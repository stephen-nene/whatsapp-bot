#!/bin/bash

# Navigate to the FastAPI directory
# cd FastAPI || { echo "Directory FastAPI not found."; exit 1; }

# Check if virtual environment exists and activate it
if [ -d "venv" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
else
    echo "Virtual environment not found. Please set it up first."
    exit 1
fi

# Install dependencies
# echo "Installing dependencies..."
# pip install -r requirements.txt

# Start the development server
echo "Starting development server..."
uvicorn main:app --reload --host 0.0.0.0 --port 900
