const heroSection = document.getElementById("hero-section");
const trendingList = document.getElementById("trending-list");
const latestList = document.getElementById("latest-list");

// Fungsi bikin kartu anime umum
function createAnimeCard(anime, isTrending = false, index = 0) {
    const card = document.createElement("div");
    card.className = isTrending ? "anime-card trending-card" : "anime-card";
    
    const poster = anime.poster || "https://via.placeholder.com/200x280?text=No+Image";
    const title = anime.seriesName || anime.title || "Tanpa Judul";
    const episode = anime.episode || "-";
    const seriesSlug = extractSeriesSlug(anime);
    
    // Dummy rating karena API nggak nyediain rating di home
    const rating = (9.0 - (index * 0.1)).toFixed(1); 

    let badgeHTML = "";
    if (isTrending) {
        badgeHTML = `<div class="rank-badge">#${index + 1}</div>`;
    }

    card.innerHTML = `
        ${badgeHTML}
        <img src="${poster}" alt="${title}" loading="lazy" referrerpolicy="no-referrer" onerror="this.src='https://via.placeholder.com/200x280?text=No+Image'">
        <div class="card-info">
            <h3>${title}</h3>
            <div class="meta">
                <span class="rating">⭐ ${rating} • ${episode}</span>
            </div>
        </div>
    `;

    card.addEventListener("click", () => {
        if (seriesSlug) window.location.href = `detail.html?slug=${encodeURIComponent(seriesSlug)}`;
    });

    return card;
}

// Fungsi Load Hero
function renderHero(anime) {
    const poster = anime.poster || "https://via.placeholder.com/1920x1080?text=No+Image";
    const title = anime.seriesName || anime.title || "Anime Populer";
    const synopsis = "Aku akan menjadi lebih kuat..."; // Dummy synopsis karena API nggak nyediain di home
    const seriesSlug = extractSeriesSlug(anime);

    heroSection.innerHTML = `
        <div class="hero-slide" style="background-image: url('${poster}');">
            <div class="hero-overlay">
                <h1 class="hero-title">${title}</h1>
                <p class="hero-synopsis">${synopsis}</p>
                <div class="hero-buttons">
                    <button class="btn-primary" onclick="window.location.href='detail.html?slug=${encodeURIComponent(seriesSlug)}'">▶ Tonton Sekarang</button>
                    <button class="btn-outline" onclick="window.location.href='detail.html?slug=${encodeURIComponent(seriesSlug)}'">ℹ Detail</button>
                </div>
            </div>
        </div>
    `;
}

// Fungsi Utama Load Data
async function loadHomeData() {
    try {
        const res = await fetch(`${API_BASE}/home`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        
        const popular = json.data.popularToday?.animeList || [];
        const latest = json.data.latestRelease?.animeList || [];

        if (popular.length === 0 && latest.length === 0) {
            throw new Error("Data kosong");
        }

        // 1. SETUP HERO (Ambil anime ke-2 dari popular biar agak random)
        const heroAnime = popular.length > 1 ? popular[1] : (latest.length > 0 ? latest[0] : null);
        if (heroAnime) {
            renderHero(heroAnime);
        } else {
            heroSection.innerHTML = `<p class="error">Tidak ada data untuk Hero.</p>`;
        }

        // 2. SETUP TRENDING (Ambil 6 dari popular)
        trendingList.innerHTML = "";
        const trendingAnime = popular.slice(0, 6);
        if (trendingAnime.length > 0) {
            trendingAnime.forEach((anime, i) => trendingList.appendChild(createAnimeCard(anime, true, i)));
        } else {
            trendingList.innerHTML = `<p class="error">Tidak ada data trending.</p>`;
        }

        // 3. SETUP TERBARU (Ambil 12 dari latest)
        latestList.innerHTML = "";
        const latestAnime = latest.slice(0, 12);
        if (latestAnime.length > 0) {
            latestAnime.forEach((anime, i) => latestList.appendChild(createAnimeCard(anime, false, i)));
        } else {
            latestList.innerHTML = `<p class="error">Tidak ada data terbaru.</p>`;
        }

    } catch (err) {
        console.error(err);
        heroSection.innerHTML = `<p class="error" style="padding:20px;">Gagal memuat banner. API mungkin down.</p>`;
        trendingList.innerHTML = `<p class="error">Gagal memuat data.</p>`;
        latestList.innerHTML = `<p class="error">Gagal memuat data.</p>`;
    }
}

loadHomeData();
