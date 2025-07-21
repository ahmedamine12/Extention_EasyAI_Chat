#!/bin/bash

# EasyAI Chat Extension Packaging Script
# This script creates a clean ZIP file for Chrome Web Store submission

echo "🚀 Packaging EasyAI Chat Extension for Chrome Web Store..."

# Set variables
EXTENSION_NAME="easyaichat"
VERSION="1.0.0"
PACKAGE_NAME="${EXTENSION_NAME}-v${VERSION}.zip"

# Clean up any existing package
if [ -f "$PACKAGE_NAME" ]; then
    echo "🗑️  Removing existing package: $PACKAGE_NAME"
    rm "$PACKAGE_NAME"
fi

# Create temporary directory for packaging
TEMP_DIR="temp_package"
if [ -d "$TEMP_DIR" ]; then
    echo "🗑️  Cleaning temporary directory..."
    rm -rf "$TEMP_DIR"
fi

echo "📁 Creating package directory..."
mkdir "$TEMP_DIR"

# Copy required files
echo "📋 Copying extension files..."
cp manifest.json "$TEMP_DIR/"
cp content.js "$TEMP_DIR/"
cp background.js "$TEMP_DIR/"
cp styles.css "$TEMP_DIR/"

# Copy directories
echo "📂 Copying directories..."
cp -r icons "$TEMP_DIR/"
cp -r popup "$TEMP_DIR/"
cp -r settings "$TEMP_DIR/"
cp -r providers "$TEMP_DIR/"
cp -r utils "$TEMP_DIR/"

# Copy documentation files
echo "📚 Copying documentation..."
cp README.md "$TEMP_DIR/"
cp CHANGELOG.md "$TEMP_DIR/"
cp privacy-policy.md "$TEMP_DIR/"
cp LICENSE "$TEMP_DIR/"

# Create ZIP file
echo "📦 Creating ZIP package: $PACKAGE_NAME"
cd "$TEMP_DIR"
zip -r "../$PACKAGE_NAME" . -x "*.DS_Store" "*~" "*.swp" "*.swo"

# Clean up
cd ..
rm -rf "$TEMP_DIR"

# Verify package
if [ -f "$PACKAGE_NAME" ]; then
    PACKAGE_SIZE=$(du -h "$PACKAGE_NAME" | cut -f1)
    echo "✅ Package created successfully!"
    echo "📦 Package: $PACKAGE_NAME"
    echo "📏 Size: $PACKAGE_SIZE"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Test the package by loading it in Chrome (chrome://extensions)"
    echo "2. Upload to Chrome Web Store Developer Dashboard"
    echo "3. Complete store listing information"
    echo "4. Submit for review"
    echo ""
    echo "📋 Files included in package:"
    unzip -l "$PACKAGE_NAME" | head -20
else
    echo "❌ Error: Package creation failed!"
    exit 1
fi

echo ""
echo "🚀 Ready for Chrome Web Store submission!" 