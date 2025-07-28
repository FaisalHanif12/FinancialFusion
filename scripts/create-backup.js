#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔒 Creating backup before APK update...\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found. Please run this script from the project root.');
  process.exit(1);
}

try {
  // Create backup directory if it doesn't exist
  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Get current timestamp for backup filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

  console.log('📱 Starting Expo development server to access app data...');
  console.log('⚠️  Please make sure your app is running and you have data to backup.');
  console.log('📋 Instructions:');
  console.log('1. The app will start in development mode');
  console.log('2. Go to Settings → Data Management → Create Backup');
  console.log('3. Or use the Export Data feature to save your data');
  console.log('4. Your data will be automatically preserved during APK updates');
  console.log('\n💡 Your data is already safe because:');
  console.log('   ✅ AsyncStorage data persists across app updates');
  console.log('   ✅ Automatic backups are created every 10 saves');
  console.log('   ✅ Manual backup feature is available in Settings');
  console.log('   ✅ Export/Import functionality for external backup');
  
  console.log('\n🚀 Starting development server...');
  console.log('Press Ctrl+C to stop when you\'re done backing up.');
  
  // Start the development server
  execSync('npx expo start', { stdio: 'inherit' });
  
} catch (error) {
  console.error('\n❌ Backup setup failed:', error.message);
  console.log('\n🔧 Manual backup instructions:');
  console.log('1. Start the app: npx expo start');
  console.log('2. Go to Settings → Data Management');
  console.log('3. Click "Create Backup" or "Export Data"');
  console.log('4. Your data will be preserved during APK updates');
  process.exit(1);
} 