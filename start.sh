#!/bin/bash
set -e

echo "=== Pathwise AI Backend Startup Script ==="
echo "Timestamp: $(date)"
echo "Working directory: $(pwd)"
echo "Python version: $(python --version 2>&1 || echo 'Python not found')"

# Change to backend directory
echo "Changing to backend directory..."
# Don't change directory - stay in root so data files are accessible
echo "Current directory: $(pwd)"
echo "Data directory should be at: $(pwd)/backend/data/"

# Check if virtual environment exists, create if not
if [ ! -d "backend/venv" ]; then
    echo "Creating virtual environment..."
    python -m venv backend/venv
    echo "Virtual environment created successfully"
else
    echo "Virtual environment already exists"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source backend/venv/bin/activate
echo "Virtual environment activated. Python: $(which python)"
echo "Pip version: $(pip --version)"

# Upgrade pip to avoid warnings (optional)
echo "Upgrading pip to latest version..."
pip install --upgrade pip --quiet

# Install dependencies if requirements.txt exists
if [ -f "backend/requirements.txt" ]; then
    echo "Installing dependencies from backend/requirements.txt..."
    echo "Requirements file contents:"
    cat backend/requirements.txt
    echo ""
    
    # Install with verbose output to see any issues
    pip install -r backend/requirements.txt --verbose
    echo "Dependencies installed successfully"
    
    # Verify key packages are installed
    echo "Verifying key packages..."
    python -c "import fastapi; print('✓ FastAPI installed')" || echo "✗ FastAPI missing"
    python -c "import uvicorn; print('✓ Uvicorn installed')" || echo "✗ Uvicorn missing"
    python -c "import jwt; print('✓ PyJWT installed')" || echo "✗ PyJWT missing"
    python -c "import supabase; print('✓ Supabase installed')" || echo "✗ Supabase missing"
    python -c "import openai; print('✓ OpenAI installed')" || echo "✗ OpenAI missing"
    python -c "import httpx; print('✓ HTTPX installed')" || echo "✗ HTTPX missing"
    
else
    echo "Warning: backend/requirements.txt not found"
fi

# Check if main.py exists
if [ ! -f "backend/main.py" ]; then
    echo "ERROR: backend/main.py not found in $(pwd)"
    ls -la backend/
    exit 1
fi

# Test if the application can be imported
echo "Testing application import..."
cd backend
python -c "
try:
    import main
    print('✓ Application imported successfully')
except ImportError as e:
    print(f'✗ Import error: {e}')
    print('Missing module:', e.name)
    exit(1)
except Exception as e:
    print(f'✗ Other error during import: {e}')
    exit(1)
" || {
    echo "ERROR: Failed to import application"
    echo "Available packages:"
    pip list
    exit 1
}

# Start the application in background and capture PID
echo "Starting application..."
python main.py &
APP_PID=$!
echo "Application started with PID: $APP_PID"
cd ..

# Wait a moment for the app to start
echo "Waiting for application to start..."
sleep 15

# Check if the process is still running
if ! kill -0 $APP_PID 2>/dev/null; then
    echo "ERROR: Application process died"
    echo "Checking for error logs..."
    # Try to get any error output
    jobs
    echo "Process status check failed"
    exit 1
fi

# Test the health endpoint
echo "Testing health endpoint..."
HEALTH_URL="http://localhost:${PORT:-8000}/"
echo "Health check URL: $HEALTH_URL"

# Try multiple times with increasing delays
for i in {1..15}; do
    echo "Health check attempt $i..."
    if curl -f -s "$HEALTH_URL" > /dev/null; then
        echo "SUCCESS: Health check passed!"
        break
    else
        echo "Health check attempt $i failed, waiting..."
        sleep $((i * 2))
    fi
    
    if [ $i -eq 15 ]; then
        echo "ERROR: All health checks failed"
        echo "Application logs:"
        # Try to get some output from the background process
        echo "Process $APP_PID status:"
        ps aux | grep $APP_PID || echo "Process not found"
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
