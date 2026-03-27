Live Demo Link-  `https://triage-flow-qp7y.onrender.com](https://triage-flow-chi.vercel.app/`

# TriageFlow
**A dynamic, visual clinical protocol builder and patient assessment execution engine.**

## 📌 Overview

Emergency departments face severe bottlenecks due to inflexible, hardcoded triage systems. TriageFlow is an enterprise-grade medical workflow platform that bridges the gap between medical expertise and software execution. It decouples medical logic from codebase, providing a no-code visual builder that empowers doctors to design clinical pathways. Frontline nurses can then execute these pathways via an intuitive interface, ensuring 100% accurate, transparent, and instantly updatable clinical assessments.

## ✨ Key Features

  * **Visual Protocol Builder:** An interactive, drag-and-drop flowchart canvas (React Flow) allowing medical experts to map out clinical guidelines dynamically.
  * **Navigate Mode:** A step-by-step, distraction-free execution engine for nurses to assess patients in real-time based on the doctor's active protocols.
  * **Role-Based Access Control (RBAC):** Secure, distinct portals for Hospital Admins, Head Physicians, and ER Nurses.
  * **Premium Modern UI:** High-end aesthetic utilizing Spline 3D for engaging landing pages, fully responsive design, and Tailwind CSS.
  * **Automated Reporting:** Generates instant, PDF-ready assessment reports containing execution history, priority outcomes, and clinical notes securely saved to the cloud.

## 🏗️ System Architecture

TriageFlow utilizes a decoupled MERN stack architecture. The frontend maintains the complex state of the visual flowcharts, while the RESTful Node.js backend securely validates RBAC tokens and manages the NoSQL protocol/report schemas.

`Client (Nurse/Doctor) → React UI (Frontend) → Node.js Express API → Deterministic DAG Engine → MongoDB Atlas → Priority Outcome`

### Database Design (MongoDB/Mongoose)

  * **Hospital:** Core tenant storing clinic information.
  * **User:** Polymorphic schema handling `admin`, `doctor`, and `nurse` roles, linked via `HospitalId`.
  * **Flowchart:** Stores `nodes` (questions/outcomes) and `edges` (connections) arrays to represent the graph state.
  * **Report:** Audit trail storing the executed `questionHistory`, final `outcome`, and Nurse `notes`.

## 💻 Tech Stack

  * **Frontend:** React (Vite), Tailwind CSS, Lucide-React, React Flow, Spline 3D
  * **Backend:** Node.js, Express.js, JWT Authentication, BcryptJS
  * **Database:** MongoDB Atlas, Mongoose ODM
  * **Deployment:** Vercel (Frontend edge network), Render (Backend Web Service)

## 🔌 API Reference

The RESTful API is secured via JWT. Core endpoints include:

**Authentication & Onboarding**

  * `POST /api/auth/login` - Authenticate User
  * `POST /api/hospital/register` - Create Admin & Clinic tenant

**Staff Management**

  * `POST /api/staff/create` - Admin provisions Doctor/Nurse credentials
  * `GET /api/staff` - Retrieve clinic staff list

**Protocol Management (Flowcharts)**

  * `GET /api/flowcharts` - Fetch active clinical protocols
  * `POST /api/flowchart` - Publish a new visual protocol to the database

**Clinical Execution (Reports)**

  * `POST /api/report` - Submit a completed triage assessment
  * `GET /api/reports` - Retrieve patient history and PDF data

## 🚀 Future Scope & Scalability

  * **Advisory ML Overlay:** Integrate predictive ML models as a localized overlay to assist doctors *during* the protocol building phase, analyzing past triage data to suggest optimal pathways.
  * **Critical Alerts:** Automated SMS/Email paging hooks triggered immediately when a "RED" (critical) pathway is reached.
  * **Multi-Tenant Network:** Allow isolated, low-resource clinics to securely subscribe to and download expert protocols published by top-tier medical research hospitals.

