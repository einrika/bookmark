let mangaData = [];

let filteredData = [...mangaData];
let selectedGenre = null;
let selectedLetter = null;
let currentPage = 1;
const itemsPerPage = 12;

// URL Parameters
function updateURLParams() {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set('page', currentPage);
    if (selectedGenre) params.set('genre', selectedGenre);
    if (selectedLetter) params.set('letter', selectedLetter);
    const searchValue = document.getElementById('searchInput').value;
    if (searchValue) params.set('search', searchValue);
    
    const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.pushState({}, '', newURL);
}

function loadFromURLParams() {
    const params = new URLSearchParams(window.location.search);
    currentPage = parseInt(params.get('page')) || 1;
    selectedGenre = params.get('genre') || null;
    selectedLetter = params.get('letter') || null;
    const searchValue = params.get('search') || '';
    
    if (searchValue) {
        document.getElementById('searchInput').value = searchValue;
    }
}

// Render Genre Tags
function renderGenreTags() {
    const genreTags = document.getElementById('genreTags');
    if (!genreTags) return;
    
    const genreSet = new Set();
    mangaData.forEach(manga => {
        if (Array.isArray(manga.genres)) {
            manga.genres.forEach(genre => genreSet.add(genre));
        }
    });
    
    genreTags.innerHTML = '<div class="genre-tag active" onclick="filterByGenre(null)">Semua</div>';
    Array.from(genreSet).forEach(genre => {
        const isActive = genre === selectedGenre ? 'active' : '';
        genreTags.innerHTML += `<div class="genre-tag ${isActive}" onclick="filterByGenre('${genre}')">${genre}</div>`;
    });
}

// Render Alphabetical Navigation
function renderAlphaNav() {
    const alphaNav = document.getElementById('alphaNav');
    const letters = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    
    alphaNav.innerHTML = letters.map(letter => {
        const isActive = letter === selectedLetter ? 'active' : '';
        return `<button class="alpha-btn ${isActive}" onclick="filterByLetter('${letter}')">${letter}</button>`;
    }).join('');
}

// Pagination
function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = `
                <button onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>❮</button>
            `;
    
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    if (startPage > 1) {
        html += `<button onclick="goToPage(1)">1</button>`;
        if (startPage > 2) html += `<span class="pagination-info">...</span>`;
    }
    
    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += `<span class="pagination-info">...</span>`;
        html += `<button onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }
    
    html += `
                <button onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>❯</button>
            `;
    
    pagination.innerHTML = html;
}

function goToPage(page) {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderManga(filteredData);
    updateURLParams();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Render Manga Grid with Pagination
function renderManga(data) {
    const grid = document.getElementById('mangaGrid');
    const noResults = document.getElementById('noResults');
    
    if (data.length === 0) {
        grid.style.display = 'none';
        noResults.style.display = 'block';
        document.getElementById('pagination').innerHTML = '';
        return;
    }
    
    grid.style.display = 'grid';
    noResults.style.display = 'none';
    
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const paginatedData = data.slice(startIdx, endIdx);
    
    grid.innerHTML = paginatedData.map(manga => `
                <div class="manga-card" onclick="showModal(${manga.id})">
                    <div class="mangabox">
                        <img class="manga-cover" src="${manga.cover}" alt="${manga.title}">
                        <div class="manga-status">${manga.status}</div>
                    </div>
                    <div class="manga-info">
                        <div class="manga-title">${manga.title}</div>
                        <div class="manga-code">${manga.code}</div>
                        <div class="manga-meta">
                            ${manga.genres.slice(0, 2).map(g => `<span class="meta-tag">${g}</span>`).join('')}
                        </div>
                        <div class="manga-synopsis">${manga.synopsis}</div>
                        <div class="manga-rating">⭐ ${manga.rating}</div>
                    </div>
                </div>
            `).join('');
    
    renderPagination(data.length);
}

// Modal Functions
function showModal(mangaId) {
    const manga = mangaData.find(m => m.id === mangaId);
    if (!manga) return;
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
                <div class="modal-synopsis">
                    <strong style="color: var(--color-gold);">Synopsis:</strong><br/>
                    ${manga.synopsis}
                </div>
                <button class="modal-btn" onclick="readNow('${manga.url}')">📖 Read Now</button>
            `;
    
    document.getElementById('mangaModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('mangaModal').classList.remove('show');
    document.body.style.overflow = 'auto';
}

