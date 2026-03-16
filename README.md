Live Demo Link- ** `https://triage-flow-qp7y.onrender.com](https://triage-flow-chi.vercel.app/`
# TriageFlow
**A dynamic, visual clinical protocol builder and patient assessment execution engine.**

## 1. Problem Statement
**Problem Title:** Overwhelmed Emergency Departments & Inflexible Triage Systems  
**Problem Description:** Emergency departments face severe bottlenecks and varied triage accuracy globally. A major factor is the heavy reliance on static paper protocols or rigidly hardcoded software, causing delayed care for critical patients and making real-time adaptation difficult during emerging crises.  
**Target Users:** Hospital Administrators, Head Physicians/Doctors, and ER Nurses.  
**Existing Gaps:** Current ED solutions lack dynamic customization, are extremely expensive to update when new medical guidelines release, and fail to provide a unified, visual way for doctors to build clinical pathways that frontline nurses can execute intuitively without second-guessing.

## 2. Problem Understanding & Approach
**Root Cause Analysis:** Triage protocols are traditionally hardcoded into software logic by external developers. When medical standards change, hospitals must wait for slow software updates. This hardcoded nature removes control from the actual medical experts.  
**Solution Strategy:** Decouple medical logic from software code. Provide a no-code visual builder that empowers doctors to design clinical pathways, paired with an elegant, focused interface for nurses to quickly assess patients based on those real-time pathways.

## 3. Proposed Solution
**Solution Overview:** TriageFlow is an enterprise-grade medical workflow platform that allows hospitals to visually map out triage logic and execute it seamlessly.  
**Core Idea:** Empower medical experts to design deterministic decision-tree flowcharts (Directed Acyclic Graphs) for patient triage, guaranteeing 100% accurate, transparent, and instantly updatable clinical assessments.  
**Key Features:**
*   **Visual Protocol Builder:** Drag-and-drop flowchart builder using React Flow for doctors.
*   **Navigate Mode:** Step-by-step, distraction-free assessment execution for nurses.
*   **Role-Based Access Control:** Secure portals for Admins, Doctors, and Nurses.
*   **Premium Aesthetic:** High-end modern UI utilizing Spline 3D, responsive design, and Tailwind CSS.
*   **Automated Reporting:** Instant PDF-ready assessment reports securely saved to the cloud.

## 4. System Architecture
**High-Level Flow:** Admin Registers Clinic → Doctor builds/publishes Flowchart Protocol → Nurse executes Protocol on patient → System calculates priority score and generates an Assessment Report.

`Nurse (User) → React Interactive UI (Frontend) → Node.js Express API (Backend) → Deterministic DAG Engine (Model) → MongoDB Atlas (Database) → Priority Outcome (Response)`

**Architecture Description:** A decoupled MERN stack architecture. The frontend maintains the complex state of the visual flowcharts, while the RESTful Node.js backend securely validates RBAC tokens and manages the NoSQL protocol/report schemas in MongoDB Atlas.

## 5. Database Design
**ER Diagram Description:**
*   **Hospital:** Stores clinic info.
*   **User:** Polymorphic schema for `admin`, `doctor`, `nurse` tied to `HospitalId`.
*   **Flowchart:** Stores `nodes` (questions/outcomes) and `edges` (connections) arrays, linked to `HospitalId` and creator `UserId`.
*   **Report:** Stores the executed `questionHistory`, final `outcome`, `riskScore`, and Nurse `notes`.

## 6. Dataset Selected
**Selection Reason:** TriageFlow inherently prioritizes **expert-crafted deterministic algorithms** (like standard pediatric or cardiac emergency guidelines) over statistical ML datasets. In ER triage, zero-hallucination, 100% explainable audit trails are legally and clinically mandatory. Medical decision pathways must be perfectly predictable.

## 7. Model Selected
**Model Name:** Deterministic Directed Acyclic Graph (DAG) Engine  
**Selection Reasoning:** Instead of using a black-box LLM that could hallucinate a diagnosis, TriageFlow uses DAGs to mathematically guarantee that a nurse's inputs will consistently lead to the exact outcome mapped by the head Doctor.  
**Alternatives Considered:** Predictive Machine Learning classification models (discarded for the primary triage engine due to lack of explainability in malpractice audits).  
**Evaluation Metrics:** 100% Execution Accuracy (Pathways reach designated terminal outcomes exactly as drawn by the physician).

