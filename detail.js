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
        detailEl.innerHTML = `<p class="error">Gagal memuat detail anime.</p>`;
    }
}

function renderDetail(data) {
    const title = data.title || data.seriesName || "Tanpa Judul";
    const poster = data.poster || "https://via.placeholder.com/240x340?text=No+Image";
    const synopsis = data.synopsis || data.description || "Tidak ada sinopsis.";
    const genres = data.genres || data.genreList || [];
    const status = data.status || "-";
    const type = data.type || "-";
    const score = data.score || data.rating || "-";
    const episodes = data.episodes || data.episodeList || [];

    const genreHtml = genres.map(g => {
        const name = typeof g === "string" ? g : (g.name || g.title || "-");
        return `<span>${name}</span>`;
    }).join("");

    const episodeHtml = episodes.map(ep => {
        const epSlug = ep.slug || ep.episodeId || ep.id || extractSlugFromUrl(ep.href || ep.link || "");
        const epTitle = ep.title || ep.name || ep.episode || "Episode";
        return `<a class="episode-item" href="watch.html?slug=${encodeURIComponent(epSlug)}&anime=${encodeURIComponent(title)}">${epTitle}</a>`;
    }).join("");

    detailEl.innerHTML = `
        <img src="${poster}" alt="${title}" onerror="this.src='https://via.placeholder.com/240x340?text=No+Image'">
        <div class="info">
            <h2>${title}</h2>
            <p><span class="label">Tipe:</span> ${type}</p>
            <p><span class="label">Status:</span> ${status}</p>
            <p><span class="label">Score:</span> ${score}</p>
            <div class="genres">${genreHtml || "<span>-</span>"}</div>
            <p class="synopsis">${synopsis}</p>
        </div>
    `;

    if (episodes.length > 0) {
        const epSection = document.createElement("div");
        epSection.innerHTML = `<h2 style="margin-top:30px;color:#e94560;">📺 Daftar Episode</h2><div class="episode-list">${episodeHtml}</div>`;
        document.querySelector("main").appendChild(epSection);
    }
}

loadDetail();
