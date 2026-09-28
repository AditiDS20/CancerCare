# CancerCare – Cancer Care & Patient Management System

> **Tagline:** *Patient Care & Treatment Management*  
> **Course:** Software Engineering / Agile Web Application Project  
> **Project Type:** Educational Patient-Management Prototype

---

## ⚠️ Medical Disclaimer

> **IMPORTANT NOTICE:**  
> This application is an educational patient-management prototype. It does not provide cancer diagnosis, treatment recommendations, or medical advice. Medical decisions should be made with qualified healthcare professionals.
> 
> The application must **NOT** diagnose cancer, predict cancer, recommend treatment, recommend medicines, or make clinical decisions. All information displayed consists of user-entered tracking records for personal organization and educational demonstration.

---

## 1. Project Overview

**CancerCare** is a modern, responsive, static web application designed to help cancer patients, caregivers, and student evaluators organize and monitor non-clinical outpatient care workflows. The application tracks:
- Clinical appointments with oncologists and specialists
- Active treatment phases, cycles, and milestones
- Supportive daily medication schedules and intake logs
- Self-reported symptom trends with visual severity ratings
- Medical report and diagnostic imaging metadata
- Prioritized reminders for hydration, fasting, and clinic preparation
- Comprehensive patient profile demographics and clinical team context

The project adheres strictly to **Agile Scrum** practices (detailed in [AGILE_MAPPING.md](AGILE_MAPPING.md)) with 10 user stories (US-01 through US-10).

---

## 2. Key Features

| Module | Features & Capabilities |
| :--- | :--- |
| **1. Authentication (Demo)** | Modern login portal with demo credential autofill, one-click evaluation access, remember-me support, and security disclaimers. |
| **2. Patient Dashboard** | Central operational view with summary stat cards (Next Appointment, Treatment Phase, Daily Meds, Reminders), treatment progress bar, mini checklists, and quick action modals. |
| **3. Patient Profile** | View and edit patient demographics, emergency contacts, user-entered cancer diagnosis category, and treating team. Includes JSON export and demo reset. |
| **4. Appointments** | Schedule, view, filter (All/Upcoming/Completed/Cancelled), edit, and delete oncology consults, infusions, and radiation visits. |
| **5. Treatment Tracker** | Visual roadmap of therapy phases (e.g. Adjuvant Chemotherapy AC-T), interactive manual progress slider (0–100%), milestones table, and Chart.js milestone breakdown. |
| **6. Medication Tracker** | Record supportive prescriptions, user-entered dosages, schedules, and daily intake. One-click "Mark as Taken" checkbox with real-time adherence calculation. |
| **7. Symptom Journal** | Record physical side effects with a 1–10 severity scale (Mild, Moderate, Severe), date/time, triggers, and relief notes. Includes Chart.js chronological severity line graph. |
| **8. Medical Reports** | Metadata registry for lab results (CBC), pathology summaries, and imaging (CT, Echocardiogram). Simulated PDF badges, search, category filters, and detailed view modals. |
| **9. Reminders** | Prioritized care reminders (High/Medium/Low) for medication intake, pre-infusion hydration, and fasting with completion toggles. |
| **10. Care Summary Report** | Printable, consolidated clinical profile summary (US-10) suitable for hospital consultations. |

---

## 3. Technology Stack

- **HTML5:** Semantic, accessible markup across 9 dedicated views.
- **CSS3:** Custom medical design system (variables, responsive flexbox/grid layout, off-canvas mobile drawer, custom modals, toasts, cards).
- **Vanilla JavaScript (ES6+):** Modular, client-side controllers for data rendering, modal lifecycle, and event handling.
- **Chart.js (v4 via CDN):** Responsive canvas charts for symptom severity trends and treatment milestones.
- **Web Storage API (`localStorage`):** Persistent, zero-backend demo storage pre-seeded with realistic clinical demo data.
- **Zero Frameworks:** No React, no backend server, no database, no Docker, no Java/Jenkins.

---

## 4. Project Structure

```
CancerCare/
│
├── index.html                   # Login portal with demo credentials
├── dashboard.html               # Main patient overview dashboard & charts
├── profile.html                 # Patient demographics & care context editor
├── appointments.html            # Appointment scheduler & filterable table
├── treatment.html               # Treatment phase & milestone tracker
├── medications.html             # Medication list & daily intake checklist
├── symptoms.html                # Symptom journal & severity trend graph
├── reports.html                 # Medical report metadata registry
├── reminders.html               # Prioritized care reminders board
│
├── css/
│   └── style.css                # Healthcare design system stylesheet
│
├── js/
│   ├── app.js                   # Storage manager, auth state, default seed data, UI utils
│   ├── dashboard.js             # Dashboard controller & Chart.js instances
│   ├── profile.js               # Profile form controller & JSON export
│   ├── appointments.js          # Appointment CRUD & filter logic
│   ├── treatment.js             # Treatment progress slider & milestone handlers
│   ├── medications.js           # Medication adherence & checklist controller
│   ├── symptoms.js              # Symptom journal controller & trend chart
│   ├── reports.js               # Report metadata manager & detail modal
│   └── reminders.js             # Care reminder controller & priority filters
│
├── tests/
│   └── test-runner.js           # Automated static validation & link integrity suite
│
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions CI testing & GitHub Pages deployment
│
├── AGILE_MAPPING.md             # Complete Agile mapping (US-01 through US-10)
└── README.md                    # Comprehensive project documentation
```

