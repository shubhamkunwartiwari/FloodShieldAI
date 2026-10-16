import React, { useState } from 'react';
import { ArrowRight, Play, ShieldAlert } from 'lucide-react';
import { SystemStateSnapshot } from '../types/flood';
import heroImage from '../assets/images/hero_flood_intelligence_1791324494433.jpg';

interface LandingPageProps {
  systemState: SystemStateSnapshot;
  onLaunchCommandCenter: () => void;
  onLaunchDemoStory: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  systemState,
  onLaunchCommandCenter,
  onLaunchDemoStory,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-4 border-b border-slate-800/80 bg-[#07090E]/90 backdrop-blur-md sticky top-0 z-40">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
          }}
          className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap"
        >
          FloodShield AI
        </a>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a
            href="#capabilities"
            className="hover:text-white transition-colors whitespace-nowrap"
          >
            Capabilities
          </a>
          <a
            href="#prediction-engine"
            className="hover:text-white transition-colors whitespace-nowrap"
          >
            Prediction Engine
          </a>
          <a
            href="#impact-proof"
            className="hover:text-white transition-colors whitespace-nowrap"
          >
            Impact Model
          </a>
          <a
            href="#ethics"
            className="hover:text-white transition-colors whitespace-nowrap"
          >
            Methodology
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onLaunchDemoStory}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700 rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-cyan-400" />
            Run Storm Demo
          </button>
          <button
            onClick={onLaunchCommandCenter}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-md hover:bg-cyan-300 transition-colors whitespace-nowrap cursor-pointer"
          >
            Launch Command Center
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main id="top" className="flex-1">
        <section className="max-w-[1360px] mx-auto px-6 lg:px-12 pt-14 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="text-xs font-mono text-cyan-400 tracking-wide">
                Bengaluru Urban Watershed · Hydrological Intelligence Platform ·
                Open-Meteo &amp; Sentinel SAR Ready
              </div>

              <h1
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08]"
                style={{ textWrap: 'balance' }}
              >
                Predict. Prepare. Protect.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                AI-powered real-time flood intelligence for earlier warnings,
                smarter evacuation, and faster disaster response. Continuously
                synthesizes rainfall intensity, river stage, soil saturation,
                and urban topography into actionable emergency priorities.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onLaunchCommandCenter}
                  className="inline-flex items-center gap-2.5 px-6 py-3 text-sm font-semibold text-slate-950 bg-cyan-400 rounded-md hover:bg-cyan-300 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Launch Command Center
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onLaunchDemoStory}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-slate-200 bg-[#0F172A] border border-slate-700 rounded-md hover:border-slate-500 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Play className="w-4 h-4 text-amber-400" />
                  Simulate Bengaluru Storm Event (T+0 to T+50)
                </button>
              </div>

              {/* Live Telemetry Snapshot Bar (Unboxed Clean Metadata) */}
              <div className="pt-6 border-t border-slate-800/90 grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <div className="text-xs text-slate-400">Active Basin Risk</div>
                  <div className="mt-1 font-mono text-xl font-bold text-rose-400 tabular-nums">
                    ✖ {systemState.overallRisk}
                  </div>
                  <div className="text-xs text-slate-500 font-mono tabular-nums">
                    Confidence: {systemState.overallConfidencePct}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Peak Onset Window</div>
                  <div className="mt-1 font-mono text-xl font-bold text-white tabular-nums">
                    {systemState.timeToPeakRiskLabel}
                  </div>
                  <div className="text-xs text-slate-500 font-mono tabular-nums">
                    Rain: {systemState.currentRainfallMmHr} mm/hr
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Exposed Population</div>
                  <div className="mt-1 font-mono text-xl font-bold text-amber-400 tabular-nums">
                    {systemState.populationImpact.totalExposed.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500 font-mono tabular-nums">
                    {systemState.populationImpact.requiringEvacuation.toLocaleString()} evacuate
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Estimated Loss</div>
                  <div className="mt-1 font-mono text-xl font-bold text-white tabular-nums">
                    ₹{systemState.damage.totalCentralCr} Cr
                  </div>
                  <div className="text-xs text-slate-500 font-mono tabular-nums">
                    Range: ₹{systemState.damage.uncertaintyMinCr}–₹
                    {systemState.damage.uncertaintyMaxCr} Cr
                  </div>
                </div>
              </div>
            </div>

            {/* Right Focal Visual Carrier (16:9 with Resilient Fallback) */}
            <div className="lg:col-span-5">
              <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-[#0B0E17] aspect-video">
                {!imgError ? (
                  <img
                    src={heroImage}
                    alt="Bengaluru Urban Watershed Topographic Flood Intelligence Visualization"
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-[#0B0E17] to-cyan-950/40 text-center">
                    <ShieldAlert className="w-10 h-10 text-cyan-400 mb-2" />
                    <span className="font-mono text-xs text-slate-300">
                      BENGALURU WATERSHED DIGITAL TWIN · 6 CATCHMENTS
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-5">
                  <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
                    <span>KORAMANGALA–CHALLAGHATTA VALLEY</span>
                    <span className="tabular-nums">12.9304° N, 77.6784° E</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Real-time coupled hydrological runoff, depth-damage curves,
                    and safe-corridor routing across 6 municipal flood zones.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Capabilities Asymmetric Bento Grid */}
        <section
          id="capabilities"
          className="border-t border-slate-800/80 bg-[#0B0E17] py-16"
        >
          <div className="max-w-[1360px] mx-auto px-6 lg:px-12">
            <div className="max-w-2xl mb-10">
              <h2
                className="font-display text-2xl sm:text-3xl font-bold text-white"
                style={{ textWrap: 'balance' }}
              >
                Five Integrated Operational Modules in One Unified System
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                Every rainfall fluctuation immediately propagates across the
                hydrological model, inundation map, economic loss estimator,
                evacuation router, and AI copilot.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 01. Live Risk Map (Span 2) */}
              <div className="md:col-span-2 p-6 bg-[#0F172A] border border-slate-800 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono text-cyan-400">
                    01. Geospatial Intelligence · Interactive Layers
                  </div>
                  <h3 className="text-lg font-semibold text-white mt-2">
                    Live Risk Map &amp; Multi-Layer Catchment Telemetry
                  </h3>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                    Inspect real-time flood probability polygons, predicted
                    inundation extents, river discharge gauges, hospitals,
                    power substations, and civic shelters. Click any zone to
                    audit depth ranges, arrival countdowns, and safe evacuation
                    corridors.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
                  <span>6 Watershed Zones · 12 Critical Infrastructure Nodes</span>
                  <button
                    onClick={onLaunchCommandCenter}
                    className="text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                  >
                    Open Interactive Map →
                  </button>
                </div>
              </div>

              {/* 02. Explainable AI Predictions */}
              <div
                id="prediction-engine"
                className="p-6 bg-[#0F172A] border border-slate-800 rounded-lg flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-mono text-amber-400">
                    02. Explainable ML Engine
                  </div>
                  <h3 className="text-lg font-semibold text-white mt-2">
                    Multi-Horizon AI Predictions
                  </h3>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                    Generates 1h, 3h, 6h, and 12h flood probabilities with
                    transparent feature attribution across storm-drain capacity,
                    river rise rate, soil saturation, and impervious cover.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-400 tabular-nums">
                  1h: 38% · 3h: 72% · 6h: 91% · 12h: 96%
                </div>
              </div>

              {/* 03. Damage Estimation */}
              <div className="p-6 bg-[#0F172A] border border-slate-800 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono text-rose-400">
                    03. Depth-Damage Economics
                  </div>
                  <h3 className="text-lg font-semibold text-white mt-2">
                    Uncertainty-Aware Damage Estimation
                  </h3>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                    Computes residential, commercial, infrastructure, and
                    agricultural losses using depth-duration fragility curves
                    with explicit confidence intervals (e.g., ₹150–₹220 Cr).
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-400 tabular-nums">
                  Avoidable Loss Model: Up to 34% reduction
                </div>
              </div>

              {/* 04. Evacuation Optimization */}
              <div className="p-6 bg-[#0F172A] border border-slate-800 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono text-emerald-400">
                    04. Dynamic Routing
                  </div>
                  <h3 className="text-lg font-semibold text-white mt-2">
                    Evacuation Route Optimization
                  </h3>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                    Automatically flags submerged underpasses (e.g., Yemlur
                    Causeway, Panathur RUB) and reroutes evacuees along elevated
                    flyovers toward high-ground shelters and trauma centers.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-400 tabular-nums">
                  Real-time hazard avoidance &amp; ETA calculation
                </div>
              </div>

              {/* 05. Emergency Response & What-If Simulator */}
              <div className="p-6 bg-[#0F172A] border border-slate-800 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono text-cyan-400">
                    05. Command &amp; Simulation
                  </div>
                  <h3 className="text-lg font-semibold text-white mt-2">
                    Emergency Response &amp; What-If Simulator
                  </h3>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                    Ranks zone deployment priorities by population vulnerability
                    and infrastructure criticality, while allowing commanders to
                    stress-test +10% to +100% rainfall scenarios.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-400">
                  Includes FloodShield Copilot AI Assistant
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Proof of Impact / Potential Damage Avoided */}
        <section id="impact-proof" className="py-16 border-t border-slate-800/80">
          <div className="max-w-[1360px] mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="text-xs font-mono text-emerald-400">
                  QUANTIFIED INTERVENTION MODEL
                </div>
                <h2
                  className="font-display text-2xl sm:text-3xl font-bold text-white"
                  style={{ textWrap: 'balance' }}
                >
                  Measurable Reduction in Human Exposure and Economic Loss
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  By delivering localized flood-onset forecasts 2 to 4 hours
                  before peak channel overflow, municipal responders can
                  pre-deploy high-draft dewatering pumps, close vulnerable
                  underpasses, and evacuate ground-floor households.
                </p>
                <p className="text-xs text-slate-400">
                  Model-based estimate calibrated on historical Bengaluru urban
                  flood events (Sept 2022 &amp; Aug 2017); not a guaranteed
                  real-world outcome.
                </p>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-[#0F172A] border border-slate-800 rounded-lg">
                  <div className="text-xs text-slate-400">
                    Without Early Warning
                  </div>
                  <div className="mt-2 font-mono text-2xl font-bold text-rose-400 tabular-nums">
                    ₹{systemState.damage.withoutEarlyWarningCr} Cr
                  </div>
                  <div className="mt-2 text-xs text-slate-400">
                    Unmitigated basement, vehicle, substation, and commercial
                    corridor inundation.
                  </div>
                </div>

                <div className="p-5 bg-[#0F172A] border border-slate-800 rounded-lg">
                  <div className="text-xs text-slate-400">
                    With FloodShield Intervention
                  </div>
                  <div className="mt-2 font-mono text-2xl font-bold text-cyan-400 tabular-nums">
                    ₹{systemState.damage.withFloodShieldInterventionCr} Cr
                  </div>
                  <div className="mt-2 text-xs text-slate-400">
                    Staged evacuation, flood-barrier deployment, and traffic
                    diversion 3h prior.
                  </div>
                </div>

                <div className="p-5 bg-[#0F172A] border border-emerald-500/40 rounded-lg">
                  <div className="text-xs text-emerald-300 font-medium">
                    Potential Damage Avoided
                  </div>
                  <div className="mt-2 font-mono text-2xl font-bold text-emerald-400 tabular-nums">
                    ₹{systemState.damage.potentiallyAvoidedCr} Cr
                  </div>
                  <div className="mt-2 text-xs text-slate-300">
                    Model-estimated savings plus{' '}
                    <span className="font-mono tabular-nums font-semibold">
                      {systemState.populationImpact.requiringEvacuation.toLocaleString()}
                    </span>{' '}
                    residents safely evacuated early.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Ethics, Safety & Methodology Footer */}
      <footer
        id="ethics"
        className="border-t border-slate-800 bg-[#07090E] py-8 px-6 lg:px-12 text-xs text-slate-400"
      >
        <div className="max-w-[1360px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="font-semibold text-slate-200">
              Ethics, Safety &amp; Decision-Support Disclaimer
            </div>
            <p>
              This system provides predictive estimates for research and
              decision-support purposes. It is not a replacement for official
              emergency warnings or instructions from local authorities (NDMA,
              KSNDMC, BBMP, IMD). No personally identifiable information (PII)
              is collected or displayed.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={onLaunchCommandCenter}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-md hover:bg-cyan-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              Enter Command Center
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
