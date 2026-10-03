import React, { useState } from 'react';
import { Globe, Copy, Check, GitBranch, ShieldCheck, Server, Terminal, CheckCircle2, Zap, ArrowRight, AlertTriangle } from 'lucide-react';

interface CloudflareDeployModalProps {
  onClose?: () => void;
}

export const CloudflareDeployModal: React.FC<CloudflareDeployModalProps> = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const domain = 'pnautomata.bhutadamarasena.com';
  const cnameTarget = 'ais-dev-kgzpi7vjubcqzx2wvit4qa-348093651422.asia-east1.run.app';

  const wranglerToml = `# Cloudflare Pages Deployment Configuration
name = "pnautomata"
compatibility_date = "2024-10-01"
pages_build_output_dir = "./dist"

# Route & custom domain configuration
routes = [
  { pattern = "pnautomata.bhutadamarasena.com/*", zone_name = "bhutadamarasena.com" }
]

[env.production]
vars = { ENVIRONMENT = "production", APP_TITLE = "Phase-Synchronized Omnibus v6.0" }
`;

  const githubActionsWorkflow = `# .github/workflows/deploy-cloudflare.yml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main, master]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js 22 LTS
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci || npm install

      - name: Build Production Assets
        run: npm run build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: pnautomata
          directory: dist
          gitHubToken: \${{ secrets.GITHUB_TOKEN }}
`;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-br from-purple-950/40 via-zinc-900 to-zinc-900 border border-purple-800/40 rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400 uppercase tracking-wider mb-1">
              <Globe className="w-4 h-4" />
              <span>Cloudflare Pages &amp; GitHub Sync Deployment</span>
            </div>
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <span>Subdomain:</span>
              <span className="font-mono text-amber-300">{domain}</span>
            </h2>
            <p className="text-sm text-zinc-400 max-w-2xl mt-1">
              Auto-deploy on GitHub sync to Cloudflare Pages. Upgraded to modern Node.js 22 LTS &amp; Bun &gt;= 1.1 with problematic redirect files removed.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-700/80 text-emerald-400 text-xs font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Node 22 / Bun Ready
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-purple-950/80 border border-purple-700/80 text-purple-300 text-xs font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Full (Strict) SSL
            </span>
          </div>
        </div>
      </div>

      {/* Fix Summary Notice */}
      <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-700/80 text-xs space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <span>Fixes Applied for Cloudflare Auto-Deploy:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-zinc-300 pl-1 font-mono text-[11px]">
          <li><span className="text-emerald-300 font-bold">Removed public/_redirects:</span> Eliminated conflicting redirect rules and infinite redirect loops. Cloudflare Pages handles SPA client routes natively.</li>
          <li><span className="text-emerald-300 font-bold">Node.js 22 LTS &amp; Bun Levels Enforced:</span> Added <code className="text-cyan-300">.node-version</code> and <code className="text-cyan-300">.nvmrc</code> (set to 22) and updated <code className="text-cyan-300">package.json</code> engines (<code className="text-amber-300">node &gt;= 20.0.0, bun &gt;= 1.1.0</code>). Prevents legacy Cloudflare build image errors.</li>
          <li><span className="text-emerald-300 font-bold">GitHub Actions Workflow Added:</span> Configured <code className="text-cyan-300">.github/workflows/deploy-cloudflare.yml</code> for automated zero-downtime builds on git push.</li>
        </ul>
      </div>

      {/* Method 1: Cloudflare Pages GitHub Sync (Recommended Native Way) */}
      <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-cyan-600/30 text-cyan-300 font-bold text-xs flex items-center justify-center border border-cyan-500/50">
              1
            </div>
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-cyan-400" />
              <span>Native Cloudflare Pages GitHub Sync (One-Time Setup)</span>
            </h3>
          </div>
          <span className="text-xs text-zinc-500 font-mono">Cloudflare Dashboard → Workers &amp; Pages</span>
        </div>

        <p className="text-xs text-zinc-400">
          In your Cloudflare dashboard, click <strong>Create application → Pages → Connect to Git</strong> and select your repository <code className="text-zinc-200 font-mono">Phase_Synchronized_Omnibus_v6</code>. Enter the following exact settings:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 text-left">
                <th className="py-2 px-3">Field</th>
                <th className="py-2 px-3">Value</th>
                <th className="py-2 px-3 text-right">Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-800/60 bg-zinc-900/40 text-zinc-200">
                <td className="py-2.5 px-3 text-cyan-400 font-bold">Project Name</td>
                <td className="py-2.5 px-3 font-bold text-amber-300">pnautomata</td>
                <td className="py-2.5 px-3 text-zinc-400 text-right">Matches wrangler.toml</td>
              </tr>
              <tr className="border-b border-zinc-800/60 bg-zinc-900/40 text-zinc-200">
                <td className="py-2.5 px-3 text-cyan-400 font-bold">Production Branch</td>
                <td className="py-2.5 px-3 text-zinc-300">main</td>
                <td className="py-2.5 px-3 text-zinc-400 text-right">Auto-deploys on every commit</td>
              </tr>
              <tr className="border-b border-zinc-800/60 bg-zinc-900/40 text-zinc-200">
                <td className="py-2.5 px-3 text-cyan-400 font-bold">Framework Preset</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">Vite</td>
                <td className="py-2.5 px-3 text-zinc-400 text-right">Select Vite from dropdown</td>
              </tr>
              <tr className="border-b border-zinc-800/60 bg-zinc-900/40 text-zinc-200">
                <td className="py-2.5 px-3 text-cyan-400 font-bold">Build Command</td>
                <td className="py-2.5 px-3 text-zinc-200 font-bold">npm run build</td>
                <td className="py-2.5 px-3 text-zinc-400 text-right">Or <code className="text-amber-300">bun run build</code></td>
              </tr>
              <tr className="border-b border-zinc-800/60 bg-zinc-900/40 text-zinc-200">
                <td className="py-2.5 px-3 text-cyan-400 font-bold">Build Output Directory</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">dist</td>
                <td className="py-2.5 px-3 text-zinc-400 text-right">Clean production build</td>
              </tr>
              <tr className="border-b border-zinc-800/60 bg-zinc-900/40 text-zinc-200">
                <td className="py-2.5 px-3 text-cyan-400 font-bold">Root Directory</td>
                <td className="py-2.5 px-3 text-zinc-300">/</td>
                <td className="py-2.5 px-3 text-zinc-400 text-right">Repository root</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Environment Variables Box */}
        <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs">
          <div className="font-semibold text-zinc-200 flex items-center justify-between">
            <span>Environment Variables (under "Environment Variables" in build settings):</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
            <div className="p-2 rounded bg-black/40 border border-zinc-800 flex justify-between items-center">
              <span className="text-cyan-400">NODE_VERSION</span>
              <span className="text-amber-300 font-bold">22</span>
            </div>
            <div className="p-2 rounded bg-black/40 border border-zinc-800 flex justify-between items-center">
              <span className="text-cyan-400">BUN_VERSION</span>
              <span className="text-amber-300 font-bold">1.2.0</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Specifying <code className="text-amber-300">NODE_VERSION=22</code> guarantees Cloudflare uses the modern Node 22 runner with Vite and Tailwind v4.
          </p>
        </div>
      </div>

      {/* Step 2: Custom Domain Binding for pnautomata.bhutadamarasena.com */}
      <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-600/30 text-purple-300 font-bold text-xs flex items-center justify-center border border-purple-500/50">
              2
            </div>
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-400" />
              <span>Bind Subdomain: <span className="text-amber-300 font-mono">{domain}</span></span>
            </h3>
          </div>
          <span className="text-xs text-zinc-500 font-mono">Pages Project → Custom Domains</span>
        </div>

        <div className="space-y-2 text-xs text-zinc-300 leading-relaxed">
          <p>
            1. Inside your Cloudflare Pages project (<code className="text-cyan-300 font-mono">pnautomata</code>), click the <strong>Custom domains</strong> tab.
          </p>
          <p>
            2. Click <strong>Set up a custom domain</strong> and enter: <code className="text-amber-300 font-mono font-bold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">{domain}</code>.
          </p>
          <p>
            3. Since <code className="text-zinc-200 font-mono">bhutadamarasena.com</code> is already in your Cloudflare account, Cloudflare will automatically add the CNAME record for you with one click and provision a free Full (Strict) SSL certificate!
          </p>
        </div>

        <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 flex items-center gap-2.5 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>Zero manual DNS management needed — Cloudflare binds and proxies the domain automatically.</span>
        </div>
      </div>

      {/* Step 3: Direct CLI & GitHub Actions Alternative */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CLI deploy */}
        <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-semibold text-zinc-200">Manual / CLI Deploy</h4>
              </div>
              <button
                onClick={() => copyToClipboard('npm run build && npm run deploy', 'cli')}
                className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300 flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'cli' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy Command</span>
              </button>
            </div>
            <p className="text-xs text-zinc-400 mb-3">
              You can also build and deploy directly from your local terminal using modern npm or bun:
            </p>
            <pre className="p-3 bg-black/60 rounded text-[11px] font-mono text-cyan-300 overflow-x-auto border border-zinc-800/80">
{`# With npm:
npm run build
npm run deploy

# Or with modern Bun:
bun run build
bun x wrangler pages deploy dist --project-name=pnautomata`}
            </pre>
          </div>
        </div>

        {/* GitHub Actions */}
        <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-semibold text-zinc-200">GitHub Actions CI/CD</h4>
              </div>
              <button
                onClick={() => copyToClipboard(githubActionsWorkflow, 'workflow')}
                className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300 flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'workflow' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>deploy.yml</span>
              </button>
            </div>
            <p className="text-xs text-zinc-400 mb-3">
              The workflow file <code className="text-zinc-200 font-mono">.github/workflows/deploy-cloudflare.yml</code> has already been created in this repository!
            </p>
            <pre className="p-3 bg-black/60 rounded text-[11px] font-mono text-emerald-300 overflow-x-auto border border-zinc-800/80">
{`# Add these 2 secrets in GitHub Settings -> Secrets:
1. CLOUDFLARE_API_TOKEN
2. CLOUDFLARE_ACCOUNT_ID

# Every git push automatically builds & deploys!`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
