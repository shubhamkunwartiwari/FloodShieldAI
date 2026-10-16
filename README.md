# FloodShield AI — Real-Time Flood Intelligence & Disaster Response Platform

**Predict. Prepare. Protect.**

FloodShield AI is a full-stack hydrological prediction, impact assessment, early-warning, and emergency-response command center built for municipal disaster authorities, emergency responders, and smart-city resilience programs.

> **Ethics & Decision-Support Disclaimer:** This system provides predictive estimates for research and decision-support purposes. It is not a replacement for official emergency warnings or instructions from local authorities (NDMA, KSNDMC, BBMP, IMD).

---

## 1. System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                        EXTERNAL REAL-TIME DATA & SATELLITE FEEDS                  |
|  - Open-Meteo Weather API (Hourly Precipitation, Soil Moisture 0-1cm)             |
|  - Copernicus GloFAS Flood API (River Discharge m3/s)                             |
|  - Sentinel-1 C-Band SAR & NASA GPM IMERG (Backscatter Water Mask & Pass Imagery) |
|  - KSNDMC / Historical Bengaluru Watershed Replay Layer (Fallback & Storm Demo)   |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                        EXPRESS / NODE.JS BACKEND (server.ts)                      |
|  - GET  /api/telemetry/live  -> Fetches & normalizes Open-Meteo + GloFAS feeds    |
|  - POST /api/copilot         -> Server-side @google/genai (gemini-3.8-flash)      |
|                                 strictly grounded in live structured system state |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                UNIFIED REACTIVE PREDICTION ENGINE (predictionEngine.ts)           |
|  When Rainfall / River Stage / Soil Saturation / Demo Step changes:               |
|    1. Multi-Horizon Flood Probability (1h, 3h, 6h, 12h) + Feature Attribution     |
|    2. Depth-Duration Fragility Damage Model (₹ Cr + Uncertainty Range + Avoided)  |
|    3. Demographic Exposure Pyramid (Exposed -> Warn -> Evacuate -> Assist)        |
|    4. Dynamic Evacuation Route Optimizer (Flags flooded underpasses & reroutes)   |
|    5. Responder Priority Matrix (Pop x Severity x Vulnerability x Infra Weight)   |
|    6. Automated Threshold Early Warning Generator (GREEN / YELLOW / ORANGE / RED) |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                  REACT + TYPESCRIPT + LEAFLET COMMAND CENTER UI                   |
|  - Interactive Geospatial Map (CartoDB Dark + 6 Catchments + 12 Infra + Routes)   |
|  - "What-If?" Perturbation Simulator (+10% to +100% Rain, +0.5m to +2m River)     |
|  - Sentinel-1 SAR Before/After Split Comparison & Historical Flood Benchmarks     |
+-----------------------------------------------------------------------------------+
```

---

## 2. Prediction Methodology & Explainable ML Architecture

FloodShield AI evaluates each catchment zone $i$ across four physical driver groups:

1. **Storm-Drain Overload Ratio ($w_1 = 0.34$):**
   $$\text{Overload}_i = \max\left(0, \frac{R_{\text{eff}} \cdot \alpha_{\text{rain}, i} - 0.55 \cdot C_{\text{SWD}, i}}{C_{\text{SWD}, i}}\right)$$
   where $R_{\text{eff}}$ is rainfall intensity ($\text{mm/hr}$) and $C_{\text{SWD}, i}$ is primary storm-water drain (*rajakaluve*) design capacity.
2. **Channel Stage & Rate of Rise ($w_2 = 0.28$):**
   Normalized proximity of current gauge stage ($H_{\text{river}}$) and hourly rise rate ($\Delta H / \Delta t$) to the basin danger threshold ($4.25\text{m}$).
3. **Antecedent Soil Moisture Saturation ($w_3 = 0.18$):**
   Non-linear runoff amplification $(\theta_{\text{soil}} / 100)^{1.35}$ reflecting near-zero infiltration once urban soils exceed $80\%$ saturation.
4. **Topographic Slope, Elevation & Impervious Cover ($w_4 = 0.20$):**
   Combines CartoDEM base elevation, valley slope (degrees), and impervious surface percentage.

### Emergency Response Priority Formula
$$\text{Priority Score}_i = \text{Population at Risk}_i \times \text{Flood Severity}_i \times \text{Vulnerability}_i \times \text{Infrastructure Weight}_i$$

---

## 3. PostgreSQL + PostGIS Database Schema (Production Reference)

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE watershed_zones (
    zone_id VARCHAR(32) PRIMARY KEY,
    zone_name VARCHAR(120) NOT NULL,
    watershed_name VARCHAR(120) NOT NULL,
    base_elevation_m NUMERIC(6,2) NOT NULL,
    terrain_slope_deg NUMERIC(4,2) NOT NULL,
    impervious_pct NUMERIC(5,2) NOT NULL,
    drainage_capacity_mm_hr NUMERIC(5,2) NOT NULL,
    total_population INTEGER NOT NULL,
    vulnerable_pop_pct NUMERIC(5,2) NOT NULL,
    boundary GEOMETRY(Polygon, 4326) NOT NULL
);

CREATE TABLE hydrological_telemetry (
    reading_id BIGSERIAL PRIMARY KEY,
    zone_id VARCHAR(32) REFERENCES watershed_zones(zone_id),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    rainfall_mm_hr NUMERIC(6,2) NOT NULL,
    river_stage_m NUMERIC(5,2) NOT NULL,
    soil_saturation_pct NUMERIC(5,2) NOT NULL,
    is_simulated BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE flood_predictions (
    prediction_id BIGSERIAL PRIMARY KEY,
    zone_id VARCHAR(32) REFERENCES watershed_zones(zone_id),
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    prob_1h SMALLINT NOT NULL,
    prob_3h SMALLINT NOT NULL,
    prob_6h SMALLINT NOT NULL,
    prob_12h SMALLINT NOT NULL,
    severity VARCHAR(16) NOT NULL,
    expected_depth_min_m NUMERIC(4,2) NOT NULL,
    expected_depth_max_m NUMERIC(4,2) NOT NULL,
    estimated_damage_cr NUMERIC(8,2) NOT NULL,
    confidence_pct SMALLINT NOT NULL,
    predicted_extent GEOMETRY(Polygon, 4326)
);
```

