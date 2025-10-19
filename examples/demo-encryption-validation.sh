#!/bin/bash

# Demonstration of TOKEN_ENCRYPTION_KEY validation
# This script shows how the encryption module validates keys at startup

echo "========================================================================"
echo "ENCRYPTION KEY VALIDATION DEMONSTRATION"
echo "========================================================================"
echo ""

# Test 1: Valid hex key
echo "TEST 1: Valid 64-character hex key"
echo "------------------------------------------------------------------------"
VALID_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "Generated key: ${VALID_KEY}"
echo "Key length: ${#VALID_KEY} characters"
echo ""
echo "Expected behavior: Validation should PASS"
echo ""

# Test 2: Base64 key
echo ""
echo "TEST 2: Base64 encoded key (64 characters)"
echo "------------------------------------------------------------------------"
BASE64_KEY=$(node -e "console.log(require('crypto').randomBytes(48).toString('base64'))")
echo "Key: ${BASE64_KEY}"
echo "Key length: ${#BASE64_KEY} characters"
echo ""
echo "Expected behavior: Validation should FAIL (base64 detected)"
echo ""

# Test 3: Wrong length
echo ""
echo "TEST 3: Wrong length key (32 characters)"
echo "------------------------------------------------------------------------"
SHORT_KEY="abcdef1234567890abcdef1234567890"
echo "Key: ${SHORT_KEY}"
echo "Key length: ${#SHORT_KEY} characters"
echo ""
echo "Expected behavior: Validation should FAIL (wrong length)"
echo ""

# Test 4: Missing key
echo ""
echo "TEST 4: No key configured"
echo "------------------------------------------------------------------------"
echo "TOKEN_ENCRYPTION_KEY: (not set)"
echo ""
echo "Expected behavior: Warning about missing key"
echo ""

echo ""
echo "========================================================================"
echo "KEY GENERATION INSTRUCTIONS"
echo "========================================================================"
echo ""
echo "To generate a valid encryption key, run:"
echo "  node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
echo ""
echo "Then set it in your .env file:"
echo "  TOKEN_ENCRYPTION_KEY=your_generated_key_here"
echo ""
echo "The application will validate the key at startup and log the results."
echo ""
