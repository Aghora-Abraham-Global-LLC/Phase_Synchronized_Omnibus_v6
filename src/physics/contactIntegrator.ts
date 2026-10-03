import { Agent, Vector3D } from '../types/physics';
import { vecAdd, vecDist, vecNorm, vecScale, vecSub, vecZero } from './mathUtils';

export interface SoftMinResult {
  softMinR: number; // \mathcal{R}_\beta(q)
  gradients: Vector3D[]; // \nabla_{q_i} \mathcal{R}_\beta(q)
  restraintOmega: number; // \omega(\mathcal{R}_\beta)
  cflRatio: number; // \Delta\tau * \omega(\mathcal{R}_\beta)
  cflValid: boolean; // <= \pi / 2
}

export class ContactIntegrator {
  beta: number = 3.5; // soft-min inverse temperature parameter
  omega0: number = 1.0; // base restraint frequency
  kappa: number = 0.85; // coupling stiffness
  r0: number = 2.0; // reference separation
  epsilon: number = 0.05; // regularization singularity buffer

  /**
   * Computes the strictly analytic C^\infty Soft-Minimum Potential:
   * \mathcal{R}_\beta(q) = -(1/\beta) * \ln( \sum_{i < j} \exp(-\beta * ||q_i - q_j||) )
   * and its softmax Boltzmann gradients.
   */
  evaluateSoftMin(agents: Agent[], dt: number): SoftMinResult {
    const n = agents.length;
    if (n < 2) {
      return {
        softMinR: 100,
        gradients: agents.map(() => vecZero()),
        restraintOmega: this.omega0,
        cflRatio: dt * this.omega0,
        cflValid: true,
      };
    }

    // Step 1: Pairwise distances and exponentials with shift for numerical stability
    const pairs: { i: number; j: number; dist: number; diff: Vector3D; expVal: number }[] = [];
    let minDist = Infinity;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const diff = vecSub(agents[i].position, agents[j].position);
        const dist = Math.max(1e-5, vecNorm(diff));
        if (dist < minDist) minDist = dist;
        pairs.push({ i, j, dist, diff, expVal: 0 });
      }
    }

    // Stable Log-Sum-Exp:
    // sum exp(-\beta * r_ij) = exp(-\beta * r_min) * sum exp(-\beta * (r_ij - r_min))
    let sumNormalizedExp = 0;
    for (const p of pairs) {
      const exponent = -this.beta * (p.dist - minDist);
      p.expVal = Math.exp(exponent);
      sumNormalizedExp += p.expVal;
    }

    const softMinR = minDist - (1 / this.beta) * Math.log(sumNormalizedExp);

    // Step 2: Gradients \nabla_{q_i} \mathcal{R}_\beta(q)
    const gradients: Vector3D[] = agents.map(() => vecZero());

    for (const p of pairs) {
      const boltzmannWeight = p.expVal / Math.max(1e-12, sumNormalizedExp);
      const unitDir = vecScale(p.diff, 1 / p.dist);
      const forceContribution = vecScale(unitDir, boltzmannWeight);

      gradients[p.i] = vecAdd(gradients[p.i], forceContribution);
      gradients[p.j] = vecSub(gradients[p.j], forceContribution);
    }

    // Step 3: Structural restraint frequency:
    // \omega(\mathcal{R}_\beta) = \omega_0 * [1 + \kappa * (r_0 / (\mathcal{R}_\beta + \epsilon))^2]
    const effectiveR = Math.max(0.01, softMinR + this.epsilon);
    const restraintOmega = this.omega0 * (1.0 + this.kappa * Math.pow(this.r0 / effectiveR, 2));

    // CFL Courant-Friedrichs-Lewy Limit: \Delta\tau * \omega \le \pi/2 < 2
    const cflRatio = dt * restraintOmega;
    const cflValid = cflRatio <= Math.PI / 2;

    return {
      softMinR,
      gradients,
      restraintOmega,
      cflRatio,
      cflValid,
    };
  }

  /**
   * Conformal Symplectic Strang Splitting Step on Contact Manifold (M^{2N+1}, \eta = dS - p dq)
   * \Phi_{\Delta\tau}^{V6} = \mathcal{C}_{\Delta\tau/2}^{diss} \circ \mathcal{S}_{\Delta\tau}^{Poincaré} \circ \mathcal{C}_{\Delta\tau/2}^{diss}
   * Preserves conformal invariant \eta \mapsto e^{-\Gamma \Delta\tau} \eta
   */
  conformalDissipativeStep(
    agents: Agent[],
    halfDt: number,
    instantaneousDampingGamma: number
  ): number {
    // Exact conformal exponential contraction factor: e^{-\Gamma * dt/2}
    const decayFactor = Math.exp(-instantaneousDampingGamma * halfDt);

    let entropyProduced = 0;
    for (const a of agents) {
      // Scale momentum / velocity conformally
      const oldSpeedSq = vecNorm(a.velocity) ** 2;
      a.velocity = vecScale(a.velocity, decayFactor);
      const newSpeedSq = vecNorm(a.velocity) ** 2;

      // Entropy increment dS = p * dq - H dt
      entropyProduced += 0.5 * a.mass * (oldSpeedSq - newSpeedSq);
    }

    return entropyProduced;
  }
}