function readNow(url) {
    window.open(url, '_blank');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('mangaModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Close modal with ESC key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

// Toggle alphabetical navigation
function toggleAlpha() {
    const nav = document.getElementById('alphaNav');
    const icon = document.getElementById('alphaIcon');
    nav.classList.toggle('show');
    icon.classList.toggle('expanded');
}

// Filter by Genre
function filterByGenre(genre) {
    selectedGenre = genre;
    currentPage = 1;
    
    document.querySelectorAll('.genre-tag').forEach(tag => {
        tag.classList.remove('active');
    });
    
    if (genre) {
        event.target.classList.add('active');
        filteredData = mangaData.filter(manga => manga.genres.includes(genre));
    } else {
        event.target.classList.add('active');
        filteredData = [...mangaData];
    }
    
    applyFilters();
}

// Filter by Letter
function filterByLetter(letter) {
    selectedLetter = letter;
    currentPage = 1;
    
    document.querySelectorAll('.alpha-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    if (letter === '#') {
        filteredData = mangaData.filter(manga =>
            !manga.title[0].match(/[A-Za-z]/)
        );
    } else {
        filteredData = mangaData.filter(manga =>
            manga.title[0].toLowerCase() === letter.toLowerCase()
        );
    }
    
    applyFilters();
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', function(e) {
    currentPage = 1;
    applyFilters();
});

// Apply all filters
function applyFilters() {
    let data = [...mangaData];
    
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    
    if (selectedGenre) {
        data = data.filter(manga => manga.genres.includes(selectedGenre));
    }
    
    if (selectedLetter) {
        if (selectedLetter === '#') {
            data = data.filter(manga => !manga.title[0].match(/[A-Za-z]/));
        } else {
            data = data.filter(manga =>
                manga.title[0].toLowerCase() === selectedLetter.toLowerCase()
            );
        }
    }
    
    if (searchValue) {
        data = data.filter(manga =>
            manga.title.toLowerCase().includes(searchValue) ||
            manga.code.toLowerCase().includes(searchValue)
        );
    }
    
    filteredData = data;
    renderManga(filteredData);
    updateURLParams();
}

// Sort functions
function sortBy(type) {
    if (type === 'title') {
        filteredData.sort((a, b) => a.title.localeCompare(b.title));
    } else if (type === 'rating') {
        filteredData.sort((a, b) => b.rating - a.rating);
    }
    renderManga(filteredData);
}

// Reset filters
function resetFilters() {
    selectedGenre = null;
    selectedLetter = null;
    currentPage = 1;
    document.getElementById('searchInput').value = '';
    
    document.querySelectorAll('.genre-tag').forEach(tag => {
        tag.classList.remove('active');
    });
    document.querySelectorAll('.alpha-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    filteredData = [...mangaData];
    renderManga(filteredData);
    
    // Set "Semua" genre as active
    document.querySelector('.genre-tag').classList.add('active');
    
    // Clear URL params
    window.history.pushState({}, '', window.location.pathname);
}

// Load external data (optional)
async function loadMangaData() {
    try {
        let url;
        
        if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
            url = `/manga_data.json?t=${Date.now()}`;
        } else {
            url = `https://raw.githubusercontent.com/einrika/bookmark/refs/heads/main/manga_data.json?t=${Date.now()}`;
        }
        
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load JSON");
        
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
            mangaData = data;
            filteredData = [...mangaData];
        }
    } catch (error) {
        console.warn("Cannot load manga data:", error.message);
    }
    
    initialize();
}

// Initialize
function initialize() {
    loadFromURLParams();
    renderGenreTags();
    renderAlphaNav();
    applyFilters();
}

// Start
loadMangaData();