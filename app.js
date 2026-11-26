fetch('properties/list.json')
    .then(res => res.json())
    .then(async (propertyFiles) => {
        const grid = document.getElementById('properties-grid');

        if (!propertyFiles || propertyFiles.length === 0) {
            grid.innerHTML = '<p class="empty-state">لا توجد إعلانات عقارية منشورة حالياً.</p>';
            return;
        }

        for (const file of propertyFiles) {
            try {
                const response = await fetch(`properties/${file}`);
                const item = await response.json();

                const card = document.createElement('article');
                card.className = 'card';
                card.innerHTML = `
                    <div>
                        <div class="badge-row">
                            <span class="badge-type">${item.type || 'عقار'}</span>
                            <span class="price">${item.price}</span>
                        </div>
                        <h2>${item.title}</h2>
                        <p class="meta">📍 ${item.location}</p>
                        ${item.area ? `<p class="meta">📐 المساحة: ${item.area}</p>` : ''}
                        <p class="description">${item.description || ''}</p>
                    </div>
                    <div class="links">
                        ${item.links.map(l => `<a href="${l.url}" target="_blank" rel="noopener">${l.title}</a>`).join('')}
                    </div>
                `;
                grid.appendChild(card);
            } catch (e) {
                console.error('فشل تحميل الإعلان:', file, e);
            }
        }
    })
    .catch(err => console.error('تعذر قراءة قائمة الإعلانات:', err));
    