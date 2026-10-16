import React, { useEffect, useState } from 'react';
import {
  AdvancedMarker,
  APIProvider,
  Circle,
  ColorScheme,
  Map,
  Polygon,
  Polyline,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  EvacuationRoute,
  InfrastructureAsset,
  RiskSeverity,
  ZonePrediction,
} from '../types/flood';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Droplets,
  HeartPulse,
  Info,
  Layers,
  Map as MapIcon,
  Navigation,
  ShieldAlert,
  ShieldCheck,
  Users,
  X,
  Zap,
} from 'lucide-react';

interface InteractiveFloodMapProps {
  zones: ZonePrediction[];
  infrastructure: InfrastructureAsset[];
  evacuationRoutes: EvacuationRoute[];
  selectedZoneId: string;
  onSelectZone: (zoneId: string) => void;
}

type GoogleMapTypeId = 'roadmap' | 'hybrid' | 'satellite' | 'terrain';

const GOOGLE_MAPS_API_KEY =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';

export function getPlainThreatInfo(severity: RiskSeverity): {
  title: string;
  shortAction: string;
  plainMeaning: string;
  badgeBg: string;
  badgeBorder: string;
  textColor: string;
  hex: string;
} {
  switch (severity) {
    case 'EXTREME':
      return {
        title: 'EXTREME RISK',
        shortAction: 'Evacuate Low Areas Now',
        plainMeaning:
          'Severe flash flooding underway or imminent. Ground floors and low roads submerged.',
        badgeBg: 'bg-rose-500 text-white',
        badgeBorder: 'border-rose-400',
        textColor: 'text-rose-400',
        hex: '#EF4444',
      };
    case 'HIGH':
      return {
        title: 'HIGH RISK',
        shortAction: 'Prepare to Evacuate',
        plainMeaning:
          'Streets and basements flooding. Avoid arterial underpasses and move to higher ground.',
        badgeBg: 'bg-orange-500 text-slate-950',
        badgeBorder: 'border-orange-400',
        textColor: 'text-orange-400',
        hex: '#F97316',
      };
    case 'MODERATE':
      return {
        title: 'MODERATE RISK',
        shortAction: 'Stay Alert',
        plainMeaning:
          'Water accumulation on low-lying roads and intersections. Exercise caution.',
        badgeBg: 'bg-amber-400 text-slate-950',
        badgeBorder: 'border-amber-400',
        textColor: 'text-amber-400',
        hex: '#EAB308',
      };
    case 'LOW':
    default:
      return {
        title: 'LOW RISK',
        shortAction: 'Normal Conditions',
        plainMeaning:
          'Stormwater drainage flows normally. No critical inundation detected.',
        badgeBg: 'bg-emerald-500 text-slate-950',
        badgeBorder: 'border-emerald-400',
        textColor: 'text-emerald-400',
        hex: '#10B981',
      };
  }
}

function tupleArrayToLatLngLiterals(
  coords: [number, number][]
): { lat: number; lng: number }[] {
  return coords.map(([lat, lng]) => ({ lat, lng }));
}

function getShortZoneTitle(fullZoneName: string): string {
  const parts = fullZoneName.split('·');
  return parts.length > 1 ? parts[1].trim() : fullZoneName;
}

const CameraFocusController: React.FC<{
  targetTarget: { lat: number; lng: number; zoom: number } | null;
}> = ({ targetTarget }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !targetTarget) return;
    map.panTo({ lat: targetTarget.lat, lng: targetTarget.lng });
    map.setZoom(targetTarget.zoom);
  }, [map, targetTarget]);

  return null;
};

