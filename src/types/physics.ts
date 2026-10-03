export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Agent {
  id: number;
  name: string;
  color: string;
  mass: number;
  position: Vector3D;
  velocity: Vector3D;
  acceleration: Vector3D;
  spin: Vector3D; // S_i vector, |S_i| = const
  quadrupoleDef: number; // C_Qi
  phase: number; // \Phi_i in S^1
  naturalFreq: number; // \omega_i
  trail: Vector3D[];
}

export type PNOrder = 'Newtonian' | '1PN' | '2PN' | '3PN' | '3.5PN' | '4.0PN_Tail' | '4.5PN_TailTail' | '5.0PN_Memory';

export type AutomatonState = 'S0' | 'S1' | 'S2' | 'S3' | 'S4';

export interface AutomatonInfo {
  state: AutomatonState;
  name: string;
  description: string;
  hierarchyRatio: number;
  isISCOCrossed: boolean;
  braidWord: string[];
  totalWinding: number;
  qnmActive: boolean;
  qnmTime: number;
}

export interface ReservoirPole {
  index: number;
  lambda0: number;
  lambdaCurrent: number;
  yComponent: number; // auxiliary ODE state Y_ij,m
}

export interface SimulationState {
  time: number; // evolution time t/M
  dt: number; // step size \Delta\tau
  cflRatio: number; // \Delta\tau * \omega(R_\beta)
  cflLimit: number; // \pi/2
  cflValid: boolean;
  softMinR: number; // R_\beta(q)
  restraintFreq: number; // \omega(R_\beta)
  totalEnergy: number; // H_conserv
  initialEnergy: number;
  energyError: number; // |\Delta H / H_0|
  shadowEnergy: number; // H_shadow(t) = e^{-\int \Gamma} H(0)
  shadowError: number;
  contactAction: number; // S(t) tracking dissipative entropy
  conformalDecay: number; // \Gamma(t)
  totalAngularMomentum: Vector3D;
  initialAngularMomentum: number;
  angularMomentumError: number;
  // Kuramoto metrics
  karcherBarycenter: Vector3D;
  kuramotoOrderR: number; // R_g(t) \in [0, 1]
  kuramotoVector: Vector3D; // Z_g \in T_{q0}\Sigma
  holonomyMax: number; // \delta_{max}^g
  karcherSchoenValid: boolean; // swarm radius < bound
  // Waveform & 5.0PN Memory
  gwStrainPlus: number; // h_+(t)
  gwStrainCross: number; // h_\times(t)
  christodoulouMemory: number; // \Delta h^{TT} permanent DC shift
  instantaneousFlux: number; // dE/dt radiative flux
  petersLifetimeEst: number;
  // Reservoirs
  reservoirPoles: ReservoirPole[];
  // Automaton
  automaton: AutomatonInfo;
}

export interface SimulationPreset {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  eccentricity: number;
  pnOrder: PNOrder;
  kSync: number;
  betaSoftMin: number;
  agents: Omit<Agent, 'trail' | 'acceleration'>[];
}

export interface BenchmarkItem {
  id: string;
  name: string;
  section: string;
  metric: string;
  measuredValue?: number | string;
  threshold: string;
  passed: boolean;
  details: string;
}

export interface ValidationReport {
  timestamp: string;
  version: string;
  sha256Digest: string;
  status: 'FULLY CERTIFIED' | 'FAILED';
  benchmarks: BenchmarkItem[];
  allPassed: boolean;
}
