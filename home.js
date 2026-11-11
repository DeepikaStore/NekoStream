const heroSection = document.getElementById("hero-section");
const trendingList = document.getElementById("trending-list");
const latestList = document.getElementById("latest-list");

// Render Hero Banner
function renderHero(anime) {
    const poster = anime.poster || "https://via.placeholder.com/1920x1080?text=No+Image";
    const title = anime.seriesName || anime.title || "Anime Populer";
    const seriesSlug = extractSeriesSlug(anime);

    heroSection.innerHTML = `
        <div class="hero-slide" style="background-image: url('${poster}');">
            <div class="hero-overlay">
                <h1 class="hero-title">${title}</h1>
                <p class="hero-synopsis">"Aku akan menjadi lebih kuat..."</p>
                <div class="hero-buttons">
                    <button class="btn-primary" onclick="window.location.href='detail.html?slug=${encodeURIComponent(seriesSlug)}'">▶ Tonton Sekarang</button>
                    <button class="btn-outline" onclick="window.location.href='detail.html?slug=${encodeURIComponent(seriesSlug)}'">ℹ Detail</button>
                </div>
            </div>
        </div>
    `;
}

// Load Data Utama
async function loadHomeData() {
    try {
        const res = await fetch(`${API_BASE}/home`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        
        const popular = json.data.popularToday?.animeList || [];
        const latest = json.data.latestRelease?.animeList || [];

        // 1. Hero Section (Ambil dari data populer)
        const heroAnime = popular.length > 1 ? popular[1] : (latest.length > 0 ? latest[0] : null);
        if (heroAnime) renderHero(heroAnime);

        // 2. Trending (6 Anime)
        trendingList.innerHTML = "";
        popular.slice(0, 6).forEach((anime, i) => {
            trendingList.appendChild(createAnimeCard(anime, true, i));
        });

        // 3. Terbaru (12 Anime)
        latestList.innerHTML = "";
        latest.slice(0, 12).forEach((anime, i) => {
            latestList.appendChild(createAnimeCard(anime, false, i));
        });

  // Di dalam loadHomeData() catch block:
} catch (err) {
    console.error(err);
    // Kalau API mati / network error, lempar ke halaman error
    window.location.href = `404.html?code=api`; 
    }
}

// Fungsi Tombol Filter
function applyFilter() {
    const genre = document.getElementById("filter-genre").value;
    const status = document.getElementById("filter-status").value;
    
    let url = `search.html?`;
    if (genre) url += `genre=${encodeURIComponent(genre)}&`;
    if (status) url += `status=${encodeURIComponent(status)}`;
    
    window.location.href = url;
}

loadHomeData();