export const InteractiveFloodMap: React.FC<InteractiveFloodMapProps> = ({
  zones,
  infrastructure,
  evacuationRoutes,
  selectedZoneId,
  onSelectZone,
}) => {
  // Clean layer toggles
  const [showFloodExtent, setShowFloodExtent] = useState<boolean>(true);
  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  const [showFacilities, setShowFacilities] = useState<boolean>(true);
  const [showPopulationHeat, setShowPopulationHeat] = useState<boolean>(false);

  const [mapTypeId, setMapTypeId] = useState<GoogleMapTypeId>('roadmap');
  const [useDarkScheme, setUseDarkScheme] = useState<boolean>(true);
  const [activeInfraItem, setActiveInfraItem] =
    useState<InfrastructureAsset | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [cameraTarget, setCameraTarget] = useState<{
    lat: number;
    lng: number;
    zoom: number;
  } | null>(null);

  const selectedZone =
    zones.find((z) => z.zoneId === selectedZoneId) || zones[0];
  const selectedThreat = getPlainThreatInfo(selectedZone.severity);

  const zoneRoutes = evacuationRoutes.filter(
    (r) => r.zoneId === selectedZone.zoneId
  );
  const zoneShelters = infrastructure.filter(
    (i) => i.category === 'SHELTER' || i.category === 'HOSPITAL'
  );

  const focusZoneOnMap = (zone: ZonePrediction) => {
    onSelectZone(zone.zoneId);
    setCameraTarget({
      lat: zone.center.lat,
      lng: zone.center.lng,
      zoom: 13,
    });
  };

  const resetCityOverview = () => {
    setCameraTarget({
      lat: 12.9716,
      lng: 77.6412,
      zoom: 11,
    });
  };

  return (
    <div className="space-y-4">
      {/* Main Grid: Clean Full-Height Map on Left + Streamlined Zone Inspector on Right */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left Column: Clean, Professional Google Map Canvas (8 cols) */}
        <div className="xl:col-span-8 flex flex-col bg-[#0a0d14] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          {/* Top Map Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#0e131f] border-b border-slate-800">
            {/* Area Jump Bar (Streamlined) */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
              <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap mr-1">
                Area:
              </span>
              <button
                onClick={resetCityOverview}
                className="px-2.5 py-1 text-xs rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition-colors whitespace-nowrap cursor-pointer shrink-0"
              >
                Entire City
              </button>
              {zones.map((z) => {
                const isSelected = z.zoneId === selectedZoneId;
                const threat = getPlainThreatInfo(z.severity);
                return (
                  <button
                    key={z.zoneId}
                    onClick={() => focusZoneOnMap(z)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/60 font-semibold'
                        : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: threat.hex }}
                    />
                    <span>{getShortZoneTitle(z.zoneName)}</span>
                  </button>
                );
              })}
            </div>

            {/* Map Style & Layer Dropdown/Toggles */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
                <button
                  onClick={() => setMapTypeId('roadmap')}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                    mapTypeId === 'roadmap'
                      ? 'bg-cyan-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Streets
                </button>
                <button
                  onClick={() => setMapTypeId('hybrid')}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                    mapTypeId === 'hybrid'
                      ? 'bg-cyan-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Satellite
                </button>
                <button
                  onClick={() => setMapTypeId('terrain')}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                    mapTypeId === 'terrain'
                      ? 'bg-cyan-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Terrain
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Map Canvas */}
          <div className="relative h-[560px] sm:h-[620px] w-full">
            <APIProvider
              apiKey={GOOGLE_MAPS_API_KEY}
              libraries={['marker']}
              language="en"
              region="IN"
            >
              <Map
                style={{ width: '100%', height: '100%' }}
                defaultCenter={{ lat: 12.9716, lng: 77.6412 }}
                defaultZoom={11}
                mapId="DEMO_MAP_ID"
                mapTypeId={mapTypeId}
                colorScheme={
                  useDarkScheme && mapTypeId === 'roadmap'
                    ? ColorScheme.DARK
                    : ColorScheme.LIGHT
                }
                gestureHandling="greedy"
                disableDefaultUI={false}
                streetViewControl={false}
                fullscreenControl={true}
                mapTypeControl={false}
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              >
                <CameraFocusController targetTarget={cameraTarget} />

                {/* 1. Subtle, Clean Flood Risk Polygons */}
                {zones.map((zone) => {
                  const isSelected = zone.zoneId === selectedZoneId;
                  const threat = getPlainThreatInfo(zone.severity);

                  return (
                    <Polygon
                      key={`zone-poly-${zone.zoneId}`}
                      paths={tupleArrayToLatLngLiterals(zone.polygon)}
                      strokeColor={isSelected ? '#22D3EE' : threat.hex}
                      strokeOpacity={isSelected ? 1.0 : 0.85}
                      strokeWeight={isSelected ? 3.5 : 1.8}
                      fillColor={threat.hex}
                      fillOpacity={isSelected ? 0.32 : 0.16}
                      onClick={() => onSelectZone(zone.zoneId)}
                    />
                  );
                })}

                {/* 2. Deep Inundation Water Overlay (Flood Extent) */}
                {showFloodExtent &&
                  zones.map((zone) => {
                    if (zone.prob6h < 25) return null;
                    return (
                      <Polygon
                        key={`flood-extent-${zone.zoneId}`}
                        paths={tupleArrayToLatLngLiterals(
                          zone.floodExtentPolygon
                        )}
                        strokeColor="#38BDF8"
                        strokeOpacity={0.9}
                        strokeWeight={1.2}
                        fillColor="#0284C7"
                        fillOpacity={Math.min(0.48, (zone.prob6h / 100) * 0.48)}
                        onClick={() => onSelectZone(zone.zoneId)}
                      />
                    );
                  })}

                {/* 3. Streamlined, Clear Threat Badge Pins on the Map */}
                {zones.map((zone) => {
                  const isSelected = zone.zoneId === selectedZoneId;
                  const threat = getPlainThreatInfo(zone.severity);

                  return (
                    <AdvancedMarker
                      key={`zone-pill-${zone.zoneId}`}
                      position={zone.center}
                      onClick={() => focusZoneOnMap(zone)}
                      zIndex={isSelected ? 40 : 20}
                    >
                      <div
                        className={`group cursor-pointer transition-all duration-200 transform ${
                          isSelected ? 'scale-110 -translate-y-1' : 'hover:scale-105'
                        }`}
                      >
                        {/* Sleek Pill Badge (Readable in 1 glance) */}
                        <div
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg border text-xs font-semibold backdrop-blur-md ${
                            isSelected
                              ? 'bg-slate-950 text-white border-cyan-400 ring-2 ring-cyan-400/50 shadow-cyan-500/20'
                              : 'bg-slate-950/90 text-slate-200 border-slate-700/80 hover:border-slate-500'
                          }`}
                        >
                          {/* Colored Pulsing Threat Indicator */}
                          <span className="relative flex h-2.5 w-2.5 shrink-0">
                            {zone.severity === 'EXTREME' && (
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                            )}
                            <span
                              className="relative inline-flex rounded-full h-2.5 w-2.5"
                              style={{ backgroundColor: threat.hex }}
                            />
                          </span>

                          <span className="font-bold text-white tracking-tight">
                            {getShortZoneTitle(zone.zoneName)}
                          </span>

                          <span
                            className="font-mono text-[11px] font-bold px-1.5 py-0.2 rounded"
                            style={{
                              backgroundColor: `${threat.hex}25`,
                              color: threat.hex,
                            }}
                          >
                            {zone.prob6h}%
                          </span>

                          {/* Extra info displayed on selected zone */}
                          {isSelected && (
                            <span className="font-mono text-[10px] text-cyan-300 pl-1 border-l border-slate-700">
                              ~{zone.expectedDepthMaxM}m
                            </span>
                          )}
                        </div>
                      </div>
                    </AdvancedMarker>
                  );
                })}

                {/* 4. Evacuation Routes: Clean High-Visibility Lines */}
                {showRoutes &&
                  evacuationRoutes.map((route) => {
                    const isSelected =
                      route.zoneId === selectedZoneId ||
                      route.id === selectedRouteId;
                    const isSafe = route.statusLabel === 'SAFE_CORRIDOR';
                    const routeColor = isSafe ? '#10B981' : '#EF4444';

                    return (
                      <Polyline
                        key={`evac-route-${route.id}`}
                        path={tupleArrayToLatLngLiterals(route.path)}
                        strokeColor={routeColor}
                        strokeOpacity={isSelected ? 1.0 : 0.65}
                        strokeWeight={isSelected ? 6 : 3.5}
                        onClick={() => {
                          onSelectZone(route.zoneId);
                          setSelectedRouteId(route.id);
                        }}
                      />
                    );
                  })}

                {/* 5. Minimal Circular Pins for Hospitals & Shelters */}
                {showFacilities &&
                  infrastructure.map((item) => {
                    const isShelter = item.category === 'SHELTER';
                    const isHospital = item.category === 'HOSPITAL';
                    const isInaccessible = item.accessibility === 'INACCESSIBLE';

                    // Only show shelters and hospitals on the clean map to avoid clutter
                    if (!isShelter && !isHospital) return null;

                    return (
                      <AdvancedMarker
                        key={`facility-${item.id}`}
                        position={item.coords}
                        onClick={() => setActiveInfraItem(item)}
                        zIndex={25}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg border cursor-pointer transition-transform hover:scale-125 ${
                            isShelter
                              ? 'bg-emerald-500 text-slate-950 border-white ring-2 ring-emerald-500/40'
                              : isInaccessible
                              ? 'bg-rose-600 text-white border-white ring-2 ring-rose-500/40'
                              : 'bg-cyan-500 text-slate-950 border-white ring-2 ring-cyan-500/40'
                          }`}
                          title={`${item.name} (${
                            isInaccessible ? 'Road Blocked' : 'Accessible'
                          })`}
                        >
                          {isShelter ? (
                            <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                          ) : (
                            <HeartPulse className="w-3.5 h-3.5 stroke-[2.5]" />
                          )}
                        </div>
                      </AdvancedMarker>
                    );
                  })}

                {/* Population Heat Circle (Optional Layer) */}
                {showPopulationHeat &&
                  zones.map((zone) => (
                    <Circle
                      key={`pop-circle-${zone.zoneId}`}
                      center={zone.center}
                      radius={1200}
                      strokeColor="#A855F7"
                      strokeOpacity={0.6}
                      strokeWeight={1}
                      fillColor="#A855F7"
                      fillOpacity={0.18}
                      onClick={() => onSelectZone(zone.zoneId)}
                    />
                  ))}
              </Map>
            </APIProvider>

            {/* Floating On-Map Layer Toggles (Top Left) */}
            <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5 bg-[#0a0d14]/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-800 shadow-xl">
              <span className="text-[11px] font-semibold text-slate-400 px-1.5">
                Layers:
              </span>
              <button
                onClick={() => setShowFloodExtent((p) => !p)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                  showFloodExtent
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Flood Extent
              </button>
              <button
                onClick={() => setShowRoutes((p) => !p)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                  showRoutes
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Routes
              </button>
              <button
                onClick={() => setShowFacilities((p) => !p)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                  showFacilities
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Shelters &amp; Hospitals
              </button>
            </div>

            {/* Floating Threat Level Legend (Bottom Right - Clear at 1 Glance) */}
            <div className="absolute bottom-3 right-3 z-10 bg-[#0a0d14]/90 backdrop-blur-md px-3.5 py-2 rounded-lg border border-slate-800 shadow-xl text-xs space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Threat Level Key
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-slate-200 font-medium">Extreme</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <span className="text-slate-200 font-medium">High</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-slate-200 font-medium">Moderate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-200 font-medium">Low/Safe</span>
                </div>
              </div>
            </div>

            {/* Clicked Facility Popover Card inside Map */}
            {activeInfraItem && (
              <div className="absolute top-14 right-3 z-20 w-[290px] bg-[#0e131f]/95 border border-slate-700/80 rounded-xl p-4 shadow-2xl backdrop-blur-md space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                      {activeInfraItem.category.replace('_', ' ')}
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {activeInfraItem.name}
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveInfraItem(null)}
                    className="text-slate-400 hover:text-white p-1 rounded-md bg-slate-800/80 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#0a0d14] border border-slate-800">
                    <div className="text-[10px] text-slate-400">Access Status</div>
                    <div
                      className={`font-bold mt-0.5 text-xs ${
                        activeInfraItem.accessibility === 'ACCESSIBLE'
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {activeInfraItem.accessibility === 'ACCESSIBLE'
                        ? 'Open & Safe'
                        : 'Flooded / Blocked'}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0a0d14] border border-slate-800">
                    <div className="text-[10px] text-slate-400">Water Depth</div>
                    <div className="font-mono font-bold text-white mt-0.5 text-xs">
                      {activeInfraItem.expectedWaterDepthM}m
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400">Capacity:</span>
                  <span className="font-medium text-slate-200">
                    {activeInfraItem.capacityOrLoad}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Clean, High-Contrast Zone Inspector (4 cols) */}
        <div className="xl:col-span-4 bg-[#0a0d14] border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-5 shadow-xl">
          <div className="space-y-4">
            {/* Zone Header with Clear Threat Badge */}
            <div className="border-b border-slate-800/80 pb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">
                  Selected Neighborhood
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-tight ${selectedThreat.badgeBg}`}
                >
                  {selectedThreat.title}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white tracking-tight">
                {getShortZoneTitle(selectedZone.zoneName)}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedThreat.plainMeaning}
              </p>
            </div>

            {/* 3 Essential Metrics at a Glance */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 bg-[#0e131f] border border-slate-800 rounded-lg text-center">
                <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  <span>Probability</span>
                </div>
                <div className="font-mono text-xl font-bold text-white tabular-nums mt-1">
                  {selectedZone.prob6h}%
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Next 6h</div>
              </div>

              <div className="p-3 bg-[#0e131f] border border-slate-800 rounded-lg text-center">
                <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                  <Droplets className="w-3 h-3 text-cyan-400" />
                  <span>Depth</span>
                </div>
                <div className="font-mono text-xl font-bold text-cyan-300 tabular-nums mt-1">
                  {selectedZone.expectedDepthMaxM}m
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {selectedZone.expectedDepthMaxM >= 0.8
                    ? 'Waist deep'
                    : 'Knee deep'}
                </div>
              </div>

              <div className="p-3 bg-[#0e131f] border border-slate-800 rounded-lg text-center">
                <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Peak In</span>
                </div>
                <div className="font-mono text-lg font-bold text-amber-300 tabular-nums mt-1 truncate">
                  {selectedZone.expectedArrivalLabel.replace('Approx. ', '')}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Prepare time
                </div>
              </div>
            </div>

            {/* Plain-English Assessment ("Why is this at risk?") */}
            <div className="p-3.5 bg-[#0e131f] border border-slate-800 rounded-lg space-y-1.5">
              <div className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Situation Analysis</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedZone.explanationSummary}
              </p>
            </div>
          </div>

          {/* Action Box: Safe Route & Shelter */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5" />
              <span>Recommended Evacuation Route &amp; Shelter</span>
            </div>

            {zoneRoutes.length > 0 ? (
              <div className="space-y-2">
                {zoneRoutes.slice(0, 2).map((r) => {
                  const isSafe = r.statusLabel === 'SAFE_CORRIDOR';
                  return (
                    <div
                      key={r.id}
                      className={`p-3 rounded-lg border text-xs transition-colors ${
                        isSafe
                          ? 'bg-emerald-950/25 border-emerald-500/40'
                          : 'bg-rose-950/25 border-rose-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-bold flex items-center gap-1 ${
                            isSafe ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isSafe ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              OPEN SAFE ROUTE
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5" />
                              FLOODED ROAD · AVOID
                            </>
                          )}
                        </span>
                        <span className="font-mono text-slate-300 tabular-nums">
                          {r.estimatedTravelMinutes} mins
                        </span>
                      </div>
                      <div className="font-semibold text-white mt-1">
                        {r.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {r.activeHazardNote}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-slate-400">
                Primary arterial roads out of this area are currently open.
              </div>
            )}

            <div className="p-3 rounded-lg bg-[#0e131f] border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <div className="text-[10px] text-slate-400">Nearest Shelter</div>
                <div className="font-semibold text-emerald-300 mt-0.5">
                  {zoneShelters[0]?.name || 'HSR Sector 1 Elevated Shelter'}
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                2.1 km
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
