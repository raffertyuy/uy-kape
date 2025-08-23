#!/usr/bin/env node

/**
 * Environment Validation Script for Uy, Kape! Coffee Ordering System
 * 
 * This script validates the development environment configuration and checks
 * connectivity to required services like Supabase.
 * 
 * Usage:
 *   node scripts/validate-environment.js
 *   npm run validate-env
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const c = (color, text) => `${colors[color]}${text}${colors.reset}`;

console.log(c('cyan', '🔍 Uy, Kape! Environment Validation\n'));

// Load environment variables
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && key.startsWith('VITE_')) {
      process.env[key] = value.replace(/^["']|["']$/g, '');
    }
  });
} else {
  console.log(c('red', '❌ .env file not found'));
  console.log(c('yellow', '   Copy .env.example to .env and configure it'));
  process.exit(1);
}

// Configuration checks
const checks = {
  environment: {
    name: 'Environment Variables',
    tests: []
  },
  supabase: {
    name: 'Supabase Configuration',
    tests: []
  },
  connectivity: {
    name: 'Network Connectivity',
    tests: []
  }
};

// Environment variable validation
const requiredVars = [
  { key: 'VITE_SUPABASE_URL', name: 'Supabase URL' },
  { key: 'VITE_SUPABASE_ANON_KEY', name: 'Supabase Anonymous Key' },
  { key: 'VITE_GUEST_PASSWORD', name: 'Guest Password' },
  { key: 'VITE_ADMIN_PASSWORD', name: 'Admin Password' }
];

requiredVars.forEach(({ key, name }) => {
  const value = process.env[key];
  if (!value) {
    checks.environment.tests.push({
      name,
      status: 'fail',
      message: `${key} is not set`
    });
  } else if (value.length < 3) {
    checks.environment.tests.push({
      name,
      status: 'warn',
      message: `${key} is too short (less than 3 characters)`
    });
  } else {
    checks.environment.tests.push({
      name,
      status: 'pass',
      message: `${key} is configured`
    });
  }
});

// Supabase URL format validation
const supabaseUrl = process.env.VITE_SUPABASE_URL;
if (supabaseUrl) {
  const urlPattern = /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/;
  if (urlPattern.test(supabaseUrl)) {
    checks.supabase.tests.push({
      name: 'URL Format',
      status: 'pass',
      message: 'Supabase URL format is valid'
    });
  } else {
    checks.supabase.tests.push({
      name: 'URL Format',
      status: 'fail',
      message: 'Supabase URL format is invalid (should be https://xxx.supabase.co)'
    });
  }
} else {
  checks.supabase.tests.push({
    name: 'URL Format',
    status: 'fail',
    message: 'Supabase URL is not configured'
  });
}

// Supabase anonymous key validation
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
if (anonKey) {
  // Basic JWT structure check
  const jwtPattern = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
  if (jwtPattern.test(anonKey)) {
    checks.supabase.tests.push({
      name: 'Anonymous Key Format',
      status: 'pass',
      message: 'Anonymous key format appears valid'
    });
  } else {
    checks.supabase.tests.push({
      name: 'Anonymous Key Format',
      status: 'warn',
      message: 'Anonymous key format may be invalid (should be JWT token)'
    });
  }
} else {
  checks.supabase.tests.push({
    name: 'Anonymous Key Format',
    status: 'fail',
    message: 'Anonymous key is not configured'
  });
}

// Password strength validation
const guestPassword = process.env.VITE_GUEST_PASSWORD;
const adminPassword = process.env.VITE_ADMIN_PASSWORD;

const validatePassword = (password, type) => {
  if (!password) {
    return { status: 'fail', message: `${type} password is not set` };
  }
  
  if (password.length < 6) {
    return { status: 'warn', message: `${type} password is weak (less than 6 characters)` };
  }
  
  if (password === 'password' || password === '123456' || password === 'admin') {
    return { status: 'warn', message: `${type} password is too common` };
  }
  
  return { status: 'pass', message: `${type} password strength is acceptable` };
};

const guestPasswordCheck = validatePassword(guestPassword, 'Guest');
checks.environment.tests.push({
  name: 'Guest Password Strength',
  ...guestPasswordCheck
});

const adminPasswordCheck = validatePassword(adminPassword, 'Admin');
checks.environment.tests.push({
  name: 'Admin Password Strength',
  ...adminPasswordCheck
});

// Node.js version check
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion >= 20) {
  checks.environment.tests.push({
    name: 'Node.js Version',
    status: 'pass',
    message: `Node.js ${nodeVersion} is supported`
  });
} else {
  checks.environment.tests.push({
    name: 'Node.js Version',
    status: 'warn',
    message: `Node.js ${nodeVersion} may not be supported (recommend 20.x+)`
  });
}

// Package.json validation
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  checks.environment.tests.push({
    name: 'Package Dependencies',
    status: 'pass',
    message: 'package.json found'
  });
} else {
  checks.environment.tests.push({
    name: 'Package Dependencies',
    status: 'fail',
    message: 'package.json not found'
  });
}

// Function to test connectivity
async function testConnectivity() {
  return new Promise((resolve) => {
    if (!supabaseUrl) {
      checks.connectivity.tests.push({
        name: 'Supabase Connection',
        status: 'fail',
        message: 'Cannot test - Supabase URL not configured'
      });
      return resolve();
    }

    const url = `${supabaseUrl}/rest/v1/`;
    const startTime = Date.now();
    
    const request = https.get(url, (res) => {
      const latency = Date.now() - startTime;
      
      if (res.statusCode === 200 || res.statusCode === 401) {
        // 401 is expected without proper auth headers
        checks.connectivity.tests.push({
          name: 'Supabase Connection',
          status: 'pass',
          message: `Connected successfully (${latency}ms)`
        });
      } else {
        checks.connectivity.tests.push({
          name: 'Supabase Connection',
          status: 'warn',
          message: `Unexpected status: ${res.statusCode} (${latency}ms)`
        });
      }
      resolve();
    });

    request.on('error', (error) => {
      checks.connectivity.tests.push({
        name: 'Supabase Connection',
        status: 'fail',
        message: `Connection failed: ${error.message}`
      });
      resolve();
    });

    request.setTimeout(10000, () => {
      request.destroy();
      checks.connectivity.tests.push({
        name: 'Supabase Connection',
        status: 'fail',
        message: 'Connection timeout (10 seconds)'
      });
      resolve();
    });
  });
}

// Function to display results
function displayResults() {
  console.log();
  
  let hasErrors = false;
  let hasWarnings = false;

  Object.values(checks).forEach(section => {
    console.log(c('bright', `📋 ${section.name}`));
    
    section.tests.forEach(test => {
      const icon = test.status === 'pass' ? '✅' : test.status === 'warn' ? '⚠️' : '❌';
      const color = test.status === 'pass' ? 'green' : test.status === 'warn' ? 'yellow' : 'red';
      
      console.log(`   ${icon} ${c(color, test.name)}: ${test.message}`);
      
      if (test.status === 'fail') hasErrors = true;
      if (test.status === 'warn') hasWarnings = true;
    });
    
    console.log();
  });

  // Summary
  console.log(c('bright', '📊 Summary'));
  
  if (hasErrors) {
    console.log(c('red', '   ❌ Environment has critical issues that must be resolved'));
    console.log(c('yellow', '   📖 Check docs/development-setup.md for troubleshooting'));
    process.exit(1);
  } else if (hasWarnings) {
    console.log(c('yellow', '   ⚠️  Environment has warnings but should work'));
    console.log(c('yellow', '   📖 Consider addressing warnings for better security'));
    process.exit(0);
  } else {
    console.log(c('green', '   ✅ Environment configuration looks good!'));
    console.log(c('green', '   🚀 Ready to start development'));
    process.exit(0);
  }
}

// Run all checks
async function runValidation() {
  console.log(c('blue', '🔄 Running connectivity tests...\n'));
  
  await testConnectivity();
  displayResults();
}

runValidation().catch(console.error);