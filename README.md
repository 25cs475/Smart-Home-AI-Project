# SmartHome AI — Context-Aware Intelligent Climate Management System

> **A production-quality Artificial Intelligence web application demonstrating Frame-Based Knowledge Representation, Rule-Based Reasoning, Context-Awareness, Simulated IoT Telemetry, and Multi-User Preference Conflict Resolution.**

---

## 1. Problem Statement & Overview

In modern residential smart homes, deciding whether to activate heating or cooling cannot rely on simple static threshold thermostats. Real-world indoor environments are shaped by an intricate interplay of contextual parameters:
* **Ambient indoor temperature and humidity**
* **Exterior meteorological weather and diurnal day/night cycles**
* **Physical presence and real-time room occupancy**
* **Divergent, simultaneous human occupant thermal comfort preferences**

When two or more individuals occupy the same room with opposing thermal desires (e.g., User A prefers **24°C / Cool**, whereas User B prefers **28°C / Warm**), naive thermostats fail. **SmartHome AI** formalizes this situational knowledge using **Minsky Frames**, evaluates transparent **Production Rules**, and executes **Game-Theoretic Multi-User Conflict Resolution Algorithms** to autonomously actuate simulated IoT climate hardware while providing comprehensive Explainable AI (XAI) causal justification.

---

## 2. Core AI Academic Foundations

```text
 ┌──────────────────────────────────────────────────────────────────┐
 │                        SENSE (Context Harvesting)                │
 │  Indoor/Outdoor Temp, Humidity, Occupancy, Weather, Clock, Night │
 └─────────────────────────────────┬────────────────────────────────┘
                                   │
 ┌─────────────────────────────────▼────────────────────────────────┐
 │                      MODEL (Knowledge Frames)                    │
 │    HOME_FRAME (Global Policy)                                    │
 │        ↓ (Inheritance)                                           │
 │    ROOM_FRAME (Zone Physics & Installed Actuators)               │
 │        ↓ (Inheritance & Telemetry Slot-Filling)                  │
 │    CLIMATE_SITUATION_FRAME (Active Situational Instance)         │
 └─────────────────────────────────┬────────────────────────────────┘
                                   │
 ┌─────────────────────────────────▼────────────────────────────────┐
 │                    REASON (Inference & Conflict)                 │
 │  - Rule-Based Production Engine (Heat, Cold, Eco, Circadian)     │
 │  - Multi-User Conflict Detector (|Δ| >= 1.5°C)                  │
 │  - 5 Game-Theoretic Strategies (Average, Priority, Majority...)  │
 └─────────────────────────────────┬────────────────────────────────┘
                                   │
 ┌─────────────────────────────────▼────────────────────────────────┐
 │                         ACT & EXPLAIN                            │
 │  - Actuate Simulated IoT Devices (AC, Heater, Fan, Thermostat)   │
 │  - Transparent Explainable AI (XAI) Causal Breakdown             │
 │  - Deterministic Confidence Scoring (e.g. 94%)                   │
 └──────────────────────────────────────────────────────────────────┘
```

### A. Frame-Based Knowledge Representation
- **Frames, Slots, and Facets**: Situational knowledge is structured as frames (Minsky, 1974). Slots represent attributes (`time_of_day`, `indoor_temperature`, `occupancy_count`, `user_preferences`, `climate_requirement`), while facets define data types, range boundaries, and default values.
- **Hierarchical Inheritance**:
  - `HOME_FRAME`: Root policy frame defining global safety thresholds (16°C – 34°C), default comfort band (19°C – 27°C), and energy conservation modes.
  - `ROOM_FRAME`: Specializes the home frame with room geometry, thermal inertia, and attached sensors/actuators.
  - `CLIMATE_SITUATION_FRAME`: Instantiated leaf frame capturing live sensor telemetry, active occupants, preference delta, fired rules, and target actuator states.

