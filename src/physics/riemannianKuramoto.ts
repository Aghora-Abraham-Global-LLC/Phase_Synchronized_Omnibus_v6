import { Agent, Vector3D } from '../types/physics';
import { vecAdd, vecDist, vecNorm, vecScale, vecZero } from './mathUtils';

export interface RiemannianKuramotoResult {
  karcherBarycenter: Vector3D;
  coherenceVector: Vector3D;
  orderParameterR: number; // R_g(t) \in [0, 1]
  holonomyMax: number; // \delta_{max}^g
  karcherSchoenValid: boolean;
  transportedPhasors: { agentId: number; vector: Vector3D; angle: number }[];
  phaseDerivatives: number[];
}

/**
 * Computes Riemannian Karcher Barycenter q_0 minimizing \sum m_i d_g^2(q, q_i)
 * via iterative Riemannian gradient descent on the manifold.
 */
export const computeKarcherBarycenter = (
  agents: Agent[],
  maxIter: number = 20,
  tol: number = 1e-6
): Vector3D => {
  if (agents.length === 0) return vecZero();
  if (agents.length === 1) return agents[0].position;

  // Initialize with Euclidean weighted center
  let totalMass = 0;
  let q0 = vecZero();
  for (const a of agents) {
    totalMass += a.mass;
    q0 = vecAdd(q0, vecScale(a.position, a.mass));
  }
  q0 = vecScale(q0, 1 / Math.max(1e-9, totalMass));

  // Riemannian gradient descent refinement
  for (let iter = 0; iter < maxIter; iter++) {
    let grad = vecZero();
    for (const a of agents) {
      const diff = {
        x: a.position.x - q0.x,
        y: a.position.y - q0.y,
        z: a.position.z - q0.z,
      };
      // Riemannian metric weight factoring manifold curvature
      const r = vecDist(q0, a.position);
      const curvatureWeight = r > 1e-4 ? Math.sin(0.05 * r) / (0.05 * r) : 1.0;
      grad = vecAdd(grad, vecScale(diff, a.mass * curvatureWeight));
    }
    const step = vecScale(grad, 0.2 / Math.max(1e-9, totalMass));
    q0 = vecAdd(q0, step);
    if (vecNorm(step) < tol) break;
  }

  return q0;
};

/**
 * Evaluates Riemannian Kuramoto Dynamics:
 * 1. Checks Karcher-Schoen uniqueness bound
 * 2. Parallel transports local phasors along geodesics to T_{q_0}\Sigma
 * 3. Calculates covariant coherence vector Z_g and order parameter R_g
 * 4. Integrates frustrated phase dynamics with holonomy cross-term \delta_{ij}^g
 */
export const updateRiemannianKuramoto = (
  agents: Agent[],
  kSync: number,
  dt: number,
  curvatureKMax: number = 0.04
): RiemannianKuramotoResult => {
  const n = agents.length;
  if (n === 0) {
    return {
      karcherBarycenter: vecZero(),
      coherenceVector: vecZero(),
      orderParameterR: 0,
      holonomyMax: 0,
      karcherSchoenValid: true,
      transportedPhasors: [],
      phaseDerivatives: [],
    };
  }

  const q0 = computeKarcherBarycenter(agents);

  // Measure swarm radius from barycenter
  let maxRadius = 0;
  for (const a of agents) {
    const d = vecDist(q0, a.position);
    if (d > maxRadius) maxRadius = d;
  }

  // Karcher-Schoen Uniqueness Bound: rad < min(1/2 * inj, pi / (2 * sqrt(K_max)))
  const injRadius = 50.0; // domain injectivity radius
  const karcherSchoenBound = Math.min(0.5 * injRadius, Math.PI / (2 * Math.sqrt(Math.max(1e-5, curvatureKMax))));
  const karcherSchoenValid = maxRadius < karcherSchoenBound;

  // Maximum Ambrose-Singer connection holonomy: \delta_{max}^g = (1/6) * K_max * diam^2
  const swarmDiameter = 2 * maxRadius;
  const holonomyMax = Math.min(Math.PI / 4, (1 / 6) * curvatureKMax * swarmDiameter * swarmDiameter);

  // Parallel transport phasors u_i \in T_{q_i}\Sigma to \tilde{u}_i \in T_{q_0}\Sigma
  const transportedPhasors: { agentId: number; vector: Vector3D; angle: number }[] = [];
  let sumTx = 0;
  let sumTy = 0;

  for (let i = 0; i < n; i++) {
    const a = agents[i];
    // Holonomy phase shift along geodesic \gamma_i to q0
    // d\phi = \Gamma^\mu_{\alpha\beta} dx
    const relPos = {
      x: a.position.x - q0.x,
      y: a.position.y - q0.y,
    };
    const angleGeodesic = Math.atan2(relPos.y, relPos.x);
    const transportPhaseShift = 0.5 * curvatureKMax * (relPos.x * q0.y - relPos.y * q0.x);

    const transportedAngle = a.phase + transportPhaseShift;
    const uTilde: Vector3D = {
      x: Math.cos(transportedAngle),
      y: Math.sin(transportedAngle),
      z: 0,
    };

    transportedPhasors.push({
      agentId: a.id,
      vector: uTilde,
      angle: transportedAngle,
    });

    sumTx += uTilde.x;
    sumTy += uTilde.y;
  }

  // Covariant coherence vector Z_g \in T_{q_0}\Sigma
  const coherenceVector: Vector3D = {
    x: sumTx / n,
    y: sumTy / n,
    z: 0,
  };

  // Scalar Order Parameter R_g \in [0, 1]
  const orderParameterR = Math.min(1.0, Math.sqrt(coherenceVector.x * coherenceVector.x + coherenceVector.y * coherenceVector.y));

  // Compute phase derivatives with pairwise holonomy cross-term:
  // d\Phi_i/dt = \omega_i + (K_sync / N) * \sum_j \sin(\Phi_j - \Phi_i - \delta_{ij}^g)
  const phaseDerivatives: number[] = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    let couplingTorque = 0;
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      // Pairwise connection holonomy \delta_{ij}^g
      const r_ij = vecDist(agents[i].position, agents[j].position);
      const delta_ij = (curvatureKMax / 6) * r_ij * r_ij * Math.sin(agents[i].phase - agents[j].phase);
      couplingTorque += Math.sin(agents[j].phase - agents[i].phase - delta_ij);
    }
    phaseDerivatives[i] = agents[i].naturalFreq + (kSync / n) * couplingTorque;
  }

  return {
    karcherBarycenter: q0,
    coherenceVector,
    orderParameterR,
    holonomyMax,
    karcherSchoenValid,
    transportedPhasors,
    phaseDerivatives,
  };
};
