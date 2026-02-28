##TriageFlow
**An offline-first, drag-and-drop symptom triage flowchart builder for frontline healthcare workers.**

---

## 1. Problem Statement

### Problem Title
Static & Manual Symptom Triage Systems in Rural and Field Healthcare

### Problem Description
In primary care settings, rural clinics, and field health programs, the first level of patient assessment is often performed by nurses, paramedics, or community health workers rather than specialized doctors. These frontline workers rely on paper flowcharts and manual checklists to assess symptoms and determine urgency. These tools are static, hard to update, and not tailored to specific clinic needs or regional health priorities. Most cloud-based decision support tools are impractical in field environments due to limited or no internet connectivity.

### Target Users
- Nurses and paramedics in rural clinics
- Community health workers in field programs
- Doctors and administrators who design triage protocols
- Healthcare coordinators managing distributed teams

### Existing Gaps
- Paper-based flowcharts are hard to modify and scale
- No easy way to embed risk scoring or conditional branching logic
- Healthcare workers struggle to navigate complex decision trees quickly under pressure
- No offline tools for field and rural healthcare deployment
- Inconsistent triage decisions due to lack of structured guidance
- Difficulty deploying updated protocols across distributed teams

---

## 2. Problem Understanding & Approach

### Root Cause Analysis
The core issue is that triage decision-making requires navigating complex, multi-step logic — but existing tools force workers to do this mentally or on paper. This creates cognitive overload, inconsistency, and errors. The lack of offline capability makes modern digital tools inaccessible in the environments that need them most.

### Solution Strategy
Build a desktop application that:
1. Allows doctors to visually design triage flowcharts using a drag-and-drop interface
2. Enables nurses to navigate those flowcharts question-by-question during patient assessment
3. Assigns color-coded risk scores at the end of each pathway
4. Works completely offline as a standalone executable — no internet required

---

## 3. Proposed Solution

### Solution Overview
TriageFlow is a desktop application that separates triage into two modes: a **Builder Mode** for creating protocols and a **Navigate Mode** for real-time patient assessment.

### Core Idea
Model a triage protocol as a graph — nodes represent questions or outcomes, edges represent answers. A doctor builds this graph visually. A nurse traverses it one question at a time, reaching a color-coded outcome (🔴 Emergency / 🟡 Monitor / 🟢 Home Care).

### Key Features
- Drag-and-drop flowchart builder using a node-edge graph canvas
- Conditional branching logic based on Yes/No or custom answers
- Risk scoring and priority levels (RED / YELLOW / GREEN) at outcome nodes
- Real-time Navigate Mode for step-by-step patient assessment
- Save and load multiple triage protocols
- Fully offline desktop executable via Electron
- Intuitive UI designed for non-technical healthcare staff

---

## 4. System Architecture

### High-Level Flow
```
Doctor (Builder Mode)
    ↓
React Frontend (React Flow Canvas)
    ↓
Node.js + Express API
    ↓
MongoDB (Local Database)
    ↓
Stored Flowchart Document

Nurse (Navigate Mode)
    ↓
React Frontend loads flowchart from API
    ↓
Traverses nodes/edges locally in memory
    ↓
Displays outcome: RED / YELLOW / GREEN
```

### Architecture Description
The frontend is built with React and React Flow, providing a visual canvas for building and navigating flowcharts. The backend is a Node.js + Express REST API that handles CRUD operations for flowchart documents. MongoDB stores each flowchart as a single document containing nodes and edges arrays. The entire application is wrapped in Electron, which bundles the frontend, backend, and database into a standalone offline desktop executable.

Once a flowchart is loaded into the Navigate Mode, all traversal logic runs entirely on the frontend in memory — meaning zero internet or server dependency during patient assessment.

### Architecture Diagram
```
┌─────────────────────────────────────────────────────┐
│                  ELECTRON DESKTOP APP               │
│                                                     │
│  ┌─────────────────┐      ┌──────────────────────┐  │
│  │  REACT FRONTEND │◄────►│  NODE.JS + EXPRESS   │  │
│  │                 │      │      BACKEND          │  │
│  │  - Builder Mode │      │                      │  │
│  │  - Navigate Mode│      │  - REST API Routes   │  │
│  │  - React Flow   │      │  - Flowchart CRUD    │  │
│  └─────────────────┘      └──────────┬───────────┘  │
│                                      │              │
│                            ┌─────────▼────────┐     │
│                            │    MONGODB        │     │
│                            │  (Local Instance) │     │
│                            └──────────────────┘     │
└─────────────────────────────────────────────────────┘
```

