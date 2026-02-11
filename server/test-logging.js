#!/usr/bin/env node

/**
 * Logging Test Script
 * 
 * Tests error-only logging by triggering various error conditions
 * 
 * Usage:
 *   node test-logging.js
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
console.log('║       Logging Test Suite                   ║');
console.log('╚════════════════════════════════════════════╝\n');

console.log(`Testing API: ${API_BASE_URL}\n`);
console.log('📝 Note: Check server console for log output\n');

/**
 * Test helper function
 */
async function testEndpoint(description, url, headers = {}) {
    console.log(`📋 ${description}`);

    try {
        const response = await fetch(url, { headers });
        const data = await response.json();

        console.log(`   Status: ${response.status}`);
        console.log(`   Expected log: ${response.status >= 400 ? 'YES (error/warn)' : 'NO (success - not logged)'}`);
        console.log('');

        return { response, data };
    } catch (error) {
        console.log(`   ❌ ERROR - ${error.message}\n`);
    }
}

console.log('═══════════════════════════════════════════\n');
console.log('Testing Successful Requests (Should NOT be logged):\n');

// Test 1: Successful request
await testEndpoint(
    'Test 1: Successful Request',
    `${API_BASE_URL}/api/line_status?plant=pune&line=fcpv`,
    { 'X-API-Key': API_KEY }
);

// Test 2: Health check
await testEndpoint(
    'Test 2: Health Check',
    `${API_BASE_URL}/health`
);

console.log('═══════════════════════════════════════════\n');
console.log('Testing Authentication Errors (Should be logged):\n');

// Test 3: Missing API key
await testEndpoint(
    'Test 3: Missing API Key (401)',
    `${API_BASE_URL}/api/line_status?plant=pune&line=fcpv`
);

// Test 4: Invalid API key
await testEndpoint(
    'Test 4: Invalid API Key (403)',
    `${API_BASE_URL}/api/line_status?plant=pune&line=fcpv`,
    { 'X-API-Key': 'invalid-key-12345' }
);

console.log('═══════════════════════════════════════════\n');
console.log('Testing Validation Errors (Should be logged):\n');

// Test 5: XSS attempt
await testEndpoint(
    'Test 5: XSS Attack (400)',
    `${API_BASE_URL}/api/line_status?plant=<script>alert(1)</script>`,
    { 'X-API-Key': API_KEY }
);

// Test 6: SQL injection attempt
await testEndpoint(
    'Test 6: SQL Injection (400)',
    `${API_BASE_URL}/api/line_status?plant=pune'; DROP TABLE--`,
    { 'X-API-Key': API_KEY }
);

console.log('═══════════════════════════════════════════\n');
console.log('Testing 404 Errors (Should be logged):\n');

// Test 7: 404 Not Found
await testEndpoint(
    'Test 7: Non-existent Endpoint (404)',
    `${API_BASE_URL}/api/nonexistent`,
    { 'X-API-Key': API_KEY }
);

console.log('╔════════════════════════════════════════════╗');
console.log('║     Test Suite Complete                    ║');
console.log('╚════════════════════════════════════════════╝\n');

console.log('💡 Check Server Console:');
console.log('   ✅ Successful requests (200 OK) should NOT appear in logs');
console.log('   ⚠️  Client errors (400, 401, 403, 404) should appear as WARN');
console.log('   ❌ Server errors (500+) should appear as ERROR\n');

console.log('📋 Logging Strategy:');
console.log('   - Error-only logging (not every request)');
console.log('   - Prevents log spam from 3-second polling');
console.log('   - Logs security events and errors only');
console.log('   - Console output (file logging optional)\n');

console.log('🔍 What to Look For in Server Logs:');
console.log('   [WARN] Authentication failed: Missing API key');
console.log('   [WARN] Authentication failed: Invalid API key');
console.log('   [WARN] Validation failed - potential attack');
console.log('   [WARN] GET /api/nonexistent - 404');
console.log('   (No logs for successful 200 OK requests)\n');
