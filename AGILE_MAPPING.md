# Agile Requirements & User Story Mapping

## Project Title
**CancerCare – Cancer Care & Patient Management System**  
**Tagline:** *Patient Care & Treatment Management*

---

## 1. Agile Framework Overview
The CancerCare project followed an **Agile Scrum** methodology tailored for educational healthcare software engineering. Development was structured into two 1-week sprints using MoSCoW prioritization (Must have, Should have, Could have, Won't have) and Fibonacci story estimation (1, 2, 3, 5, 8).

### Definition of Done (DoD)
A User Story is considered "Done" when:
1. All Acceptance Criteria are satisfied and verified.
2. The UI is fully responsive (desktop, tablet, mobile viewports).
3. Data is persisted accurately in browser `localStorage` without external database dependencies.
4. Client-side input validation and error feedback toasts are operational.
5. Code passes automated static validation tests (`node tests/test-runner.js`).
6. The educational medical disclaimer is prominently displayed.
7. Code is formatted, documented, and committed to version control.

---

## 2. MoSCoW Prioritization Matrix

| Priority | Story ID | Title | Story Points | Sprint |
| :--- | :--- | :--- | :---: | :---: |
| **Must Have** | US-01 | Patient Login & Demo Authentication | 3 | Sprint 1 |
| **Must Have** | US-02 | Patient Demographics & Profile Management | 3 | Sprint 1 |
| **Must Have** | US-03 | Clinical Appointment Scheduling | 5 | Sprint 1 |
| **Must Have** | US-04 | Treatment Journey Progress Tracking | 5 | Sprint 1 |
| **Must Have** | US-05 | Medication Schedule & Intake Log | 5 | Sprint 2 |
| **Must Have** | US-06 | Symptom Journal & Severity Tracker | 5 | Sprint 2 |
| **Must Have** | US-07 | Medical Report Metadata Management | 3 | Sprint 2 |
| **Must Have** | US-08 | Care Reminder Management | 3 | Sprint 2 |
| **Must Have** | US-09 | Comprehensive Dashboard Monitoring | 5 | Sprint 2 |
| **Should Have**| US-10 | Patient Care Summary Report (Printable Export) | 3 | Sprint 2 |
| **Total Story Points** | | | **40 pts** | |

---

## 3. Detailed User Stories & Acceptance Criteria

### US-01: Patient Login
- **User Story:** As an oncology patient or student evaluator, I want to authenticate into the CancerCare portal using demo credentials or a one-click demo access button so that I can securely explore my personalized care portal.
- **Priority:** Must Have (P1)
- **Story Points:** 3
- **Acceptance Criteria:**
  - [x] Given the login screen at `index.html`, when entering `demo@cancercare.com` and `demo123`, the system authenticates the user and redirects to `dashboard.html`.
  - [x] Given invalid credentials, the system blocks navigation and displays an error toast message with helpful guidance.
  - [x] A "One-Click Demo Access" button allows instant login as the demo patient (Eleanor Vance).
  - [x] An "Auto Fill" button populates the credentials form automatically.
  - [x] Educational disclaimer is explicitly visible below the login box stating this is not clinical authentication.

---

### US-02: Patient Profile
- **User Story:** As a patient, I want to view and update my personal demographics, emergency contact, and cancer diagnosis category so that my care profile reflects my current clinical background.
- **Priority:** Must Have (P1)
- **Story Points:** 3
- **Acceptance Criteria:**
  - [x] Displays patient full name, age, date of birth, gender, blood group, contact phone, email, and address.
  - [x] Includes emergency contact details (Name, Relationship, Phone).
  - [x] Includes free-text user-entered fields for Cancer Type/Category, Treating Oncologist, and Hospital.
  - [x] All updates persist to `localStorage` and update header banners dynamically.
  - [x] Provides a button to export all patient data to a downloadable JSON file.
  - [x] Clear note stating that profile fields do not generate medical conclusions or diagnostic inferences.

---

### US-03: Appointment Management
- **User Story:** As a patient, I want to schedule, edit, filter, and mark clinical appointments as completed so that I never miss an oncology consultation, infusion cycle, or diagnostic scan.
- **Priority:** Must Have (P1)
- **Story Points:** 5
- **Acceptance Criteria:**
  - [x] Allows adding appointments with Doctor Name, Department, Date, Time, Type (Chemotherapy, Radiation, Consult, Lab), Location, and Notes.
  - [x] Displays a searchable and filterable table of visits (All, Upcoming, Completed, Cancelled).
  - [x] Allows editing all appointment fields via a pre-populated modal.
  - [x] Allows deleting appointments with user confirmation dialog.
  - [x] Provides a one-click "✓ Done" button to mark upcoming visits as Completed.

---

### US-04: Treatment Progress Tracking
- **User Story:** As an oncology patient, I want to track my active treatment phase, completion percentage, and care milestones so that I have a clear visual roadmap of my therapeutic journey.
- **Priority:** Must Have (P1)
- **Story Points:** 5
- **Acceptance Criteria:**
  - [x] Displays current primary phase (e.g., Adjuvant Chemotherapy) and sub-phase cycle (e.g., Weekly Paclitaxel Cycle 8 of 12).
  - [x] Displays an interactive visual progress bar and a manual progress slider (0% to 100%).
  - [x] Displays phase start date, estimated target completion, and next scheduled session.
  - [x] Displays a milestone table showing individual surgical, systemic, and radiation milestones.
  - [x] Allows adding, editing, deleting, and marking milestones as Completed.
  - [x] Renders a Chart.js milestones breakdown visualization.
  - [x] Clear disclaimer that the tool is visual only and does not recommend or adjust treatments.

---

### US-05: Medication Tracking
- **User Story:** As a patient undergoing systemic therapy, I want to record my supportive medications, dosages, and daily intake so that I adhere to antiemetic and adjuvant schedules.
- **Priority:** Must Have (P1)
- **Story Points:** 5
- **Acceptance Criteria:**
  - [x] Form to record Medication Name, user-entered Dosage, Schedule/Timing, Time of Day, Start Date, Prescribing Doctor, and Notes.
  - [x] Displays medication cards and table with a direct checkbox toggle for "Mark as Taken".
  - [x] Automatically records timestamp when marked taken (e.g. "Today at 08:30 AM").
  - [x] Summary stat cards compute daily adherence percentage in real time.
  - [x] Allows editing and deleting medication records.
  - [x] Explicit disclaimer confirming the prototype does not recommend medicines or calculate dosages.

---

### US-06: Symptom Journal
- **User Story:** As a patient receiving chemotherapy, I want to log physical sensations and side effects with a 1-to-10 severity scale so that I can share accurate records with my oncologist.
- **Priority:** Must Have (P1)
- **Story Points:** 5
- **Acceptance Criteria:**
  - [x] Form captures Symptom Name, Severity (1 to 10), Date, Time, Context/Triggers, and Management/Relief measures.
  - [x] Color-coded severity badges: Mild (1-3, green), Moderate (4-6, amber), Severe (7-10, red).
  - [x] Renders an interactive Chart.js line graph tracking severity fluctuations over chronological dates.
  - [x] Table filtering by severity level (All, Mild, Moderate, Severe) and real-time text search.
  - [x] Allows editing and deleting symptom entries.
  - [x] Safety warning instructing patients to immediately contact hospital triage for emergency symptoms (fever ≥ 100.4°F).

---

### US-07: Medical Report Management
- **User Story:** As a patient, I want to organize metadata for my pathology reports, blood panels, and CT scans so that I have a structured index of clinical records.
- **Priority:** Must Have (P1)
- **Story Points:** 3
- **Acceptance Criteria:**
  - [x] Allows recording Document Title, Report Date, Category (Laboratory, Imaging, Pathology, Surgical), Facility, Reviewing Physician, and Clinical Findings.
  - [x] Table lists documents with simulated PDF file metadata badges and sizes.
  - [x] "👁️ View" button opens a detailed modal with comprehensive clinical findings.
  - [x] Supports category filtering and title search.
  - [x] Allows editing and deleting report records.
  - [x] Stated clearly that document metadata is simulated locally for educational demonstration.

---

### US-08: Reminder Management
- **User Story:** As a patient managing a complex regimen, I want to create prioritized reminders for appointments, medications, and pre-infusion hydration so that I stay prepared.
- **Priority:** Must Have (P1)
- **Story Points:** 3
- **Acceptance Criteria:**
  - [x] Form to create reminders with Title, Category (Treatment, Medication, Appointment, Hydration, Personal), Due Date/Time, Priority (High, Medium, Low), and Notes.
  - [x] Interactive checkbox to toggle reminders between Pending and Completed.
  - [x] Visual priority tags (High in red, Medium in amber, Low in neutral).
  - [x] Filters for All, Pending, Completed, and specific categories.
  - [x] Metric counters track active pending vs completed items.

---

### US-09: Dashboard Monitoring
- **User Story:** As a patient or care team reviewer, I want a unified dashboard showing my upcoming appointment, treatment phase, daily medication status, and symptom trend so that I get an immediate status overview.
- **Priority:** Must Have (P1)
- **Story Points:** 5
- **Acceptance Criteria:**
  - [x] Header welcomes patient by name with quick initials avatar and date indicator.
  - [x] Four primary summary metric cards: Next Appointment, Treatment Phase, Daily Medications Taken, and Active Reminders.
  - [x] Large Treatment Journey progress bar showing active regimen and percentage.
  - [x] Chart.js Symptom Severity Trend line chart and Care Milestones doughnut chart.
  - [x] Mini-lists for Upcoming Appointments, Today's Medication Checklist, Recent Symptoms, and Active Reminders.
  - [x] Quick action buttons (`+ Log Symptom`, `+ New Appointment`, `+ Add Medication`, `+ Record Report`) with instant pop-up modals.

---

### US-10: Patient Care Report
- **User Story:** As a patient preparing for an oncology consultation, I want to view and print a consolidated clinical care summary report so that I can bring an organized summary to my appointment.
- **Priority:** Should Have (P2)
- **Story Points:** 3
- **Acceptance Criteria:**
  - [x] "📄 Care Report" button in the dashboard top navigation bar opens a comprehensive care summary modal.
  - [x] Compiles patient demographics, active diagnosis, treating doctor, treatment phase, current prescriptions, and upcoming schedule.
  - [x] Includes a "🖨️ Print / Save PDF" button calling browser print view.
  - [x] Embedded educational medical disclaimer included on printout.

---

## 4. Sprint Velocity & Traceability

```
Total Estimated Story Points: 40 pts
Sprint 1 Completed Points:    16 pts (US-01, US-02, US-03, US-04)
Sprint 2 Completed Points:    24 pts (US-05, US-06, US-07, US-08, US-09, US-10)
Velocity:                    20 pts / sprint
Burn-down Target:             100% On-Time Completion
```
