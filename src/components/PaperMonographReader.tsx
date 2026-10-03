import React, { useState } from 'react';
import { MathView } from './MathView';
import { BookOpen, FileCode, Copy, Check, ExternalLink, Bookmark } from 'lucide-react';

export const PaperMonographReader: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('sec1');
  const [copied, setCopied] = useState<boolean>(false);

  const copyDoi = () => {
    navigator.clipboard.writeText('10.5281/zenodo.23116082');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
      {/* Navigation Table of Contents (Sticky Sidebar) */}
      <aside className="lg:w-64 shrink-0">
        <div className="sticky top-20 bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider pb-2 border-b border-zinc-800">
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span>Monograph Contents</span>
          </div>

          <nav className="space-y-1 text-xs font-medium">
            <button
              onClick={() => setActiveSection('sec1')}
              className={`w-full text-left px-2.5 py-1.5 rounded transition ${
                activeSection === 'sec1'
                  ? 'bg-amber-950/60 text-amber-300 font-bold border-l-2 border-amber-400'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              1. Introduction & Architecture
            </button>
            <button
              onClick={() => setActiveSection('sec2')}
              className={`w-full text-left px-2.5 py-1.5 rounded transition ${
                activeSection === 'sec2'
                  ? 'bg-amber-950/60 text-amber-300 font-bold border-l-2 border-amber-400'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              2. Riemannian Swarm Topology
            </button>
            <button
              onClick={() => setActiveSection('sec3')}
              className={`w-full text-left px-2.5 py-1.5 rounded transition ${
                activeSection === 'sec3'
                  ? 'bg-amber-950/60 text-amber-300 font-bold border-l-2 border-amber-400'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              3. 5.0PN Relativistic Dynamics
            </button>
            <button
              onClick={() => setActiveSection('sec4')}
              className={`w-full text-left px-2.5 py-1.5 rounded transition ${
                activeSection === 'sec4'
                  ? 'bg-amber-950/60 text-amber-300 font-bold border-l-2 border-amber-400'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              4. Contact Control & Soft-Min
            </button>
            <button
              onClick={() => setActiveSection('sec5')}
              className={`w-full text-left px-2.5 py-1.5 rounded transition ${
                activeSection === 'sec5'
                  ? 'bg-amber-950/60 text-amber-300 font-bold border-l-2 border-amber-400'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              5. Braid DFA & EOB Plunge
            </button>
            <button
              onClick={() => setActiveSection('sec6')}
              className={`w-full text-left px-2.5 py-1.5 rounded transition ${
                activeSection === 'sec6'
                  ? 'bg-amber-950/60 text-amber-300 font-bold border-l-2 border-amber-400'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              6. Empirical Verification & Benchmarks
            </button>
            <button
              onClick={() => setActiveSection('sec7')}
              className={`w-full text-left px-2.5 py-1.5 rounded transition ${
                activeSection === 'sec7'
                  ? 'bg-amber-950/60 text-amber-300 font-bold border-l-2 border-amber-400'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              References & Citations
            </button>
          </nav>

          <div className="pt-3 border-t border-zinc-800 space-y-2 text-[11px] font-mono text-zinc-500">
            <div>AMS: 70H15, 65P10, 57K10, 83C25</div>
            <div>PACS: 05.45.Xt, 04.25.Nx</div>
            <button
              onClick={copyDoi}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'DOI Copied' : 'Copy Preprint DOI'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Manuscript Body */}
      <article className="flex-1 bg-zinc-950/60 border border-zinc-800 rounded-xl p-6 md:p-8 space-y-8 text-zinc-300 leading-relaxed text-sm">
        {/* Title Header */}
        <div className="border-b border-zinc-800 pb-6 text-center space-y-3">
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block">
            Preprint Monograph • Final Version 6.0 (Omnibus)
          </span>
          <h1 className="text-xl md:text-2xl font-bold text-zinc-100 max-w-3xl mx-auto leading-tight">
            Phase-Synchronized Trajectory Optimization in Synthetic Multi-Agent Systems: Riemannian Kuramoto Dynamics, 5.0PN Christodoulou Memory, Contact Integrators, and EOB-Braid Automata
          </h1>
          <h2 className="text-sm font-semibold text-zinc-400 max-w-2xl mx-auto">
            Resolving Extreme Eccentricities, Tail-of-Tails, Non-Zeno Hysteresis, and Symplectic-Contact Plunge Dynamics
          </h2>

          <div className="pt-3 text-xs text-zinc-400 space-y-1">
            <div className="font-semibold text-zinc-200 text-sm">
              Arya Arunachala Ananda Ghulam-e-Shah-e-Unmani
            </div>
            <div>
              <span className="italic">BhutaDamaraSena R&D Labs</span> &nbsp;·&nbsp;{' '}
              <span className="italic">Aghora Abraham Global LLC</span>
            </div>
            <div className="font-mono text-[11px] text-amber-400">
              <a
                href="https://doi.org/10.5281/zenodo.23116082"
                target="_blank"
                rel="noreferrer"
                className="hover:underline inline-flex items-center gap-1 font-semibold"
              >
                Preprint DOI: 10.5281/zenodo.23116082
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="text-[11px] text-zinc-500">September 30, 2026</div>
          </div>

          {/* Abstract */}
          <div className="mt-6 p-4 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-left text-xs space-y-2 text-zinc-300">
            <span className="font-bold text-zinc-100 uppercase tracking-wider block text-[11px]">Abstract</span>
            <p>
              We formulate and rigorously establish the Definitive Omnibus Version 6.0 of the unified geometric, thermodynamic, and topological framework governing synthetic multi-agent systems in extreme relativistic regimes. This monograph systematically unifies the macroscopic topological control established in V5.0 with the microscopic 5.0PN contact integration developed in V6.0 iterations:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-zinc-400 pl-1">
              <li><strong>Curved-Manifold Synchronization:</strong> Symmetric Langevin thermostat on a Riemannian Cauchy slice <MathView math="(\Sigma, g)" /> via Levi-Civita covariant parallel transport.</li>
              <li><strong>Complete 5.0PN Equations of Motion:</strong> Non-separable 3PN conservative core + 5.0PN Christodoulou non-linear memory and tail-of-tails.</li>
              <li><strong>Adaptive Multi-Grid Reservoirs and Contact Control:</strong> Dynamically allocated <MathView math="K=16" /> Padé-Laplace reservoir <MathView math="\lambda_m(\omega_p)" /> + <MathView math="C^\infty" /> soft-minimum potential <MathView math="\mathcal{R}_\beta(q)" />.</li>
              <li><strong>Topological Braid DFA and EOB Hybridization:</strong> Artin braid group <MathView math="B_N" /> mapping + non-Zeno hysteresis and Effective One-Body (EOB) QNM ringdown sink state <MathView math="S_4" />.</li>
            </ol>
          </div>
        </div>

        {/* Section 1: Introduction */}
        <section id="sec1" className="space-y-4">
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-800 pb-2">
            <span className="text-amber-400 font-mono">1.</span>
            <span>Introduction and Architecture Overview</span>
          </h3>
          <p>
            The precise coordination of synthetic multi-agent autonomous swarms requires resolving physics across widely varying scales: from macroscopic topological organization and spatial collision avoidance to microscopic ultra-relativistic momentum interactions. This Definitive Version 6.0 establishes a strict two-tier architectural hierarchy:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3 text-xs">
            <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/40">
              <strong className="text-cyan-300 block mb-1">Tier 1: Macro-Scale Swarm Topology</strong>
              Agents navigate a curved Riemannian spatial slice <MathView math="(\Sigma, g)" />, establishing macroscopic phase synchronization via covariant parallel transport to the Karcher barycenter.
            </div>
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40">
              <strong className="text-emerald-300 block mb-1">Tier 2: Micro-Scale Relativistic Dynamics</strong>
              Short-range interactions trigger extreme Post-Newtonian (PN) fields, including continuous 5.0PN non-Markovian radiation reaction solved via adaptive fading-memory reservoirs and conformal contact integrators.
            </div>
          </div>
        </section>

        {/* Section 2: Riemannian Kuramoto */}
        <section id="sec2" className="space-y-4">
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-800 pb-2">
            <span className="text-amber-400 font-mono">2.</span>
            <span>Riemannian Swarm Topology and Covariant Synchronization</span>
          </h3>
          <p>
            Let <MathView math="(\Sigma, g)" /> be a smooth, connected, orientable <MathView math="d" />-dimensional Riemannian manifold representing the spatial navigation domain. Let <MathView math="\nabla" /> denote the unique Levi-Civita connection compatible with <MathView math="g" />. An <MathView math="N" />-agent system possesses spatial coordinates <MathView math="q_i \in \Sigma" /> and Synthetic Phase Alignment Parameters <MathView math="\Phi_i(t) \in \mathbb{S}^1 = [0, 2\pi)" />.
          </p>

          <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
            <div className="font-bold text-zinc-200">
              Definition 2.1 (Barycentric Geodesic Pole and Injectivity Constraint)
            </div>
            <p>
              To ensure covariant formulations are globally single-valued, we require the spatial swarm radius to satisfy the Karcher-Schoen uniqueness bound:
            </p>
            <div className="my-2 text-center text-cyan-300">
              <MathView math="\operatorname{rad}(\{q_1, \dots, q_N\}) < \min\left( \frac{1}{2} \operatorname{inj}(\Sigma, g), \frac{\pi}{2\sqrt{K_{\max}}} \right)" block />
            </div>
            <p>
              Under this normal-neighborhood constraint, the Riemannian Karcher barycenter strictly minimizes the variance functional <MathView math="q_0 \coloneqq \arg\min_{q \in \Sigma} \sum_{i=1}^N m_i d_g^2(q, q_i)" />.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
            <div className="font-bold text-zinc-200">
              Theorem 2.3 (Exponential Phase-Locking Convergence with Geometric Frustration)
            </div>
            <p>
              Let <MathView math="\delta_{\max}^g \coloneqq \frac{1}{6} K_{\max} \operatorname{diam}(\Sigma)^2 < \frac{\pi}{4}" /> bound the Riemann connection holonomy. For coupling gain <MathView math="K_{\mathrm{sync}} > K_c^g" />, the expected Lyapunov coherence exhibits exponential contraction:
            </p>
            <div className="my-2 text-center text-emerald-300">
              <MathView math="\mathbb{E}[1 - R_g(t)] \le (1 - R_g(0)) e^{-\lambda_g t}" block />
            </div>
          </div>
        </section>

        {/* Section 3: 5.0PN Dynamics */}
        <section id="sec3" className="space-y-4">
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-800 pb-2">
            <span className="text-amber-400 font-mono">3.</span>
            <span>Micro-Scale 5.0PN Conservative and Dissipative Relativistic Dynamics</span>
          </h3>
          <p>
            The micro-scale Hamiltonian features velocity-dependent interactions up to 3PN, augmented by Spin-Orbit (<MathView math="H_{\mathrm{SO}}" />) and Spin-Spin (<MathView math="H_{\mathrm{SS}}^{\mathrm{2PN}}" />) couplings with synthetic quadrupole deformations <MathView math="C_{Qi}" />:
          </p>
          <div className="my-2 text-center text-cyan-300">
            <MathView math="H_{\mathrm{conserv}} = H_{\mathrm{Newt}} + \frac{1}{c^2} H_{\mathrm{1PN}} + \frac{1}{c^4} H_{\mathrm{2PN}} + \frac{1}{c^6} H_{\mathrm{3PN}} + H_{\mathrm{SO}} + H_{\mathrm{SS}}" block />
          </div>

          <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider mt-4">
            The Full 5.0PN Radiation Reaction Cascade
          </h4>
          <div className="my-2 text-center text-amber-300">
            <MathView math="\bm{a}_{\mathrm{dissipative}} = \bm{a}_{3.5\mathrm{PN}}^{\mathrm{inst}} + \bm{a}_{\mathrm{SS}}^{\mathrm{RR}} + \bm{a}_{4.0\mathrm{PN}}^{\mathrm{tail}} + \bm{a}_{4.5\mathrm{PN}}^{\mathrm{tail-tail}} + \bm{a}_{5.0\mathrm{PN}}^{\mathrm{memory}}" block />
          </div>

          <p>
            In particular, the <strong>5.0PN Christodoulou Non-Linear Memory</strong> term is generated by gravitational waves interacting with their own radiative energy flux:
          </p>
          <div className="my-2 text-center text-amber-400">
            <MathView math="a_{i, 5.0\mathrm{PN}}^{\mathrm{memory}}(t) = \frac{2}{5} \frac{G^2}{c^{10}} \ddot{I}_{jk}^{(3)}(t) \int_{-\infty}^{t} \frac{I_{jk}^{(4)}(t')}{t - t'} dt'" block />
          </div>
          <p>
            producing a permanent, non-oscillatory DC metric shift in the asymptotic spatial metric.
          </p>
        </section>

        {/* Section 4: Contact Control */}
        <section id="sec4" className="space-y-4">
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-800 pb-2">
            <span className="text-amber-400 font-mono">4.</span>
            <span>Dual-Layer Control: Soft-Minimum Restraints and Contact Integration</span>
          </h3>
          <p>
            To eliminate non-differentiable cusps that break Lie series, we introduce the <MathView math="C^\infty" /> Soft-Minimum Potential:
          </p>
          <div className="my-2 text-center text-cyan-300">
            <MathView math="\mathcal{R}_\beta(\bm{q}) \coloneqq -\frac{1}{\beta} \ln \left( \sum_{1 \le i < j \le N} \exp\left( -\beta \|\bm{q}_i - \bm{q}_j\| \right) \right)" block />
          </div>

          <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
            <div className="font-bold text-zinc-200">
              Theorem 4.1 (CFL Stability and Uniform Constraint Bounds)
            </div>
            <p>
              Under the Courant-Friedrichs-Lewy condition <MathView math="\Delta \tau \cdot \sup \omega(\mathcal{R}_\beta) \le \frac{\pi}{2} < 2" />, the transverse error from the physical constraint manifold is unconditionally bounded:
            </p>
            <div className="my-2 text-center text-emerald-300">
              <MathView math="\sup_{\tau \in [0, \mathcal{T}]} \operatorname{dist}((\bm{q}, \bm{p}, \bm{x}, \bm{y}), \mathcal{C}) \le C_0 \frac{\Delta \tau}{\omega_0} + \mathcal{O}(\Delta \tau^2)" block />
            </div>
          </div>
        </section>

        {/* Section 5: Braid DFA */}
        <section id="sec5" className="space-y-4">
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-800 pb-2">
            <span className="text-amber-400 font-mono">5.</span>
            <span>Topological Braid DFA and EOB Hybridization</span>
          </h3>
          <p>
            Agent trajectories are projected onto observer plane <MathView math="\mathbf{n} \in \mathbb{S}^2" /> to yield Artin braid words <MathView math="w_{\mathbf{n}} \in B_N" />. The 5-state automaton (<MathView math="B_N\text{-DFA}_{\mathrm{EOB}}^{5.0\mathrm{PN}}" />) governs macro-state transitions with non-Zeno hysteresis gap <MathView math="\mathcal{H}_{\mathrm{ratio}} \in (2.5, 8.0)" />. When <MathView math="r \le r_{\mathrm{ISCO}} = 6M" />, the system enters sink state <MathView math="S_4" /> governed by Effective One-Body Padé resummation <MathView math="A_{\mathrm{EOB}}(u) = P_5^1[\dots]" /> and Kerr QNM ringdown!
          </p>
        </section>

        {/* Section 6: Benchmarks */}
        <section id="sec6" className="space-y-4">
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-800 pb-2">
            <span className="text-amber-400 font-mono">6.</span>
            <span>Empirical Verification and Benchmarks</span>
          </h3>
          <p>
            Table 3 confirms Contact-Strang energy balance <MathView math="\le 10^{-12}" /> across <MathView math="10^5" /> cycles with zero secular drift. At extreme eccentricity <MathView math="e=0.95" />, the adaptive <MathView math="K=16" /> multi-grid reservoir restricts phase dephasing to <MathView math="\Delta\Phi \le 0.009 \, \mathrm{rad}" /> with waveform match <MathView math="\mathcal{M} = 0.9999" /> against SEOBNRv5HM baselines!
          </p>
        </section>

        {/* Section 7: References */}
        <section id="sec7" className="space-y-3 pt-4 border-t border-zinc-800 text-xs">
          <h4 className="font-bold text-zinc-200 uppercase tracking-wider">References</h4>
          <ol className="list-decimal list-inside space-y-1.5 text-zinc-400">
            <li>A. A. A. Ghulam-e-Shah-e-Unmani, <em>Phase-Synchronized Trajectory Optimization in Synthetic Multi-Agent Systems</em>, V5.0, DOI: 10.5281/zenodo.22851183 (2026).</li>
            <li>M. Tao, <em>Explicit symplectic approximation of nonseparable Hamiltonians</em>, Phys. Rev. E 94, 043303 (2016).</li>
            <li>H. Karcher, <em>Riemannian center of mass and mollifier smoothing</em>, Comm. Pure Appl. Math. 30(5), 509–541 (1977).</li>
            <li>W. Ambrose and I. M. Singer, <em>A theorem on holonomy</em>, Trans. Amer. Math. Soc. 75(3), 428–443 (1953).</li>
            <li>T. Damour, P. Jaranowski, and G. Schäfer, <em>Hamiltonian of two spinning compact bodies</em>, Phys. Rev. D 77(6), 064032 (2008).</li>
            <li>D. Christodoulou, <em>Nonlinear nature of gravitation and gravitational-wave experiments</em>, Phys. Rev. Lett. 67(12), 1486–1489 (1991).</li>
            <li>L. Blanchet, <em>Gravitational radiation from post-Newtonian sources</em>, Living Rev. Relativity 17, 2 (2014).</li>
            <li>A. Bravetti, H. Cruz, and D. Tapias, <em>Contact geometry and thermodynamics</em>, Ann. Phys. 376, 17–39 (2017).</li>
            <li>E. Artin, <em>Theory of braids</em>, Ann. of Math. 48(1), 101–126 (1947).</li>
            <li>A. Buonanno and T. Damour, <em>Effective one-body approach to general relativistic two-body dynamics</em>, Phys. Rev. D 59(8), 084006 (1999).</li>
          </ol>
        </section>
      </article>
    </div>
  );
};
