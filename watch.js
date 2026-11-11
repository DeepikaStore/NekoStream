const slug = getQueryParam("slug");
const animeName = getQueryParam("anime") || "";
const posterUrl = getQueryParam("poster") || "";
const seriesSlug = getQueryParam("series") || "";

// ... (kode atas sama kayak sebelumnya) ...

function playServer(index) {
    const server = servers[index];
    if (!server || !server.url) return;

    let embedUrl = server.url;
    if (embedUrl.startsWith("//")) embedUrl = "https:" + embedUrl;

    playerContainer.innerHTML = `
        <iframe src="${embedUrl}" allowfullscreen allow="autoplay; encrypted-media; fullscreen" referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-forms"></iframe>
    `;

    // SIMPAN KE HISTORY SAAT VIDEO DIPUTAR
    const historyItem = {
        slug: slug,
        animeName: animeName || "Anime",
        episodeTitle: currentData?.title || currentData?.episode || "Episode",
        poster: posterUrl,
        seriesSlug: seriesSlug
    };
    saveHistory(historyItem);
}

// ... (sisa kode watch.js sama aja, cuma pastiin di renderEpisodeNav pass poster & series)
// Contoh di renderEpisodeNav:
// a.href = `watch.html?slug=${...}&anime=${...}&poster=${...}&series=${...}`;