---

## 5. Database Design

### ER Diagram

```
┌──────────────────────────────────────────────┐
│                  FLOWCHART                   │
│──────────────────────────────────────────────│
│  _id         ObjectId (auto-generated)       │
│  name        String                          │
│  createdAt   Date                            │
│  nodes[]     Array of Node objects           │
│  edges[]     Array of Edge objects           │
└──────────────┬───────────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌──────▼──────────┐
│    NODE     │  │      EDGE       │
│─────────────│  │─────────────────│
│ id (String) │  │ id   (String)   │
│ type        │  │ source (Node.id)│
│ position.x  │  │ target (Node.id)│
│ position.y  │  │ label (String)  │
│ data.label  │  └─────────────────┘
│ data.priority│
│ data.riskScore│
└─────────────┘
```

### ER Diagram Description
The Flowchart is the single top-level entity stored in MongoDB. It embeds two arrays — Nodes and Edges — directly inside the document. Nodes represent questions or outcome boxes on the canvas. Edges represent the arrows connecting them, each carrying a label (e.g., "Yes" or "No") and pointing from one Node ID to another. This embedded structure means an entire triage protocol is saved and retrieved in a single database operation.

---

## 6. Dataset Selected

| Field | Details |
|---|---|
| Dataset Name | No external dataset used |
| Source | N/A |
| Data Type | N/A |
| Selection Reason | TriageFlow is a tool for building and navigating triage logic — it does not rely on a pre-trained dataset. The triage content (questions, branching logic, outcomes) is created by healthcare professionals using the Builder Mode. |
| Preprocessing Steps | N/A |

---

## 7. Model Selected

| Field | Details |
|---|---|
| Model Name | Rule-based Graph Traversal (no ML model) |
| Selection Reasoning | The problem requires deterministic, auditable decision pathways. A rule-based graph traversal model is more appropriate than an ML model here because healthcare triage protocols must be transparent, predictable, and created by certified medical professionals — not inferred from data. |
| Alternatives Considered | Decision Tree ML classifiers (rejected — black box, not customizable by doctors), LLM-based triage (rejected — unreliable offline, not auditable) |
| Evaluation Metrics | Protocol completion rate, time-to-outcome per assessment, consistency of priority classification across workers |

---

## 8. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, React Flow, Tailwind CSS, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB (local instance) |
| Desktop/Offline | Electron, Electron Builder |
| Dev Tools | Vite, Postman, Git |

---

## 9. API Documentation & Testing

### API Endpoints

**Endpoint 1: Get All Flowcharts**
```
GET /api/flowcharts
Response: Array of all saved flowchart documents
```

**Endpoint 2: Get Single Flowchart**
```
GET /api/flowchart/:id
Response: Single flowchart document with all nodes and edges
```

**Endpoint 3: Create Flowchart**
```
POST /api/flowchart
Body: { name, nodes[], edges[] }
Response: Saved flowchart document with generated _id
```

**Endpoint 4: Update Flowchart**
```
PUT /api/flowchart/:id
Body: { name, nodes[], edges[] }
Response: Updated flowchart document
```

**Endpoint 5: Delete Flowchart**
```
DELETE /api/flowchart/:id
Response: { message: "Deleted" }
```

**Endpoint 6: Navigate — Get Next Node**
```
POST /api/flowchart/:id/navigate
Body: { currentNodeId, selectedEdgeTarget }
Response: { nextNode }
```

### API Testing Screenshots
*(Add Postman / Thunder Client screenshots here)*

---

## 10. Module-wise Development & Deliverables

### Checkpoint 1: Research & Planning
- Deliverables: Problem understanding, tech stack finalization, data schema design, GitHub repository setup, team role assignment

