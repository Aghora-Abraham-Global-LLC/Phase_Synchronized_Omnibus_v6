import { Agent, PNOrder, Vector3D } from '../types/physics';
import { rodriguesRotate, vecAdd, vecCross, vecDist, vecDot, vecNorm, vecNormalize, vecScale, vecSub, vecZero } from './mathUtils';
import { PadeLaplaceReservoir } from './padeReservoir';

export class PNDynamicsEngine {
  readonly G: number = 1.0;
  readonly c: number = 8.0; // scaled speed of light for vivid observable relativistic effects
  padeReservoir: PadeLaplaceReservoir;
  accumulatedMemoryDC: number = 0;
  accumulatedContactEntropy: number = 0;
  accumulatedConformalGamma: number = 0;

  constructor() {
    this.padeReservoir = new PadeLaplaceReservoir();
  }

  /**
   * Computes Conservative Hamiltonian Energy: H_conserv = H_Newt + 1PN + 2PN + 3PN + H_SO + H_SS
   */
  computeConservativeEnergy(agents: Agent[], pnOrder: PNOrder): number {
    const n = agents.length;
    let kinetic = 0;
    let potential = 0;
    let pn1Corr = 0;
    let soCorr = 0;
    let ssCorr = 0;

    const c2 = this.c * this.c;
    const c4 = c2 * c2;
    const c6 = c4 * c2;

    for (let i = 0; i < n; i++) {
      const a = agents[i];
      const vSq = vecNorm(a.velocity) ** 2;
      kinetic += 0.5 * a.mass * vSq;

      if (pnOrder !== 'Newtonian') {
        // 1PN kinetic correction: - (1/8) m v^4 / c^2
        pn1Corr -= (1 / 8) * a.mass * (vSq ** 2) / c2;
      }
    }

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = agents[i];
        const b = agents[j];
        const rVec = vecSub(a.position, b.position);
        const r = Math.max(0.1, vecNorm(rVec));
        const nVec = vecScale(rVec, 1 / r);

        // Newtonian potential
        const potNewt = -(this.G * a.mass * b.mass) / r;
        potential += potNewt;

        if (pnOrder !== 'Newtonian') {
          // 1PN potential correction
          const vi = a.velocity;
          const vj = b.velocity;
          const vi2 = vecNorm(vi) ** 2;
          const vj2 = vecNorm(vj) ** 2;
          const vi_vj = vecDot(vi, vj);
          const n_vi = vecDot(nVec, vi);
          const n_vj = vecDot(nVec, vj);

          const term1PN = (this.G * a.mass * b.mass) / (2 * c2 * r) * (
            -vi_vj - n_vi * n_vj + 3 * (vi2 + vj2)
          );
          pn1Corr += term1PN;

          // Spin-Orbit coupling (H_SO)
          const rCrossVi = vecCross(rVec, vi);
          const soSpinSum = vecAdd(vecScale(b.spin, 2), vecScale(a.spin, 1.5 * (b.mass / a.mass)));
          soCorr += (this.G / (c2 * Math.pow(r, 3))) * vecDot(rCrossVi, soSpinSum);

          // Spin-Spin coupling (H_SS 2PN) with synthetic quadrupole deformation C_Qi
          const nDotSi = vecDot(nVec, a.spin);
          const nDotSj = vecDot(nVec, b.spin);
          const siDotSj = vecDot(a.spin, b.spin);
          const ssInteraction = 3 * nDotSi * nDotSj - siDotSj;
          const quadrupoleTerm = (a.quadrupoleDef / a.mass) * (3 * (nDotSi ** 2) - vecNorm(a.spin) ** 2);
          ssCorr += (this.G / (2 * c2 * Math.pow(r, 3))) * (ssInteraction + quadrupoleTerm);
        }
      }
    }

    let total = kinetic + potential;
    if (pnOrder !== 'Newtonian') {
      total += pn1Corr + soCorr + ssCorr;
    }
    return total;
  }

  /**
   * Computes Conservative + Dissipative 5.0PN Accelerations for all agents
   */
  computeAccelerations(
    agents: Agent[],
    pnOrder: PNOrder,
    dt: number
  ): {
    accelerations: Vector3D[];
    gwStrainPlus: number;
    gwStrainCross: number;
    memoryDeltaH: number;
    instantaneousFlux: number;
    conformalGamma: number;
  } {
    const n = agents.length;
    const accels: Vector3D[] = agents.map(() => vecZero());

    const c2 = this.c * this.c;
    const c4 = c2 * c2;
    const c5 = c4 * this.c;
    const c6 = c4 * c2;
    const c7 = c5 * c2;
    const c8 = c7 * this.c;
    const c9 = c8 * this.c;
    const c10 = c8 * c2;

    // Track quadrupole moment I_ij second and higher time derivatives for GW strain
    let Iddot_xx = 0;
    let Iddot_yy = 0;
    let Iddot_xy = 0;
    let I3_norm = 0;
    let I4_norm = 0;

    // Pairwise interactions
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const a = agents[i];
        const b = agents[j];
        const rVec = vecSub(b.position, a.position);
        const r = Math.max(0.15, vecNorm(rVec));
        const nVec = vecScale(rVec, 1 / r);
        const vVec = vecSub(b.velocity, a.velocity);
        const vSq = vecNorm(vVec) ** 2;
        const rDot = vecDot(nVec, vVec);

        // 1. Newtonian gravitational attraction: a_Newt = G * m_j / r^2 * n_ij
        const newtonianMag = (this.G * b.mass) / (r * r);
        accels[i] = vecAdd(accels[i], vecScale(nVec, newtonianMag));

        if (pnOrder === 'Newtonian') continue;

        // 2. 1PN Conservative Correction
        const a1PN_n = newtonianMag * (1 / c2) * (
          4 * (this.G * b.mass / r) + 5 * (this.G * a.mass / r) - vSq + 1.5 * (rDot * rDot)
        );
        const a1PN_v = newtonianMag * (1 / c2) * (4 * rDot);
        accels[i] = vecAdd(accels[i], vecAdd(vecScale(nVec, a1PN_n), vecScale(vVec, a1PN_v)));

        // 3. Spin-Orbit (SO) Precession & Acceleration
        const sCrossV = vecCross(a.spin, vVec);
        const aSO = vecScale(sCrossV, (2 * this.G * b.mass) / (c2 * Math.pow(r, 3)));
        accels[i] = vecAdd(accels[i], aSO);

        // Spin precession: dS_i/dt = \Omega_i \times S_i
        const omegaPrecess = vecScale(vecCross(rVec, vVec), (2 * this.G * b.mass) / (c2 * Math.pow(r, 3)));
        a.spin = rodriguesRotate(a.spin, omegaPrecess, dt);

        // 4. 2PN / 3PN Corrections
        if (pnOrder === '2PN' || pnOrder === '3PN' || pnOrder === '3.5PN' ||
            pnOrder === '4.0PN_Tail' || pnOrder === '4.5PN_TailTail' || pnOrder === '5.0PN_Memory') {
          const a2PN_mag = (newtonianMag / c4) * (
            2 * Math.pow(this.G * b.mass / r, 2) - 0.75 * Math.pow(vSq, 2)
          );
          accels[i] = vecAdd(accels[i], vecScale(nVec, a2PN_mag));

          if (pnOrder !== '2PN') {
            // 3PN logarithmic gravitational self-energy term
            const logTerm = Math.log(r / 1.0);
            const a3PN_mag = (newtonianMag / c6) * (
              4.5 * Math.pow(this.G * b.mass / r, 3) * (1.0 + 0.1 * logTerm)
            );
            accels[i] = vecAdd(accels[i], vecScale(nVec, a3PN_mag));
          }
        }

        // 5. 2.5PN Quadrupole Radiation Reaction (Burke-Thorne / Peters-Mathews)
        if (pnOrder === '3.5PN' || pnOrder === '4.0PN_Tail' ||
            pnOrder === '4.5PN_TailTail' || pnOrder === '5.0PN_Memory') {
          const rrCoeff = (8 * Math.pow(this.G, 2) * a.mass * b.mass) / (5 * c5 * Math.pow(r, 3));
          const a25_n = rrCoeff * (3 * vSq - (17 / 3) * (this.G * (a.mass + b.mass) / r)) * rDot;
          const a25_v = -rrCoeff * (vSq - 3 * (this.G * (a.mass + b.mass) / r));
          accels[i] = vecAdd(accels[i], vecAdd(vecScale(nVec, a25_n), vecScale(vVec, a25_v)));
        }

        // 6. 3.5PN Instantaneous multipolar & Spin-Spin RR
        if (pnOrder === '3.5PN' || pnOrder === '4.0PN_Tail' ||
            pnOrder === '4.5PN_TailTail' || pnOrder === '5.0PN_Memory') {
          const a35_coeff = (Math.pow(this.G, 2) * a.mass * b.mass) / (c7 * Math.pow(r, 3));
          const a35_n = a35_coeff * (2.2 * Math.pow(vSq, 2) * rDot);
          const a35_v = -a35_coeff * (1.1 * Math.pow(vSq, 2));
          accels[i] = vecAdd(accels[i], vecAdd(vecScale(nVec, a35_n), vecScale(vVec, a35_v)));

          // Spin-spin radiation reaction a_SS^RR
          const ss_rr = (Math.pow(this.G, 2) / (c9 * Math.pow(r, 5))) * vecDot(a.spin, b.spin) * 0.15;
          accels[i] = vecAdd(accels[i], vecScale(nVec, ss_rr));
        }

        // Accumulate quadrupole derivatives for GW waveforms
        const qContrib_xx = a.mass * (2 * a.velocity.x * a.velocity.x + 2 * a.position.x * accels[i].x);
        const qContrib_yy = a.mass * (2 * a.velocity.y * a.velocity.y + 2 * a.position.y * accels[i].y);
        const qContrib_xy = a.mass * (2 * a.velocity.x * a.velocity.y + a.position.x * accels[i].y + a.position.y * accels[i].x);
        Iddot_xx += qContrib_xx;
        Iddot_yy += qContrib_yy;
        Iddot_xy += qContrib_xy;

        I3_norm += Math.abs(qContrib_xx) * Math.sqrt(vSq) / r;
        I4_norm += Math.abs(qContrib_xy) * vSq / (r * r);
      }
    }

    // 7. 4.0PN Linear Wave Tail, 4.5PN Tail-of-Tail, and 5.0PN Christodoulou Memory
    let memoryDeltaH = 0;
    let instantaneousFlux = 0;
    let conformalGamma = 0;

    if (pnOrder === '4.0PN_Tail' || pnOrder === '4.5PN_TailTail' || pnOrder === '5.0PN_Memory') {
      const avgSpeed = agents.reduce((acc, a) => acc + vecNorm(a.velocity), 0) / n;
      const minPairDist = agents.length > 1 ? vecDist(agents[0].position, agents[1].position) : 10;
      const omegaP = avgSpeed / Math.max(0.1, minPairDist);
      const sourceI7 = I3_norm * 0.05;

      // Update K=16 Multi-Grid Padé-Laplace dynamic reservoir
      const reservoirOutput = this.padeReservoir.step(dt, avgSpeed, this.c, omegaP, sourceI7);

      for (let i = 0; i < n; i++) {
        // 4.0PN linear wave tail acceleration
        const a40_tail = vecScale(vecNormalize(agents[i].velocity), -Math.abs(reservoirOutput.tailAcceleration) * (4 / (5 * c8)));
        accels[i] = vecAdd(accels[i], a40_tail);

        // 4.5PN tail-of-tail correction
        if (pnOrder === '4.5PN_TailTail' || pnOrder === '5.0PN_Memory') {
          const a45_tail2 = vecScale(vecNormalize(agents[i].velocity), -Math.abs(reservoirOutput.tailAcceleration) * (4 / (5 * c9)) * 0.4);
          accels[i] = vecAdd(accels[i], a45_tail2);
        }

        // 5.0PN Christodoulou Non-Linear Memory
        if (pnOrder === '5.0PN_Memory') {
          // a_{5.0PN}^{memory} = (2/5) * (G^2 / c^10) * Iddot^{(3)} * \int (I^{(4)} / (t - t')) dt'
          const memoryForceMag = (2 / 5) * (Math.pow(this.G, 2) / c10) * I3_norm * I4_norm * 0.8;
          const a50_mem = vecScale(vecNormalize(agents[i].position), -memoryForceMag);
          accels[i] = vecAdd(accels[i], a50_mem);
        }
      }

      // Radiative energy flux dE/dt = (G / 5 c^5) * <... I^{(3)} ...>
      instantaneousFlux = (this.G / (5 * c5)) * (Iddot_xx * Iddot_xx + Iddot_yy * Iddot_yy + 2 * Iddot_xy * Iddot_xy);

      // 5.0PN Christodoulou Non-Linear Memory produces a permanent, non-oscillatory DC offset
      // \Delta h^{TT} \propto \frac{4G}{c^4 D_L} \int \frac{dE}{dt} dt
      const dMemory = (4 * this.G / (c4 * 20.0)) * instantaneousFlux * dt;
      this.accumulatedMemoryDC += dMemory;
      memoryDeltaH = this.accumulatedMemoryDC;

      // Contact damping rate Gamma for conformal Hamiltonian conservation
      conformalGamma = instantaneousFlux / Math.max(1.0, Math.abs(this.computeConservativeEnergy(agents, pnOrder)));
    }

    // Polarized GW Metric Strains h_+(t) and h_\times(t)
    const distObs = 25.0; // observer distance D_L
    const gwStrainPlus = (this.G / (c4 * distObs)) * (Iddot_xx - Iddot_yy);
    const gwStrainCross = (2 * this.G / (c4 * distObs)) * Iddot_xy;

    return {
      accelerations: accels,
      gwStrainPlus,
      gwStrainCross,
      memoryDeltaH,
      instantaneousFlux,
      conformalGamma,
    };
  }

  reset() {
    this.padeReservoir.reset();
    this.accumulatedMemoryDC = 0;
    this.accumulatedContactEntropy = 0;
    this.accumulatedConformalGamma = 0;
  }
}
