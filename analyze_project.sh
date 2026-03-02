#!/bin/bash

echo "╔══════════════════════════════════════════════════════════╗"
echo "║     🔍 ALAISAI PROJECT ANALYZER                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

PROJECT_DIR="$(pwd)"
echo "📂 المسار الحالي: $PROJECT_DIR"
echo ""

# إحصائيات عامة
echo "📊 إحصائيات المشروع:"
echo "----------------------------------------"
TOTAL_DIRS=$(find . -type d | wc -l)
TOTAL_FILES=$(find . -type f | wc -l)
TOTAL_SIZE=$(du -sh . | cut -f1)

echo "📁 إجمالي المجلدات: $TOTAL_DIRS"
echo "📄 إجمالي الملفات: $TOTAL_FILES"
echo "💾 الحجم الكلي: $TOTAL_SIZE"
echo ""

# تفاصيل المجلدات الرئيسية
echo "📂 تفاصيل المجلدات الرئيسية:"
echo "----------------------------------------"
ls -la | grep "^d" | awk '{print $NF}' | while read dir; do
    if [ "$dir" != "." ] && [ "$dir" != ".." ]; then
        count=$(find "$dir" -type f | wc -l)
        echo "   📁 $dir : $count ملف"
    fi
done
echo ""

# أنواع الملفات
echo "📋 أنواع الملفات:"
echo "----------------------------------------"
find . -type f -name "*.*" | grep -o "\.[^.]*$" | sort | uniq -c | sort -rn | while read count ext; do
    echo "   $count ملف $ext"
done
echo ""

# التحقق من الملفات الأساسية المطلوبة
echo "✅ التحقق من الملفات الأساسية:"
echo "----------------------------------------"

CORE_FILES=(
    "index.html"
    "manifest.json"
    "sw.js"
    "TREE.md"
    "README.md"
    "LICENSE"
    "system/core/quantum-core.js"
    "system/core/neural-core.js"
    "system/core/evolution.js"
    "system/core/security.js"
    "system/core/database.js"
    "system/core/api.js"
    "system/core/addons-manager.js"
    "system/ai/neural-assistant.js"
    "system/ai/predictor.js"
    "system/ai/learner.js"
    "system/ai/model.json"
    "system/storage/distributed.js"
    "system/storage/ipfs-bridge.js"
    "system/storage/p2p-sync.js"
    "system/storage/blockchain-store.js"
    "system/ui/i18n.js"
    "system/ui/ui-kit.js"
    "system/ui/components.js"
    "system/ui/file-manager.js"
    "system/ui/validators.js"
    "system/ui/helpers.js"
    "system/ui/formatters.js"
    "system/hardware/abstraction.js"
    "system/hardware/camera.js"
    "system/hardware/microphone.js"
    "system/hardware/bluetooth.js"
    "system/hardware/usb.js"
    "system/hardware/serial.js"
    "system/config/routes.json"
    "system/config/plugins.json"
    "system/config/errors.json"
    "system/config/settings.json"
    "assets/css/themes.css"
    "assets/css/animations.css"
)

EXISTING=()
MISSING=()

for file in "${CORE_FILES[@]}"; do
    if [ -f "$file" ]; then
        EXISTING+=("$file")
    else
        MISSING+=("$file")
    fi
done

echo "   ✅ الملفات الموجودة: ${#EXISTING[@]}"
echo "   ❌ الملفات المفقودة: ${#MISSING[@]}"
echo ""

if [ ${#MISSING[@]} -gt 0 ]; then
    echo "📝 قائمة الملفات المفقودة:"
    for f in "${MISSING[@]}"; do
        echo "   • $f"
    done
    echo ""
fi

# التحقق من الأيقونات
echo "🖼️  التحقق من الأيقونات:"
echo "----------------------------------------"

ICONS=(
    "assets/images/icon-72.png"
    "assets/images/icon-96.png"
    "assets/images/icon-128.png"
    "assets/images/icon-144.png"
    "assets/images/icon-152.png"
    "assets/images/icon-192.png"
    "assets/images/icon-384.png"
    "assets/images/icon-512.png"
    "assets/images/favicon.ico"
)

EXISTING_ICONS=0
MISSING_ICONS=0

for icon in "${ICONS[@]}"; do
    if [ -f "$icon" ]; then
        echo "   ✅ $icon"
        EXISTING_ICONS=$((EXISTING_ICONS + 1))
    else
        echo "   ❌ $icon"
        MISSING_ICONS=$((MISSING_ICONS + 1))
    fi
done

echo ""
echo "📊 ملخص التحليل:"
echo "----------------------------------------"
echo "✅ إجمالي الملفات: $TOTAL_FILES"
echo "✅ إجمالي المجلدات: $TOTAL_DIRS"
echo "⚠️  الملفات الأساسية المفقودة: ${#MISSING[@]}"
echo "⚠️  الأيقونات المفقودة: $MISSING_ICONS"

# إنشاء تقرير نصي
REPORT_FILE="analysis_report_$(date +%Y%m%d_%H%M%S).txt"
{
    echo "ALASAI PROJECT ANALYSIS REPORT"
    echo "==============================="
    echo "تاريخ التحليل: $(date)"
    echo "المسار: $PROJECT_DIR"
    echo ""
    echo "إحصائيات عامة:"
    echo "  المجلدات: $TOTAL_DIRS"
    echo "  الملفات: $TOTAL_FILES"
    echo "  الحجم: $TOTAL_SIZE"
    echo ""
    echo "الملفات الأساسية الموجودة (${#EXISTING[@]}):"
    for f in "${EXISTING[@]}"; do
        echo "  ✓ $f"
    done
    echo ""
    echo "الملفات الأساسية المفقودة (${#MISSING[@]}):"
    for f in "${MISSING[@]}"; do
        echo "  ✗ $f"
    done
} > "$REPORT_FILE"

echo ""
echo "📄 تم حفظ التقرير في: $REPORT_FILE"
echo "✅ التحليل اكتمل!"
