import React from 'react';
import { PNOrder, SimulationPreset, SimulationState } from '../types/physics';
import { SIMULATION_PRESETS } from '../physics/presets';
import { Play, Pause, RotateCcw, StepForward, Sliders, Eye, Zap, Layers } from 'lucide-react';
import { MathView } from './MathView';

interface ControlPanelProps {
  isRunning: boolean;
  onToggleRun: () => void;
  onStep: () => void;
  onReset: () => void;
  selectedPresetId: string;
  onSelectPreset: (preset: SimulationPreset) => void;
  pnOrder: PNOrder;
  setPnOrder: (order: PNOrder) => void;
  dt: number;
  setDt: (dt: number) => void;
  betaSoftMin: number;
  setBetaSoftMin: (b: number) => void;
  simState: SimulationState;
  showTrails: boolean;
  setShowTrails: (v: boolean) => void;
  showVectors: boolean;
  setShowVectors: (v: boolean) => void;
  showBarycenter: boolean;
  setShowBarycenter: (v: boolean) => void;
  showSoftMinEquipotentials: boolean;
  setShowSoftMinEquipotentials: (v: boolean) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isRunning,
  onToggleRun,
  onStep,
  onReset,
  selectedPresetId,
  onSelectPreset,
  pnOrder,
  setPnOrder,
  dt,
  setDt,
  betaSoftMin,
  setBetaSoftMin,
  simState,
  showTrails,
  setShowTrails,
  showVectors,
  setShowVectors,
  showBarycenter,
  setShowBarycenter,
  showSoftMinEquipotentials,
  setShowSoftMinEquipotentials,
}) => {
  const pnOrders: { id: PNOrder; label: string; badge: string }[] = [
    { id: 'Newtonian', label: 'Newtonian', badge: 'O(c⁰)' },
    { id: '1PN', label: '1PN Conservative', badge: 'c⁻²' },
    { id: '2PN', label: '2PN + Spin-Spin', badge: 'c⁻⁴' },
    { id: '3PN', label: '3PN Log Self-Energy', badge: 'c⁻⁶' },
    { id: '3.5PN', label: '3.5PN Instantaneous', badge: 'c⁻⁷' },
    { id: '4.0PN_Tail', label: '4.0PN Linear Tail', badge: 'c⁻⁸' },
    { id: '4.5PN_TailTail', label: '4.5PN Tail-of-Tail', badge: 'c⁻⁹' },
    { id: '5.0PN_Memory', label: '5.0PN Christodoulou Memory', badge: 'c⁻¹⁰' },
  ];

  return (
    <div className="bg-[#0b0e14] border border-zinc-800 rounded-xl p-4 flex flex-col gap-4">
      {/* Simulation Controls: Play, Step, Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleRun}
            className={`px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-2 shadow-lg transition cursor-pointer ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/40'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-950/40'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? 'Pause Flow' : 'Integrate Orbit'}</span>
          </button>

          <button
            onClick={onStep}
            disabled={isRunning}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 transition cursor-pointer"
            title="Single Poincaré Step (Δτ)"
          >
            <StepForward className="w-4 h-4" />
          </button>

          <button
            onClick={onReset}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition cursor-pointer"
            title="Reset Simulation State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Preset Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-400 font-medium hidden sm:inline">Scenario:</span>
          <select
            value={selectedPresetId}
            onChange={(e) => {
              const p = SIMULATION_PRESETS.find((x) => x.id === e.target.value);
              if (p) onSelectPreset(p);
            }}
            className="bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-2.5 py-1.5 font-medium text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {SIMULATION_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Physics Sliders: dt and beta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Step size \Delta\tau & CFL status */}
        <div className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300 font-medium">
              Integrator Step Size <MathView math="\Delta \tau" />:
            </span>
            <span className="font-mono text-cyan-400 font-bold">{dt.toFixed(3)} M</span>
          </div>

          <input
            type="range"
            min="0.002"
            max="0.04"
            step="0.001"
            value={dt}
            onChange={(e) => setDt(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />

          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-zinc-500">
              CFL Ratio: <span className={simState.cflValid ? 'text-cyan-400' : 'text-rose-400 font-bold'}>{simState.cflRatio.toFixed(3)}</span>
            </span>
            <span className="text-zinc-400">Limit: ≤ π/2 (1.571)</span>
          </div>
        </div>

        {/* Soft-min inverse temperature beta */}
        <div className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300 font-medium">
              Soft-Min Inverse Temp <MathView math="\beta" />:
            </span>
            <span className="font-mono text-emerald-400 font-bold">{betaSoftMin.toFixed(1)}</span>
          </div>

          <input
            type="range"
            min="1.0"
            max="8.0"
            step="0.2"
            value={betaSoftMin}
            onChange={(e) => setBetaSoftMin(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span>1.0 (Diffuse Soft-Min)</span>
            <span className="text-emerald-400">R_β(q) = {simState.softMinR.toFixed(2)}</span>
            <span>8.0 (Sharp Cusp-free)</span>
          </div>
        </div>
      </div>

      {/* Relativistic Post-Newtonian (PN) Order Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="font-medium text-zinc-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Post-Newtonian Radiation Reaction Expansion Hierarchy:</span>
          </span>
          <span className="font-mono text-amber-400 font-bold">{pnOrder}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-mono">
          {pnOrders.map((ord) => {
            const isSelected = pnOrder === ord.id;
            return (
              <button
                key={ord.id}
                onClick={() => setPnOrder(ord.id)}
                className={`p-2 rounded-lg border text-left flex flex-col justify-between transition cursor-pointer ${
                  isSelected
                    ? 'border-amber-500/80 bg-amber-950/30 text-amber-200 shadow-sm'
                    : 'border-zinc-800/80 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <span className="text-[11px] font-sans font-semibold truncate">{ord.label}</span>
                <span className="text-[10px] text-zinc-500 mt-1">{ord.badge}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Display Toggles */}
      <div className="pt-2 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-zinc-400 flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>Viewport Layers:</span>
        </span>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={showTrails}
              onChange={(e) => setShowTrails(e.target.checked)}
              className="rounded bg-zinc-900 border-zinc-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <span>Orbital Trails</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={showVectors}
              onChange={(e) => setShowVectors(e.target.checked)}
              className="rounded bg-zinc-900 border-zinc-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <span>Velocity &amp; SO(3) Spin</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={showBarycenter}
              onChange={(e) => setShowBarycenter(e.target.checked)}
              className="rounded bg-zinc-900 border-zinc-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <span>Karcher Barycenter (q₀)</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={showSoftMinEquipotentials}
              onChange={(e) => setShowSoftMinEquipotentials(e.target.checked)}
              className="rounded bg-zinc-900 border-zinc-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <span>Soft-Min Field (<MathView math="\mathcal{R}_\beta" />)</span>
          </label>
        </div>
      </div>
    </div>
  );
};
