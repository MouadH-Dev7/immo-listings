const fs = require('fs');
const path = require('path');

const propertiesDir = path.join(__dirname, 'properties');
const files = fs.readdirSync(propertiesDir).filter(
    f => f.endsWith('.json') && f !== 'list.json' && f !== 'template.json'
);

console.log(`🔍 جاري فحص ${files.length} ملف إعلان عقاري...`);

files.forEach(file => {
    const filePath = path.join(propertiesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // 1. التحقق من صحة بنية JSON
    let data;
    try {
        data = JSON.parse(content);
    } catch (e) {
        console.error(`❌ صيغة JSON غير صالحة في الملف: ${file}`);
        process.exit(1);
    }

    // 2. التحقق من الحقول الإلزامية للإعلان العقاري
    if (!data.title || !data.price || !data.location || !Array.isArray(data.links) || data.links.length === 0) {
        console.error(`❌ حقول إلزامية ناقصة (title, price, location, links) في الملف: ${file}`);
        process.exit(1);
    }
});

// 3. توليد ملف الفهرس بعد نجاح الفحص
fs.writeFileSync(path.join(propertiesDir, 'list.json'), JSON.stringify(files, null, 2));
console.log('✅ تم التحقق من جميع الإعلانات وتحديث properties/list.json بنجاح.');