#!/bin/bash

echo "╔══════════════════════════════════════════════════════════╗"
echo "║     🖼️  ALAISAI ICON EXTRACTOR                           ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# المسارات
PROJECT_DIR="$(pwd)"
ICONS_ZIP="$PROJECT_DIR/../AppIcons.zip"
TEMP_DIR="$PROJECT_DIR/temp_icons"
TARGET_DIR="$PROJECT_DIR/assets/images"

echo "📂 مسار المشروع: $PROJECT_DIR"
echo "📦 ملف الأيقونات: $ICONS_ZIP"
echo "🎯 مجلد الهدف: $TARGET_DIR"
echo ""

# التحقق من وجود ملف الأيقونات
if [ ! -f "$ICONS_ZIP" ]; then
    echo "❌ ملف AppIcons.zip غير موجود في المسار: $ICONS_ZIP"
    echo "🔍 البحث عن الملف في المجلدات المجاورة..."
    
    # البحث عن الملف
    FOUND_ZIP=$(find "$PROJECT_DIR/.." -name "AppIcons.zip" -type f | head -1)
    
    if [ -n "$FOUND_ZIP" ]; then
        ICONS_ZIP="$FOUND_ZIP"
        echo "✅ تم العثور على الملف: $ICONS_ZIP"
    else
        echo "❌ لم يتم العثور على ملف AppIcons.zip"
        exit 1
    fi
fi

# إنشاء مجلد مؤقت
echo "📁 إنشاء مجلد مؤقت..."
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"
echo "✅ تم إنشاء $TEMP_DIR"

# فك ضغط الملف
echo "📦 فك ضغط ملف الأيقونات..."
unzip -q "$ICONS_ZIP" -d "$TEMP_DIR"
if [ $? -ne 0 ]; then
    echo "❌ فشل في فك الضغط"
    exit 1
fi
echo "✅ تم فك الضغط بنجاح"

# إنشاء مجلد الهدف إذا لم يكن موجوداً
mkdir -p "$TARGET_DIR"

# قائمة الأيقونات المطلوبة
REQUIRED_ICONS=(
    "icon-72.png"
    "icon-96.png"
    "icon-128.png"
    "icon-144.png"
    "icon-152.png"
    "icon-192.png"
    "icon-384.png"
    "icon-512.png"
    "favicon.ico"
)

echo ""
echo "🔍 البحث عن الأيقونات المطلوبة..."
echo "----------------------------------------"

FOUND_COUNT=0
MISSING_COUNT=0

for icon in "${REQUIRED_ICONS[@]}"; do
    echo -n "   • $icon: "
    
    # البحث عن الملف في المجلد المؤقت
    FOUND_FILE=$(find "$TEMP_DIR" -name "*${icon}*" -o -name "*${icon%.*}*" | head -1)
    
    if [ -n "$FOUND_FILE" ]; then
        # نسخ الملف مع تصحيح الاسم
        cp "$FOUND_FILE" "$TARGET_DIR/$icon"
        if [ $? -eq 0 ]; then
            echo "✅ تم النسخ من $(basename "$FOUND_FILE")"
            FOUND_COUNT=$((FOUND_COUNT + 1))
        else
            echo "❌ فشل النسخ"
            MISSING_COUNT=$((MISSING_COUNT + 1))
        fi
    else
        # البحث عن أيقونات بأسماء مشابهة
        SIMILAR=$(find "$TEMP_DIR" -name "*.png" -o -name "*.ico" | grep -i "${icon%-*}" | head -3)
        if [ -n "$SIMILAR" ]; then
            echo "⚠️  لم يتم العثور على مطابقة تامة"
            echo "      ملفات مشابهة:"
            echo "$SIMILAR" | while read -r sim; do
                echo "        • $(basename "$sim")"
            done
        else
            echo "❌ غير موجود"
        fi
        MISSING_COUNT=$((MISSING_COUNT + 1))
    fi
done

echo ""
echo "📊 النتائج:"
echo "----------------------------------------"
echo "✅ تم نسخ: $FOUND_COUNT أيقونة"
echo "❌ لم يتم العثور على: $MISSING_COUNT أيقونة"
echo ""

# عرض محتويات مجلد الأيقونات بعد النسخ
echo "📁 محتويات مجلد الأيقونات الآن:"
echo "----------------------------------------"
ls -la "$TARGET_DIR" | grep -E "icon|favicon"

echo ""
echo "🔍 البحث عن أيقونات إضافية في الملف المضغوط:"
echo "----------------------------------------"
echo "جميع ملفات PNG الموجودة:"
find "$TEMP_DIR" -name "*.png" | head -10 | while read -r png; do
    echo "   • $(basename "$png")"
done

echo ""
echo "جميع ملفات ICO الموجودة:"
find "$TEMP_DIR" -name "*.ico" | head -5 | while read -r ico; do
    echo "   • $(basename "$ico")"
done

# عرض خيارات للتعامل مع الأيقونات المفقودة
if [ $MISSING_COUNT -gt 0 ]; then
    echo ""
    echo "🛠️  خيارات للتعامل مع الأيقونات المفقودة:"
    echo "----------------------------------------"
    echo "1. البحث يدوياً في الملفات المستخرجة:"
    echo "   ls -la $TEMP_DIR"
    echo ""
    echo "2. إنشاء أيقونات افتراضية (إذا لم تكن موجودة):"
    echo "   for size in 96 384; do"
    echo "       convert -size ${size}x${size} xc:none -fill '#4cc9f0' -draw \"circle $((size/2)),$((size/2)) $((size/2)),10\" png24:assets/images/icon-${size}.png"
    echo "   done"
    echo "   echo 'ICO' > assets/images/favicon.ico"
    echo ""
    echo "3. استخدام ImageMagick لتحويل أيقونات موجودة:"
    echo "   pkg install imagemagick -y"
    echo "   # ثم استخدام الأمر convert"
fi

# تنظيف المجلد المؤقت
echo ""
echo "🧹 تنظيف الملفات المؤقتة..."
rm -rf "$TEMP_DIR"
echo "✅ تم التنظيف"

echo ""
echo "🎉 اكتملت عملية استخراج الأيقونات!"
