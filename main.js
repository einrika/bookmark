// Data Manga dalam format JSON  
let mangaData = [];

let filteredData = [...mangaData];
let selectedGenre = null;
let selectedLetter = null;

// Ambil data JSON dari file eksternal jika ada
async function loadMangaData() {
    try {
        const response = await fetch('/manga_data.json'); // arahkan ke file JSON eksternal
        if (!response.ok) throw new Error('Gagal memuat JSON eksternal');
        const data = await response.json();
        
        // jika file JSON kosong atau tidak valid, pakai data internal
        if (!Array.isArray(data) || data.length === 0) {
            console.warn('File JSON kosong, gunakan data internal');
            mangaData = [];
        } else {
            mangaData = data;
        }
    } catch (error) {
        console.warn('Tidak dapat memuat JSON eksternal, gunakan data internal:', error.message);
        mangaData = [];
    }
    
    filteredData = [...mangaData];
    
    // Tunggu renderManga selesai dulu
    await renderManga(mangaData);
    
    // Jalankan renderGenreTags hanya setelah DOM siap
    if (document.readyState === "complete" || document.readyState === "interactive") {
        renderGenreTags();
    } else {
        document.addEventListener("DOMContentLoaded", renderGenreTags);
    }
}

// Render Genre Tags  
function renderGenreTags() {
    // pastikan elemen ada
    const genreTags = document.getElementById('genreTags');
    if (!genreTags) {
        console.warn("Elemen #genreTags belum ada di DOM, tunda renderGenreTags()");
        return;
    }
    
    const genreSet = new Set();
    
    // pastikan mangaData valid
    if (!Array.isArray(mangaData) || mangaData.length === 0) {
        console.warn("Tidak ada data manga untuk membuat genre tag");
        genreTags.innerHTML = '<div class="genre-tag">Tidak ada genre</div>';
        return;
    }
    
    // kumpulkan semua genre unik
    mangaData.forEach(manga => {
        if (Array.isArray(manga.genres)) {
            manga.genres.forEach(genre => genreSet.add(genre));
        }
    });
    
    // render genre tag
    genreTags.innerHTML = '<div class="genre-tag" onclick="filterByGenre(null)">Semua</div>';
    Array.from(genreSet).forEach(genre => {
        genreTags.innerHTML += `<div class="genre-tag" onclick="filterByGenre('${genre}')">${genre}</div>`;
    });
}

// Render Alphabetical Navigation  
function renderAlphaNav() {
    const alphaNav = document.getElementById('alphaNav');
    const letters = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    
    alphaNav.innerHTML = letters.map(letter =>
        `<button class="alpha-btn" onclick="filterByLetter('${letter}')">${letter}</button>`
    ).join('');
}

// Render Manga Grid  
function renderManga(data) {
    const grid = document.getElementById('mangaGrid');
    const noResults = document.getElementById('noResults');
    
    if (data.length === 0) {
        grid.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }
    
    grid.style.display = 'grid';
    noResults.style.display = 'none';
    
    grid.innerHTML = data.map(manga => `  
            <div class="manga-card" onclick="openManga('${manga.url}')">  
                <div class="manga-cover">  
                    <span style="font-size: 2.5rem;">${manga.cover}</span>  
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
}

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

// Search functionality - combined search  
document.getElementById('searchInput').addEventListener('input', function(e) {
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
    
    renderManga(data);
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
}

// Open manga URL  
function openManga(url) {
    window.open(url, '_blank');
}

// Initialize  
renderAlphaNav();
loadMangaData();
// Set "Semua" genre as active by default  
document.querySelector('.genre-tag').classList.add('active');