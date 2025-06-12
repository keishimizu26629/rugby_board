#!/bin/sh

echo "🧪 Starting Rugby Board Test Environment..."

# Check if node_modules exists and has content
if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
    echo "📦 Installing npm dependencies..."
    npm install --legacy-peer-deps
    echo "✅ Dependencies installed successfully!"
else
    echo "✅ Dependencies already installed, checking for updates..."
    # Check if package.json is newer than node_modules
    if [ "package.json" -nt "node_modules" ]; then
        echo "📦 Package.json updated, reinstalling dependencies..."
        npm install --legacy-peer-deps
        echo "✅ Dependencies updated successfully!"
    fi
fi

# Execute the passed command
echo "🧪 Running tests..."
exec "$@"
