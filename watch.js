const slug = getQueryParam("slug");
const animeName = getQueryParam("anime") || "";
const playerContainer = document.getElementById("player-container");
const serverListEl = document.getElementById("server-list");
const watchTitle = document.getElementById("watch-title");

let servers = [];
let currentData = null;

async function loadEpisode() {
    if (!slug) {
        playerContainer.innerHTML = `<p class="error">Episode tidak ditemukan.</p>`;
        return;
    }

    watchTitle.textContent = animeName ? `Nonton: ${animeName}` : "Nonton Anime";

    try {
        const res = await fetch(`${API_BASE}/episode/${encodeURIComponent(slug)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.data) throw new Error("Data kosong");

        currentData = json.data;
        servers = extractServers(currentData);

        if (servers.length === 0) {
            playerContainer.innerHTML = `<p class="error">Server video tidak tersedia dari API.</p>`;
            return;
        }

        renderServers();
        playServer(0);
        renderEpisodeNav(currentData);
    } catch (err) {
        console.error(err);
        playerContainer.innerHTML = `<p class="error">Gagal memuat episode (slug: ${slug}).</p>`;
    }
}

function extractServers(data) {
    const list = [];

    const details = data.details || data.detail || data;
    const streamUrl = details.streamingUrl || details.streamUrl || details.iframeUrl || details.embedUrl || details.playerUrl || "";

    if (streamUrl) {
        list.push({ name: "Default Server", url: streamUrl });
    }

    const multiServer = data.servers || data.streamServers || data.serverList || data.streamingServers || details.servers || [];
    if (Array.isArray(multiServer)) {
        multiServer.forEach(s => {
            const name = s.name || s.server || s.provider || s.title || "Server";
            const url = s.url || s.iframeUrl || s.embedUrl || s.link || s.streamUrl || s.streamingUrl || "";
            if (url) list.push({ name, url });
        });
    }

    const mirror = data.mirror || data.mirrors || details.mirror || [];
    if (Array.isArray(mirror)) {
        mirror.forEach((m, i) => {
            const name = m.name || m.provider || m.host || `Mirror ${i + 1}`;
            const url = m.url || m.link || m.embedUrl || m.iframeUrl || "";
            if (url) list.push({ name, url });
        });
    }

    return list;
}

function renderServers() {
    serverListEl.innerHTML = "";
    servers.forEach((s, i) => {
        const btn = document.createElement("button");
        btn.textContent = s.name;
        if (i === 0) btn.classList.add("active");
        btn.addEventListener("click", () => {
            document.querySelectorAll(".server-list button").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            playServer(i);
        });
        serverListEl.appendChild(btn);
    });
}

function playServer(index) {
    const server = servers[index];
    if (!server || !server.url) {
        playerContainer.innerHTML = `<p class="error">Server tidak tersedia.</p>`;
        return;
    }

    let embedUrl = server.url;
    if (embedUrl.startsWith("//")) embedUrl = "https:" + embedUrl;

    playerContainer.innerHTML = `
        <iframe
            src="${embedUrl}"
            allowfullscreen
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            referrerpolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-forms"
        ></iframe>
    `;
}

function renderEpisodeNav(data) {
    const nav = document.getElementById("episode-nav");
    nav.innerHTML = "";

    const details = data.details || data;
    const prev = data.prevEpisode || data.prev || details.prevEpisode || details.prev;
    const next = data.nextEpisode || data.next || details.nextEpisode || details.next;

    if (prev) {
        const prevSlug = prev.slug || prev.episodeId || extractSlugFromUrl(prev.href || prev.link || prev.url || "");
        if (prevSlug) {
            const a = document.createElement("a");
            a.href = `watch.html?slug=${encodeURIComponent(prevSlug)}&anime=${encodeURIComponent(animeName)}`;
            a.textContent = "← Episode Sebelumnya";
            nav.appendChild(a);
        }
    }

    if (next) {
        const nextSlug = next.slug || next.episodeId || extractSlugFromUrl(next.href || next.link || next.url || "");
        if (nextSlug) {
            const a = document.createElement("a");
            a.href = `watch.html?slug=${encodeURIComponent(nextSlug)}&anime=${encodeURIComponent(animeName)}`;
            a.textContent = "Episode Berikutnya →";
            nav.appendChild(a);
        }
    }
}

loadEpisode();
