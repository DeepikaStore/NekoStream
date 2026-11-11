const API_BASE = "https://nexora-anime-api.vercel.app/oploverz";
const PER_PAGE = 20;

function createAnimeCard(anime) {
    const card = document.createElement("div");
    card.className = "anime-card";

    const poster = anime.poster || "https://via.placeholder.com/200x280?text=No+Image";
    const title = anime.seriesName || anime.title || "Tanpa Judul";
    const episode = anime.episode || "-";
    const type = anime.type || "TV";
    const slug = anime.slug || anime.animeId || anime.id || "";
    const href = anime.href || anime.link || anime.url || "";

    card.innerHTML = `
        <img src="${poster}" alt="${title}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x280?text=No+Image'">
        <div class="card-info">
            <h3>${title}</h3>
            <div class="meta"><span>📺 ${type}</span><span>🎬 ${episode}</span></div>
        </div>
    `;

    card.addEventListener("click", () => {
        if (slug) {
            window.location.href = `detail.html?slug=${encodeURIComponent(slug)}`;
        } else if (href) {
            const extracted = extractSlugFromUrl(href);
            if (extracted) {
                window.location.href = `detail.html?slug=${encodeURIComponent(extracted)}`;
            }
        }
    });

    return card;
}

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

function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}
