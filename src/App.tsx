import React, { useEffect, useMemo, useState } from 'react';
import { DEMO_STORM_STEPS } from './data/bengaluruWatershed';
import {
  computeSystemState,
  LiveMeteorologicalFeed,
} from './engine/predictionEngine';
import { SimulationParameters } from './types/flood';
import { LandingPage } from './components/LandingPage';
import {
  getPlainThreatInfo,
  InteractiveFloodMap,
} from './components/InteractiveFloodMap';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { SatelliteComparisonView } from './components/SatelliteComparisonView';
import { CopilotDrawer } from './components/CopilotDrawer';
import {
  DamageAndPopulationSection,
  EmergencyResponseAndEvacuationSection,
  InfrastructureAndHistorySection,
  LiveTimelineAndQualitySection,
} from './components/AnalyticsAndImpactPanels';
import {
  AlertTriangle,
  BarChart3,
  Bot,
  CloudRain,
  Compass,
  ExternalLink,
  MapPin,
  Pause,
  Play,
  Radio,
  ShieldAlert,
  Sliders,
  Users,
} from 'lucide-react';

type WorkspaceTab =
  | 'MAP_AND_WARNINGS'
  | 'EVACUATION_AND_HELP'
  | 'WHAT_IF_SIMULATOR'
  | 'IMPACT_AND_HISTORY';

const FRIENDLY_STEP_LABELS = [
  '1. Rain Starts',
  '2. Heavy Downpour',
  '3. Drains Filling',
  '4. Flash Flood Risk',
  '5. Extreme Peak',
  '6. Evacuation Active',
];

