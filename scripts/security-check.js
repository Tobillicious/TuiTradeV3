#!/usr/bin/env node

/**
 * TuiTrade Security Check Script
 * Runs various security checks to ensure the app is production-ready
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 TuiTrade Security Check\n');

const checks = [];
let passed = 0;
let failed = 0;

function check(name, condition, message) {
  const status = condition ? '✅' : '❌';
  const result = { name, passed: condition, message };
  checks.push(result);
  
  console.log(`${status} ${name}: ${message}`);
  
  if (condition) {
    passed++;
  } else {
    failed++;
  }
}

// Check 1: Environment file exists
const envExists = fs.existsSync('.env');
check(
  'Environment File',
  envExists,
  envExists ? '.env file found' : '.env file missing - copy from .env.example'
);

// Check 2: Firebase rules exist
const firestoreRulesExist = fs.existsSync('firestore.rules');
const storageRulesExist = fs.existsSync('storage.rules');
check(
  'Firebase Rules',
  firestoreRulesExist && storageRulesExist,
  firestoreRulesExist && storageRulesExist 
    ? 'Firestore and Storage rules found' 
    : 'Missing security rules files'
);

// Check 3: Firebase config exists
const firebaseConfigExists = fs.existsSync('firebase.json');
check(
  'Firebase Configuration',
  firebaseConfigExists,
  firebaseConfigExists ? 'firebase.json found' : 'firebase.json missing'
);

// Check 4: Functions directory exists
const functionsExist = fs.existsSync('functions') && fs.existsSync('functions/src/index.ts');
check(
  'Cloud Functions',
  functionsExist,
  functionsExist ? 'Cloud Functions setup found' : 'Cloud Functions not configured'
);

// Check 5: Check for common security issues in package.json
let vulnerabilities = 0;
try {
  const auditResult = execSync('npm audit --json', { encoding: 'utf8' });
  const audit = JSON.parse(auditResult);
  vulnerabilities = audit.metadata?.vulnerabilities?.total || 0;
} catch (error) {
  // npm audit might exit with non-zero code if vulnerabilities found
  try {
    const auditResult = error.stdout;
    const audit = JSON.parse(auditResult);
    vulnerabilities = audit.metadata?.vulnerabilities?.total || 0;
  } catch (parseError) {
    vulnerabilities = -1; // Unknown
  }
}

check(
  'Dependencies Security',
  vulnerabilities === 0,
  vulnerabilities === 0 ? 'No known vulnerabilities' : 
  vulnerabilities === -1 ? 'Could not check vulnerabilities' :
  `${vulnerabilities} vulnerabilities found - run 'npm audit fix'`
);

// Check 6: Environment variables in .env (if exists)
if (envExists) {
  const envContent = fs.readFileSync('.env', 'utf8');
  const hasFirebaseConfig = envContent.includes('REACT_APP_FIREBASE_API_KEY=') && 
                           !envContent.includes('your_firebase_api_key');
  const hasStripeConfig = envContent.includes('REACT_APP_STRIPE_PUBLISHABLE_KEY=');
  
  check(
    'Firebase Configuration',
    hasFirebaseConfig,
    hasFirebaseConfig ? 'Firebase config appears to be set' : 'Firebase config needs to be updated'
  );
  
  check(
    'Stripe Configuration',
    hasStripeConfig,
    hasStripeConfig ? 'Stripe config found' : 'Stripe config missing (optional for basic functionality)'
  );
}

// Check 7: Build process works
let buildWorks = false;
try {
  execSync('npm run build', { stdio: 'pipe' });
  buildWorks = true;
} catch (error) {
  buildWorks = false;
}

check(
  'Build Process',
  buildWorks,
  buildWorks ? 'Build process successful' : 'Build process failed - check for errors'
);

// Check 8: Check for sensitive files that shouldn't be committed
const gitignoreExists = fs.existsSync('.gitignore');
let gitignoreContent = '';
if (gitignoreExists) {
  gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
}

const sensitivePatternsInGitignore = [
  '.env',
  'node_modules',
  '/build',
  '/functions/lib'
].every(pattern => gitignoreContent.includes(pattern));

check(
  'Git Security',
  sensitivePatternsInGitignore,
  sensitivePatternsInGitignore ? 'Sensitive files properly ignored' : 'Update .gitignore to exclude sensitive files'
);

// Check 9: HTTPS enforcement
const firebaseJson = fs.existsSync('firebase.json') ? 
  JSON.parse(fs.readFileSync('firebase.json', 'utf8')) : {};
const hasSecurityHeaders = firebaseJson.hosting?.headers?.some(header => 
  header.headers?.some(h => h.key === 'Strict-Transport-Security')
);

check(
  'HTTPS Security',
  hasSecurityHeaders,
  hasSecurityHeaders ? 'Security headers configured' : 'Security headers missing in firebase.json'
);

// Summary
console.log('\n📊 Security Check Summary');
console.log('='.repeat(50));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📋 Total checks: ${checks.length}`);

const score = (passed / checks.length) * 100;
console.log(`🎯 Security Score: ${score.toFixed(1)}%`);

if (score >= 90) {
  console.log('🎉 Excellent! Your app is ready for production.');
} else if (score >= 70) {
  console.log('⚠️  Good, but please address the failing checks before production.');
} else {
  console.log('🚨 Security issues found. Please fix before deploying to production.');
}

console.log('\n📋 Next Steps:');
if (failed > 0) {
  console.log('1. Address the failing security checks above');
  console.log('2. Re-run this script to verify fixes');
  console.log('3. Review the SECURITY_AUDIT.md file');
  console.log('4. Follow the DEPLOYMENT_GUIDE.md for production deployment');
} else {
  console.log('1. Review the DEPLOYMENT_GUIDE.md for production deployment');
  console.log('2. Set up monitoring and alerts');
  console.log('3. Test thoroughly in a staging environment');
  console.log('4. Deploy to production!');
}

// Exit with error code if any critical checks failed
process.exit(failed > 0 ? 1 : 0);