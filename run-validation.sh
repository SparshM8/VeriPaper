#!/bin/bash
# VeriPaper Complete Validation Pipeline
# Run this to start both servers and validate the AI detector

echo "=================================="
echo "VeriPaper: Option D - Complete Pipeline"
echo "===================================="
echo ""
echo "Starting backend server..."
cd backend
python -m uvicorn app.main:app --port 8000 &
BACKEND_PID=$!
sleep 3

echo ""
echo "✅ Backend running on http://127.0.0.1:8000"
echo ""

echo "=================================="
echo "Running Validation Tests..."
echo "=================================="
echo ""

echo "Step 1: Clear Separation Test"
echo "-----------------------------"
python scripts/validate_ai_detector.py

echo ""
echo "Step 2: Threshold Optimization"
echo "-----------------------------"
python scripts/tune_ai_detector.py

echo ""
echo "=================================="
echo "✅ All Tests Complete!"
echo "=================================="
echo ""
echo "Starting frontend server..."
cd ../frontend
npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT
