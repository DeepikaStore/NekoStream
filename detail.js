const slug = getQueryParam("slug");
const detailEl = document.getElementById("anime-detail");

async function loadDetail() {
    if (!slug) {
        detailEl.innerHTML = `<p class="error">Slug anime tidak ditemukan.</p>`;
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/anime/${encodeURIComponent(slug)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.data) throw new Error("Data kosong");

        renderDetail(json.data);
    } catch (err) {
        console.error(err);
        detailEl.innerHTML = `<p class="error">Gagal memuat detail anime (slug: ${slug}).</p>`;
    }
}

function renderDetail(data) {
    // 1. Ambil data anime (handle berbagai format API)
    const anime = data.anime || data.details || data;
    const title = anime.title || anime.seriesName || anime.name || "Tanpa Judul";
    const poster = anime.poster || anime.image || "https://via.placeholder.com/240x340?text=No+Image";
    const synopsis = anime.synopsis || anime.description || anime.sinopsis || "Tidak ada sinopsis.";
    const status = anime.status || "-";
    const type = anime.type || anime.tipe || "-";
    const score = anime.score || anime.rating || "-";
    const studios = anime.studios || anime.studio || "-";
    const released = anime.released || anime.aired || anime.releaseDate || "-";

    // 2. Handle Genre (Biar nggak muncul [object Object])
    let genres = anime.genres || anime.genreList || anime.genre || [];
    if (typeof genres === "string") genres = genres.split(",").map(g => g.trim());
    if (!Array.isArray(genres)) genres = [];

    const genreHtml = genres.map(g => {
        let name = "-";
        if (typeof g === "string") name = g;
        else if (typeof g === "object" && g !== null) name = g.name || g.title || "-";
        return `<span>${name}</span>`;
    }).join("") || "<span>-</span>";

    // 3. Ambil List Episode
    let episodes = anime.episodes || anime.episodeList || anime.episode_list || [];
    if (!Array.isArray(episodes)) episodes = [];

    // 4. Render HTML Utama (Grid Kiri Kanan)
    detailEl.innerHTML = `
        <img src="${poster}" alt="${title}" referrerpolicy="no-referrer" onerror="this.src='https://via.placeholder.com/240x340?text=No+Image'">
        <div class="info">
            <h2>${title}</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                <p><span class="label">Tipe:</span> ${type}</p>
                <p><span class="label">Status:</span> ${status}</p>
                <p><span class="label">Score:</span> ${score}</p>
                <p><span class="label">Studio:</span> ${studios}</p>
                <p><span class="label">Rilis:</span> ${released}</p>
            </div>
            <div class="genres">${genreHtml}</div>
            <p class="synopsis">${synopsis}</p>
        </div>
    `;

    // 5. Render Daftar Episode
    if (episodes.length > 0) {
        const episodeHtml = episodes.map(ep => {
            const epSlug = ep.slug || ep.episodeId || ep.id || extractSlugFromUrl(ep.href || ep.link || ep.url || "");
            const epTitle = ep.title || ep.name || ep.episode || "Episode";
            // Bawa parameter poster & series biar masuk history
            return `<a class="episode-item" href="watch.html?slug=${encodeURIComponent(epSlug)}&anime=${encodeURIComponent(title)}&poster=${encodeURIComponent(poster)}&series=${encodeURIComponent(slug)}">${epTitle}</a>`;
        }).join("");

        const epSection = document.createElement("div");
        epSection.style.marginTop = "30px";
        epSection.innerHTML = `
            <h2 style="color:#e94560; margin-bottom: 15px;">📺 Daftar Episode</h2>
            <div class="episode-list">${episodeHtml}</div>
        `;
        document.querySelector(".content-wrapper").appendChild(epSection);
    }
}

loadDetail();
