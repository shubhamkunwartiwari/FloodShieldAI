import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '2mb' }));

const PORT = 3000;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Live Open-Meteo & GloFAS Hydrological Telemetry Endpoint
app.get('/api/telemetry/live', async (req, res) => {
  const lat = Number(req.query.lat) || 12.9716;
  const lon = Number(req.query.lon) || 77.5946;

  const weatherBase =
    process.env.OPEN_METEO_BASE_URL || 'https://api.open-meteo.com/v1/forecast';
  const floodBase =
    process.env.OPEN_METEO_FLOOD_URL || 'https://flood-api.open-meteo.com/v1/flood';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const weatherUrl = `${weatherBase}?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,rain&hourly=precipitation,soil_moisture_0_to_1cm&forecast_days=1`;
    const floodUrl = `${floodBase}?latitude=${lat}&longitude=${lon}&daily=river_discharge&forecast_days=1`;

    const [weatherRes, floodRes] = await Promise.allSettled([
      fetch(weatherUrl, { signal: controller.signal }),
      fetch(floodUrl, { signal: controller.signal }),
    ]);

    clearTimeout(timeout);

    let temperatureC = 24.5;
    let currentPrecipitationMmHr = 2.4;
    let cumulative6hPrecipitationMm = 11.2;
    let soilMoisturePct = 58;
    let riverDischargeM3s = 18.5;
    let isAvailable = false;

    if (weatherRes.status === 'fulfilled' && weatherRes.value.ok) {
      const wData = (await weatherRes.value.json()) as any;
      isAvailable = true;
      temperatureC = wData?.current?.temperature_2m ?? 24.5;
      currentPrecipitationMmHr = wData?.current?.precipitation ?? 0;
      const hourlyPrecip: number[] = wData?.hourly?.precipitation ?? [];
      if (hourlyPrecip.length >= 6) {
        cumulative6hPrecipitationMm = Number(
          hourlyPrecip.slice(0, 6).reduce((a, b) => a + (b || 0), 0).toFixed(1)
        );
      }
      const soilArr: number[] = wData?.hourly?.soil_moisture_0_to_1cm ?? [];
      if (soilArr.length > 0 && typeof soilArr[0] === 'number') {
        // Convert m3/m3 volumetric soil moisture (typically 0.1 to 0.5) to saturation %
        soilMoisturePct = Math.min(96, Math.max(30, Math.round(soilArr[0] * 195)));
      }
    }

    if (floodRes.status === 'fulfilled' && floodRes.value.ok) {
      const fData = (await floodRes.value.json()) as any;
      const dischargeArr: number[] = fData?.daily?.river_discharge ?? [];
      if (dischargeArr.length > 0 && typeof dischargeArr[0] === 'number') {
        riverDischargeM3s = dischargeArr[0];
      }
    }

    res.json({
      isAvailable,
      temperatureC,
      currentPrecipitationMmHr,
      cumulative6hPrecipitationMm,
      riverDischargeM3s,
      soilMoisturePct,
      fetchedAtIso: new Date().toISOString(),
    });
  } catch (error: any) {
    res.json({
      isAvailable: false,
      temperatureC: 24.0,
      currentPrecipitationMmHr: 0,
      cumulative6hPrecipitationMm: 0,
      riverDischargeM3s: 14.0,
      soilMoisturePct: 55,
      fetchedAtIso: new Date().toISOString(),
      errorNote: 'External weather API unreachable; using local simulation layer.',
    });
  }
});

// Helper: Deterministic data-grounded fallback if Gemini key is unavailable
function buildDeterministicCopilotAnswer(question: string, state: any): string {
  const q = question.toLowerCase();
  const zones = state?.zones || [];
  const topZone = zones[0];
  const secondZone = zones[1];
  const infra = state?.infrastructure || [];
  const routes = state?.evacuationRoutes || [];
  const damage = state?.damage || {};
  const pop = state?.populationImpact || {};

  if (q.includes('most at risk') || q.includes('which area') || q.includes('vulnerable')) {
    return `Based on current telemetry (${state.currentRainfallMmHr} mm/hr rainfall, ${state.riverWaterLevelM}m channel level, ${state.soilSaturationPct}% soil saturation):\n\n1. **${topZone?.zoneName}** is at highest risk (**${topZone?.severity}**, ${topZone?.prob6h}% 6h flood probability, expected depth ${topZone?.expectedDepthMinM}m–${topZone?.expectedDepthMaxM}m, priority score ${topZone?.responsePriorityScore}/100) with **${topZone?.populationAtRisk?.toLocaleString()}** residents exposed.\n2. **${secondZone?.zoneName}** follows at **${secondZone?.severity}** (${secondZone?.prob6h}% 6h probability, **${secondZone?.populationAtRisk?.toLocaleString()}** exposed).\n\n*Note: Estimates are model-derived for decision support and do not replace official emergency warnings.*`;
  }

  if (q.includes('zone 4') || q.includes('why is') || q.includes('extreme') || q.includes('explain')) {
    const z4 = zones.find((z: any) => z.zoneId === 'zone-4') || topZone;
    return `**${z4?.zoneName}** is classified as **${z4?.severity}** (${z4?.prob6h}% 6h probability, Confidence: ${z4?.confidencePct}%) due to four converging physical drivers:\n\n- **Storm-Drain Overload (Weight 34%):** Current rainfall (${state.currentRainfallMmHr} mm/hr) vs. local SWD design capacity (${z4?.drainageCapacityMmHr} mm/hr).\n- **Channel Stage & Rise Rate (Weight 28%):** Water level is at **${state.riverWaterLevelM}m** (rising at +${state.riverRiseRateCmHr} cm/hr against a ${state.riverDangerLevelM}m danger mark).\n- **Soil Saturation (Weight 18%):** Antecedent soil moisture is at **${state.soilSaturationPct}%**, leaving minimal infiltration capacity.\n- **Topography & Urbanization (Weight 20%):** Low elevation (${z4?.baseElevationM}m ASL, ${z4?.terrainSlopeDeg}° slope) and ${z4?.imperviousSurfacePct}% impervious surface.`;
  }

  if (q.includes('evacuat') || q.includes('how many people') || q.includes('population')) {
    return `Current **Population Impact Analysis** across Bengaluru's 6 monitored catchments:\n\n- **Total Population Exposed:** ${pop.totalExposed?.toLocaleString()} (${pop.householdsAffected?.toLocaleString()} households)\n- **Requiring Early Warning:** ${pop.requiringWarning?.toLocaleString()}\n- **Requiring Staged Evacuation:** **${pop.requiringEvacuation?.toLocaleString()}**\n- **Requiring Immediate Emergency Assistance:** ${pop.requiringEmergencyAssistance?.toLocaleString()} (including ~${pop.vulnerableChildrenElderly?.toLocaleString()} children/elderly)\n- **Potentially Isolated by Road Inundation:** ${pop.potentiallyIsolated?.toLocaleString()}`;
  }

  if (q.includes('hospital') || q.includes('shelter') || q.includes('infrastructure')) {
    const hospitals = infra.filter((i: any) => i.category === 'HOSPITAL');
    const shelters = infra.filter((i: any) => i.category === 'SHELTER');
    const safestHosp = hospitals.find((h: any) => h.accessibility === 'ACCESSIBLE') || hospitals[0];
    const atRiskHosp = hospitals.filter((h: any) => h.accessibility !== 'ACCESSIBLE');
    return `**Hospital & Shelter Readiness Assessment:**\n\n- **Safest Accessible Trauma Hubs:** **${safestHosp?.name}** (${safestHosp?.riskLevel} risk, ${safestHosp?.floodProbability}% flood prob, status: ${safestHosp?.operationalStatus}).\n- **Hospitals Under Access/Load Strain:** ${
      atRiskHosp.length > 0
        ? atRiskHosp.map((h: any) => `${h.name} (${h.accessibility}, expected depth ${h.expectedWaterDepthM}m)`).join('; ')
        : 'All monitored hospitals currently accessible.'
    }\n- **Primary Elevated Evacuation Shelters:** ${shelters.map((s: any) => `**${s.name}** (${s.capacityOrLoad})`).join(' and ')}.`;
  }

  if (q.includes('road') || q.includes('route') || q.includes('avoid')) {
    const unsafeRoutes = routes.filter((r: any) => r.statusLabel !== 'SAFE_CORRIDOR');
    const safeRoutes = routes.filter((r: any) => r.statusLabel === 'SAFE_CORRIDOR');
    return `**Evacuation Routing & Road Accessibility (${state.roadsAffectedCount} road segments impacted):**\n\n- **Corridors to AVOID:** ${
      unsafeRoutes.length > 0
        ? unsafeRoutes.map((r: any) => `**${r.name}** (${r.statusLabel} — ${r.activeHazardNote})`).join(' · ')
        : 'No primary evacuation corridors currently closed.'
    }\n- **Recommended Safe Evacuation Corridors:** ${safeRoutes
      .map((r: any) => `**${r.name}** → ${r.destinationName} (${r.estimatedTravelMinutes} min, Exposure: ${r.floodExposure})`)
      .join(' · ')}`;
  }

  if (q.includes('damage') || q.includes('loss') || q.includes('30%') || q.includes('what happens')) {
    const projectedRain = Number((state.currentRainfallMmHr * 1.3).toFixed(1));
    const projectedDamage = Math.round(damage.totalCentralCr * 1.42);
    const projectedPop = Math.round((pop.totalExposed || 10000) * 1.38);
    return `**Economic Damage & Sensitivity Assessment:**\n\n- **Current Estimated Damage:** **₹${damage.totalCentralCr} Cr** (Uncertainty range: **₹${damage.uncertaintyMinCr}–₹${damage.uncertaintyMaxCr} Cr**). Breakdown: Residential ₹${damage.residentialCr} Cr, Commercial ₹${damage.commercialCr} Cr, Infrastructure ₹${damage.infrastructureCr} Cr, Agriculture ₹${damage.agricultureCr} Cr.\n- **If Rainfall Increases by +30% (to ${projectedRain} mm/hr):** Non-linear runoff surge would elevate total exposed population to **~${projectedPop.toLocaleString()}** and increase projected economic loss to **~₹${projectedDamage} Cr**, pushing secondary zones into EXTREME severity.\n- **Potential Damage Avoided via FloodShield Early Intervention:** Estimated **₹${damage.potentiallyAvoidedCr} Cr** (comparing ₹${damage.withoutEarlyWarningCr} Cr unmitigated vs. ₹${damage.withFloodShieldInterventionCr} Cr with proactive floodgates, pumping, and vehicle/asset relocation).`;
  }

  return `**FloodShield Copilot Situation Summary (${state.scenarioTitle}):**\n\n- **Overall Basin Risk:** **${state.overallRisk}** (Confidence: ${state.overallConfidencePct}%, Peak expected in ${state.timeToPeakRiskLabel})\n- **Environmental Telemetry:** Rainfall ${state.currentRainfallMmHr} mm/hr · River Stage ${state.riverWaterLevelM}m (+${state.riverRiseRateCmHr} cm/hr) · Soil Saturation ${state.soilSaturationPct}%\n- **Human & Economic Impact:** **${pop.totalExposed?.toLocaleString()}** exposed (${pop.requiringEvacuation?.toLocaleString()} requiring evacuation) · Estimated damage **₹${damage.totalCentralCr} Cr** (Range: ₹${damage.uncertaintyMinCr}–₹${damage.uncertaintyMaxCr} Cr)\n- **Highest Priority Zone:** **${topZone?.zoneName}** (Priority Score ${topZone?.responsePriorityScore}/100, deploy ${topZone?.recommendedTeamCount} NDRF/SDRF units).`;
}

