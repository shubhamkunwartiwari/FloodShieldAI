import React from 'react';
import {
  SimulationParameters,
  SystemStateSnapshot,
} from '../types/flood';
import { CloudRain, RotateCcw, Sliders, Waves } from 'lucide-react';

interface WhatIfSimulatorProps {
  params: SimulationParameters;
  baselineState: SystemStateSnapshot;
  currentState: SystemStateSnapshot;
  onUpdateParams: (updater: (prev: SimulationParameters) => SimulationParameters) => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  params,
  baselineState,
  currentState,
  onUpdateParams,
}) => {
  const rainOptions = [0, 10, 25, 50, 100];
  const riverOptions = [0, 0.5, 1.0, 2.0];
  const soilOptions: (number | null)[] = [null, 50, 70, 90];

  const isModified =
    params.rainfallMultiplierPct !== 0 ||
    params.riverLevelDeltaM !== 0 ||
    params.soilSaturationOverridePct !== null;

  const popDelta =
    currentState.populationImpact.totalExposed -
    baselineState.populationImpact.totalExposed;
  const damageDelta =
    currentState.damage.totalCentralCr - baselineState.damage.totalCentralCr;

  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <Sliders className="w-3.5 h-3.5" />
            <span>INTERACTIVE &ldquo;WHAT-IF?&rdquo; SIMULATOR</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-0.5">
            Test How Worse Weather Changes Flood Risk &amp; Evacuation Needs
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any preset or adjust rainfall, river level, and ground wetness
            below — the map and warnings update immediately.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick 1-Click Weather Presets */}
          <button
            onClick={() =>
              onUpdateParams((prev) => ({
                ...prev,
                rainfallMultiplierPct: 25,
                riverLevelDeltaM: 0.5,
                soilSaturationOverridePct: 70,
              }))
            }
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            🌧️ Heavy Rain (+25%)
          </button>
          <button
            onClick={() =>
              onUpdateParams((prev) => ({
                ...prev,
                rainfallMultiplierPct: 50,
                riverLevelDeltaM: 1.0,
                soilSaturationOverridePct: 90,
              }))
            }
            className="px-3 py-1.5 text-xs font-medium bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded border border-orange-500/40 transition-colors cursor-pointer whitespace-nowrap"
          >
            ⛈️ Severe Cloudburst (+50%)
          </button>
          {isModified && (
            <button
              onClick={() =>
                onUpdateParams((prev) => ({
                  ...prev,
                  rainfallMultiplierPct: 0,
                  riverLevelDeltaM: 0,
                  soilSaturationOverridePct: null,
                }))
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 rounded transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Normal
            </button>
          )}
        </div>
      </div>

      {/* 3 Simple Parameter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Rainfall Multiplier */}
        <div className="p-4 bg-[#0B0E17] border border-slate-800 rounded-lg space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
              1. How much harder does it rain?
            </span>
            <span className="font-mono font-bold text-cyan-400 tabular-nums">
              {params.rainfallMultiplierPct === 0
                ? 'Current'
                : `+${params.rainfallMultiplierPct}%`}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Current rate: {currentState.currentRainfallMmHr} mm/hr
          </p>
          <div className="flex items-center gap-1.5 pt-1">
            {rainOptions.map((val) => (
              <button
                key={val}
                onClick={() =>
                  onUpdateParams((prev) => ({
                    ...prev,
                    rainfallMultiplierPct: val,
                  }))
                }
                className={`flex-1 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer whitespace-nowrap ${
                  params.rainfallMultiplierPct === val
                    ? 'bg-cyan-400 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white'
                }`}
              >
                {val === 0 ? 'Normal' : `+${val}%`}
              </button>
            ))}
          </div>
        </div>

        {/* 2. River / Canal Level Surge */}
        <div className="p-4 bg-[#0B0E17] border border-slate-800 rounded-lg space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5 text-amber-400" />
              2. How much higher is the river?
            </span>
            <span className="font-mono font-bold text-amber-400 tabular-nums">
              +{params.riverLevelDeltaM.toFixed(1)}m
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Water level: {currentState.riverWaterLevelM}m (Danger mark:{' '}
            {currentState.riverDangerLevelM}m)
          </p>
          <div className="flex items-center gap-1.5 pt-1">
            {riverOptions.map((val) => (
              <button
                key={val}
                onClick={() =>
                  onUpdateParams((prev) => ({
                    ...prev,
                    riverLevelDeltaM: val,
                  }))
                }
                className={`flex-1 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer whitespace-nowrap ${
                  params.riverLevelDeltaM === val
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white'
                }`}
              >
                {val === 0 ? '+0m' : `+${val}m`}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Ground Wetness (Soil Saturation) */}
        <div className="p-4 bg-[#0B0E17] border border-slate-800 rounded-lg space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white">
              3. How soaked is the ground?
            </span>
            <span className="font-mono font-bold text-emerald-400 tabular-nums">
              {currentState.soilSaturationPct}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Wet ground cannot soak up rain, causing faster street flooding.
          </p>
          <div className="flex items-center gap-1.5 pt-1">
            {soilOptions.map((val) => (
              <button
                key={val === null ? 'auto' : val}
                onClick={() =>
                  onUpdateParams((prev) => ({
                    ...prev,
                    soilSaturationOverridePct: val,
                  }))
                }
                className={`flex-1 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer whitespace-nowrap ${
                  params.soilSaturationOverridePct === val
                    ? 'bg-emerald-400 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white'
                }`}
              >
                {val === null ? 'Auto' : `${val}%`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clear Before vs. After Comparison Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        <div className="p-4 bg-[#0B0E17] border border-slate-800 rounded-lg">
          <div className="text-xs font-semibold text-slate-400">
            Before Change (Baseline Scenario)
          </div>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <div>
              <div className="text-xs text-slate-400">Threat Level</div>
              <div className="font-mono text-base font-bold text-slate-200 mt-0.5">
                {baselineState.overallRisk}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">People Affected</div>
              <div className="font-mono text-base font-bold text-slate-200 tabular-nums mt-0.5">
                {baselineState.populationImpact.totalExposed.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Estimated Damage</div>
              <div className="font-mono text-base font-bold text-slate-200 tabular-nums mt-0.5">
                ₹{baselineState.damage.totalCentralCr} Cr
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#0B0E17] border border-cyan-500/40 rounded-lg">
          <div className="flex items-center justify-between text-xs">
            <span className="text-cyan-400 font-bold">
              After Your &ldquo;What-If&rdquo; Changes
            </span>
            <span className="text-slate-400 font-mono">
              Peak in {currentState.timeToPeakRiskLabel}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <div>
              <div className="text-xs text-slate-400">Threat Level</div>
              <div
                className={`font-mono text-base font-bold mt-0.5 ${
                  currentState.overallRisk === 'EXTREME'
                    ? 'text-rose-400'
                    : currentState.overallRisk === 'HIGH'
                    ? 'text-orange-400'
                    : 'text-amber-400'
                }`}
              >
                {currentState.overallRisk}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">People Affected</div>
              <div className="font-mono text-base font-bold text-amber-400 tabular-nums mt-0.5">
                {currentState.populationImpact.totalExposed.toLocaleString()}
                {popDelta !== 0 && (
                  <span className="text-xs ml-1 text-rose-400">
                    ({popDelta > 0 ? `+${popDelta.toLocaleString()}` : popDelta.toLocaleString()})
                  </span>
                )}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Estimated Damage</div>
              <div className="font-mono text-base font-bold text-rose-400 tabular-nums mt-0.5">
                ₹{currentState.damage.totalCentralCr} Cr
                {damageDelta !== 0 && (
                  <span className="text-xs ml-1 text-rose-300">
                    ({damageDelta > 0 ? `+₹${damageDelta}` : `-₹${Math.abs(damageDelta)}`} Cr)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
