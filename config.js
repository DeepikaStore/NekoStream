const API_BASE = "https://nexora-anime-api.vercel.app/oploverz";
const PER_PAGE = 20;

function extractSlugFromUrl(url) {
    if (!url) return "";
    try {
        const u = new URL(url);
        const parts = u.pathname.split("/").filter(Boolean);
        return parts[parts.length - 1] || "";
    } catch {
        return "";
    }
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
        const cleaned = fallback.replace(/-episode-?\d+.*$/i, "").replace(/-subtitle-indonesia.*$/i, "").trim();
        if (cleaned) return cleaned;
    }
    return "";
}

function createAnimeCard(anime) {
    const card = document.createElement("div");
    card.className = "anime-card";
    const poster = anime.poster || "https://via.placeholder.com/200x280?text=No+Image";
    const title = anime.seriesName || anime.title || "Tanpa Judul";
    const episode = anime.episode || "-";
    const type = anime.type || "TV";
    const seriesSlug = extractSeriesSlug(anime);

    card.innerHTML = `
        <img src="${poster}" alt="${title}" loading="lazy" referrerpolicy="no-referrer" onerror="this.src='https://via.placeholder.com/200x280?text=No+Image'">
        <div class="card-info">
            <h3>${title}</h3>
            <div class="meta"><span>📺 ${type}</span><span>🎬 ${episode}</span></div>
        </div>
    `;
    card.addEventListener("click", () => {
        if (seriesSlug) window.location.href = `detail.html?slug=${encodeURIComponent(seriesSlug)}`;
    });
    return card;
}

function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

// --- FITUR HISTORY (LANJUT NONTON) ---
function saveHistory(item) {
    let history = JSON.parse(localStorage.getItem('nekostream_history')) || [];
    history = history.filter(h => h.slug !== item.slug); // Hapus jika sudah ada
    history.unshift({ ...item, timestamp: Date.now() }); // Taruh paling atas
    history = history.slice(0, 10); // Batasi 10 history terakhir
    localStorage.setItem('nekostream_history', JSON.stringify(history));
}

function getHistory() {
    return JSON.parse(localStorage.getItem('nekostream_history')) || [];
}