## 8. Technology Stack
*   **Frontend:** React (Vite), Tailwind CSS, Lucide-React, React Flow, Spline 3D
*   **Backend:** Node.js, Express.js, JSON Web Tokens (JWT), BcryptJS
*   **Database:** MongoDB Atlas (Mongoose ODM)
*   **Deployment:** Vercel (Frontend edge network), Render.com (Backend Web Service)

## 9. API Documentation & Testing
**API Endpoints List:**
*   **Auth:** 
    *   `POST /api/auth/login` - Authenticate User
    *   `POST /api/hospital/register` - Create Admin & Clinic
*   **Staff:** 
    *   `POST /api/staff/create` - Admin creates Doctor/Nurse
    *   `GET /api/staff` - Retrieve clinic staff
*   **Flowcharts:** 
    *   `GET /api/flowcharts` - Fetch active protocols
    *   `POST /api/flowchart` - Publish new visual protocol
*   **Reports:** 
    *   `POST /api/report` - Submit completed assessment
    *   `GET /api/reports` - Retrieve patient history

*(Add Postman / Thunder Client screenshots here)*

## 10. Module-wise Development & Deliverables
*   **Checkpoint 1: Research & Planning**
    *   Deliverables: ER diagrams, Role-based user journey maps.
*   **Checkpoint 2: Backend Development**
    *   Deliverables: MongoDB schemas, secure JWT authentication middleware, REST logic.
*   **Checkpoint 3: Frontend Development**
    *   Deliverables: Spline 3D Landing Page, React Flow canvas integration, secure client routing.
*   **Checkpoint 4: Logic Engine Integration**
    *   Deliverables: DAG traversal logic allowing Nurses to step through the Doctor's visual graph conditionally.
*   **Checkpoint 5: Deployment**
    *   Deliverables: Live environment configuration mapping frontend to Render API, MongoDB IP whitelisting.

## 11. End-to-End Workflow
1. Hospital Admin registers the clinic via the 3D-animated Spline landing page.
2. Admin accesses Dashboard and creates credentials for Doctors and Nurses.
3. Doctor logs in, accesses the **Flow Builder**, and visually constructs a new Triage Protocol (e.g., "Severe Burns").
4. Nurse logs in, selects "Severe Burns" from the active inventory, and enters **Navigate Mode**.
5. Nurse answers sequential clinical questions. Based on responses, the DAG routes to a final severity outcome (RED/YELLOW/GREEN).
6. Nurse adds final notes and saves. Doctor can review the finalized assessment report.

## 12. Demo & Video
*   **Live Demo Link:** `https://triage-flow-chi.vercel.app/`
*   **Backend API Link:** `https://triage-flow-qp7y.onrender.com`


## 13. Hackathon Deliverables Summary
Delivered a fully functional, market-ready, visually stunning prototype featuring 3D web elements, a custom visual algorithm builder, deterministic logic execution, comprehensive RBAC security, and automated reporting.


## 15. Future Scope & Scalability
*   **Short-Term:** Integrate predictive ML models as an *advisory* overlay to assist Doctors while they build protocols. Add SMS/Email paging alerts for 'RED' priority assessments.
*   **Long-Term:** Implement an interconnected multi-hospital network allowing isolated low-resource clinics to securely download and execute expert protocols published by top-tier medical research hospitals.

## 16. Known Limitations
*   Nodes currently require manual refresh mapping if entirely disconnected mid-flow without an outcome.
*   Physical printing on Safari requires adjusting header margins compared to Chrome.

## 17. Impact
By bridging the gap between medical expertise and software execution, TriageFlow eliminates the "inflexible software" bottleneck in emergency rooms. It drastically improves triage consistency, allows hospitals to instantly roll out newly discovered medical protocols during crises, and ultimately accelerates life-saving care for those who need it most.
