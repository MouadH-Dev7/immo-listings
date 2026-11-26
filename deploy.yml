const fs = require('fs');
const path = require('path');

const propertiesDir = path.join(__dirname, 'properties');
if (!fs.existsSync(propertiesDir)) {
    fs.mkdirSync(propertiesDir, { recursive: true });
}

const files = fs.readdirSync(propertiesDir).filter(
    f => f.endsWith('.json') && f !== 'list.json' && f !== 'template.json'
);

console.log(`🔍 Validating ${files.length} property file(s)...`);

files.forEach(file => {
    const filePath = path.join(propertiesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    let data;
    try {
        data = JSON.parse(content);
    } catch (e) {
        console.error(`❌ INVALID JSON FORMAT in: ${file}`);
        process.exit(1);
    }

    if (!data.title || !data.price || !data.location || !Array.isArray(data.links) || data.links.length === 0) {
        console.error(`❌ MISSING REQUIRED FIELDS (title, price, location, links) in: ${file}`);
        process.exit(1);
    }
});

fs.writeFileSync(path.join(propertiesDir, 'list.json'), JSON.stringify(files, null, 2));
console.log('✅ Validation successful! properties/list.json updated.');