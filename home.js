const popularList = document.getElementById("popular-list");
const latestList = document.getElementById("latest-list");
const historyList = document.getElementById("history-list");
const historySection = document.getElementById("history-section");
const paginationEl = document.getElementById("pagination");

let currentPage = 1;
let allLatest = [];
let hasNextPage = false;

// Load History
function loadHistory() {
    const history = getHistory();
    if (history.length === 0) return;

    historySection.style.display = "block";
    historyList.innerHTML = "";

    history.forEach(item => {
        const card = document.createElement("div");
        card.className = "anime-card";
        const poster = item.poster || "https://via.placeholder.com/200x280?text=No+Image";
        
        card.innerHTML = `
            <img src="${poster}" alt="${item.animeName}" loading="lazy" referrerpolicy="no-referrer">
            <div class="card-info">
                <h3>${item.animeName}</h3>
                <div class="meta"><span>🎬 ${item.episodeTitle}</span></div>
            </div>
        `;
        card.addEventListener("click", () => {
            window.location.href = `watch.html?slug=${encodeURIComponent(item.slug)}&anime=${encodeURIComponent(item.animeName)}&poster=${encodeURIComponent(poster)}&series=${encodeURIComponent(item.seriesSlug || '')}`;
        });
        historyList.appendChild(card);
    });
}

async function loadHome() {
    try {
        const res = await fetch(`${API_BASE}/home`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.statusCode !== 200 || !json.data) throw new Error("Response tidak valid");

        const popular = json.data.popularToday?.animeList || [];
        const latest = json.data.latestRelease?.animeList || [];

        popularList.innerHTML = "";
        if (popular.length === 0) {
            popularList.innerHTML = `<p class="error">Tidak ada data populer.</p>`;
        } else {
            popular.forEach(a => popularList.appendChild(createAnimeCard(a)));
        }

        allLatest = latest;
        hasNextPage = json.data.latestRelease?.hasNextPage || latest.length >= PER_PAGE;
        renderLatestPage();
        renderPagination();
    } catch (err) {
        console.error(err);
        popularList.innerHTML = `<p class="error">Gagal memuat data populer.</p>`;
        latestList.innerHTML = `<p class="error">Gagal memuat data terbaru.</p>`;
    }
}

// ... (Fungsi renderLatestPage, renderPagination, dan goToPage SAMA PERSIS seperti sebelumnya) ...
function renderLatestPage() {
    latestList.innerHTML = "";
    if (allLatest.length === 0) { latestList.innerHTML = `<p class="error">Tidak ada data terbaru.</p>`; return; }
    allLatest.forEach(a => latestList.appendChild(createAnimeCard(a)));
}

function renderPagination() {
    paginationEl.innerHTML = "";
    if (currentPage > 1) {
        const prev = document.createElement("button");
        prev.textContent = "← Sebelumnya";
        prev.addEventListener("click", () => goToPage(currentPage - 1));
        paginationEl.appendChild(prev);
    }
    const cur = document.createElement("button");
    cur.textContent = `Halaman ${currentPage}`;
    cur.className = "current"; cur.disabled = true;
    paginationEl.appendChild(cur);
    if (hasNextPage) {
        const next = document.createElement("button");
        next.textContent = "Berikutnya →";
        next.addEventListener("click", () => goToPage(currentPage + 1));
        paginationEl.appendChild(next);
    }
}

async function goToPage(page) {
    currentPage = page;
    latestList.innerHTML = `<p class="loading">Memuat halaman ${page}...</p>`;
    try {
        const res = await fetch(`${API_BASE}/home?page=${page}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        allLatest = json.data?.latestRelease?.animeList || [];
        hasNextPage = json.data?.latestRelease?.hasNextPage || allLatest.length >= PER_PAGE;
    } catch (err) { hasNextPage = false; }
    renderLatestPage();
    renderPagination();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

loadHistory();
loadHome();
