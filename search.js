const genreListEl = document.getElementById("genre-list");
const resultList = document.getElementById("result-list");
const resultTitle = document.getElementById("result-title");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const searchPagination = document.getElementById("search-pagination");

let searchType = "default"; 
let searchQuery = "";
let currentPage = 1;
let hasNextPage = false;

// 1. Load Genre (Hardcode)
function loadGenres() {
    const genres = [
        { id: "action", name: "Action" },
        { id: "adventure", name: "Adventure" },
        { id: "comedy", name: "Comedy" },
        { id: "drama", name: "Drama" },
        { id: "fantasy", name: "Fantasy" },
        { id: "horror", name: "Horror" },
        { id: "mecha", name: "Mecha" },
        { id: "music", name: "Music" },
        { id: "mystery", name: "Mystery" },
        { id: "psychological", name: "Psychological" },
        { id: "romance", name: "Romance" },
        { id: "sci-fi", name: "Sci-Fi" },
        { id: "slice-of-life", name: "Slice of Life" },
        { id: "sports", name: "Sports" },
        { id: "supernatural", name: "Supernatural" },
        { id: "thriller", name: "Thriller" }
    ];

    genreListEl.innerHTML = "";
    genres.forEach(g => {
        const card = document.createElement("div");
        card.className = "genre-card";
        card.textContent = g.name;
        card.addEventListener("click", () => {
            window.history.pushState({}, '', `?genre=${g.id}`);
            loadByGenre(g.id, g.name);
        });
        genreListEl.appendChild(card);
    });
}

// 2. Load Anime Default (Rilis Terbaru)
async function loadDefaultAnime() {
    searchType = "default";
    currentPage = 1;
    resultTitle.textContent = "🆕 Rilis Terbaru";
    resultList.innerHTML = `<p class="loading">Memuat anime...</p>`;
    searchPagination.innerHTML = "";

    try {
        const res = await fetch(`${API_BASE}/home`);
        const json = await res.json();
        const list = json.data?.latestRelease?.animeList || [];
        hasNextPage = json.data?.latestRelease?.hasNextPage || false;
        renderResults(list);
    } catch (err) {
        resultList.innerHTML = `<p class="error">Gagal memuat daftar anime.</p>`;
    }
}

// 3. Event Search Form
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = searchInput.value.trim();
    if (q) {
        window.history.pushState({}, '', `?q=${encodeURIComponent(q)}`);
        loadBySearch(q);
    }
});

async function loadBySearch(q) {
    searchType = "query";
    searchQuery = q;
    currentPage = 1;
    resultTitle.textContent = `🔍 Hasil Pencarian: "${q}"`;
    await fetchData(`${API_BASE}/search?q=${encodeURIComponent(q)}&page=1`);
}

// 4. Load By Genre
async function loadByGenre(id, name) {
    searchType = "genre";
    searchQuery = id;
    currentPage = 1;
    resultTitle.textContent = `🗂️ Genre: ${name}`;
    await fetchData(`${API_BASE}/genre/${encodeURIComponent(id)}?page=1`);
}

// 5. Fungsi Fetch Data
async function fetchData(url) {
    resultList.innerHTML = `<p class="loading">Memuat data...</p>`;
    searchPagination.innerHTML = "";

    try {
        const res = await fetch(url);
        const json = await res.json();
        
        // Handle response API yang beda-beda formatnya
        let list = json.data?.animeList || json.data?.results || json.data || [];
        if (!Array.isArray(list)) list = [];

        hasNextPage = json.pagination?.hasNextPage || false;
        renderResults(list);
    } catch (err) {
        resultList.innerHTML = `<p class="error">Gagal memuat data atau anime tidak ditemukan.</p>`;
    }
}

// 6. Render Hasil
function renderResults(list) {
    resultList.innerHTML = "";
    if (list.length === 0) {
        resultList.innerHTML = `<p class="error">Anime tidak ditemukan.</p>`;
        return;
    }
    list.forEach((a, i) => resultList.appendChild(createAnimeCard(a, false, i)));
    renderPagination();
}

// 7. Pagination
function renderPagination() {
    searchPagination.innerHTML = "";
    if (currentPage > 1) {
        const prev = document.createElement("button");
        prev.textContent = "← Sebelumnya";
        prev.addEventListener("click", () => goToPage(currentPage - 1));
        searchPagination.appendChild(prev);
    }
    const cur = document.createElement("button");
    cur.textContent = `Halaman ${currentPage}`;
    cur.className = "current"; cur.disabled = true;
    searchPagination.appendChild(cur);
    
    if (hasNextPage) {
        const next = document.createElement("button");
        next.textContent = "Berikutnya →";
        next.addEventListener("click", () => goToPage(currentPage + 1));
        searchPagination.appendChild(next);
    }
}

async function goToPage(page) {
    currentPage = page;
    if (searchType === "query") {
        await fetchData(`${API_BASE}/search?q=${encodeURIComponent(searchQuery)}&page=${page}`);
    } else if (searchType === "genre") {
        await fetchData(`${API_BASE}/genre/${encodeURIComponent(searchQuery)}?page=${page}`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// --- INISIALISASI SAAT HALAMAN DIBUKA ---
loadGenres();

// Cek apakah ada parameter URL (?q=... atau ?genre=...)
const urlParams = new URLSearchParams(window.location.search);
const qParam = urlParams.get('q');
const genreParam = urlParams.get('genre');

if (qParam) {
    searchInput.value = qParam;
    loadBySearch(qParam);
} else if (genreParam) {
    // Cari nama genre dari ID buat judul
    const genreName = genreParam.charAt(0).toUpperCase() + genreParam.slice(1).replace('-', ' ');
    loadByGenre(genreParam, genreName);
} else {
    loadDefaultAnime();
}
