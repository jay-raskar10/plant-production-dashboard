#!/usr/bin/env node

/**
 * API Key Generator Utility
 * 
 * Generates a cryptographically secure API key for authentication
 * 
 * Usage:
 *   node generate-api-key.js
 * 
 * The generated key should be added to your .env file:
 *   API_KEY=<generated-key>
 *   ALLOWED_API_KEYS=<generated-key>
 */

import crypto from 'crypto';

console.log('╔════════════════════════════════════════════╗ ');
console.log('║       API Key Generator                    ║ ');
console.log('╚════════════════════════════════════════════╝\n');

// Generate a secure 256-bit (32 bytes) API key
const apiKey = crypto.randomBytes(32).toString('hex');

console.log('✅ Generated secure API key:\n');
console.log(`   ${apiKey}\n`);

console.log('📋 Add this to your .env file:\n');
console.log('   API_KEY=' + apiKey);
console.log('   ALLOWED_API_KEYS=' + apiKey + '\n');

console.log('💡 To add multiple API keys (for different clients):');
console.log('   ALLOWED_API_KEYS=key1,key2,key3\n');

console.log('⚠️  IMPORTANT:');
console.log('   - Keep this key secret');
console.log('   - Never commit .env to git');
console.log('   - Rotate keys every 90 days\n');
