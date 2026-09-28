/**
 * CancerCare - Storage & CRUD Logic Integration Test
 * Simulates browser environment to test CancerCareStorage & CancerCareAuth
 */

// Mock browser Storage & DOM environment
const storageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

global.localStorage = storageMock;
global.sessionStorage = storageMock;
global.window = { location: { href: '', reload: () => {} } };

const fs = require('fs');
const path = require('path');
const vm = require('vm');

let appJsCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
// Append export statements for Node test context
appJsCode += '\nglobalThis.CancerCareStorage = CancerCareStorage;\nglobalThis.CancerCareAuth = CancerCareAuth;\n';

const context = {
  localStorage: storageMock,
  sessionStorage: storageMock,
  window: global.window,
  globalThis: {},
  console: console,
  Date: Date,
  JSON: JSON,
  Math: Math,
  parseInt: parseInt
};
context.globalThis = context;

vm.createContext(context);
vm.runInContext(appJsCode, context);

const { CancerCareStorage, CancerCareAuth } = context;

let passed = 0;
let failed = 0;

function check(desc, condition) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${desc}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${desc}`);
  }
}

console.log('Testing Storage CRUD & Authentication...');

// 1. Auth Test
const loginFail = CancerCareAuth.login('wrong@test.com', 'badpass');
check('Auth rejects invalid credentials', loginFail.success === false);

const loginPass = CancerCareAuth.login('demo@cancercare.com', 'demo123', true);
check('Auth accepts demo credentials', loginPass.success === true);
check('Session is active', CancerCareAuth.isAuthenticated() === true);

// 2. Patient Profile
const patient = CancerCareStorage.getPatient();
check('Default patient initialized', patient.fullName === 'Eleanor Vance');

patient.age = 53;
patient.fullName = 'Eleanor Vance Updated';
CancerCareStorage.savePatient(patient);
check('Patient updated', CancerCareStorage.getPatient().fullName === 'Eleanor Vance Updated');

// 3. Appointments CRUD
const initialApts = CancerCareStorage.getAppointments();
check('Initial appointments loaded', initialApts.length > 0);

const newApt = CancerCareStorage.addAppointment({
  doctorName: 'Dr. Test Oncologist',
  date: '2026-11-15',
  time: '10:00',
  type: 'Consultation',
  status: 'Upcoming'
});
check('Appointment added', newApt.id.startsWith('apt-'));

const updatedApt = CancerCareStorage.updateAppointment(newApt.id, { notes: 'Updated test notes' });
check('Appointment updated', updatedApt.notes === 'Updated test notes');

CancerCareStorage.deleteAppointment(newApt.id);
check('Appointment deleted', CancerCareStorage.getAppointments().find(a => a.id === newApt.id) === undefined);

// 4. Treatment CRUD
const treatment = CancerCareStorage.getTreatment();
check('Treatment phase loaded', treatment.progressPercentage === 65);

treatment.progressPercentage = 70;
CancerCareStorage.saveTreatment(treatment);
check('Treatment progress updated to 70%', CancerCareStorage.getTreatment().progressPercentage === 70);

// 5. Medication CRUD & Toggle Taken
const meds = CancerCareStorage.getMedications();
const firstMed = meds[0];
const originalTaken = firstMed.takenToday;
const toggledMed = CancerCareStorage.toggleMedicationTaken(firstMed.id);
check('Medication taken status toggled', toggledMed.takenToday === !originalTaken);

const newMed = CancerCareStorage.addMedication({
  name: 'Test Supportive Med',
  dosage: '10 mg',
  schedule: 'Daily'
});
check('Medication added', newMed.id.startsWith('med-'));
CancerCareStorage.deleteMedication(newMed.id);
check('Medication deleted', CancerCareStorage.getMedications().find(m => m.id === newMed.id) === undefined);

// 6. Symptoms CRUD
const newSym = CancerCareStorage.addSymptom({
  name: 'Test Mild Headache',
  severity: 2,
  severityLevel: 'Mild',
  date: '2026-10-01'
});
check('Symptom added', newSym.id.startsWith('sym-'));

CancerCareStorage.updateSymptom(newSym.id, { severity: 3 });
check('Symptom updated', CancerCareStorage.getSymptoms().find(s => s.id === newSym.id).severity === 3);

CancerCareStorage.deleteSymptom(newSym.id);
check('Symptom deleted', CancerCareStorage.getSymptoms().find(s => s.id === newSym.id) === undefined);

// 7. Reports CRUD
const newReport = CancerCareStorage.addReport({
  title: 'Test Lab Report',
  date: '2026-10-01',
  category: 'Laboratory / Blood'
});
check('Report added', newReport.id.startsWith('rep-'));
CancerCareStorage.deleteReport(newReport.id);
check('Report deleted', CancerCareStorage.getReports().find(r => r.id === newReport.id) === undefined);

// 8. Reminders CRUD & Toggle
const newRem = CancerCareStorage.addReminder({
  title: 'Test Drink Electrolytes',
  category: 'Treatment',
  priority: 'High',
  completed: false
});
check('Reminder added', newRem.id.startsWith('rem-'));

const toggledRem = CancerCareStorage.toggleReminder(newRem.id);
check('Reminder toggled completed', toggledRem.completed === true);

CancerCareStorage.deleteReminder(newRem.id);
check('Reminder deleted', CancerCareStorage.getReminders().find(r => r.id === newRem.id) === undefined);

// 9. Reset Demo Data
CancerCareStorage.resetAllData(false);
check('Reset data restores original patient', CancerCareStorage.getPatient().fullName === 'Eleanor Vance');

console.log(`\nStorage CRUD Test Summary: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
process.exit(0);
