#!/bin/bash

echo "╔══════════════════════════════════════════════════════════╗"
echo "║     🖼️  ALAISAI ICON EXTRACTOR (المسار المحدث)          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# المسارات المحدثة
PROJECT_DIR="$(pwd)"
DOWNLOAD_DIR="/storage/emulated/0/Download"
ICONS_ZIP="$DOWNLOAD_DIR/AppIcons.zip"
TEMP_DIR="$PROJECT_DIR/temp_icons"
TARGET_DIR="$PROJECT_DIR/assets/images"

echo "📂 مسار المشروع: $PROJECT_DIR"
echo "📂 مجلد التحميلات: $DOWNLOAD_DIR"
echo "📦 ملف الأيقونات: $ICONS_ZIP"
echo "🎯 مجلد الهدف: $TARGET_DIR"
echo ""

# التحقق من وجود ملف الأيقونات في مجلد التحميلات
if [ -f "$ICONS_ZIP" ]; then
    echo "✅ تم العثور على ملف الأيقونات في مجلد التحميلات"
else
    echo "❌ ملف AppIcons.zip غير موجود في: $ICONS_ZIP"
    echo ""
    echo "🔍 محتويات مجلد التحميلات:"
    echo "----------------------------------------"
    ls -la "$DOWNLOAD_DIR" | grep -E "\.zip$|AppIcons" | head -10
    
    echo ""
    echo "🔍 البحث عن أي ملف ZIP في مجلد التحميلات:"
    FOUND_ZIPS=$(find "$DOWNLOAD_DIR" -maxdepth 1 -name "*.zip" -type f | head -5)
    if [ -n "$FOUND_ZIPS" ]; then
        echo "ملفات ZIP الموجودة:"
        echo "$FOUND_ZIPS" | while read -r zip; do
            echo "   • $(basename "$zip")"
        done
    fi
    
    echo ""
    echo "⚠️  يرجى التأكد من وجود ملف AppIcons.zip في:"
    echo "   $DOWNLOAD_DIR"
    echo ""
    echo "أو قم بتنزيله من:"
    echo "   https://github.com/yourusername/Alaisai_OS_Pro/releases"
    exit 1
fi

# إنشاء مجلد مؤقت
echo ""
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
COPIED_FILES=()

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
            COPIED_FILES+=("$icon ← $(basename "$FOUND_FILE")")
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
if [ $FOUND_COUNT -gt 0 ]; then
    echo ""
    echo "📋 الملفات التي تم نسخها:"
    for file in "${COPIED_FILES[@]}"; do
        echo "   • $file"
    done
fi
echo "❌ لم يتم العثور على: $MISSING_COUNT أيقونة"

# عرض محتويات مجلد الأيقونات بعد النسخ
echo ""
echo "📁 محتويات مجلد الأيقونات الآن:"
echo "----------------------------------------"
if [ -d "$TARGET_DIR" ]; then
    ls -la "$TARGET_DIR" | grep -E "icon|favicon" || echo "   (لا توجد أيقونات)"
else
    echo "   المجلد غير موجود"
fi

# البحث عن أيقونات بديلة في الملف المضغوط
echo ""
echo "🔍 البحث عن أيقونات بديلة في الملف المضغوط:"
echo "----------------------------------------"

echo "جميع أيقونات PNG المتوفرة:"
find "$TEMP_DIR" -name "*.png" | head -15 | while read -r png; do
    size=$(file "$png" | grep -oE '[0-9]+ x [0-9]+' | head -1)
    echo "   • $(basename "$png") ${size:+($size)}"
done

echo ""
echo "جميع أيقونات ICO المتوفرة:"
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
    echo "2. استخدام ImageMagick لإنشاء الأيقونات:"
    echo "   pkg install imagemagick -y"
    echo "   for size in 96 384; do"
    echo "       convert -size \${size}x\${size} xc:none -fill '#4cc9f0' -draw \"circle \$((size/2)),\$((size/2)) \$((size/2)),10\" png24:assets/images/icon-\${size}.png"
    echo "   done"
    echo "   echo 'ICO' > assets/images/favicon.ico"
    echo ""
    echo "3. نسخ أيقونات يدوياً من القائمة أعلاه:"
    echo "   cp \"$TEMP_DIR/اسم_الملف\" \"$TARGET_DIR/icon-الحجم.png\""
fi

# تنظيف المجلد المؤقت (اختياري)
echo ""
echo "🧹 هل تريد تنظيف الملفات المؤقتة؟ (y/N): "
read -p "> " CLEANUP

if [ "$CLEANUP" = "y" ] || [ "$CLEANUP" = "Y" ]; then
    rm -rf "$TEMP_DIR"
    echo "✅ تم التنظيف"
else
    echo "📁 تم الاحتفاظ بالملفات المؤقتة في: $TEMP_DIR"
fi

echo ""
echo "🎉 اكتملت عملية استخراج الأيقونات!"
echo ""
echo "للتأكد من النتيجة، قم بتشغيل: bash analyze_project.sh"
