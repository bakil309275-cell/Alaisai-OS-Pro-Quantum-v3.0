#!/bin/bash

echo "╔══════════════════════════════════════════════════════════╗"
echo "║     🖼️  ALAISAI ICON FIXER - الحل المتكامل             ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

TEMP_DIR="temp_icons"
TARGET_DIR="assets/images"
SIZES=(72 96 128 144 152 192 384 512)

echo "📂 المسار: $(pwd)"
echo "📁 المؤقت: $TEMP_DIR"
echo "🎯 الهدف: $TARGET_DIR"
echo ""

# 1. التحقق من ImageMagick
echo "🔧 1. التحقق من ImageMagick..."
if ! command -v convert &>/dev/null; then
    echo "📦 تثبيت ImageMagick..."
    pkg install imagemagick -y
else
    echo "✅ ImageMagick مثبت"
fi
echo ""

# 2. إنشاء الأيقونات المفقودة مباشرة
echo "🎨 2. إنشاء الأيقونات المفقودة..."
mkdir -p "$TARGET_DIR"

# إنشاء icon-96.png من icon-72.png
if [ ! -f "$TARGET_DIR/icon-96.png" ] && [ -f "$TARGET_DIR/icon-72.png" ]; then
    echo -n "   • icon-96.png: "
    convert "$TARGET_DIR/icon-72.png" -resize 96x96! "$TARGET_DIR/icon-96.png" 2>/dev/null
    [ $? -eq 0 ] && echo "✅" || echo "❌"
fi

# إنشاء icon-384.png من icon-512.png
if [ ! -f "$TARGET_DIR/icon-384.png" ] && [ -f "$TARGET_DIR/icon-512.png" ]; then
    echo -n "   • icon-384.png: "
    convert "$TARGET_DIR/icon-512.png" -resize 384x384! "$TARGET_DIR/icon-384.png" 2>/dev/null
    [ $? -eq 0 ] && echo "✅" || echo "❌"
fi

# إنشاء favicon.ico
if [ ! -f "$TARGET_DIR/favicon.ico" ] && [ -f "$TARGET_DIR/icon-72.png" ]; then
    echo -n "   • favicon.ico: "
    convert "$TARGET_DIR/icon-72.png" -resize 32x32 "$TARGET_DIR/favicon.ico" 2>/dev/null
    [ $? -eq 0 ] && echo "✅" || echo "❌"
fi

# 3. عرض النتيجة
echo ""
echo "📁 3. النتيجة النهائية:"
echo "----------------------------------------"
ls -la "$TARGET_DIR" | grep -E "icon|favicon" | while read line; do
    echo "   $line"
done

echo ""
echo "✅ تم الانتهاء!"
echo "قم بتشغيل: bash analyze_project.sh للتحقق"