### B. Rule-Based Reasoning Engine
Transparent, verifiable IF-THEN declarative rules evaluated sequentially:
- `RULE_ECO_EMPTY`: `IF occupancy == 0 THEN mode = ECO` (compressors idle, energy setback applied).
- `RULE_EXTREME_HEAT`: `IF temp >= 28.0°C AND occupancy > 0 THEN mode = COOLING, AC = ON`.
- `RULE_EXTREME_COLD`: `IF temp <= 18.0°C AND occupancy > 0 THEN mode = HEATING, Heater = ON`.
- `RULE_COMFORT_ZONE`: `IF temp BETWEEN 18.1°C AND 27.9°C AND occupancy > 0 THEN mode = COMFORT` (HVAC idle).
- `RULE_NIGHT_SLEEP`: `IF isNight AND occupancy > 0 THEN adjustTarget(-1.0°C)` (circadian thermoregulation).
- `RULE_HIGH_HUMIDITY`: `IF humidity >= 70% AND temp >= 25.0°C THEN fan = HIGH` (latent moisture purge).
- `RULE_RAINY_OUTDOOR`: `IF weather == 'Rainy' THEN adjustCoolingThreshold(+1.0°C)`.

### C. Multi-User Preference Conflict System
Triggered when simultaneous occupants in a zone have preferred temperatures diverging by $\ge 1.5^\circ\text{C}$:
1. **Strategy 1 — Average (Compromise)**: Arithmetic mean $\frac{\sum T_i}{N}$ (e.g., $(24 + 28) / 2 = 26.0^\circ\text{C}$).
2. **Strategy 2 — Priority-Weighted**: Weighted average $\frac{\sum (w_i \cdot T_i)}{\sum w_i}$ based on user role authority (Owner = 2.0x, Member = 1.0x).
3. **Strategy 3 — Majority Consensus**: Modal clustering finding the highest density preference cluster.
4. **Strategy 4 — Room-Based Anchor**: Prioritizes the primary room resident or zone owner.
5. **Strategy 5 — Manual Administrator Override**: Explicit owner designated temperature.

### D. Explainable AI (XAI) & Confidence Scoring
- **Dynamic Causal Trace**: Answers *"Why did AI make this decision?"* by breaking down context observation $\rightarrow$ rule activation $\rightarrow$ conflict detection $\rightarrow$ compromise calculation $\rightarrow$ actuator state.
- **Deterministic Confidence Score**: A factor-based certainty score derived from sensor signal completeness, volatility, and human preference agreement.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript & Vite 6
- **Styling**: Tailwind CSS (Cyber Dark Theme, Hex/Grid background, Glassmorphism panels, Cyan `#06B6D4` and Violet `#8B5CF6` glow effects)
- **Icons**: Lucide React
- **Data Visualization**: Recharts (Hourly energy curves, weekly duty cycles, temperature telemetry)
- **Routing & State**: React Router v7, React Context API (`AuthContext`, `ToastContext`)
- **Animation & Celebration**: Canvas Confetti

### Backend
- **Runtime**: Node.js v20+ / Express.js with TypeScript (`tsx`)
- **Database & ORM**: SQLite (via Prisma ORM for zero-friction setup, 100% PostgreSQL schema compatible)
- **Security & Auth**: JWT (JSON Web Tokens), bcrypt password hashing, Role-Based Access Control (`ADMIN`, `HOME_OWNER`, `HOUSEHOLD_MEMBER`)
- **Architecture**: Modular Service-Oriented Architecture (`services/frames`, `services/climate`, `services/conflicts`, `services/devices`, `services/ai`)

---

## 4. Repository Structure

