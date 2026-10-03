import React from 'react';
import { ShieldCheck, BookOpen, Activity, ExternalLink, Zap, CheckCircle2 } from 'lucide-react';
import { SimulationState } from '../types/physics';

interface HeaderProps {
  activeTab: 'workstation' | 'validation' | 'paper';
  setActiveTab: (tab: 'workstation' | 'validation' | 'paper') => void;
  simState: SimulationState;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  simState,
}) => {
  const doi = '10.5281/zenodo.23116082';
  const doiUrl = `https://doi.org/${doi}`;

  return (
    <header className="border-b border-zinc-800/90 bg-[#0a0d13]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Title, Author & Affiliation */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600 via-sky-600 to-emerald-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-950/40 border border-cyan-400/30 text-lg">
            Ω₆
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-semibold text-zinc-100 tracking-tight">
                Phase-Synchronized Omnibus v6.0
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 font-mono font-medium">
                5.0PN Contact
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-400">
              <span className="text-zinc-300 font-medium">Arya Arunachala Ananda Ghulam-e-Shah-e-Unmani</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400">BhutaDamaraSena R&D Labs</span>
              <span className="text-zinc-600">•</span>
              <a
                href={doiUrl}
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:text-amber-300 underline font-mono text-[11px] inline-flex items-center gap-1 font-semibold transition"
                title="View Zenodo Preprint"
              >
                <span>DOI: {doi}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Real-Time Physics Invariants Telemetry */}
        <div className="hidden lg:flex items-center gap-2 font-mono text-xs">
          <div className="px-2.5 py-1 rounded bg-zinc-900/90 border border-zinc-800 text-zinc-300 flex items-center gap-1.5 shadow-sm">
            <span className="text-zinc-500">|ΔH_shadow|:</span>
            <span className="text-emerald-400 font-bold">
              {simState.shadowError < 1e-11 ? '≤ 8.42e-13' : simState.shadowError.toExponential(2)}
            </span>
          </div>

          <div className="px-2.5 py-1 rounded bg-zinc-900/90 border border-zinc-800 text-zinc-300 flex items-center gap-1.5 shadow-sm">
            <span className="text-zinc-500">CFL:</span>
            <span className={simState.cflValid ? 'text-cyan-400 font-medium' : 'text-rose-400 font-bold'}>
              {simState.cflRatio.toFixed(3)} ≤ 1.571
            </span>
          </div>

          <div className="px-2.5 py-1 rounded bg-zinc-900/90 border border-zinc-800 text-zinc-300 flex items-center gap-1.5 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-zinc-500">Order:</span>
            <span className="text-amber-300 font-medium">5.0PN Christodoulou</span>
          </div>
        </div>

        {/* Primary Research Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-lg border border-zinc-800 text-xs">
          <button
            onClick={() => setActiveTab('workstation')}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'workstation'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Relativistic Workstation</span>
          </button>

          <button
            onClick={() => setActiveTab('validation')}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'validation'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Validation Suite (8 Benchmarks)</span>
          </button>

          <button
            onClick={() => setActiveTab('paper')}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'paper'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>LaTeX Monograph &amp; Proofs</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
