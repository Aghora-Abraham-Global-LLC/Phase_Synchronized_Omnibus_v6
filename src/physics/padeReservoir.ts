import { ReservoirPole } from '../types/physics';

export class PadeLaplaceReservoir {
  readonly K: number = 16;
  readonly tau0: number = 2.0; // characteristic radiation timescale
  readonly gamma: number = 0.45; // periastron frequency coupling coefficient
  poles: ReservoirPole[];

  constructor() {
    this.poles = [];
    // Initialize K=16 geometrically spaced Padé-Laplace relaxation poles
    // lambda_{m,0} across logarithmic frequency decades [10^-2, 10^3]
    for (let m = 0; m < this.K; m++) {
      const exponent = -2.0 + (5.0 * m) / (this.K - 1);
      const lambda0 = Math.pow(10, exponent);
      this.poles.push({
        index: m,
        lambda0,
        lambdaCurrent: lambda0,
        yComponent: 0.0,
      });
    }
  }

  /**
   * Updates dynamic reservoir poles coupling to periastron frequency \omega_p(t)
   * \lambda_m(t) = \lambda_{m,0} * [1 + \gamma * (v/c)^3 * \omega_p(t)]
   * and steps auxiliary ODEs Y_{ij,m} with transport correction:
   * dY/dt = -(\lambda_m / \tau_0) * Y + I^{(7)} + (\dot{\lambda}/\lambda)*(Y - I^{(7)}*\tau_0/\lambda)
   */
  step(
    dt: number,
    velocityMagnitude: number,
    c: number,
    omegaPeriastron: number,
    sourceMultipoleI7: number
  ): { tailAcceleration: number; poles: ReservoirPole[]; residualError: number } {
    const vRel = Math.min(0.95, velocityMagnitude / c);
    const couplingFactor = 1.0 + this.gamma * Math.pow(vRel, 3) * Math.max(0, omegaPeriastron);

    let tailSum = 0;

    for (let m = 0; m < this.K; m++) {
      const p = this.poles[m];
      const prevLambda = p.lambdaCurrent;
      const newLambda = p.lambda0 * couplingFactor;
      const dotLambda = (newLambda - prevLambda) / Math.max(1e-7, dt);

      // Padé weight alpha_m for logarithmic hereditary kernel approximation
      const weightAlphaM = 1.0 / (Math.sqrt(p.lambda0) * Math.PI);

      // Transport-corrected ODE derivative:
      const decayTerm = -(newLambda / this.tau0) * p.yComponent;
      const driveTerm = sourceMultipoleI7;
      const transportCorrection = (dotLambda / Math.max(1e-6, newLambda)) *
        (p.yComponent - sourceMultipoleI7 * (this.tau0 / Math.max(1e-6, newLambda)));

      const dYdt = decayTerm + driveTerm + 0.1 * transportCorrection;

      // Semi-implicit Euler step for stiff decay:
      // Y_{t+dt} = (Y_t + dt * (drive + correction)) / (1 + dt * lambda / tau0)
      const denom = 1.0 + (dt * newLambda) / this.tau0;
      p.yComponent = (p.yComponent + dt * (driveTerm + 0.1 * transportCorrection)) / denom;
      p.lambdaCurrent = newLambda;

      tailSum += weightAlphaM * p.yComponent;
    }

    // Residual error bound: epsilon_tail <= exp(-pi * sqrt(2*K))
    const residualError = Math.exp(-Math.PI * Math.sqrt(2 * this.K));

    return {
      tailAcceleration: tailSum * 0.05,
      poles: [...this.poles],
      residualError,
    };
  }

  reset() {
    for (const p of this.poles) {
      p.lambdaCurrent = p.lambda0;
      p.yComponent = 0.0;
    }
  }
}
