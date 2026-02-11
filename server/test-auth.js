#!/usr/bin/env node

/**
 * Authentication Test Script
 * 
 * Tests API authentication by making requests with and without API keys
 * 
 * Usage:
 *   node test-auth.js
 * 
 * Make sure the server is running before executing this script
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the server directory
dotenv.config({ path: join(__dirname, '.env') });

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const API_KEY = process.env.API_KEY;

console.log('\n╔════════════════════════════════════════════╗');
console.log('║     Authentication Test Suite              ║');
console.log('╚════════════════════════════════════════════╝\n');

console.log(`Testing API: ${API_BASE_URL}`);
console.log(`Using API Key: ${API_KEY?.substring(0, 16)}...${API_KEY?.substring(API_KEY.length - 4)}\n`);

// Test 1: Health check (no auth required)
console.log('📋 Test 1: Health Check (No Authentication)');
try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();

    if (response.ok) {
        console.log('✅ PASS - Health check accessible without authentication');
        console.log(`   Status: ${data.status}`);
        console.log(`   Auth: ${data.authentication}\n`);
    } else {
        console.log('❌ FAIL - Health check should be accessible\n');
    }
} catch (error) {
    console.log(`❌ ERROR - Cannot connect to server: ${error.message}\n`);
    process.exit(1);
}

// Test 2: API without authentication (should fail)
console.log('📋 Test 2: API Request Without Authentication');
try {
    const response = await fetch(`${API_BASE_URL}/api/meta`);
    const data = await response.json();

    if (response.status === 401) {
        console.log('✅ PASS - Request correctly rejected (401 Unauthorized)');
        console.log(`   Message: ${data.message}\n`);
    } else {
        console.log('❌ FAIL - API should require authentication');
        console.log(`   Got status: ${response.status}\n`);
    }
} catch (error) {
    console.log(`❌ ERROR - ${error.message}\n`);
}

// Test 3: API with invalid key (should fail)
console.log('📋 Test 3: API Request With Invalid Key');
try {
    const response = await fetch(`${API_BASE_URL}/api/meta`, {
        headers: {
            'X-API-Key': 'invalid-key-12345'
        }
    });
    const data = await response.json();

    if (response.status === 403) {
        console.log('✅ PASS - Invalid key correctly rejected (403 Forbidden)');
        console.log(`   Message: ${data.message}\n`);
    } else {
        console.log('❌ FAIL - Invalid key should be rejected');
        console.log(`   Got status: ${response.status}\n`);
    }
} catch (error) {
    console.log(`❌ ERROR - ${error.message}\n`);
}

// Test 4: API with valid key (should succeed)
console.log('📋 Test 4: API Request With Valid Key');
try {
    const response = await fetch(`${API_BASE_URL}/api/meta`, {
        headers: {
            'X-API-Key': process.env.API_KEY
        }
    });
    const data = await response.json();

    if (response.ok && data.success) {
        console.log('✅ PASS - Valid key accepted');
        console.log(`   Plants: ${data.data.plants?.length || 0}`);
        console.log(`   Lines: ${data.data.lines?.length || 0}`);
        console.log(`   Stations: ${data.data.stations_meta?.length || 0}\n`);
    } else {
        console.log('❌ FAIL - Valid key should be accepted');
        console.log(`   Got status: ${response.status}\n`);
    }
} catch (error) {
    console.log(`❌ ERROR - ${error.message}\n`);
}

// Test 5: Line status endpoint with authentication
console.log('📋 Test 5: Line Status Endpoint With Authentication');
try {
    const response = await fetch(`${API_BASE_URL}/api/line_status?plant=pune&line=fcpv`, {
        headers: {
            'X-API-Key': process.env.API_KEY
        }
    });
    const data = await response.json();

    if (response.ok && data.success) {
        console.log('✅ PASS - Line status endpoint accessible');
        console.log(`   Line KPI: ${data.data.line_kpi ? 'Present' : 'Missing'}`);
        console.log(`   Stations: ${data.data.stations?.length || 0}`);
        console.log(`   SPC Summary: ${data.data.spc_summary ? 'Present' : 'Missing'}\n`);
    } else {
        console.log('❌ FAIL - Line status should be accessible with valid key');
        console.log(`   Got status: ${response.status}\n`);
    }
} catch (error) {
    console.log(`❌ ERROR - ${error.message}\n`);
}

console.log('╔════════════════════════════════════════════╗');
console.log('║     Test Suite Complete                    ║');
console.log('╚════════════════════════════════════════════╝\n');

console.log('💡 Next Steps:');
console.log('   1. Update frontend to send X-API-Key header');
console.log('   2. Test CORS from browser');
console.log('   3. Test with multiple API keys\n');
