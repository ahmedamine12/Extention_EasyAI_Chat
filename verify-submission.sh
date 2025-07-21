#!/bin/bash

# EasyAI Chat Extension Submission Verification Script
# This script verifies that the extension is ready for Chrome Web Store submission

echo "🔍 Verifying EasyAI Chat Extension for Chrome Web Store submission..."
echo ""

# Check if package exists
if [ ! -f "easyaichat-v1.0.0.zip" ]; then
    echo "❌ Error: Extension package not found!"
    echo "Run ./package-extension.sh first"
    exit 1
fi

echo "✅ Extension package found: easyaichat-v1.0.0.zip"

# Check package size
PACKAGE_SIZE=$(du -h "easyaichat-v1.0.0.zip" | cut -f1)
echo "✅ Package size: $PACKAGE_SIZE"

# Check required files exist
echo ""
echo "📋 Checking required files..."

REQUIRED_FILES=(
    "manifest.json"
    "content.js"
    "background.js"
    "styles.css"
    "icons/easyChat.png"
    "popup/popup.html"
    "popup/popup.js"
    "popup/popup.css"
    "settings/settings.html"
    "settings/settings.js"
    "settings/settings.css"
    "providers/openai.js"
    "providers/gemini.js"
    "utils/crypto.js"
    "utils/storage.js"
    "utils/error.js"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ Missing: $file"
        MISSING_FILES=true
    fi
done

# Check manifest.json
echo ""
echo "📄 Checking manifest.json..."
if grep -q '"manifest_version": 3' manifest.json; then
    echo "✅ Manifest v3 compliance"
else
    echo "❌ Manifest v3 compliance issue"
    MANIFEST_ISSUES=true
fi

if grep -q '"version": "1.0.0"' manifest.json; then
    echo "✅ Version number correct"
else
    echo "❌ Version number issue"
    MANIFEST_ISSUES=true
fi

if grep -q '"minimum_chrome_version": "88"' manifest.json; then
    echo "✅ Minimum Chrome version set"
else
    echo "❌ Minimum Chrome version issue"
    MANIFEST_ISSUES=true
fi

# Check for console.log statements
echo ""
echo "🔍 Checking for development code..."
if grep -r "console\.log" content.js background.js popup/ settings/ providers/ utils/ 2>/dev/null | grep -v "// console.log" | grep -v "console.log.*//"; then
    echo "❌ Found console.log statements in production code"
    CODE_ISSUES=true
else
    echo "✅ No console.log statements found"
fi

# Check for placeholder URLs
echo ""
echo "🔗 Checking for placeholder URLs..."
if grep -r "your-username\|placeholder\|example\.com" manifest.json README.md 2>/dev/null; then
    echo "❌ Found placeholder URLs"
    URL_ISSUES=true
else
    echo "✅ No placeholder URLs found"
fi

# Check for development URLs
echo ""
echo "🌐 Checking for development URLs..."
if grep -r "localhost\|127\.0\.0\.1\|test\.\|dev\.\|staging\." content.js background.js popup/ settings/ providers/ utils/ 2>/dev/null; then
    echo "❌ Found development URLs"
    DEV_ISSUES=true
else
    echo "✅ No development URLs found"
fi

# Check documentation
echo ""
echo "📚 Checking documentation..."
if [ -f "README.md" ] && [ -f "LICENSE" ] && [ -f "privacy-policy.md" ] && [ -f "store-description.md" ]; then
    echo "✅ All documentation files present"
else
    echo "❌ Missing documentation files"
    DOC_ISSUES=true
fi

# Summary
echo ""
echo "📊 Verification Summary:"
echo "========================"

if [ "$MISSING_FILES" = true ] || [ "$MANIFEST_ISSUES" = true ] || [ "$CODE_ISSUES" = true ] || [ "$URL_ISSUES" = true ] || [ "$DEV_ISSUES" = true ] || [ "$DOC_ISSUES" = true ]; then
    echo "❌ Issues found - Please fix before submission"
    echo ""
    if [ "$MISSING_FILES" = true ]; then
        echo "• Missing required files"
    fi
    if [ "$MANIFEST_ISSUES" = true ]; then
        echo "• Manifest.json issues"
    fi
    if [ "$CODE_ISSUES" = true ]; then
        echo "• Development code found"
    fi
    if [ "$URL_ISSUES" = true ]; then
        echo "• Placeholder URLs found"
    fi
    if [ "$DEV_ISSUES" = true ]; then
        echo "• Development URLs found"
    fi
    if [ "$DOC_ISSUES" = true ]; then
        echo "• Documentation issues"
    fi
    exit 1
else
    echo "✅ All checks passed!"
    echo ""
    echo "🎯 Next Steps:"
    echo "1. Create Chrome Web Store Developer account"
    echo "2. Pay $5 registration fee"
    echo "3. Upload easyaichat-v1.0.0.zip"
    echo "4. Complete store listing information"
    echo "5. Submit for review"
    echo ""
    echo "🚀 Extension is ready for Chrome Web Store submission!"
fi 