```text
SmartHome AI/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma data models (Rooms, Devices, Frames, Decisions, Conflicts)
│   │   └── seed.ts             # Benchmark seed script (Smart Residence, 32°C initial state)
│   ├── src/
│   │   ├── controllers/        # Express route controllers (Auth, AI, Dashboard, Rooms, etc.)
│   │   ├── middleware/         # JWT Auth & RBAC guard middleware
│   │   ├── routes/             # REST API endpoint routers
│   │   ├── services/
│   │   │   ├── ai/             # 7-stage Sense-Reason-Act Decision Engine
│   │   │   ├── climate/        # Contextual declarative rule evaluation
│   │   │   ├── conflicts/      # 5 Conflict resolution algorithms
│   │   │   ├── devices/        # Virtual IoT actuator & sensor simulator
│   │   │   └── frames/         # Frame knowledge base & inheritance hierarchy
│   │   └── server.ts           # Express server entrypoint
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable widgets (ExplainableCard, FrameVisualizer, ReasoningPipeline, etc.)
│   │   ├── context/            # AuthContext & ToastContext
│   │   ├── layouts/            # Cyber AppLayout with responsive sidebar & presentation triggers
│   │   ├── pages/              # 12 major application views
│   │   ├── services/           # Axios API client
│   │   ├── types/              # Comprehensive TypeScript interfaces
│   │   ├── App.tsx             # Route configuration
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── package.json                # Root orchestration scripts
└── README.md
```

---

## 5. Quick Start Instructions

### Prerequisites
- **Node.js** (v18 or higher recommended; v20+ tested)
- **npm** (v9 or higher)

### 1. Installation

You can install all dependencies across the entire repository with one command from the project root:

```bash
npm run install:all
```

Or individually:

```bash
# In backend directory:
cd backend
npm install

# In frontend directory:
cd ../frontend
npm install
```

### 2. Database Setup & Seeding

From the `backend/` directory, initialize the database and load benchmark initial data:

```bash
cd backend
npm run db:setup
```

> **Default Seed Data Populated**:
> - **Household**: Smart Residence (101 Intelligent Way)
> - **Zones**: Living Room, Bedroom, Study Room, Kitchen
> - **Users**:
>   - House Owner (`owner@smarthome.ai` / `password123`) — Preferred: **24.0°C**
>   - Family Member (`member@smarthome.ai` / `password123`) — Preferred: **28.0°C**
>   - System Administrator (`admin@smarthome.ai` / `admin123`)
> - **Initial Living Room Telemetry**:
>   - Indoor Temperature: **32.0°C**
>   - Humidity: **68%**
>   - Occupancy: **2 people**
>   - Weather: **Hot / Sunny**
>   - Time: **08:00 PM (Night)**

### 3. Running the Application

You can start both Backend and Frontend concurrently from the root directory:

```bash
npm run dev
```

Or run them in separate terminals:

```bash
# Terminal 1 (Backend - Port 5000):
cd backend
npm run dev

# Terminal 2 (Frontend - Port 5173):
cd frontend
npm run dev
```

Open your browser and navigate to:
**`http://localhost:5173`**

---

## 6. REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user & issue JWT |
| `POST` | `/api/auth/register` | Register new resident profile |
| `GET` | `/api/dashboard` | Aggregated telemetry, HVAC status, confidence, active mode |
| `GET` | `/api/rooms` | Retrieve all climate zones and attached IoT devices |
| `PUT` | `/api/rooms/:id/environment` | Inject simulated sensors (temp, humidity, occupancy, weather) |
| `GET` | `/api/devices` | IoT device rack telemetry |
| `PUT` | `/api/devices/:id/override` | Manual override on specific IoT actuator |
| `PUT` | `/api/devices/:id/release-override` | Release override back to autonomous AI |
| `GET` | `/api/preferences` | Household occupant thermal preferences |
| `POST` | `/api/ai/analyze` | Execute 7-stage Sense-Reason-Act intelligence pipeline |
| `GET` | `/api/frames/current` | Retrieve active `CLIMATE_SITUATION_FRAME` slots & facets |
| `GET` | `/api/frames/hierarchy` | Retrieve `HOME_FRAME` $\rightarrow$ `ROOM_FRAME` $\rightarrow$ `SITUATION_FRAME` inheritance tree |
| `GET` | `/api/conflicts` | Historical conflict events audit log |
| `POST` | `/api/conflicts/preview` | Real-time preview of all 5 conflict resolution algorithms |
| `GET` | `/api/analytics/energy` | Simulated hourly/weekly power consumption & savings |
| `POST` | `/api/simulation/scenario/:id` | Trigger preset demonstration scenarios (1 to 5) |
| `POST` | `/api/simulation/reset` | Restore benchmark initial state (32°C, 2 people, 8 PM) |