// 2. FloodShield Copilot Server-Side Gemini Endpoint
app.post('/api/copilot', async (req, res) => {
  const { question, systemState } = req.body || {};
  if (!question || !systemState) {
    res.status(400).json({ error: 'Missing question or systemState payload.' });
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    res.json({
      answer: buildDeterministicCopilotAnswer(question, systemState),
      modelUsed: 'FloodShield Structured Telemetry Engine (Deterministic Fallback)',
    });
    return;
  }

  try {
    const compactContext = {
      scenarioTitle: systemState.scenarioTitle,
      isSimulatedData: systemState.isSimulatedData,
      overallRisk: systemState.overallRisk,
      overallConfidencePct: systemState.overallConfidencePct,
      timeToPeakRiskLabel: systemState.timeToPeakRiskLabel,
      currentRainfallMmHr: systemState.currentRainfallMmHr,
      riverWaterLevelM: systemState.riverWaterLevelM,
      riverDangerLevelM: systemState.riverDangerLevelM,
      riverRiseRateCmHr: systemState.riverRiseRateCmHr,
      soilSaturationPct: systemState.soilSaturationPct,
      roadsAffectedCount: systemState.roadsAffectedCount,
      populationImpact: systemState.populationImpact,
      damage: systemState.damage,
      zones: systemState.zones?.map((z: any) => ({
        zoneName: z.zoneName,
        severity: z.severity,
        prob1h: z.prob1h,
        prob3h: z.prob3h,
        prob6h: z.prob6h,
        prob12h: z.prob12h,
        expectedDepth: `${z.expectedDepthMinM}m-${z.expectedDepthMaxM}m`,
        arrival: z.expectedArrivalLabel,
        populationAtRisk: z.populationAtRisk,
        populationEvacuate: z.populationEvacuate,
        estimatedDamageCr: z.estimatedDamageCr,
        priorityScore: z.responsePriorityScore,
        explanationSummary: z.explanationSummary,
      })),
      infrastructure: systemState.infrastructure?.map((i: any) => ({
        name: i.name,
        category: i.category,
        riskLevel: i.riskLevel,
        floodProbability: i.floodProbability,
        expectedWaterDepthM: i.expectedWaterDepthM,
        accessibility: i.accessibility,
        operationalStatus: i.operationalStatus,
      })),
      evacuationRoutes: systemState.evacuationRoutes?.map((r: any) => ({
        name: r.name,
        destinationName: r.destinationName,
        estimatedTravelMinutes: r.estimatedTravelMinutes,
        floodExposure: r.floodExposure,
        statusLabel: r.statusLabel,
        activeHazardNote: r.activeHazardNote,
      })),
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `CURRENT FLOODSHIELD AI SYSTEM TELEMETRY (JSON):\n${JSON.stringify(
        compactContext
      )}\n\nUSER QUESTION:\n${question}`,
      config: {
        systemInstruction:
          'You are FloodShield Copilot, the official AI disaster-response and hydrological decision-support assistant for FloodShield AI. ' +
          'Answer the user question concisely (120-180 words max) using ONLY the structured JSON telemetry provided in the prompt. ' +
          'Do NOT invent facts outside the provided data; if a piece of data is unavailable, state that clearly. ' +
          'Cite exact zone names, probabilities, water depths (m), affected population counts, economic damage uncertainty ranges (₹ Cr), hospital statuses, and evacuation routes. ' +
          'Remind the user briefly that predictions are model-based estimates for decision support and do not replace official emergency warnings.',
      },
    });

    const text = response.text || buildDeterministicCopilotAnswer(question, systemState);
    res.json({
      answer: text,
      modelUsed: 'gemini-3.8-flash',
    });
  } catch (err: any) {
    res.json({
      answer: buildDeterministicCopilotAnswer(question, systemState),
      modelUsed: 'FloodShield Structured Telemetry Engine (Fallback)',
      warning: err?.message || 'Gemini API request failed; served grounded telemetry response.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FloodShield AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
