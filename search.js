const genreListEl = document.getElementById("genre-list");
const resultSection = document.getElementById("result-section");
const resultList = document.getElementById("result-list");
const resultTitle = document.getElementById("result-title");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const searchPagination = document.getElementById("search-pagination");

let searchType = ""; // "query" atau "genre"
let searchQuery = "";
let currentPage = 1;
let hasNextPage = false;

// 1. Load Genre saat pertama buka
async function loadGenres() {
    try {
        const res = await fetch(`${API_BASE}/genre`);
        if (!res.ok) throw new Error("Gagal");
        const json = await res.json();
        
        // Handle perbedaan struktur data (kadang array langsung, kadang di dalam objek)
        let genres = json.data || json.genreList || [];
        if (genres.genres) genres = genres.genres;

        genreListEl.innerHTML = "";
        genres.forEach(g => {
            const id = g.id || g.genreId || g.slug;
            const name = g.name || g.title;
            const card = document.createElement("div");
            card.className = "genre-card";
            card.textContent = name;
            card.addEventListener("click", () => loadByGenre(id, name));
            genreListEl.appendChild(card);
        });
    } catch (err) {
        genreListEl.innerHTML = `<p class="error">Gagal memuat genre.</p>`;
    }
}

// 2. Load Search Text
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = searchInput.value.trim();
    if (q) loadBySearch(q);
});

async function loadBySearch(q) {
    searchType = "query";
    searchQuery = q;
    currentPage = 1;
    resultTitle.textContent = `Hasil Pencarian: "${q}"`;
    await fetchData(`${API_BASE}/search?q=${encodeURIComponent(q)}&page=1`);
}

// 3. Load By Genre
async function loadByGenre(id, name) {
    searchType = "genre";
    searchQuery = id;
    currentPage = 1;
    resultTitle.textContent = `Genre: ${name}`;
    await fetchData(`${API_BASE}/genre/${encodeURIComponent(id)}?page=1`);
}

// 4. Fetch Data (Dipakai bareng buat Search & Genre)
async function fetchData(url) {
    resultSection.style.display = "block";
    resultList.innerHTML = `<p class="loading">Memuat data...</p>`;
    searchPagination.innerHTML = "";
    genreListEl.parentElement.style.display = "none"; // Sembunyikan genre

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Gagal");
        const json = await res.json();
        
        let list = json.data?.animeList || json.data?.results || json.data || [];
        if (!Array.isArray(list)) list = [];

        hasNextPage = json.pagination?.hasNextPage || false;

        resultList.innerHTML = "";
        if (list.length === 0) {
            resultList.innerHTML = `<p class="error">Anime tidak ditemukan.</p>`;
        } else {
            list.forEach(a => resultList.appendChild(createAnimeCard(a)));
        }
        renderPagination();
    } catch (err) {
        resultList.innerHTML = `<p class="error">Gagal memuat data.</p>`;
    }
}

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
    let url = searchType === "query" 
        ? `${API_BASE}/search?q=${encodeURIComponent(searchQuery)}&page=${page}`
        : `${API_BASE}/genre/${encodeURIComponent(searchQuery)}?page=${page}`;
    await fetchData(url);
    window.scrollTo({ top: 0, behavior: "smooth" });
}

loadGenres();
