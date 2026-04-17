#!/bin/bash
# Test Ollama MCQ Endpoint
# nmkrspvlidata - Quick test script

echo "🧪 Testing Ollama MCQ Generation Endpoint"
echo "==========================================="
echo ""

# Backend URL
BACKEND_URL="http://localhost:5000"

echo "📡 Backend: $BACKEND_URL"
echo ""

# Test 1: Health Check
echo "1️⃣  Health Check..."
curl -s "$BACKEND_URL/api/ollama-mcq/health" | jq '.' 2>/dev/null || echo "Health check failed"
echo ""
echo ""

# Test 2: Generate MCQ
echo "2️⃣  Generate MCQ Questions..."
curl -s -X POST "$BACKEND_URL/api/ollama-mcq/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "JavaScript",
    "difficulty": "medium",
    "count": 2
  }' | jq '.' 2>/dev/null || echo "MCQ generation failed"
echo ""
echo ""

echo "✅ Tests Complete!"
