#!/bin/bash

# ProSprint AI Quick Start Script

echo "========================================="
echo "ProSprint AI - Quick Start"
echo "========================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed."
    echo "Please install Python 3.8 or higher and try again."
    exit 1
fi

echo "✓ Python 3 found: $(python3 --version)"
echo ""

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "Error: pip is not installed."
    echo "Please install pip and try again."
    exit 1
fi

echo "✓ pip found"
echo ""

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi
echo ""

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -q -r requirements.txt
pip install -q -e .
echo "✓ Dependencies installed"
echo ""

# Set up environment file
if [ ! -f ".env" ]; then
    echo "Setting up .env file..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your API keys"
    echo "   You'll need at least OPENAI_API_KEY for full functionality"
    echo ""
else
    echo "✓ .env file already exists"
    echo ""
fi

# Show help
echo "========================================="
echo "Installation Complete!"
echo "========================================="
echo ""
echo "To get started, run:"
echo ""
echo "  # View system information"
echo "  prosprint info"
echo ""
echo "  # Run interactive demo"
echo "  prosprint demo"
echo ""
echo "  # Execute a prompt"
echo "  prosprint run \"Send an email to team@company.com\""
echo ""
echo "  # View activity logs"
echo "  prosprint logs"
echo ""
echo "For more information, see README.md"
echo ""
echo "Happy automating! 🚀"
echo ""
