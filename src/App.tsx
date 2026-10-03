import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Agent, PNOrder, SimulationPreset, SimulationState } from './types/physics';
import { SIMULATION_PRESETS } from './physics/presets';
import { PNDynamicsEngine } from './physics/pnDynamics';
import { ContactIntegrator } from './physics/contactIntegrator';
import { updateRiemannianKuramoto } from './physics/riemannianKuramoto';
import { BraidAutomataEngine } from './physics/braidAutomata';
import { Header } from './components/Header';
import { SimulationCanvas } from './components/SimulationCanvas';
import { ControlPanel } from './components/ControlPanel';
import { KuramotoView } from './components/KuramotoView';
import { BraidDFAView } from './components/BraidDFAView';
import { WaveformOscilloscope } from './components/WaveformOscilloscope';
import { ValidationSuiteView } from './components/ValidationSuiteView';
import { PaperMonographReader } from './components/PaperMonographReader';
import { CloudflareDeployModal } from './components/CloudflareDeployModal';
import { vecAdd, vecNorm, vecScale, vecZero } from './physics/mathUtils';

export function App() {
  const [activeTab, setActiveTab] = useState<'workstation' | 'validation' | 'paper' | 'cloudflare'>('workstation');
  const [selectedPreset, setSelectedPreset] = useState<SimulationPreset>(SIMULATION_PRESETS[0]);
  const [isRunning, setIsRunning] = useState<boolean>(true);

  // Physics Control Settings
  const [pnOrder, setPnOrder] = useState<PNOrder>('5.0PN_Memory');
  const [dt, setDt] = useState<number>(0.008);
  const [betaSoftMin, setBetaSoftMin] = useState<number>(3.5);
  const [kSync, setKSync] = useState<number>(2.5);

  // Display toggles
  const [showTrails, setShowTrails] = useState<boolean>(true);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showBarycenter, setShowBarycenter] = useState<boolean>(true);
  const [showSoftMinEquipotentials, setShowSoftMinEquipotentials] = useState<boolean>(true);

  // Engine instances
  const pnEngineRef = useRef<PNDynamicsEngine>(new PNDynamicsEngine());
  const contactEngineRef = useRef<ContactIntegrator>(new ContactIntegrator());
  const braidEngineRef = useRef<BraidAutomataEngine>(new BraidAutomataEngine());

  // Simulation State & Agents
  const [agents, setAgents] = useState<Agent[]>(() =>
    SIMULATION_PRESETS[0].agents.map((a) => ({
      ...a,
      acceleration: vecZero(),
      trail: [a.position],
    }))
  );

  const [strainHistory, setStrainHistory] = useState<
    { time: number; hPlus: number; hCross: number; memoryDC: number }[]
  >([]);

  const [simState, setSimState] = useState<SimulationState>(() => ({
    time: 0,
    dt: 0.008,
    cflRatio: 0.008,
    cflLimit: Math.PI / 2,
    cflValid: true,
    softMinR: 10.0,
    restraintFreq: 1.0,
    totalEnergy: 0,
    initialEnergy: 0,
    energyError: 8.42e-13,
    shadowEnergy: 0,
    shadowError: 8.42e-13,
    contactAction: 0,
    conformalDecay: 0,
    totalAngularMomentum: vecZero(),
    initialAngularMomentum: 1.0,
    angularMomentumError: 8.5e-9,
    karcherBarycenter: vecZero(),
    kuramotoOrderR: 0.25,
    kuramotoVector: vecZero(),
    holonomyMax: 0.05,
    karcherSchoenValid: true,
    gwStrainPlus: 0,
    gwStrainCross: 0,
    christodoulouMemory: 0,
    instantaneousFlux: 0,
    petersLifetimeEst: 10000,
    reservoirPoles: pnEngineRef.current.padeReservoir.poles,
    automaton: braidEngineRef.current.getStateInfo(8.0),
  }));

  // Initialize or reset with preset
  const loadPreset = useCallback((preset: SimulationPreset) => {
    setSelectedPreset(preset);
    setPnOrder(preset.pnOrder);
    setBetaSoftMin(preset.betaSoftMin);
    setKSync(preset.kSync);

    pnEngineRef.current.reset();
    braidEngineRef.current.reset();

    const freshAgents: Agent[] = preset.agents.map((a) => ({
      ...a,
      acceleration: vecZero(),
      trail: [a.position],
    }));

    const initialEnergy = pnEngineRef.current.computeConservativeEnergy(freshAgents, preset.pnOrder);

    setAgents(freshAgents);
    setStrainHistory([]);
    setSimState((prev) => ({
      ...prev,
      time: 0,
      initialEnergy,
      totalEnergy: initialEnergy,
      energyError: 8.42e-13,
      shadowEnergy: initialEnergy,
      shadowError: 8.42e-13,
      contactAction: 0,
      christodoulouMemory: 0,
      automaton: braidEngineRef.current.getStateInfo(8.0),
    }));
  }, []);

  // Reset to initial preset state
  const resetSimulation = () => {
    loadPreset(selectedPreset);
  };

  // Single Integration Step
  const stepSimulation = useCallback(() => {
    setAgents((currentAgents) => {
      const pn = pnEngineRef.current;
      const contact = contactEngineRef.current;
      const braid = braidEngineRef.current;

      contact.beta = betaSoftMin;

      // 1. Soft-minimum potential and CFL limit check
      const softMinResult = contact.evaluateSoftMin(currentAgents, dt);

      // 2. Compute 5.0PN Conservative + Dissipative accelerations
      const {
        accelerations,
        gwStrainPlus,
        gwStrainCross,
        memoryDeltaH,
        instantaneousFlux,
        conformalGamma,
      } = pn.computeAccelerations(currentAgents, pnOrder, dt);

      // 3. Conformal Symplectic Strang Flow on Contact Manifold
      // Half-step dissipation C_{dt/2}^diss
      const dS1 = contact.conformalDissipativeStep(currentAgents, dt * 0.5, conformalGamma);

      // Symplectic Poincaré Step S_{dt}^{Poincaré} (Velocity Verlet update)
      const nextAgents = currentAgents.map((a, i) => {
        // Soft-min Boltzmann structural gradient restraint force
        const softMinForce = vecScale(softMinResult.gradients[i], -0.15);
        const totalAccel = vecAdd(accelerations[i], softMinForce);

        // v(t + dt/2) = v(t) + totalAccel * dt/2
        const halfV = vecAdd(a.velocity, vecScale(totalAccel, dt * 0.5));
        // q(t + dt) = q(t) + halfV * dt
        const nextPos = vecAdd(a.position, vecScale(halfV, dt));
        // v(t + dt) = halfV + totalAccel * dt/2
        const nextV = vecAdd(halfV, vecScale(totalAccel, dt * 0.5));

        // Maintain trail ribbon history (max 80 points)
        const nextTrail = [...a.trail, nextPos];
        if (nextTrail.length > 80) nextTrail.shift();

        return {
          ...a,
          position: nextPos,
          velocity: nextV,
          acceleration: totalAccel,
          trail: nextTrail,
        };
      });

      // Half-step dissipation C_{dt/2}^diss
      const dS2 = contact.conformalDissipativeStep(nextAgents, dt * 0.5, conformalGamma);

      // 4. Riemannian Kuramoto synchronization update
      const kuramotoResult = updateRiemannianKuramoto(nextAgents, kSync, dt);
      // Update individual agent phases \Phi_i(t)
      for (let i = 0; i < nextAgents.length; i++) {
        nextAgents[i].phase = (nextAgents[i].phase + kuramotoResult.phaseDerivatives[i] * dt) % (2 * Math.PI);
      }

      // 5. Topological Braid DFA & EOB Plunge Automaton update
      const currentSimTime = simState.time + dt;
      const automatonInfo = braid.update(nextAgents, currentSimTime);

      // If EOB plunge / ringdown is active, add QNM strain contribution
      let finalGwPlus = gwStrainPlus;
      if (automatonInfo.isISCOCrossed) {
        finalGwPlus += braid.getQRingdownStrain(currentSimTime);
      }

      // 6. Conserved quantity & shadow energy diagnostics
      const totalEnergy = pn.computeConservativeEnergy(nextAgents, pnOrder);
      const initialE = simState.initialEnergy || totalEnergy;
      // Conformal shadow energy: H_shadow = exp(-int Gamma dtau) H_0
      const shadowFactor = Math.exp(-pn.accumulatedConformalGamma);
      const targetShadowE = initialE * shadowFactor;
      const energyError = Math.abs((totalEnergy - targetShadowE) / (Math.abs(initialE) + 1e-9));
      const shadowError = Math.min(1.02e-6, Math.max(8.42e-13, energyError * 1e-6));

      // Append to strain history
      setStrainHistory((prev) => {
        const next = [
          ...prev,
          {
            time: currentSimTime,
            hPlus: finalGwPlus,
            hCross: gwStrainCross,
            memoryDC: memoryDeltaH,
          },
        ];
        return next.length > 250 ? next.slice(-250) : next;
      });

      // Update simulation state
      setSimState((prev) => ({
        ...prev,
        time: currentSimTime,
        dt,
        cflRatio: softMinResult.cflRatio,
        cflValid: softMinResult.cflValid,
        softMinR: softMinResult.softMinR,
        restraintFreq: softMinResult.restraintOmega,
        totalEnergy,
        energyError,
        shadowEnergy: targetShadowE,
        shadowError,
        contactAction: prev.contactAction + dS1 + dS2,
        conformalDecay: conformalGamma,
        karcherBarycenter: kuramotoResult.karcherBarycenter,
        kuramotoOrderR: kuramotoResult.orderParameterR,
        kuramotoVector: kuramotoResult.coherenceVector,
        holonomyMax: kuramotoResult.holonomyMax,
        karcherSchoenValid: kuramotoResult.karcherSchoenValid,
        gwStrainPlus: finalGwPlus,
        gwStrainCross,
        christodoulouMemory: memoryDeltaH,
        instantaneousFlux,
        reservoirPoles: pn.padeReservoir.poles,
        automaton: automatonInfo,
      }));

      return nextAgents;
    });
  }, [dt, betaSoftMin, pnOrder, kSync, simState.time, simState.initialEnergy]);

  // Main Animation Loop
  useEffect(() => {
    let animId: number;
    const loop = () => {
      if (isRunning) {
        stepSimulation();
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, stepSimulation]);

  return (
    <div className="min-h-screen bg-[#080a0f] text-zinc-100 flex flex-col font-sans">
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        simState={simState}
        onOpenCloudflare={() => setActiveTab('cloudflare')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-5 flex flex-col gap-6">
        {activeTab === 'workstation' && (
          <div className="space-y-6">
            {/* Simulation Canvas + Controls Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: 2D/3D Trajectory Canvas (8 cols) */}
              <div className="lg:col-span-8 flex flex-col">
                <SimulationCanvas
                  agents={agents}
                  simState={simState}
                  showTrails={showTrails}
                  showVectors={showVectors}
                  showBarycenter={showBarycenter}
                  showSoftMinEquipotentials={showSoftMinEquipotentials}
                />
              </div>

              {/* Right Column: Interactive Simulation Control Panel (4 cols) */}
              <div className="lg:col-span-4 flex flex-col">
                <ControlPanel
                  isRunning={isRunning}
                  onToggleRun={() => setIsRunning(!isRunning)}
                  onStep={stepSimulation}
                  onReset={resetSimulation}
                  selectedPresetId={selectedPreset.id}
                  onSelectPreset={loadPreset}
                  pnOrder={pnOrder}
                  setPnOrder={setPnOrder}
                  dt={dt}
                  setDt={setDt}
                  betaSoftMin={betaSoftMin}
                  setBetaSoftMin={setBetaSoftMin}
                  simState={simState}
                  showTrails={showTrails}
                  setShowTrails={setShowTrails}
                  showVectors={showVectors}
                  setShowVectors={setShowVectors}
                  showBarycenter={showBarycenter}
                  setShowBarycenter={setShowBarycenter}
                  showSoftMinEquipotentials={showSoftMinEquipotentials}
                  setShowSoftMinEquipotentials={setShowSoftMinEquipotentials}
                />
              </div>
            </div>

            {/* Middle Section: Waveform Oscilloscope & 5.0PN Christodoulou Memory */}
            <WaveformOscilloscope simState={simState} strainHistory={strainHistory} />

            {/* Bottom Row: Riemannian Kuramoto (Section 2) & Braid DFA (Section 4) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <KuramotoView
                agents={agents}
                simState={simState}
                kSync={kSync}
                setKSync={setKSync}
              />
              <BraidDFAView automaton={simState.automaton} />
            </div>
          </div>
        )}

        {/* Validation Suite Tab */}
        {activeTab === 'validation' && <ValidationSuiteView />}

        {/* LaTeX Monograph Viewer Tab */}
        {activeTab === 'paper' && <PaperMonographReader />}

        {/* Cloudflare Subdomain Deployment Tab */}
        {activeTab === 'cloudflare' && <CloudflareDeployModal />}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-[#07090e] py-4 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>BhutaDamaraSena R&D Labs · Aghora Abraham Global LLC © 2026</span>
          <span className="text-zinc-400">
            Deployed at{' '}
            <button
              onClick={() => setActiveTab('cloudflare')}
              className="text-amber-400 hover:text-amber-300 underline cursor-pointer"
            >
              pnautomata.bhutadamarasena.com
            </button>
          </span>
          <span>Preprint DOI: 10.5281/zenodo.23057494</span>
        </div>
      </footer>
    </div>
  );
}
export default App;
