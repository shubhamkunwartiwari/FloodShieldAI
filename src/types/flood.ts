export type RiskSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
export type AlertColor = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';

export interface GeoCoord {
  lat: number;
  lng: number;
}

export interface FeatureContribution {
  feature: string;
  weight: number;
  currentValue: string;
  deltaDescription: string;
  impactScore: number; // 0 to 100
}

export interface ZonePrediction {
  zoneId: string;
  zoneName: string;
  watershed: string;
  center: GeoCoord;
  polygon: [number, number][];
  floodExtentPolygon: [number, number][];
  baseElevationM: number;
  terrainSlopeDeg: number;
  imperviousSurfacePct: number;
  drainageCapacityMmHr: number;
  historicalFloodFreqPerDecade: number;
  totalPopulation: number;
  vulnerablePopulationPct: number;
  totalBuildings: number;
  basePropertyValueCr: number;

  // Dynamic computed metrics
  prob1h: number;
  prob3h: number;
  prob6h: number;
  prob12h: number;
  severity: RiskSeverity;
  alertColor: AlertColor;
  expectedDepthMinM: number;
  expectedDepthMaxM: number;
  expectedArrivalMinutes: number;
  expectedArrivalLabel: string;
  confidencePct: number;
  populationAtRisk: number;
  householdsAtRisk: number;
  populationEvacuate: number;
  populationIsolated: number;
  buildingsAtRisk: number;
  estimatedDamageCr: number;
  damageMinCr: number;
  damageMaxCr: number;
  responsePriorityScore: number; // 0 to 100
  recommendedTeamCount: number;
  explanationSummary: string;
  featureContributions: FeatureContribution[];
}

export interface InfrastructureAsset {
  id: string;
  name: string;
  category:
    | 'HOSPITAL'
    | 'SCHOOL'
    | 'POWER_SUBSTATION'
    | 'WATER_TREATMENT'
    | 'FIRE_STATION'
    | 'POLICE_STATION'
    | 'BRIDGE'
    | 'RAIL_TRANSIT'
    | 'SHELTER';
  zoneId: string;
  coords: GeoCoord;
  elevationOffsetM: number; // relative to zone base
  capacityOrLoad: string;
  importanceWeight: number;

  // Dynamic computed state
  riskLevel: RiskSeverity;
  floodProbability: number;
  expectedWaterDepthM: number;
  accessibility: 'ACCESSIBLE' | 'RESTRICTED' | 'INACCESSIBLE';
  operationalStatus: 'NOMINAL' | 'AT_RISK' | 'OVERLOADED' | 'SUSPENDED';
}

export interface EvacuationRoute {
  id: string;
  zoneId: string;
  name: string;
  originLabel: string;
  destinationShelterId: string;
  destinationName: string;
  destinationType: 'SHELTER' | 'HOSPITAL' | 'SAFE_HIGH_GROUND';
  path: [number, number][];
  baseTravelMinutes: number;
  lowLyingSegmentSensitivity: number; // 0 to 1

  // Dynamic computed state
  isRecommendedPrimary: boolean;
  estimatedTravelMinutes: number;
  floodExposure: RiskSeverity;
  statusLabel: 'SAFE_CORRIDOR' | 'CAUTION_SLOW' | 'AVOID_INUNDATED';
  activeHazardNote: string;
}

export interface DamageBreakdown {
  totalCentralCr: number;
  uncertaintyMinCr: number;
  uncertaintyMaxCr: number;
  residentialCr: number;
  commercialCr: number;
  infrastructureCr: number;
  agricultureCr: number;
  vehiclesEquipmentCr: number;
  withoutEarlyWarningCr: number;
  withFloodShieldInterventionCr: number;
  potentiallyAvoidedCr: number;
}

export interface PopulationImpactPyramid {
  totalExposed: number;
  requiringWarning: number;
  requiringEvacuation: number;
  requiringEmergencyAssistance: number;
  vulnerableChildrenElderly: number;
  householdsAffected: number;
  potentiallyIsolated: number;
}

export interface EarlyWarningAlert {
  id: string;
  timestamp: string;
  zoneId: string;
  zoneName: string;
  severity: RiskSeverity;
  alertColor: AlertColor;
  floodProbability: number;
  expectedOnset: string;
  affectedPopulation: number;
  headline: string;
  recommendedActions: string[];
}

export interface TimelineEvent {
  id: string;
  time: string;
  category: 'WEATHER' | 'HYDROLOGY' | 'AI_MODEL' | 'ALERT' | 'RESPONSE';
  message: string;
  severity: RiskSeverity;
}

export interface HistoricalFloodEvent {
  id: string;
  date: string;
  title: string;
  peakRainfallMm24h: number;
  peakRiverLevelM: number;
  inundatedAreaSqKm: number;
  populationAffected: number;
  economicDamageCr: number;
  recoveryDays: number;
  keyHotspots: string[];
  notes: string;
}

export interface DataFreshnessTelemetry {
  isLiveApiConnected: boolean;
  sourceLabel: string;
  weatherUpdatedAgo: string;
  riverGaugeUpdatedAgo: string;
  satellitePassAgo: string;
  activeStationsCount: number;
  totalStationsCount: number;
  sensorReliabilityPct: number;
  missingDataNotes: string;
}

export interface SimulationParameters {
  mode: 'LIVE_OPEN_METEO' | 'DEMO_STORM' | 'WHAT_IF_CUSTOM';
  demoStepIndex: number; // 0 to 5 (T+0 to T+50)
  rainfallMultiplierPct: number; // 0 = baseline, +10, +25, +50, +100
  riverLevelDeltaM: number; // 0, +0.5, +1.0, +2.0
  soilSaturationOverridePct: number | null; // null = use scenario default, or 50, 70, 90
}

export interface SystemStateSnapshot {
  timestampIso: string;
  scenarioTitle: string;
  isSimulatedData: boolean;
  dataSourceBanner: string;
  overallRisk: RiskSeverity;
  overallAlertColor: AlertColor;
  overallConfidencePct: number;
  timeToPeakRiskLabel: string;
  currentRainfallMmHr: number;
  forecastCumulativeRainfallMm6h: number;
  riverWaterLevelM: number;
  riverDangerLevelM: number;
  riverRiseRateCmHr: number;
  soilSaturationPct: number;
  roadsAffectedCount: number;
  criticalInfraAtRiskCount: number;
  zones: ZonePrediction[];
  infrastructure: InfrastructureAsset[];
  evacuationRoutes: EvacuationRoute[];
  damage: DamageBreakdown;
  populationImpact: PopulationImpactPyramid;
  activeAlerts: EarlyWarningAlert[];
  timeline: TimelineEvent[];
  freshness: DataFreshnessTelemetry;
  hourlyForecast: {
    hour: string;
    rainfallMm: number;
    riverLevelM: number;
    floodProbPct: number;
  }[];
}