---

## 4. API Documentation

### `GET /api/telemetry/live?lat=12.9716&lon=77.5946`
Fetches real-time precipitation, temperature, and 0–1cm soil moisture from Open-Meteo alongside river discharge from the Copernicus GloFAS Flood API.
- **Response (`200 OK`):**
  ```json
  {
    "isAvailable": true,
    "temperatureC": 24.6,
    "currentPrecipitationMmHr": 4.2,
    "cumulative6hPrecipitationMm": 18.5,
    "riverDischargeM3s": 21.4,
    "soilMoisturePct": 68,
    "fetchedAtIso": "2026-10-06T22:10:00.000Z"
  }
  ```

### `POST /api/copilot`
Queries **FloodShield Copilot** (`gemini-3.8-flash` via `@google/genai`) strictly grounded in the current `SystemStateSnapshot`.
- **Request Body:** `{ "question": "Why is Zone 4 classified as extreme?", "systemState": { ... } }`
- **Response (`200 OK`):** `{ "answer": "...", "modelUsed": "gemini-3.8-flash" }`

---

## 5. Setup Instructions

1. Copy `.env.example` to `.env` and configure `GEMINI_API_KEY`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the full-stack development server (Express + Vite on Port 3000):
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build && npm start
   ```

---

## 6. Assumptions, Limitations & Data Sources

- **Assumptions:** Depth-damage curves assume urban mixed residential/IT-corridor building stock typical of Bengaluru East and South catchments. Early-warning damage reduction assumes a 3-hour lead time enabling basement floodgate deployment and vehicle relocation.
- **Limitations:** Sub-meter street micro-drainage blockages (e.g., localized solid-waste clogging) cannot be observed from satellite SAR and require municipal IoT ultrasonic gauge density.
- **Data Sources:** Open-Meteo Meteorological API, Open-Meteo GloFAS Flood API, OpenStreetMap / CARTO Dark Matter basemaps, and historical KSNDMC / BBMP flood reports (2017, 2020, 2022, 2023).