---

## 7. 24-Step Academic Demonstration Flow (Section 37)

Follow this exact walkthrough to present the system to an academic evaluator or professor:

1. **Login**: Navigate to `http://localhost:5173/login`. Click the 1-click **House Owner** button (`owner@smarthome.ai`) and press **Authenticate Session**.
2. **Dashboard**: Observe the 6 core telemetry cards: **Temperature (32°C)**, **Humidity (68%)**, **Occupancy (2 people)**, **Weather (Hot/Sunny)**, **HVAC (Cooling Active)**, and **AI Confidence (94%)**.
3. **Knowledge Frames**: Click **Knowledge Frames** on the sidebar. View the live slot-filler table.
4. **Inheritance**: Switch to **Inheritance Hierarchy** to demonstrate how `CLIMATE_SITUATION_FRAME` inherits safe bands from `HOME_FRAME` and physical actuators from `ROOM_FRAME`.
5. **Environment Tuning**: Navigate to **Environment Monitor**. Adjust the Temperature slider to **32.0°C**, Occupancy to **2**, and Weather to **Hot / Sunny**.
6. **Occupant Preferences**: Verify in **Household & Prefs** that House Owner is set to **24°C** and Family Member is set to **28°C**.
7. **Run AI Analysis**: Go to **AI Decision Engine** and click **RUN AI ANALYSIS**.
8. **Animated Pipeline**: Observe the 7-stage animated pipeline trace:
   - Step 1: Context Collected
   - Step 2: Situation Frame Built
   - Step 3: Rules Evaluated (`RULE_EXTREME_HEAT` triggered because 32.0°C $\ge$ 28.0°C)
   - Step 4: Preference Conflict Detected (4.0°C divergence)
   - Step 5: Conflict Resolved via Compromise Strategy: $(24 + 28) / 2 = 26.0^\circ\text{C}$
   - Step 6: HVAC Mode determined as **COOLING** at **26.0°C**
   - Step 7: Virtual AC Actuator updated to **ON (Cooling)**
9. **Explainability**: Review the **"Why Did AI Make This Decision?"** card for transparent causal breakdown.
10. **Test Heating**: Go to **Environment Monitor**, lower Temperature slider to **14.0°C**, Occupancy to **2**, and click **Apply Telemetry & Run AI**.
    - Watch the system trigger `RULE_EXTREME_COLD`, switch mode to **HEATING**, and actuate the Smart Heater **ON**.
11. **Test Eco Mode**: Change Occupancy slider to **0**.
    - Watch the system evaluate `RULE_ECO_EMPTY`, deactivate HVAC compressors, and engage **ECO Mode**.
12. **Presentation Mode**: Click the **Presentation Mode** button in the top navbar. Enjoy the automated 7-stage sequential walkthrough designed for a 2–3 minute professor briefing with step indicators and celebration confetti.
13. **Reset Benchmark**: Click **Reset Simulation** in the top navbar to instantly restore the 32°C benchmark state.

---

## 8. Switching to PostgreSQL (Production Database)

The project ships with SQLite for zero-configuration local execution. To switch to PostgreSQL:
1. Open `backend/prisma/schema.prisma`
2. Change datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Set your PostgreSQL connection string in `backend/.env`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/smarthome_ai?schema=public"
   ```
4. Run `npm run db:setup` in `backend/`.

---

## 9. Academic AI Discussion & Future Work

- **Knowledge Representation**: Minsky frames provide structured expectations with default values that prevent computational thrashing when sensor readings are momentarily absent.
- **Explainability (XAI)**: Unlike opaque deep neural networks, rule-based inference over structured frames provides 100% causal auditability, critical for safety-critical residential and industrial HVAC operations.
- **Future Enhancements**: Integration with reinforcement learning (RL) for predictive thermal inertia pre-cooling, energy grid spot price dynamic arbitrage, and physical Zigbee/Matter IoT hardware bindings.
