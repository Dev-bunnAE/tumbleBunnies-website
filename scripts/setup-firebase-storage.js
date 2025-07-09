#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Firebase Storage configuration...\n');

// Check if Firebase CLI is installed
try {
  execSync('firebase --version', { stdio: 'ignore' });
  console.log('✅ Firebase CLI is installed');
} catch (error) {
  console.log('❌ Firebase CLI is not installed');
  console.log('Please install Firebase CLI: npm install -g firebase-tools');
  console.log('Then run: firebase login');
  process.exit(1);
}

// Check if user is logged in
try {
  execSync('firebase projects:list', { stdio: 'ignore' });
  console.log('✅ Firebase CLI is logged in');
} catch (error) {
  console.log('❌ Please login to Firebase: firebase login');
  process.exit(1);
}

console.log('\n📋 Manual steps required:');
console.log('\n1. Go to Firebase Console > Storage > Rules');
console.log('2. Replace the rules with the content from firebase-storage-rules.txt');
console.log('3. Publish the rules');

console.log('\n4. Set CORS configuration:');
console.log('   gsutil cors set firebase-storage-cors.json gs://tumblebunnies-website.appspot.com');

console.log('\n5. Or manually in Firebase Console:');
console.log('   - Go to Storage > Files');
console.log('   - Click the three dots menu');
console.log('   - Select "Configure CORS"');
console.log('   - Add the configuration from firebase-storage-cors.json');

console.log('\n🎯 After completing these steps, image uploads should work!'); 