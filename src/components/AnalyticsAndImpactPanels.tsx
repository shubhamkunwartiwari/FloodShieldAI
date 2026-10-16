import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { HISTORICAL_FLOOD_EVENTS } from '../data/bengaluruWatershed';
import { SystemStateSnapshot } from '../types/flood';
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  Building2,
  History,
  Navigation,
  ShieldCheck,
  Users,
} from 'lucide-react';

interface AnalyticsPanelsProps {
  systemState: SystemStateSnapshot;
  selectedZoneId: string;
  onSelectZone: (zoneId: string) => void;
}

export const DamageAndPopulationSection: React.FC<{
  systemState: SystemStateSnapshot;
}> = ({ systemState }) => {
  const { damage, populationImpact } = systemState;

  const damageChartData = [
    { sector: 'Residential', lossCr: damage.residentialCr },
    { sector: 'Commercial', lossCr: damage.commercialCr },
    { sector: 'Infrastructure', lossCr: damage.infrastructureCr },
    { sector: 'Agriculture', lossCr: damage.agricultureCr },
    { sector: 'Vehicles/Other', lossCr: damage.vehiclesEquipmentCr },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Left: AI Damage Estimation Engine (7 Cols) */}
      <div className="lg:col-span-7 bg-[#0F172A] border border-slate-800 rounded-lg p-5 flex flex-col justify-between space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs font-mono text-rose-400">
              AI-ASSISTED DEPTH-DURATION FRAGILITY ENGINE
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Economic Damage Estimation &amp; Sector Breakdown
            </h3>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400">Estimated Total Damage</div>
            <div className="font-mono text-2xl font-bold text-rose-400 tabular-nums">
              ₹{damage.totalCentralCr} Crore
            </div>
            <div className="text-xs font-mono text-slate-400 tabular-nums">
              Uncertainty Range: ₹{damage.uncertaintyMinCr}–₹
              {damage.uncertaintyMaxCr} Cr
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
          {/* Breakdown List */}
          <div className="sm:col-span-5 space-y-2.5 text-xs font-mono">
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-300">Residential Structures</span>
              <span className="font-bold text-white tabular-nums">
                ₹{damage.residentialCr} Cr
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-300">Commercial &amp; IT Parks</span>
              <span className="font-bold text-white tabular-nums">
                ₹{damage.commercialCr} Cr
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-300">Public Infrastructure</span>
              <span className="font-bold text-white tabular-nums">
                ₹{damage.infrastructureCr} Cr
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-300">Peri-Urban Agriculture</span>
              <span className="font-bold text-white tabular-nums">
                ₹{damage.agricultureCr} Cr
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-300">Vehicles &amp; Equipment</span>
              <span className="font-bold text-white tabular-nums">
                ₹{damage.vehiclesEquipmentCr} Cr
              </span>
            </div>
          </div>

          {/* Recharts Bar Chart */}
          <div className="sm:col-span-7 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={damageChartData}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 16, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis
                  type="number"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickFormatter={(v) => `₹${v}Cr`}
                />
                <YAxis
                  dataKey="sector"
                  type="category"
                  stroke="#CBD5E1"
                  fontSize={11}
                  width={95}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B0E17',
                    borderColor: '#1E293B',
                    fontSize: '12px',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                  formatter={(value: any) => [`₹${value} Cr`, 'Estimated Loss']}
                />
                <Bar dataKey="lossCr" fill="#F43F5E" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Potential Damage Avoided Impact Banner */}
        <div className="p-4 bg-[#0B0E17] border border-emerald-500/30 rounded grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-[11px] font-mono text-slate-400">
              WITHOUT EARLY WARNING
            </div>
            <div className="font-mono text-lg font-bold text-rose-400 tabular-nums mt-0.5">
              ₹{damage.withoutEarlyWarningCr} Cr
            </div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-400">
              WITH FLOODSHIELD INTERVENTION
            </div>
            <div className="font-mono text-lg font-bold text-cyan-400 tabular-nums mt-0.5">
              ₹{damage.withFloodShieldInterventionCr} Cr
            </div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-emerald-400 font-semibold">
              POTENTIALLY AVOIDED (EST.)
            </div>
            <div className="font-mono text-lg font-bold text-emerald-400 tabular-nums mt-0.5">
              ₹{damage.potentiallyAvoidedCr} Cr
            </div>
          </div>
        </div>
      </div>

      {/* Right: Population Impact Pyramid (5 Cols) */}
      <div className="lg:col-span-5 bg-[#0F172A] border border-slate-800 rounded-lg p-5 flex flex-col justify-between space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400">
            <Users className="w-3.5 h-3.5" />
            <span>DEMOGRAPHIC EXPOSURE &amp; VULNERABILITY</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-0.5">
            Population Impact Pyramid
          </h3>
        </div>

        {/* 4-Stage Impact Pyramid */}
        <div className="space-y-2">
          <div className="p-3 bg-[#0B0E17] border border-slate-800 rounded flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-200">
                1. People Exposed in Inundation Footprint
              </div>
              <div className="text-[11px] text-slate-400">
                {populationImpact.householdsAffected.toLocaleString()} households
                across 6 zones
              </div>
            </div>
            <div className="font-mono text-lg font-bold text-white tabular-nums">
              {populationImpact.totalExposed.toLocaleString()}
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
          </div>

          <div className="p-3 bg-[#0B0E17] border border-amber-500/30 rounded flex items-center justify-between mx-2">
            <div>
              <div className="text-xs font-semibold text-amber-300">
                2. People Requiring Automated Early Warning
              </div>
              <div className="text-[11px] text-slate-400">
                Cell-broadcast &amp; civic siren activation
              </div>
            </div>
            <div className="font-mono text-lg font-bold text-amber-400 tabular-nums">
              {populationImpact.requiringWarning.toLocaleString()}
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
          </div>

          <div className="p-3 bg-[#0B0E17] border border-orange-500/40 rounded flex items-center justify-between mx-4">
            <div>
              <div className="text-xs font-semibold text-orange-300">
                3. People Requiring Staged Evacuation
              </div>
              <div className="text-[11px] text-slate-400">
                Ground-floor &amp; low-lying residential blocks
              </div>
            </div>
            <div className="font-mono text-lg font-bold text-orange-400 tabular-nums">
              {populationImpact.requiringEvacuation.toLocaleString()}
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
          </div>

          <div className="p-3 bg-[#0B0E17] border border-rose-500/50 rounded flex items-center justify-between mx-6">
            <div>
              <div className="text-xs font-semibold text-rose-300">
                4. Requiring Direct Emergency Assistance
              </div>
              <div className="text-[11px] text-slate-400">
                Includes {populationImpact.vulnerableChildrenElderly.toLocaleString()}{' '}
                children/elderly &amp; {populationImpact.potentiallyIsolated.toLocaleString()}{' '}
                isolated
              </div>
            </div>
            <div className="font-mono text-lg font-bold text-rose-400 tabular-nums">
              {populationImpact.requiringEmergencyAssistance.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const EmergencyResponseAndEvacuationSection: React.FC<
  AnalyticsPanelsProps
> = ({ systemState, selectedZoneId, onSelectZone }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Left: Emergency Response Priority Matrix (7 Cols) */}
      <div className="lg:col-span-7 bg-[#0F172A] border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="text-xs font-mono text-cyan-400">
              EMERGENCY RESPONSE OPTIMIZATION ENGINE
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Responder Deployment &amp; Triage Priority Ranking
            </h3>
          </div>
          <div className="text-[11px] font-mono text-slate-400 bg-[#0B0E17] px-2.5 py-1 rounded border border-slate-800">
            Priority = Pop × Severity × Vulnerability × Infra Weight
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="py-2.5 pr-3">Zone / Catchment</th>
                <th className="py-2.5 px-3 text-right">Risk (6h)</th>
                <th className="py-2.5 px-3 text-right">Exposed Pop</th>
                <th className="py-2.5 px-3 text-right">Evacuate</th>
                <th className="py-2.5 px-3 text-right">Priority Score</th>
                <th className="py-2.5 pl-3 text-right">NDRF Units</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {systemState.zones.map((z, idx) => (
                <tr
                  key={z.zoneId}
                  onClick={() => onSelectZone(z.zoneId)}
                  className={`cursor-pointer transition-colors ${
                    z.zoneId === selectedZoneId
                      ? 'bg-cyan-500/10'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  <td className="py-2.5 pr-3 font-medium text-white">
                    <span className="font-mono text-slate-500 mr-1.5">
                      #{idx + 1}
                    </span>
                    {z.zoneName}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                    <span
                      className={
                        z.severity === 'EXTREME'
                          ? 'text-rose-400 font-bold'
                          : z.severity === 'HIGH'
                          ? 'text-orange-400 font-bold'
                          : z.severity === 'MODERATE'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }
                    >
                      {z.severity} ({z.prob6h}%)
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-200">
                    {z.populationAtRisk.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-amber-300">
                    {z.populationEvacuate.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-cyan-400">
                    {z.responsePriorityScore} / 100
                  </td>
                  <td className="py-2.5 pl-3 text-right font-mono tabular-nums text-slate-200">
                    {z.recommendedTeamCount} Teams
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: Evacuation Route Optimizer (5 Cols) */}
      <div className="lg:col-span-5 bg-[#0F172A] border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
            <Navigation className="w-3.5 h-3.5" />
            <span>DYNAMIC EVACUATION ROUTE PLANNER</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-0.5">
            Safe Corridors vs. Flooded Roads to Avoid
          </h3>
        </div>

        <div className="space-y-2.5 max-h-[310px] overflow-y-auto pr-1">
          {systemState.evacuationRoutes.map((route) => {
            const isSafe = route.statusLabel === 'SAFE_CORRIDOR';
            return (
              <div
                key={route.id}
                onClick={() => onSelectZone(route.zoneId)}
                className={`p-3 rounded border cursor-pointer transition-colors ${
                  isSafe
                    ? 'bg-[#0B0E17] border-slate-800 hover:border-emerald-500/40'
                    : 'bg-rose-950/15 border-rose-500/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span
                    className={
                      isSafe
                        ? 'text-emerald-400 font-bold'
                        : 'text-rose-400 font-bold'
                    }
                  >
                    {isSafe
                      ? '● SAFE ROUTE'
                      : route.statusLabel === 'CAUTION_SLOW'
                      ? '▲ CAUTION ROUTE'
                      : '✖ FLOODED — AVOID'}
                  </span>
                  <span className="tabular-nums text-slate-300">
                    Travel Time: {route.estimatedTravelMinutes} min · Exposure:{' '}
                    {route.floodExposure}
                  </span>
                </div>
                <div className="text-xs font-semibold text-white mt-1">
                  {route.name}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  To: {route.destinationName}
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  {route.activeHazardNote}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const InfrastructureAndHistorySection: React.FC<{
  systemState: SystemStateSnapshot;
}> = ({ systemState }) => {
  const [infraFilter, setInfraFilter] = useState<string>('ALL');
  const [selectedHistoryId, setSelectedHistoryId] = useState<string>(
    HISTORICAL_FLOOD_EVENTS[0].id
  );

  const filteredInfra =
    infraFilter === 'ALL'
      ? systemState.infrastructure
      : systemState.infrastructure.filter((i) => i.category === infraFilter);

  const selectedHist =
    HISTORICAL_FLOOD_EVENTS.find((h) => h.id === selectedHistoryId) ||
    HISTORICAL_FLOOD_EVENTS[0];

  const comparisonData = [
    {
      metric: 'Rainfall (mm)',
      Historical: selectedHist.peakRainfallMm24h,
      CurrentForecast: systemState.forecastCumulativeRainfallMm6h,
    },
    {
      metric: 'Damage (₹ Cr)',
      Historical: selectedHist.economicDamageCr,
      CurrentForecast: systemState.damage.totalCentralCr,
    },
    {
      metric: 'Exposed Pop (k)',
      Historical: Number((selectedHist.populationAffected / 1000).toFixed(1)),
      CurrentForecast: Number(
        (systemState.populationImpact.totalExposed / 1000).toFixed(1)
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Left: Critical Infrastructure Status Table (7 Cols) */}
      <div className="lg:col-span-7 bg-[#0F172A] border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400">
              <Building2 className="w-3.5 h-3.5" />
              <span>CRITICAL INFRASTRUCTURE RISK MONITOR</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Hospitals, Power Substations, Bridges &amp; Shelters
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {['ALL', 'HOSPITAL', 'SHELTER', 'POWER_SUBSTATION', 'BRIDGE'].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setInfraFilter(cat)}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors cursor-pointer whitespace-nowrap ${
                    infraFilter === cat
                      ? 'bg-cyan-400 text-slate-950 font-bold'
                      : 'bg-[#0B0E17] text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              )
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="py-2 pr-3">Facility Name</th>
                <th className="py-2 px-2">Type</th>
                <th className="py-2 px-2 text-right">Risk / Prob</th>
                <th className="py-2 px-2 text-right">Est. Depth</th>
                <th className="py-2 px-2">Accessibility</th>
                <th className="py-2 pl-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredInfra.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 pr-3 font-medium text-white">
                    {item.name}
                    <div className="text-[11px] text-slate-500 font-mono">
                      {item.capacityOrLoad}
                    </div>
                  </td>
                  <td className="py-2.5 px-2 font-mono text-[11px] text-slate-300">
                    {item.category.replace('_', ' ')}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                    <span
                      className={
                        item.riskLevel === 'EXTREME'
                          ? 'text-rose-400 font-bold'
                          : item.riskLevel === 'HIGH'
                          ? 'text-orange-400 font-bold'
                          : item.riskLevel === 'MODERATE'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }
                    >
                      {item.riskLevel} ({item.floodProbability}%)
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-200">
                    {item.expectedWaterDepthM}m
                  </td>
                  <td className="py-2.5 px-2 font-mono text-[11px]">
                    <span
                      className={
                        item.accessibility === 'ACCESSIBLE'
                          ? 'text-emerald-400'
                          : item.accessibility === 'RESTRICTED'
                          ? 'text-amber-400'
                          : 'text-rose-400 font-semibold'
                      }
                    >
                      {item.accessibility}
                    </span>
                  </td>
                  <td className="py-2.5 pl-2 text-right font-mono text-[11px] text-slate-200">
                    {item.operationalStatus}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: Historical Flood Benchmark Analysis (5 Cols) */}
      <div className="lg:col-span-5 bg-[#0F172A] border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400">
            <History className="w-3.5 h-3.5" />
            <span>HISTORICAL FLOOD BENCHMARKING</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-0.5">
            Compare Current Forecast vs. Past Floods
          </h3>
        </div>

        {/* Historical Event Selector */}
        <div className="grid grid-cols-2 gap-1.5">
          {HISTORICAL_FLOOD_EVENTS.map((ev) => (
            <button
              key={ev.id}
              onClick={() => setSelectedHistoryId(ev.id)}
              className={`p-2 text-left rounded border text-xs transition-colors cursor-pointer ${
                ev.id === selectedHistoryId
                  ? 'bg-cyan-500/15 border-cyan-500/50 text-white'
                  : 'bg-[#0B0E17] border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-mono text-[11px] text-cyan-400">
                {ev.date}
              </div>
              <div className="font-medium truncate mt-0.5">{ev.title}</div>
            </button>
          ))}
        </div>

        {/* Selected Historical Details */}
        <div className="p-3 bg-[#0B0E17] border border-slate-800 rounded text-xs space-y-2">
          <div className="grid grid-cols-3 gap-2 font-mono text-center border-b border-slate-800 pb-2">
            <div>
              <div className="text-[10px] text-slate-400">Peak Rain / River</div>
              <div className="font-bold text-white tabular-nums">
                {selectedHist.peakRainfallMm24h}mm / {selectedHist.peakRiverLevelM}m
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Affected Pop</div>
              <div className="font-bold text-amber-400 tabular-nums">
                {selectedHist.populationAffected.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Loss / Recovery</div>
              <div className="font-bold text-rose-400 tabular-nums">
                ₹{selectedHist.economicDamageCr}Cr · {selectedHist.recoveryDays}d
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {selectedHist.notes}
          </p>
        </div>

        {/* Comparison Chart */}
        <div className="h-[175px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="metric" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0B0E17',
                  borderColor: '#1E293B',
                  fontSize: '11px',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="Historical" fill="#64748B" radius={[3, 3, 0, 0]} />
              <Bar
                dataKey="CurrentForecast"
                fill="#06B6D4"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export const LiveTimelineAndQualitySection: React.FC<{
  systemState: SystemStateSnapshot;
}> = ({ systemState }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Left: 12-Hour Hydrological Forecast Curve (4 Cols) */}
      <div className="lg:col-span-4 bg-[#0F172A] border border-slate-800 rounded-lg p-5 space-y-3">
        <div className="border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400">
            <Activity className="w-3.5 h-3.5" />
            <span>12-HOUR FORWARD TRAJECTORY</span>
          </div>
          <h3 className="text-base font-bold text-white mt-0.5">
            Rainfall Intensity &amp; Flood Probability Curve
          </h3>
        </div>
        <div className="h-[210px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={systemState.hourlyForecast}
              margin={{ top: 8, right: 12, left: -15, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="hour" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0B0E17',
                  borderColor: '#1E293B',
                  fontSize: '11px',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line
                type="monotone"
                dataKey="rainfallMm"
                name="Rain (mm/hr)"
                stroke="#06B6D4"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="floodProbPct"
                name="Flood Prob (%)"
                stroke="#F43F5E"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Center: Live Event Timeline (4 Cols) */}
      <div className="lg:col-span-4 bg-[#0F172A] border border-slate-800 rounded-lg p-5 space-y-3">
        <div className="border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>REAL-TIME EVENT STREAM</span>
          </div>
          <h3 className="text-base font-bold text-white mt-0.5">
            Live Hydrological &amp; Alert Timeline
          </h3>
        </div>

        <div className="space-y-2.5">
          {systemState.timeline.map((ev) => (
            <div
              key={ev.id}
              className="p-2.5 bg-[#0B0E17] border border-slate-800/90 rounded text-xs flex items-start gap-3"
            >
              <span className="font-mono text-[11px] text-cyan-400 shrink-0 tabular-nums mt-0.5">
                {ev.time}
              </span>
              <div className="text-slate-200 leading-snug">{ev.message}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Data Quality, Uncertainty & Sensor Reliability (4 Cols) */}
      <div className="lg:col-span-4 bg-[#0F172A] border border-slate-800 rounded-lg p-5 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>DATA QUALITY + MODEL CONFIDENCE</span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              Telemetry Freshness &amp; Uncertainty Audit
            </h3>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Prediction Confidence</span>
              <span className="text-emerald-400 font-bold tabular-nums">
                {systemState.overallConfidencePct}%
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Weather Telemetry</span>
              <span className="text-slate-200">
                {systemState.freshness.weatherUpdatedAgo}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">River Stage Gauges</span>
              <span className="text-slate-200">
                {systemState.freshness.riverGaugeUpdatedAgo}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Satellite SAR Pass</span>
              <span className="text-slate-200">
                {systemState.freshness.satellitePassAgo}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Sensor Network Reliability</span>
              <span className="text-cyan-400 tabular-nums">
                {systemState.freshness.sensorReliabilityPct}% (
                {systemState.freshness.activeStationsCount}/
                {systemState.freshness.totalStationsCount} active)
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-[#0B0E17] border border-slate-800 rounded text-[11px] text-slate-400 leading-relaxed">
          <strong className="text-slate-200 font-mono block mb-0.5">
            Missing Data &amp; Sensor Interpolation Note:
          </strong>
          {systemState.freshness.missingDataNotes}
        </div>
      </div>
    </div>
  );
};