### Checkpoint 2: Backend Development
- Deliverables: Express server running, MongoDB connected, all 6 API routes implemented and tested via Postman, Flowchart schema finalized

### Checkpoint 3: Frontend Development
- Deliverables: React Flow canvas with drag-and-drop nodes, node label editing, edge connections, save/load flowchart, Navigate Mode with step-by-step assessment and outcome display

### Checkpoint 4: Model Training
- Deliverables: N/A — rule-based graph traversal, no ML model training required. Graph traversal algorithm implemented and tested with demo flowchart.

### Checkpoint 5: Model Integration
- Deliverables: Navigate Mode connected to backend API, root node detection algorithm, edge traversal logic, outcome screen with risk scoring and color-coded priority

### Checkpoint 6: Deployment
- Deliverables: Electron app packaging, offline build tested, demo flowchart (Fever Triage Protocol) preloaded, final .exe generated and verified

---

## 11. End-to-End Workflow

1. Doctor opens TriageFlow desktop app and navigates to Builder Mode
2. Doctor drags Question nodes and Outcome nodes onto the canvas
3. Doctor connects nodes with edges, labeling each connection (Yes / No / Maybe)
4. Doctor assigns RED / YELLOW / GREEN priority and risk score to each outcome node
5. Doctor saves the protocol — it is stored as a single document in local MongoDB
6. Nurse opens the app and selects the saved protocol in Navigate Mode
7. App finds the root node (question with no incoming edges) and displays it
8. Nurse clicks the answer button matching the patient's response
9. App follows the corresponding edge to the next question node
10. Steps 8–9 repeat until an outcome node (with priority) is reached
11. App displays the final outcome screen: 🔴 Emergency / 🟡 Monitor / 🟢 Home Care with risk score
12. Nurse acts on the outcome — all of this works 100% offline

---

## 12. Demo & Video

- **Live Demo Link:** *(Add link here)*
- **Demo Video Link:** *(Add link here)*
- **GitHub Repository:** *(Add link here)*

---

## 13. Hackathon Deliverables Summary

- Functional drag-and-drop flowchart builder with React Flow
- Real-time Navigate Mode for step-by-step patient triage assessment
- Risk scoring and color-coded priority classification at outcome nodes
- Fully offline Electron desktop application (.exe)
- RESTful Node.js + Express backend with MongoDB storage
- Preloaded demo: Fever & Respiratory Triage Protocol

---

## 14. Team Roles & Responsibilities

| Member | Role | Responsibilities |
|---|---|---|
| Member A | Frontend Developer | React app setup, React Flow canvas, drag-and-drop builder, Navigate Mode UI, Tailwind styling |
| Member B | Backend Developer | Node.js + Express server, MongoDB schema, all API routes, Postman testing |
| Member C | Integration & Electron | Electron shell setup, offline packaging, electron-builder config, frontend-backend integration, end-to-end testing |

---

## 15. Future Scope & Scalability

### Short-Term
- Export triage protocols as printable PDF flowcharts
- Add edge label editing directly on the canvas
- Multi-language support for regional healthcare workers
- Patient assessment history and basic reporting

### Long-Term
- Cloud sync for deploying updated protocols across distributed clinic networks
- AI-assisted triage suggestions based on symptom patterns
- Integration with Electronic Health Record (EHR) systems
- Mobile app version for field workers using tablets or phones
- Role-based access control (Admin / Doctor / Nurse)
- Analytics dashboard for tracking triage outcomes over time

---

## 16. Known Limitations

- Electron app bundle size is large (150–300MB) due to bundled Chromium
- No authentication system in the current version — any user can edit protocols
- MongoDB must be running locally; no automatic startup management yet
- No export to shareable format (PDF/JSON) in current MVP
- Edge labels must be set manually after drawing connections

---

## 17. Impact

- Reduces cognitive load on frontline healthcare workers during patient assessment
- Standardizes triage decisions across different workers and shifts, reducing inconsistency
- Enables faster identification of high-risk and emergency cases through structured pathways
- Brings structured decision support to rural and offline healthcare environments where cloud tools fail
- Empowers non-technical medical staff to build and update their own triage protocols without developer help
- Directly addresses patient safety concerns caused by unstructured or manual triage processes
