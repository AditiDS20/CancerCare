/**
 * CancerCare - Automated Test & Validation Runner
 * 
 * Verifies:
 * 1. Required project file structure
 * 2. JavaScript syntax integrity (node --check)
 * 3. HTML markup integrity and link validation (zero broken local links)
 * 4. CSS stylesheet presence and core classes
 * 5. Educational medical disclaimer presence across all pages
 * 6. Agile mapping file verification (US-01 through US-10)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName}${details ? ` -> ${details}` : ''}`);
  }
}

console.log('====================================================');
console.log('CancerCare Automated Test Suite');
console.log('====================================================\n');

// --------------------------------------------------
// Test Group 1: Required File Structure
// --------------------------------------------------
console.log('Group 1: Validating Required Project Files...');

const requiredHtmlFiles = [
  'index.html',
  'dashboard.html',
  'profile.html',
  'appointments.html',
  'treatment.html',
  'medications.html',
  'symptoms.html',
  'reports.html',
  'reminders.html'
];

requiredHtmlFiles.forEach(file => {
  const filePath = path.join(ROOT_DIR, file);
  assert(fs.existsSync(filePath), `HTML file exists: ${file}`, `Missing ${filePath}`);
});

const requiredJsFiles = [
  'js/app.js',
  'js/dashboard.js',
  'js/profile.js',
  'js/appointments.js',
  'js/treatment.js',
  'js/medications.js',
  'js/symptoms.js',
  'js/reports.js',
  'js/reminders.js'
];

requiredJsFiles.forEach(file => {
  const filePath = path.join(ROOT_DIR, file);
  assert(fs.existsSync(filePath), `JavaScript file exists: ${file}`, `Missing ${filePath}`);
});

assert(fs.existsSync(path.join(ROOT_DIR, 'css', 'style.css')), 'CSS file exists: css/style.css');
assert(fs.existsSync(path.join(ROOT_DIR, 'AGILE_MAPPING.md')), 'Agile mapping document exists: AGILE_MAPPING.md');
assert(fs.existsSync(path.join(ROOT_DIR, '.github', 'workflows', 'deploy.yml')), 'GitHub Actions workflow exists: .github/workflows/deploy.yml');

// --------------------------------------------------
// Test Group 2: JavaScript Syntax Verification
// --------------------------------------------------
console.log('\nGroup 2: Checking JavaScript Syntax...');

requiredJsFiles.forEach(file => {
  const filePath = path.join(ROOT_DIR, file);
  try {
    execSync(`node --check "${filePath}"`, { stdio: 'pipe' });
    assert(true, `Syntax valid: ${file}`);
  } catch (err) {
    assert(false, `Syntax valid: ${file}`, err.message);
  }
});

// --------------------------------------------------
// Test Group 3: HTML Markup & Zero Broken Links
// --------------------------------------------------
console.log('\nGroup 3: Checking HTML Markup & Link Integrity...');

requiredHtmlFiles.forEach(file => {
  const filePath = path.join(ROOT_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Check doctype and title
  assert(content.includes('<!DOCTYPE html>'), `${file} contains DOCTYPE`);
  assert(content.includes('<title>'), `${file} contains <title> tag`);
  assert(content.includes('css/style.css'), `${file} references css/style.css`);
  assert(content.includes('js/app.js'), `${file} references js/app.js`);

  // Check medical disclaimer presence
  const hasDisclaimer = content.toLowerCase().includes('disclaimer') || 
                        content.toLowerCase().includes('educational patient-management prototype');
  assert(hasDisclaimer, `${file} contains medical disclaimer notification`);

  // Extract all href attributes and verify local destination files exist
  const hrefMatches = content.match(/href="([^"#?]+)"/g) || [];
  hrefMatches.forEach(match => {
    const rawHref = match.replace(/href="|"/g, '');
    if (!rawHref.startsWith('http') && !rawHref.startsWith('data:') && !rawHref.startsWith('mailto:')) {
      const targetPath = path.join(ROOT_DIR, rawHref);
      assert(fs.existsSync(targetPath), `${file} link target exists: ${rawHref}`, `Target not found: ${targetPath}`);
    }
  });
});

// --------------------------------------------------
// Test Group 4: CSS Stylesheet Verification
// --------------------------------------------------
console.log('\nGroup 4: Checking CSS Design System Rules...');
const cssContent = fs.readFileSync(path.join(ROOT_DIR, 'css', 'style.css'), 'utf8');

const requiredCssTokens = [
  '--primary-700',
  '.app-container',
  '.sidebar',
  '.main-content',
  '.top-header',
  '.card',
  '.table',
  '.btn-primary',
  '.badge',
  '.modal-backdrop',
  '.toast',
  '@media (max-width: 768px)'
];

requiredCssTokens.forEach(token => {
  assert(cssContent.includes(token), `CSS contains core class or token: ${token}`);
});

// --------------------------------------------------
// Test Group 5: Agile Mapping Verification
// --------------------------------------------------
console.log('\nGroup 5: Checking Agile Mapping & User Stories...');
const agileContent = fs.readFileSync(path.join(ROOT_DIR, 'AGILE_MAPPING.md'), 'utf8');

for (let i = 1; i <= 10; i++) {
  const storyId = `US-${String(i).padStart(2, '0')}`;
  assert(agileContent.includes(storyId), `AGILE_MAPPING.md contains ${storyId}`);
}

// --------------------------------------------------
// Test Group 6: Runtime Storage & CRUD Integration
// --------------------------------------------------
console.log('\nGroup 6: Running Runtime Storage & CRUD Logic Verification...');
try {
  const crudOutput = execSync(`node "${path.join(__dirname, 'storage-crud-test.js')}"`, { stdio: 'pipe' }).toString();
  assert(true, 'Runtime Storage CRUD and Authentication logic passed');
  console.log('    ' + crudOutput.trim().split('\n').slice(-1)[0]);
} catch (err) {
  assert(false, 'Runtime Storage CRUD and Authentication logic', err.message);
}

// --------------------------------------------------
// Summary
// --------------------------------------------------
console.log('\n====================================================');
console.log(`Test Summary: ${passedTests} passed, ${failedTests} failed, Total ${totalTests} checks`);
console.log('====================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('\nAll tests passed successfully! Ready for college evaluation & deployment.\n');
  process.exit(0);
}