export default function App() {
  const [activeSurface, setActiveSurface] = useState<
    'COMMAND_CENTER' | 'LANDING'
  >('COMMAND_CENTER');
  const [activeTab, setActiveTab] =
    useState<WorkspaceTab>('MAP_AND_WARNINGS');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('zone-4');
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isDemoPlaying, setIsDemoPlaying] = useState<boolean>(false);
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState<boolean>(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () =>
      window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  // Default to Step 4 (Flash Flood Risk) for immediate rich data demonstration
  const [simParams, setSimParams] = useState<SimulationParameters>({
    mode: 'DEMO_STORM',
    demoStepIndex: 3,
    rainfallMultiplierPct: 0,
    riverLevelDeltaM: 0,
    soilSaturationOverridePct: null,
  });

  const [liveFeed, setLiveFeed] = useState<LiveMeteorologicalFeed | null>(null);

  // Fetch real Open-Meteo & GloFAS hydrological data on mount
  useEffect(() => {
    let cancelled = false;
    fetch('/api/telemetry/live?lat=12.9716&lon=77.5946')
      .then((r) => r.json())
      .then((data: LiveMeteorologicalFeed) => {
        if (!cancelled) {
          setLiveFeed(data);
        }
      })
      .catch(() => {
        // Fallback handled smoothly inside predictionEngine
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-advance Demo Mode when playing
  useEffect(() => {
    if (!isDemoPlaying) return;
    const interval = setInterval(() => {
      setSimParams((prev) => ({
        ...prev,
        mode: 'DEMO_STORM',
        demoStepIndex: (prev.demoStepIndex + 1) % DEMO_STORM_STEPS.length,
      }));
    }, 3500);
    return () => clearInterval(interval);
  }, [isDemoPlaying]);

  // Compute unified system state
  const systemState = useMemo(
    () => computeSystemState(simParams, liveFeed),
    [simParams, liveFeed]
  );

  const baselineState = useMemo(
    () =>
      computeSystemState(
        {
          ...simParams,
          rainfallMultiplierPct: 0,
          riverLevelDeltaM: 0,
          soilSaturationOverridePct: null,
        },
        liveFeed
      ),
    [simParams, liveFeed]
  );

  const totalBuildingsAtRisk = useMemo(
    () => systemState.zones.reduce((acc, z) => acc + z.buildingsAtRisk, 0),
    [systemState]
  );

  const topAlert = systemState.activeAlerts[0];
  const overallThreatInfo = getPlainThreatInfo(systemState.overallRisk);

  if (activeSurface === 'LANDING') {
    return (
      <LandingPage
        systemState={systemState}
        onLaunchCommandCenter={() => setActiveSurface('COMMAND_CENTER')}
        onLaunchDemoStory={() => {
          setSimParams({
            mode: 'DEMO_STORM',
            demoStepIndex: 0,
            rainfallMultiplierPct: 0,
            riverLevelDeltaM: 0,
            soilSaturationOverridePct: null,
          });
          setIsDemoPlaying(true);
          setActiveSurface('COMMAND_CENTER');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {gmpQuotaExceeded && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-200 px-4 py-2 text-xs text-center sticky top-0 z-50">
          <span>
            Google Maps Platform quota reached. Visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-100 hover:text-white"
            >
              maps developer site
            </a>{' '}
            to manage API quotas.
          </span>
        </div>
      )}

      {/* Professional Top Navigation Header */}
      <header className="flex items-center justify-between px-6 lg:px-10 py-3.5 border-b border-slate-800/80 bg-[#0A0D14]/95 backdrop-blur-md sticky top-0 z-30">
        {/* Brand with Open-Source Badge */}
        <div className="flex items-center gap-3">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('MAP_AND_WARNINGS');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/25 transition-colors">
              <CloudRain className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-base font-bold tracking-tight text-white leading-tight">
                FloodShield AI
              </span>
              <span className="text-[10px] text-slate-400 tracking-wide font-mono">
                Open-Source Hydrology Platform
              </span>
            </div>
          </a>
        </div>

        {/* Clean Center Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#0e131f] p-1 rounded-lg border border-slate-800/80 text-xs font-medium">
          <button
            onClick={() => setActiveTab('MAP_AND_WARNINGS')}
            className={`px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'MAP_AND_WARNINGS'
                ? 'bg-cyan-400 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Live Map &amp; Warnings
          </button>
          <button
            onClick={() => setActiveTab('EVACUATION_AND_HELP')}
            className={`px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'EVACUATION_AND_HELP'
                ? 'bg-cyan-400 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Safe Routes &amp; Shelters
          </button>
          <button
            onClick={() => setActiveTab('WHAT_IF_SIMULATOR')}
            className={`px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'WHAT_IF_SIMULATOR'
                ? 'bg-cyan-400 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            What-If Simulator
          </button>
          <button
            onClick={() => setActiveTab('IMPACT_AND_HISTORY')}
            className={`px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'IMPACT_AND_HISTORY'
                ? 'bg-cyan-400 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Damage &amp; Satellite Data
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveSurface('LANDING')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <span>About</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>
          <button
            onClick={() => setIsCopilotOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-md shadow-cyan-500/10"
          >
            <Bot className="w-3.5 h-3.5" />
            Ask Copilot AI
          </button>
        </div>
      </header>

      {/* Streamlined Live Data & Storm Progression Command Strip */}
      <div className="bg-[#0b0f19] border-b border-slate-800/80 px-6 lg:px-10 py-2.5">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Data Mode Indicator */}
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`flex items-center gap-1.5 font-semibold ${
                systemState.isSimulatedData
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    systemState.isSimulatedData
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    systemState.isSimulatedData
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
              </span>
              {systemState.isSimulatedData
                ? 'Storm Scenario Simulation'
                : 'Live Hydrology API (Open-Meteo)'}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 text-[11px] hidden sm:inline">
              Bengaluru Urban Basin
            </span>
          </div>

          {/* Storm Progression Scrubber + Live Switch */}
          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            <div className="flex items-center gap-1 bg-[#07090e] p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setIsDemoPlaying((p) => !p)}
                className="px-2.5 py-1 text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 rounded-md hover:bg-cyan-500/25 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                title={isDemoPlaying ? 'Pause Simulation' : 'Auto-play Storm Timeline'}
              >
                {isDemoPlaying ? (
                  <>
                    <Pause className="w-3 h-3" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" /> Play
                  </>
                )}
              </button>

              {DEMO_STORM_STEPS.map((step, idx) => (
                <button
                  key={step.stepIndex}
                  onClick={() => {
                    setIsDemoPlaying(false);
                    setSimParams((prev) => ({
                      ...prev,
                      mode: 'DEMO_STORM',
                      demoStepIndex: step.stepIndex,
                    }));
                  }}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    simParams.mode !== 'LIVE_OPEN_METEO' &&
                    simParams.demoStepIndex === step.stepIndex
                      ? 'bg-cyan-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {FRIENDLY_STEP_LABELS[idx] || step.timeOffsetLabel}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setIsDemoPlaying(false);
                setSimParams((prev) => ({
                  ...prev,
                  mode:
                    prev.mode === 'LIVE_OPEN_METEO'
                      ? 'DEMO_STORM'
                      : 'LIVE_OPEN_METEO',
                }));
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                simParams.mode === 'LIVE_OPEN_METEO'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                  : 'bg-[#07090e] border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Radio className="w-3 h-3" />
              {simParams.mode === 'LIVE_OPEN_METEO'
                ? 'Live Weather'
                : 'Use Live API'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <main
        id="top"
        className="flex-1 max-w-[1600px] w-full mx-auto px-6 lg:px-10 py-6 space-y-6"
      >
        {/* 1. Four Clean, Uncluttered KPI Status Cards */}
        <section aria-label="Key Flood Telemetry & Impact Metrics">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Metric 1: Threat Level */}
            <div className="p-4 bg-[#0a0d14] border border-slate-800/80 rounded-xl flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium">Basin Flood Threat</span>
                <span className="font-mono text-[11px] text-slate-400">
                  {systemState.overallConfidencePct}% conf.
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline justify-between gap-2">
                <span
                  className={`text-2xl font-bold tracking-tight ${overallThreatInfo.textColor}`}
                >
                  {systemState.overallRisk}
                </span>
                <span className="text-xs font-mono text-cyan-300">
                  Peak in {systemState.timeToPeakRiskLabel}
                </span>
              </div>
              <p className="mt-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400 truncate">
                {overallThreatInfo.plainMeaning}
              </p>
            </div>

            {/* Metric 2: Population Exposed */}
            <div className="p-4 bg-[#0a0d14] border border-slate-800/80 rounded-xl flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium">Exposed Population</span>
                <Users className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="mt-2.5 flex items-baseline justify-between gap-2">
                <span className="font-mono text-2xl font-bold text-white tabular-nums">
                  {systemState.populationImpact.totalExposed.toLocaleString()}
                </span>
                <span className="text-xs font-mono text-amber-400 font-semibold tabular-nums">
                  {systemState.populationImpact.requiringEvacuation.toLocaleString()}{' '}
                  to evacuate
                </span>
              </div>
              <p className="mt-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400 truncate">
                {totalBuildingsAtRisk.toLocaleString()} buildings ·{' '}
                {systemState.roadsAffectedCount} flooded road segments
              </p>
            </div>

            {/* Metric 3: Weather & River Conditions */}
            <div className="p-4 bg-[#0a0d14] border border-slate-800/80 rounded-xl flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium">Rain &amp; River Stage</span>
                <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="mt-2.5 flex items-baseline justify-between gap-2">
                <span className="font-mono text-2xl font-bold text-cyan-400 tabular-nums">
                  {systemState.currentRainfallMmHr}{' '}
                  <span className="text-xs font-sans font-normal text-slate-400">
                    mm/hr
                  </span>
                </span>
                <span className="text-xs font-mono text-slate-300 tabular-nums">
                  River: {systemState.riverWaterLevelM}m
                </span>
              </div>
              <p className="mt-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400 truncate">
                Ground saturation is at {systemState.soilSaturationPct}% ·{' '}
                {systemState.riverWaterLevelM >= systemState.riverDangerLevelM
                  ? 'Above threshold'
                  : 'Below danger level'}
              </p>
            </div>

            {/* Metric 4: Economic Damage & Savable Losses */}
            <div className="p-4 bg-[#0a0d14] border border-slate-800/80 rounded-xl flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium">Estimated Damage</span>
                <span className="font-mono text-emerald-400 text-xs">
                  ₹{systemState.damage.potentiallyAvoidedCr} Cr savable
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline justify-between gap-2">
                <span className="font-mono text-2xl font-bold text-rose-400 tabular-nums">
                  ₹{systemState.damage.totalCentralCr} Cr
                </span>
                <span className="text-xs font-mono text-slate-400 tabular-nums">
                  Range: ₹{systemState.damage.uncertaintyMinCr}–₹
                  {systemState.damage.uncertaintyMaxCr} Cr
                </span>
              </div>
              <p className="mt-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400 truncate">
                Early barriers &amp; sandbagging avoid ~34% of losses
              </p>
            </div>
          </div>
        </section>

        {/* 2. Urgent Flash Flood Alert Banner (High Contrast, Concise) */}
        {topAlert && (
          <section
            aria-label="Active Flood Warning Banner"
            className={`p-3.5 px-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md ${
              topAlert.alertColor === 'RED'
                ? 'bg-rose-950/20 border-rose-500/50'
                : topAlert.alertColor === 'ORANGE'
                ? 'bg-orange-950/20 border-orange-500/50'
                : 'bg-amber-950/20 border-amber-500/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>
                    Active Warning: {topAlert.zoneName.split('·')[1] || topAlert.zoneName}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-rose-400 px-1.5 py-0.2 rounded bg-rose-500/15">
                    {topAlert.floodProbability}% probability · Peak in{' '}
                    {topAlert.expectedOnset.replace('Approx. ', '')}
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  {topAlert.recommendedActions[0] ||
                    'Move valuables to upper floors and avoid flooded roads.'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setSelectedZoneId(topAlert.zoneId);
                  setActiveTab('EVACUATION_AND_HELP');
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Safe Routes →
              </button>
            </div>
          </section>
        )}

        {/* 3. Tab Contents */}

        {/* Tab 1: Live Flood Map & Timeline */}
        {activeTab === 'MAP_AND_WARNINGS' && (
          <div className="space-y-6">
            <InteractiveFloodMap
              zones={systemState.zones}
              infrastructure={systemState.infrastructure}
              evacuationRoutes={systemState.evacuationRoutes}
              selectedZoneId={selectedZoneId}
              onSelectZone={setSelectedZoneId}
            />
            <LiveTimelineAndQualitySection systemState={systemState} />
          </div>
        )}

        {/* Tab 2: Safe Evacuation Routes, Emergency Response & Hospitals */}
        {activeTab === 'EVACUATION_AND_HELP' && (
          <div className="space-y-6">
            <EmergencyResponseAndEvacuationSection
              systemState={systemState}
              selectedZoneId={selectedZoneId}
              onSelectZone={setSelectedZoneId}
            />
            <InfrastructureAndHistorySection systemState={systemState} />
          </div>
        )}

        {/* Tab 3: Interactive What-If Simulator + Map Preview */}
        {activeTab === 'WHAT_IF_SIMULATOR' && (
          <div className="space-y-6">
            <WhatIfSimulator
              params={simParams}
              baselineState={baselineState}
              currentState={systemState}
              onUpdateParams={setSimParams}
            />
            <InteractiveFloodMap
              zones={systemState.zones}
              infrastructure={systemState.infrastructure}
              evacuationRoutes={systemState.evacuationRoutes}
              selectedZoneId={selectedZoneId}
              onSelectZone={setSelectedZoneId}
            />
          </div>
        )}

        {/* Tab 4: Damage Breakdown, Satellite SAR Radar & History */}
        {activeTab === 'IMPACT_AND_HISTORY' && (
          <div className="space-y-6">
            <DamageAndPopulationSection systemState={systemState} />
            <SatelliteComparisonView systemState={systemState} />
            <InfrastructureAndHistorySection systemState={systemState} />
          </div>
        )}
      </main>

      {/* Clean, Non-Intrusive Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0A0D14] px-6 lg:px-10 py-5 mt-auto text-xs text-slate-400">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <p>
              <strong>Open-Source Decision Support:</strong> Predictions are
              model estimates designed for research and civil defense planning.
              Follow official directives from NDMA and local municipal agencies.
            </p>
          </div>
          <div className="font-mono text-[11px] text-slate-500 whitespace-nowrap">
            FloodShield AI · MIT License
          </div>
        </div>
      </footer>

      {/* FloodShield Copilot AI Disaster Assistant Drawer */}
      <CopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        systemState={systemState}
      />
    </div>
  );
}
