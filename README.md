# TriageFlow
**A robust, roles-based, online/offline-synced symptom triage flowchart builder for frontline healthcare workers.**

---

## 1. Problem Statement

### Problem Title
Static & Manual Symptom Triage Systems in Rural and Field Healthcare

### Problem Description
In primary care settings, rural clinics, and field health programs, the first level of patient assessment is often performed by nurses, paramedics, or community health workers rather than specialized doctors. These frontline workers rely on paper flowcharts and manual checklists to assess symptoms and determine urgency. These tools are static, hard to update, and not tailored to specific clinic needs or regional health priorities. Most cloud-based decision support tools are impractical in field environments due to limited or no internet connectivity.

### Target Users
- **Administrators**: Create hospitals and manage staff accounts securely.
- **Doctors**: Design advanced triage flowcharts tailored to their clinic's needs.
- **Nurses**: Navigate those flowcharts during critical patient assessments.

### Existing Gaps
- Paper-based flowcharts are hard to modify and scale
- No easy way to embed risk scoring or conditional branching logic
- Lack of offline tools for field and rural healthcare deployment
- Difficulty securely deploying updated protocols across distributed teams
- Lack of centralized clinic management and role-based permissions

---

## 2. Problem Understanding & Approach

### Root Cause Analysis
The core issue is that triage decision-making requires navigating complex, multi-step logic under cognitive overload. The lack of offline capability makes modern cloud tools inaccessible exactly where they are needed most. 

### Solution Strategy
Build a secure, multi-tenant web/desktop application that:
1. Incorporates strict Role-Based Access Control (Admin, Doctor, Nurse)
2. Allows doctors to visually design triage flowcharts using a drag-and-drop interface and publish them.
3. Enables nurses to navigate those flowcharts question-by-question during patient assessment with offline caching support.
4. Auto-syncs Expert built-in protocols alongside Hospital-specific custom flowcharts seamlessly to the cloud.

---

## 3. Proposed Solution

### Solution Overview
TriageFlow is a high-availability application that separates triage into distinct modes based on the user's secure JWT session: an **Admin Dashboard** for hospital management, a **Builder Mode** for doctors to create protocols, and a **Navigate Mode** for real-time patient assessment by nurses.

### Key Features
- **JWT-Secured Multi-Tenancy**: Hospitals are strictly sandboxed. Admins manage their own staff and doctors publish protocols only to their specific hospital.
- **Offline Resiliency**: Advanced connection listeners automatically cache JWT tokens, API payloads, and expert protocols to local storage. Navigating critical flowcharts works flawlessly even if the internet drops.
- **Drag-and-Drop Builder**: Conditional branching logic with risk scoring and priority levels (RED / YELLOW / GREEN) on outcome nodes.
- **Protocol Inventory**: Differentiates automatically injected Built-in "Expert Protocols" from privately drafted "Hospital Protocols".

---

## 4. System Architecture

### High-Level Flow
```
User Login (JWT Generated)
    ↓
Role Segregation:
  [Admin] → Accesses Admin Dashboard to manage users/inventory
  [Doctor] → Accesses React Flow Canvas to Design Protocols
  [Nurse] → Accesses Navigate Mode for Offline/Online Patient Triage
    ↓
Node.js + Express API (Modular Routes & Middleware Validation)
    ↓
MongoDB Atlas (Cloud Database)
```

### Architecture Description
The backend utilizes a heavily refactored, modular Node.js Express architecture separated into dedicated routes (`auth.js`, `staff.js`, `flowchart.js`, `hospital.js`). All endpoints strictly enforce role verification (`adminOnly`, `doctorOnly`) via a custom `authMiddleware`. Data is partitioned successfully per-clinic using `hospitalId` references. 

The React Frontend seamlessly handles JWT session persistence. `App.jsx` actively listens to the `navigator.onLine` API, performing background synchronization fetching protocol structures into `localStorage`, rendering offline degraded modes securely without crashing.

---

## 5. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Flow, Tailwind CSS, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Authentication | JSON Web Tokens (JWT), Bcrypt.js Hash |
| State Management| LocalStorage offline caching |

---

## 6. Project Structure

```
triageflow/
│
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminDashboard.jsx   # Staff & Protocol management
│   │   │   ├── FlowBuilder.jsx      # Protocol design canvas
│   │   │   ├── HospitalRegister.jsx # Multi-tenant clinic boarding
│   │   │   ├── Login.jsx            # JWT Login proxy
│   │   │   └── NavigateMode.jsx     # Patient assessment screen
│   │   ├── App.jsx                  # Main app with mode switching
│   │   └── main.jsx                 # React entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Node.js Backend
│   ├── middleware/
│   │   └── auth.js                  # JWT Verifiers (Role logic)
│   ├── models/
│   │   ├── Flowchart.js             # Protocol graph schema
│   │   ├── Hospital.js              # Clinic identity schema
│   │   └── User.js                  # Admin/Doctor/Nurse profiles
│   ├── routes/
│   │   ├── auth.js                  # Login/Me endpoints
│   │   ├── flowchart.js             # Secure Graph CRUD
│   │   ├── hospital.js              # Registration entrypoint
│   │   └── staff.js                 # Admin-driven user generation
│   ├── utils/
│   │   └── seed.js                  # Automatic Expert logic builder
│   ├── index.js                     # Express app bootstrap
│   └── package.json
│
└── README.md
```

---

## 7. Development & Delivery Highlights

### Security & Authentication 
Implemented full stateless JWT session handling utilizing strong bcrypt salting natively. Every database object is now securely sandboxed strictly to the authenticated `hospitalId`, preventing cross-clinic data leakage entirely.

### Cloud Integration 
Completely shifted the local storage engine directly to robust MongoDB Atlas instances using dynamic Environment variables allowing the app to successfully leverage modern cloud infrastructure.

### Advanced Frontend Architecture
TriageFlow now correctly caches deep protocol structures into browser memory when networking fails. Separation of Concerns (SoC) principle applied flawlessly separating UI logic across discrete modular dashboard screens, completely doing away with monolithic React interfaces.

### Backend Modularity
Deprecated single-file massive backend files into heavily decoupled Express.js Route configurations, increasing legibility dramatically. Advanced middleware injections secure individual methods on-the-fly dynamically.

---

## 8. Impact

- Massively reduces cognitive overload on frontline workers providing robust structural guidance.
- Centralizes multi-user environments efficiently under designated clinical administrators.
- Brings structured cloud-first decision support to remote rural areas without sacrificing functionality even when the internet drops entirely.
- Eliminates dangerous data leaks across multiple health facilities utilizing the new TriageFlow schema boundaries.