---

## 5. Demo Credentials

For grading, evaluation, and viva presentations:

- **Email:** `demo@cancercare.com`
- **Password:** `demo123`

> **Convenience Feature:** The login page includes an **"⚡ Auto Fill"** button and a **"🚀 One-Click Demo Access"** button that logs into the portal instantly as Eleanor Vance (52, Breast Cancer Adjuvant Care case study).

---

## 6. How to Run Locally

Because CancerCare is built with standard HTML5, CSS3, and Vanilla JavaScript, it can be run in any modern web browser without installing heavy toolchains.

### Method A: Direct File Open (Fastest)
1. Clone or download this repository.
2. Double-click `index.html` to open it directly in your web browser (Chrome, Edge, Firefox, or Safari).
3. Click **"🚀 One-Click Demo Access"** or log in with `demo@cancercare.com` / `demo123`.

### Method B: Using Local Development Server (Recommended)
If you have Python or Node.js installed, you can serve the directory locally:

**Using Node.js:**
```bash
# Using npx serve (no global installation required)
npx serve .
# Open http://localhost:3000 in your browser
```

**Using Python:**
```bash
# Python 3
python -m http.server 8000
# Open http://localhost:8000 in your browser
```

---

## 7. Running the Test Suite Locally

The project includes an automated static test runner checking file integrity, JavaScript syntax (`node --check`), HTML structure, zero broken links, CSS design system tokens, and Agile user story mapping:

```bash
node tests/test-runner.js
```

**Expected output:**
```
====================================================
CancerCare Automated Test Suite
====================================================
...
Test Summary: 77 passed, 0 failed, Total 77 checks
====================================================
All tests passed successfully! Ready for college evaluation & deployment.
```

---

## 8. GitHub Actions Information

The repository includes a continuous integration and deployment workflow located at:
`.github/workflows/deploy.yml`

### What the Workflow Does:
1. **Triggers:** Automatically executes on every push to the `main` branch, pull requests targeting `main`, or manual trigger via `workflow_dispatch`.
2. **Checkout:** Checks out repository code onto a clean `ubuntu-latest` runner.
3. **Automated Testing:** Runs `node tests/test-runner.js` to validate JavaScript syntax, HTML structure, stylesheet presence, and link integrity.
4. **Static Preparation:** Packages the static website assets without requiring build steps.
5. **Deployment:** Deploys the static site directly to **GitHub Pages** using official `actions/deploy-pages@v4`.

---

## 9. GitHub Pages Deployment Instructions

To enable GitHub Pages for your repository:

1. Push your code to your GitHub repository on branch `main`.
2. Go to your repository on GitHub.
3. Click on the **Settings** tab.
4. In the left sidebar, click on **Pages** (under the "Code and automation" section).
5. Under **Build and deployment**:
   - Set **Source** to **GitHub Actions**.
6. That's it! GitHub Actions will automatically run the `.github/workflows/deploy.yml` workflow, validate tests, and deploy your site.
7. Your live website URL will be displayed at the top of the Pages settings page (e.g. `https://<your-username>.github.io/<repository-name>/`).

---

## 10. Recommended Screenshots for Assignment Submission

For your college project report, viva presentation, or laboratory manual, capture the following screenshots:

1. **Screenshot 1 – Login Portal (`index.html`):**  
   Shows the branded login box, demo credentials prompt, auto-fill buttons, and medical disclaimer.
2. **Screenshot 2 – Main Dashboard Overview (`dashboard.html`):**  
   Shows the top metrics cards, upcoming appointment, treatment phase progress bar, and quick action bar.
3. **Screenshot 3 – Dashboard Visualizations (`dashboard.html`):**  
   Shows the Chart.js Symptom Severity Trend line chart and Care Milestones breakdown.
4. **Screenshot 4 – Patient Profile Form (`profile.html`):**  
   Shows demographic fields, emergency contact, and user-entered clinical context.
5. **Screenshot 5 – Appointments Management (`appointments.html`):**  
   Shows filter tabs (Upcoming/Completed), search bar, and the interactive "Schedule Appointment" modal.
6. **Screenshot 6 – Treatment Tracker (`treatment.html`):**  
   Shows the active phase badge, manual progress slider, and care milestones table.
7. **Screenshot 7 – Medication Tracker & Adherence (`medications.html`):**  
   Shows prescription cards, dosage details, and the "Mark as Taken" checkbox toggle.
8. **Screenshot 8 – Symptom Journal (`symptoms.html`):**  
   Shows color-coded severity badges (Mild, Moderate, Severe), date/time logs, and the symptom severity graph.
9. **Screenshot 9 – Medical Reports Registry (`reports.html`):**  
   Shows the report list with simulated PDF badges, category tags, and the "View Report Details" modal.
10. **Screenshot 10 – Care Reminders (`reminders.html`):**  
    Shows high-priority reminders, due dates, and completion status toggles.
11. **Screenshot 11 – Patient Care Summary Report (`dashboard.html` -> Care Report modal):**  
    Shows the consolidated printable medical summary modal.
12. **Screenshot 12 – Terminal Test Execution:**  
    Shows `node tests/test-runner.js` passing with 0 errors.
13. **Screenshot 13 – GitHub Actions CI/CD Pipeline:**  
    Shows the green checkmark for the automated test and deployment workflow in your GitHub repository.
