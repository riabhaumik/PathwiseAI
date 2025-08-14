#!/bin/bash
set -e

echo "=== Pathwise AI Backend Startup Script ==="
echo "Timestamp: $(date)"
echo "Working directory: $(pwd)"
echo "Python version: $(python --version 2>&1 || echo 'Python not found')"

# Change to backend directory
echo "Changing to backend directory..."
cd backend
echo "Current directory: $(pwd)"

# Check if virtual environment exists, create if not
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
    echo "Virtual environment created successfully"
else
    echo "Virtual environment already exists"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate
echo "Virtual environment activated. Python: $(which python)"
echo "Pip version: $(pip --version)"

# Install dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "Installing dependencies from requirements.txt..."
    pip install -r requirements.txt
    echo "Dependencies installed successfully"
else
    echo "Warning: requirements.txt not found"
fi

# Check if main.py exists
if [ ! -f "main.py" ]; then
    echo "ERROR: main.py not found in $(pwd)"
    ls -la
    exit 1
fi

# Test if the application can be imported
echo "Testing application import..."
python -c "import main; print('Application imported successfully')" || {
    echo "ERROR: Failed to import application"
    exit 1
}

# Start the application in background and capture PID
echo "Starting application..."
python main.py &
APP_PID=$!
echo "Application started with PID: $APP_PID"

# Wait a moment for the app to start
echo "Waiting for application to start..."
sleep 10

# Check if the process is still running
if ! kill -0 $APP_PID 2>/dev/null; then
    echo "ERROR: Application process died"
    exit 1
fi

# Test the health endpoint
echo "Testing health endpoint..."
HEALTH_URL="http://localhost:${PORT:-8000}/health"
echo "Health check URL: $HEALTH_URL"

# Try multiple times with increasing delays
for i in {1..10}; do
    echo "Health check attempt $i..."
    if curl -f -s "$HEALTH_URL" > /dev/null; then
        echo "SUCCESS: Health check passed!"
        break
    else
        echo "Health check attempt $i failed, waiting..."
        sleep $((i * 2))
    fi
    
    if [ $i -eq 10 ]; then
        echo "ERROR: All health checks failed"
        echo "Killing application process..."
        kill $APP_PID 2>/dev/null || true
        exit 1
    fi
done

echo "Application is running successfully!"
echo "PID: $APP_PID"
echo "Health endpoint: $HEALTH_URL"

# Keep the script running and monitor the application
while kill -0 $APP_PID 2>/dev/null; do
    sleep 30
    echo "Application still running (PID: $APP_PID)"
done

echo "Application stopped unexpectedly"
exit 1
