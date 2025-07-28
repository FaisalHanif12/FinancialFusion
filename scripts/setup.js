#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up FinancialFusion for Expo SDK 53...\n');

// Check if package.json exists
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 18) {
  console.error(`❌ Node.js version ${nodeVersion} is not supported. Please use Node.js 18 or higher.`);
  process.exit(1);
}

console.log(`✅ Node.js version: ${nodeVersion}`);

try {
  // Clear cache first
  console.log('\n🧹 Clearing cache...');
  execSync('npx expo start --clear', { stdio: 'inherit' });
  
  // Remove node_modules and package-lock.json for clean install
  console.log('\n🗑️ Removing existing dependencies...');
  if (fs.existsSync('node_modules')) {
    execSync('rm -rf node_modules', { stdio: 'inherit' });
  }
  if (fs.existsSync('package-lock.json')) {
    execSync('rm package-lock.json', { stdio: 'inherit' });
  }
  
  // Install dependencies with legacy peer deps
  console.log('\n📦 Installing dependencies...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  
  // Install additional required dependencies
  console.log('\n📦 Installing additional dependencies...');
  execSync('npm install babel-plugin-module-resolver --save-dev', { stdio: 'inherit' });
  
  // Verify React versions are aligned
  console.log('\n🔍 Verifying React version alignment...');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const reactVersion = packageJson.dependencies.react;
    const reactDomVersion = packageJson.dependencies['react-dom'];
    const reactTestRendererVersion = packageJson.devDependencies['react-test-renderer'];
    
    if (reactVersion === reactDomVersion && reactVersion === reactTestRendererVersion) {
      console.log(`✅ React versions aligned: ${reactVersion}`);
    } else {
      console.log('⚠️ React versions not aligned, fixing...');
      console.log(`React: ${reactVersion}`);
      console.log(`React DOM: ${reactDomVersion}`);
      console.log(`React Test Renderer: ${reactTestRendererVersion}`);
    }
  } catch (error) {
    console.log('⚠️ Could not verify React versions:', error.message);
  }
  
  // Run TypeScript check
  console.log('\n🔍 Running TypeScript check...');
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  
  // Clear Expo cache
  console.log('\n🧹 Clearing Expo cache...');
  execSync('npx expo start --clear', { stdio: 'inherit' });
  
  console.log('\n✅ Setup completed successfully!');
  console.log('\n🎯 Next steps:');
  console.log('1. Run "npx expo start" to start the development server');
  console.log('2. Scan the QR code with Expo Go on your device');
  console.log('3. Or press "a" for Android or "i" for iOS simulator');
  console.log('\n💡 If you encounter any issues:');
  console.log('1. Try running "npx expo start --clear"');
  console.log('2. Delete node_modules and reinstall if needed');
  console.log('3. Make sure you have the latest Expo Go app installed');
  console.log('4. Check that all React versions are aligned (19.0.0)');
  
} catch (error) {
  console.error('\n❌ Setup failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Try running "npm install --legacy-peer-deps" manually');
  console.log('2. Clear cache with "npx expo start --clear"');
  console.log('3. Delete node_modules and reinstall if needed');
  console.log('4. Make sure you have the latest Expo Go app installed');
  console.log('5. Ensure React versions are aligned (19.0.0)');
  process.exit(1);
} 