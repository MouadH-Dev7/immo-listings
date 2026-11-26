const grid = document.getElementById('properties-grid');
const searchInput = document.getElementById('search-input');
const typeFilter = document.getElementById('type-filter');
const searchButton = document.getElementById('search-button');
const listingCount = document.getElementById('listing-count');
const noResults = document.getElementById('no-results');
let properties = [];

function escapeHTML(value = '') {
    return String(value).replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
}

function renderProperties() {
    const keyword = searchInput.value.trim().toLocaleLowerCase('ar');
    const selectedType = typeFilter.value;
    const filtered = properties.filter(item => {
        const searchable = `${item.title || ''} ${item.location || ''} ${item.type || ''} ${item.description || ''}`.toLocaleLowerCase('ar');
        return (!keyword || searchable.includes(keyword)) && (!selectedType || item.type === selectedType);
    });

    listingCount.textContent = filtered.length;
    noResults.hidden = filtered.length !== 0;
    grid.innerHTML = '';

    filtered.forEach(item => {
        const card = document.createElement('article');
        card.className = 'card';
        const imageMarkup = item.image
            ? `<img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.title || 'صورة العقار')}" loading="lazy" onerror="this.remove();this.parentElement.classList.remove('has-image')">`
            : '';
        const links = Array.isArray(item.links) ? item.links : [];
        const linksMarkup = links.map(link => {
            const url = escapeHTML(link.url || '#');
            const title = escapeHTML(link.title || 'عرض الرابط');
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>`;
        }).join('');

        card.innerHTML = `
            <div class="card-visual ${item.image ? 'has-image' : ''}">
                ${imageMarkup}
                <span class="card-type">${escapeHTML(item.type || 'عقار')}</span>
                <span class="visual-house" aria-hidden="true">⌂</span>
            </div>
            <div class="card-body">
                <div class="card-price">${escapeHTML(item.price || 'السعر عند التواصل')}</div>
                <h3>${escapeHTML(item.title || 'إعلان عقاري')}</h3>
                <p class="card-location">⌖ ${escapeHTML(item.location || 'الموقع غير محدد')}</p>
                <p class="card-description">${escapeHTML(item.description || 'لا يوجد وصف لهذا الإعلان حالياً.')}</p>
                <div class="card-details">
                    ${item.area ? `<span>▧ ${escapeHTML(item.area)}</span>` : ''}
                    <span>◆ ${escapeHTML(item.type || 'عقار')}</span>
                </div>
                ${linksMarkup ? `<div class="card-links">${linksMarkup}</div>` : ''}
            </div>`;
        grid.appendChild(card);
    });
}

function populateTypeFilter() {
    const types = [...new Set(properties.map(item => item.type).filter(Boolean))];
    types.sort((a, b) => a.localeCompare(b, 'ar'));
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeFilter.appendChild(option);
    });
}

searchButton.addEventListener('click', renderProperties);
searchInput.addEventListener('input', renderProperties);
typeFilter.addEventListener('change', renderProperties);

fetch('properties/list.json')
    .then(response => {
        if (!response.ok) throw new Error('تعذر العثور على قائمة الإعلانات');
        return response.json();
    })
    .then(async files => {
        if (!Array.isArray(files)) throw new Error('تنسيق قائمة الإعلانات غير صحيح');
        const results = await Promise.all(files.map(async file => {
            try {
                const response = await fetch(`properties/${encodeURIComponent(file)}`);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return await response.json();
            } catch (error) {
                console.error('فشل تحميل الإعلان:', file, error);
                return null;
            }
        }));
        properties = results.filter(Boolean);
        populateTypeFilter();
        renderProperties();
        if (properties.length === 0) {
            grid.innerHTML = '<p class="no-results">لا توجد إعلانات منشورة حالياً. أضف ملفات الإعلانات بصيغة JSON داخل مجلد properties.</p>';
        }
    })
    .catch(error => {
        console.error('تعذر تحميل الإعلانات:', error);
        grid.innerHTML = '<p class="no-results">تعذر تحميل الإعلانات حالياً. يرجى المحاولة لاحقاً.</p>';
        listingCount.textContent = '0';
    });
