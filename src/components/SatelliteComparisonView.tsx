import React, { useState } from 'react';
import { SystemStateSnapshot } from '../types/flood';
import normalImg from '../assets/images/satellite_normal_baseline_1791324507089.jpg';
import floodImg from '../assets/images/satellite_flood_inundation_1791324518646.jpg';
import { Eye, Layers } from 'lucide-react';

interface SatelliteComparisonViewProps {
  systemState: SystemStateSnapshot;
}

export const SatelliteComparisonView: React.FC<
  SatelliteComparisonViewProps
> = ({ systemState }) => {
  const [viewMode, setViewMode] = useState<
    'SPLIT_SLIDER' | 'NORMAL_ONLY' | 'FLOOD_EXTENT_ONLY'
  >('SPLIT_SLIDER');
  const [sliderPos, setSliderPos] = useState<number>(54);
  const [normalErr, setNormalErr] = useState(false);
  const [floodErr, setFloodErr] = useState(false);

  const topZone = systemState.zones[0];
  const estInundatedSqKm = Number(
    (
      systemState.zones.reduce((acc, z) => acc + z.prob6h * 0.062, 0)
    ).toFixed(1)
  );

  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="text-xs font-mono text-cyan-400">
            COPERNICUS SENTINEL-1 SAR &amp; NASA GPM REMOTE SENSING
          </div>
          <h3 className="text-lg font-bold text-white mt-0.5">
            Satellite Before / After Flood Inundation Comparison
          </h3>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[#0B0E17] border border-slate-800 rounded-md">
          <button
            onClick={() => setViewMode('NORMAL_ONLY')}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer whitespace-nowrap ${
              viewMode === 'NORMAL_ONLY'
                ? 'bg-cyan-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            NORMAL CONDITIONS
          </button>
          <button
            onClick={() => setViewMode('SPLIT_SLIDER')}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer whitespace-nowrap ${
              viewMode === 'SPLIT_SLIDER'
                ? 'bg-cyan-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            SPLIT COMPARE
          </button>
          <button
            onClick={() => setViewMode('FLOOD_EXTENT_ONLY')}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer whitespace-nowrap ${
              viewMode === 'FLOOD_EXTENT_ONLY'
                ? 'bg-rose-500 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            PREDICTED FLOOD EXTENT
          </button>
        </div>
      </div>

      {/* Interactive Remote Sensing Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8 space-y-3">
          <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-slate-800 bg-[#07090E] select-none">
            {/* Base Layer: Predicted Flood Extent */}
            <div className="absolute inset-0">
              {!floodErr ? (
                <img
                  src={floodImg}
                  alt="Sentinel-1 SAR Predicted Flood Inundation Extent"
                  referrerPolicy="no-referrer"
                  onError={() => setFloodErr(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-950 via-cyan-950/60 to-slate-900 flex items-center justify-center">
                  <span className="font-mono text-xs text-cyan-300">
                    SAR INUNDATION EXTENT LAYER · {estInundatedSqKm} SQ.KM
                  </span>
                </div>
              )}
              <div className="absolute top-3 right-3 bg-[#07090E]/90 border border-rose-500/50 px-2.5 py-1 rounded text-[11px] font-mono text-rose-300">
                PREDICTED FLOOD EXTENT (SAR + AI DEM) · {topZone.expectedDepthMinM}m–{topZone.expectedDepthMaxM}m
              </div>
            </div>

            {/* Overlay Clipped Layer: Normal Conditions */}
            {viewMode !== 'FLOOD_EXTENT_ONLY' && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  width: viewMode === 'NORMAL_ONLY' ? '100%' : `${sliderPos}%`,
                  borderRight:
                    viewMode === 'SPLIT_SLIDER'
                      ? '2px solid #22D3EE'
                      : 'none',
                }}
              >
                {!normalErr ? (
                  <img
                    src={normalImg}
                    alt="Sentinel-2 Normal Baseline Conditions"
                    referrerPolicy="no-referrer"
                    onError={() => setNormalErr(true)}
                    className="w-full h-full object-cover"
                    style={{
                      width:
                        viewMode === 'SPLIT_SLIDER'
                          ? `${10000 / Math.max(1, sliderPos)}%`
                          : '100%',
                      maxWidth: 'none',
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                    <span className="font-mono text-xs text-emerald-300">
                      SENTINEL-2 BASELINE OPTICAL REFERENCE
                    </span>
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-[#07090E]/90 border border-emerald-500/40 px-2.5 py-1 rounded text-[11px] font-mono text-emerald-300">
                  NORMAL BASELINE CONDITIONS (DRY CHANNEL)
                </div>
              </div>
            )}

            {/* Bottom Coordinate & Pass Telemetry Scrim */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-300">
              <span>
                SWATH: BELLANDUR–VARTHUR–KC VALLEY (12.9304°N, 77.6784°E)
              </span>
              <span>
                VV/VH BACKSCATTER THRESHOLD: -16.4 dB · WATER MASK CONFIDENCE:{' '}
                {systemState.overallConfidencePct}%
              </span>
            </div>
          </div>

          {viewMode === 'SPLIT_SLIDER' && (
            <div className="flex items-center gap-4 bg-[#0B0E17] px-4 py-2.5 rounded border border-slate-800">
              <span className="text-xs font-mono text-emerald-400 whitespace-nowrap">
                ◄ Normal Baseline
              </span>
              <input
                type="range"
                min={5}
                max={95}
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                aria-label="Satellite before and after comparison slider"
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-xs font-mono text-rose-400 whitespace-nowrap">
                Predicted Flood Extent ►
              </span>
            </div>
          )}
        </div>

        {/* Right Remote Sensing Metadata & Architecture Panel */}
        <div className="lg:col-span-4 space-y-3">
          <div className="p-4 bg-[#0B0E17] border border-slate-800 rounded space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
              <Eye className="w-3.5 h-3.5" />
              <span>Remote Sensing Telemetry Summary</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Projected Inundated Area</span>
                <span className="text-rose-400 font-bold tabular-nums">
                  {estInundatedSqKm} km²
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Radar Sensor</span>
                <span className="text-slate-200">Sentinel-1 C-Band SAR</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Precipitation Pass</span>
                <span className="text-slate-200">NASA GPM IMERG Early</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Terrain Elevation Model</span>
                <span className="text-slate-200">CartoDEM 2.5m + LiDAR</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Cloud Penetration</span>
                <span className="text-emerald-400">100% (All-Weather SAR)</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#0B0E17] border border-slate-800 rounded space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>How Satellite + AI Fusion Works</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Optical satellites are blinded by heavy monsoon cloud cover.
              FloodShield AI ingests C-band Synthetic Aperture Radar (SAR)
              backscatter along with 2.5m CartoDEM terrain slopes and real-time
              rain-gauge runoff to project water spread across urban floodplains
              hours before peak stage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
