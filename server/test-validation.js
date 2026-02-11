#!/usr/bin/env node

/**
 * Input Validation Test Script
 * 
 * Tests input validation by sending valid and malicious inputs
 * 
 * Usage:
 *   node test-validation.js
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
console.log('║     Input Validation Test Suite           ║');
console.log('╚════════════════════════════════════════════╝\n');

console.log(`Testing API: ${API_BASE_URL}\n`);

/**
 * Test helper function
 */
async function testEndpoint(description, url, shouldPass) {
    console.log(`📋 ${description}`);
    console.log(`   URL: ${url.replace(API_BASE_URL, '')}`);

    try {
        const response = await fetch(url, {
            headers: { 'X-API-Key': API_KEY }
        });

        const data = await response.json();

        if (shouldPass) {
            if (response.ok) {
                console.log(`   ✅ PASS - Request accepted (as expected)`);
                console.log(`   Status: ${response.status}\n`);
            } else {
                console.log(`   ❌ FAIL - Request rejected (should have passed)`);
                console.log(`   Status: ${response.status}`);
                console.log(`   Error: ${data.error}\n`);
            }
        } else {
            if (!response.ok && response.status === 400) {
                console.log(`   ✅ PASS - Request rejected (as expected)`);
                console.log(`   Status: ${response.status}`);
                console.log(`   Error: ${data.error}`);
                if (data.details && data.details.length > 0) {
                    console.log(`   Details: ${data.details[0].message}\n`);
                } else {
                    console.log('');
                }
            } else {
                console.log(`   ❌ FAIL - Request accepted (should have been rejected)`);
                console.log(`   Status: ${response.status}\n`);
            }
        }
    } catch (error) {
        console.log(`   ❌ ERROR - ${error.message}\n`);
    }
}

console.log('═══════════════════════════════════════════\n');
console.log('Testing Valid Inputs:\n');

// Test 1: Valid request with all parameters
await testEndpoint(
    'Test 1: Valid Request (All Parameters)',
    `${API_BASE_URL}/api/line_status?plant=pune&line=fcpv&station=smt&shift=A&dateRange=today`,
    true
);

// Test 2: Valid request with minimal parameters
await testEndpoint(
    'Test 2: Valid Request (Minimal Parameters)',
    `${API_BASE_URL}/api/line_status?plant=pune&line=fcpv`,
    true
);

// Test 3: Valid request with hyphens and underscores
await testEndpoint(
    'Test 3: Valid Request (Hyphens/Underscores)',
    `${API_BASE_URL}/api/line_status?plant=pune-plant&line=fcpv_line`,
    true
);

console.log('═══════════════════════════════════════════\n');
console.log('Testing XSS Prevention:\n');

// Test 4: XSS attempt with script tags
await testEndpoint(
    'Test 4: XSS Attack (Script Tags)',
    `${API_BASE_URL}/api/line_status?plant=<script>alert('XSS')</script>&line=fcpv`,
    false
);

// Test 5: XSS attempt with HTML
await testEndpoint(
    'Test 5: XSS Attack (HTML Tags)',
    `${API_BASE_URL}/api/line_status?plant=<img src=x onerror=alert(1)>&line=fcpv`,
    false
);

console.log('═══════════════════════════════════════════\n');
console.log('Testing SQL Injection Prevention:\n');

// Test 6: SQL injection attempt
await testEndpoint(
    'Test 6: SQL Injection (DROP TABLE)',
    `${API_BASE_URL}/api/line_status?plant=pune'; DROP TABLE production; --&line=fcpv`,
    false
);

// Test 7: SQL injection with OR
await testEndpoint(
    'Test 7: SQL Injection (OR 1=1)',
    `${API_BASE_URL}/api/line_status?plant=pune' OR '1'='1&line=fcpv`,
    false
);

console.log('═══════════════════════════════════════════\n');
console.log('Testing Buffer Overflow Prevention:\n');

// Test 8: Very long input
await testEndpoint(
    'Test 8: Buffer Overflow (Long Input)',
    `${API_BASE_URL}/api/line_status?plant=${'A'.repeat(200)}&line=fcpv`,
    false
);

console.log('═══════════════════════════════════════════\n');
console.log('Testing Special Characters:\n');

// Test 9: Special characters
await testEndpoint(
    'Test 9: Special Characters (Symbols)',
    `${API_BASE_URL}/api/line_status?plant=pune@#$%&line=fcpv`,
    false
);

// Test 10: Path traversal attempt
await testEndpoint(
    'Test 10: Path Traversal (../ attack)',
    `${API_BASE_URL}/api/line_status?plant=../../etc/passwd&line=fcpv`,
    false
);

console.log('═══════════════════════════════════════════\n');
console.log('Testing Station Status Endpoint:\n');

// Test 11: Valid station status request
await testEndpoint(
    'Test 11: Valid Station Status',
    `${API_BASE_URL}/api/station_status?id=op10&dateRange=today&shift=A`,
    true
);

// Test 12: Invalid station status (XSS)
await testEndpoint(
    'Test 12: Invalid Station Status (XSS)',
    `${API_BASE_URL}/api/station_status?id=<script>alert(1)</script>`,
    false
);

console.log('╔════════════════════════════════════════════╗');
console.log('║     Test Suite Complete                    ║');
console.log('╚════════════════════════════════════════════╝\n');

console.log('💡 Summary:');
console.log('   ✅ Valid inputs should pass');
console.log('   ❌ Malicious inputs should be rejected (400 Bad Request)');
console.log('   🛡️  Security validation prevents:');
console.log('      - XSS attacks');
console.log('      - SQL injection');
console.log('      - Buffer overflow');
console.log('      - Path traversal\n');

console.log('📋 Validation Strategy:');
console.log('   - Security-focused (not business rules)');
console.log('   - Alphanumeric + hyphens/underscores allowed');
console.log('   - Max length: 100 characters');
console.log('   - HTML entities escaped');
console.log('   - Business validation delegated to LabVIEW\n');
