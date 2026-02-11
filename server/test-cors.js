#!/usr/bin/env node

/**
 * CORS Test Script
 * 
 * Tests CORS configuration by simulating requests from different origins
 * 
 * Usage:
 *   node test-cors.js
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
console.log('║          CORS Test Suite                   ║');
console.log('╚════════════════════════════════════════════╝\n');

console.log(`Testing API: ${API_BASE_URL}\n`);

/**
 * Test CORS with different origins
 */
async function testCorsOrigin(origin, description) {
    console.log(`📋 ${description}`);
    console.log(`   Origin: ${origin || '(no origin)'}`);

    try {
        const headers = {
            'X-API-Key': API_KEY
        };

        if (origin) {
            headers['Origin'] = origin;
        }

        const response = await fetch(`${API_BASE_URL}/api/meta`, {
            headers
        });

        const corsHeader = response.headers.get('access-control-allow-origin');

        if (response.ok) {
            console.log(`   ✅ PASS - Request accepted`);
            console.log(`   CORS Header: ${corsHeader || '(none)'}\n`);
        } else {
            console.log(`   ❌ FAIL - Request rejected (${response.status})`);
            console.log(`   CORS Header: ${corsHeader || '(none)'}\n`);
        }
    } catch (error) {
        console.log(`   ❌ ERROR - ${error.message}\n`);
    }
}

/**
 * Test preflight request (OPTIONS)
 */
async function testPreflightRequest() {
    console.log('📋 Test: Preflight Request (OPTIONS)');

    try {
        const response = await fetch(`${API_BASE_URL}/api/meta`, {
            method: 'OPTIONS',
            headers: {
                'Origin': 'http://localhost:5173',
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'X-API-Key'
            }
        });

        const allowOrigin = response.headers.get('access-control-allow-origin');
        const allowMethods = response.headers.get('access-control-allow-methods');
        const allowHeaders = response.headers.get('access-control-allow-headers');
        const maxAge = response.headers.get('access-control-max-age');

        if (response.ok || response.status === 204) {
            console.log('   ✅ PASS - Preflight successful');
            console.log(`   Allow-Origin: ${allowOrigin}`);
            console.log(`   Allow-Methods: ${allowMethods}`);
            console.log(`   Allow-Headers: ${allowHeaders}`);
            console.log(`   Max-Age: ${maxAge} seconds\n`);
        } else {
            console.log(`   ❌ FAIL - Preflight rejected (${response.status})\n`);
        }
    } catch (error) {
        console.log(`   ❌ ERROR - ${error.message}\n`);
    }
}

// Run tests
console.log('═══════════════════════════════════════════\n');
console.log('Testing Different Origins:\n');

// Test 1: Allowed origin (localhost)
await testCorsOrigin('http://localhost:5173', 'Test 1: Allowed Origin (localhost:5173)');

// Test 2: Different port on localhost
await testCorsOrigin('http://localhost:3000', 'Test 2: Different Port (localhost:3000)');

// Test 3: LAN IP address
await testCorsOrigin('http://192.168.1.100:5173', 'Test 3: LAN IP Address (192.168.1.100:5173)');

// Test 4: No origin (e.g., Postman, mobile apps)
await testCorsOrigin(null, 'Test 4: No Origin Header (Postman/Mobile)');

// Test 5: Unauthorized origin
await testCorsOrigin('http://malicious-site.com', 'Test 5: Unauthorized Origin (malicious-site.com)');

console.log('═══════════════════════════════════════════\n');
console.log('Testing Preflight Requests:\n');

// Test 6: Preflight request
await testPreflightRequest();

console.log('╔════════════════════════════════════════════╗');
console.log('║     Test Suite Complete                    ║');
console.log('╚════════════════════════════════════════════╝\n');

console.log('💡 Interpretation:');
console.log('   ✅ Allowed origins should return CORS headers');
console.log('   ❌ Blocked origins should NOT return CORS headers');
console.log('   📝 No origin (Postman) should be allowed\n');

console.log('📋 Current CORS Configuration:');
console.log(`   CORS_ORIGIN: ${process.env.CORS_ORIGIN}`);
console.log(`   ALLOWED_IP_RANGES: ${process.env.ALLOWED_IP_RANGES || '(none)'}`);
console.log(`   CORS_DEV_MODE: ${process.env.CORS_DEV_MODE || 'false'}\n`);

console.log('💡 Next Steps:');
console.log('   1. Test from browser with different origins');
console.log('   2. Update CORS_ORIGIN for production deployment');
console.log('   3. Configure ALLOWED_IP_RANGES for LAN\n');
