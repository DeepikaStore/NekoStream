const API_BASE = "https://nexora-anime-api.vercel.app/oploverz";
const PER_PAGE = 20;

function extractSlugFromUrl(url) {
    if (!url) return "";
    try {
        const u = new URL(url);
        const parts = u.pathname.split("/").filter(Boolean);
        return parts[parts.length - 1] || "";
    } catch { return ""; }
}

function extractSeriesSlug(anime) {
    if (anime.seriesSlug) return anime.seriesSlug;
    if (anime.seriesId) return anime.seriesId;
    const seriesHref = anime.seriesHref || anime.seriesLink || anime.seriesUrl || "";
    if (seriesHref) {
        const s = extractSlugFromUrl(seriesHref);
        if (s) return s;
    }
    const href = anime.href || anime.link || anime.url || "";
    if (href) {
        const fallback = extractSlugFromUrl(href);
        return fallback.replace(/-episode-?\d+.*$/i, "").replace(/-subtitle-indonesia.*$/i, "").trim();
    }
    return "";
}

function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

// --- LOGIKA FAVORIT ---
function getFavorites() { return JSON.parse(localStorage.getItem('neko_favs')) || []; }
function isFavorite(slug) { return getFavorites().some(f => f.slug === slug); }
function toggleFavorite(anime, event) {
    if (event) event.stopPropagation(); // Biar nggak ke-redirect pas klik love
    let favs = getFavorites();
    const index = favs.findIndex(f => f.slug === anime.slug);
    if (index > -1) { favs.splice(index, 1); } else { favs.push(anime); }
    localStorage.setItem('neko_favs', JSON.stringify(favs));
    return index === -1; // Return true kalau baru ditambahin
}

// --- LOGIKA RIWAYAT ---
function getHistory() { return JSON.parse(localStorage.getItem('neko_history')) || []; }
function saveHistory(item) {
    let history = getHistory();
    history = history.filter(h => h.slug !== item.slug);
    history.unshift({ ...item, timestamp: Date.now() });
    localStorage.setItem('neko_history', JSON.stringify(history.slice(0, 20))); // Max 20
}

// --- KARTU ANIME UNIVERSAL ---
function createAnimeCard(anime, isTrending = false, index = 0) {
    const card = document.createElement("div");
    card.className = isTrending ? "anime-card trending-card" : "anime-card";
    
    const poster = anime.poster || "https://via.placeholder.com/200x280?text=No+Image";
    const title = anime.seriesName || anime.title || "Tanpa Judul";
    const episode = anime.episode || "-";
    const seriesSlug = extractSeriesSlug(anime);
    const rating = (9.0 - (index * 0.1)).toFixed(1);
    const faved = isFavorite(seriesSlug);

    let badgeHTML = isTrending ? `<div class="rank-badge">#${index + 1}</div>` : "";
    let heartHTML = `<button class="heart-btn ${faved ? 'active' : ''}" onclick='toggleFav(event, ${JSON.stringify(JSON.stringify({slug: seriesSlug, title: title, poster: poster}))})'>❤️</button>`;

    card.innerHTML = `
        ${badgeHTML}
        ${heartHTML}
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

function toggleFav(event, jsonStr) {
    const anime = JSON.parse(jsonStr);
    const isNowFav = toggleFavorite(anime, event);
    const btn = event.currentTarget;
    if (isNowFav) { btn.classList.add('active'); } else { btn.classList.remove('active'); }
}
