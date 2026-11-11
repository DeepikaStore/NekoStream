const slug = getQueryParam("slug");
const animeName = getQueryParam("anime") || "";
const playerContainer = document.getElementById("player-container");
const serverListEl = document.getElementById("server-list");
const watchTitle = document.getElementById("watch-title");

let servers = [];

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

        const data = json.data;
        servers = extractServers(data);

        if (servers.length === 0) {
            const directUrl = data.streamUrl || data.iframeUrl || data.url || "";
            if (directUrl) {
                servers = [{ name: "Default", url: directUrl }];
            }
        }

        if (servers.length === 0) {
            playerContainer.innerHTML = `
                <p class="error">
                    Server video tidak tersedia dari API.<br>
                    <a href="${buildOploverzFallbackUrl()}" target="_blank" style="color:#e94560;margin-top:10px;display:inline-block;">
                        Buka di Oploverz (fallback)
                    </a>
                </p>`;
            return;
        }

        renderServers();
        playServer(0);
        renderEpisodeNav(data);
    } catch (err) {
        console.error(err);
        playerContainer.innerHTML = `
            <p class="error">
                Gagal memuat episode.<br>
                <a href="${buildOploverzFallbackUrl()}" target="_blank" style="color:#e94560;margin-top:10px;display:inline-block;">
                    Buka di Oploverz (fallback)
                </a>
            </p>`;
    }
}

function extractServers(data) {
    const list = data.servers || data.streamServers || data.serverList || data.streamingServers || [];
    return list.map(s => {
        const name = s.name || s.server || s.provider || s.title || "Server";
        const url = s.url || s.iframeUrl || s.embedUrl || s.link || s.streamUrl || "";
        return { name, url };
    }).filter(s => s.url);
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
            sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
        ></iframe>
    `;
}

function renderEpisodeNav(data) {
    const nav = document.getElementById("episode-nav");
    nav.innerHTML = "";
    const prev = data.prevEpisode || data.prev;
    const next = data.nextEpisode || data.next;

    if (prev) {
        const prevSlug = prev.slug || prev.episodeId || extractSlugFromUrl(prev.href || prev.link || "");
        if (prevSlug) {
            const a = document.createElement("a");
            a.href = `watch.html?slug=${encodeURIComponent(prevSlug)}&anime=${encodeURIComponent(animeName)}`;
            a.textContent = "← Episode Sebelumnya";
            nav.appendChild(a);
        }
    }

    if (next) {
        const nextSlug = next.slug || next.episodeId || extractSlugFromUrl(next.href || next.link || "");
        if (nextSlug) {
            const a = document.createElement("a");
            a.href = `watch.html?slug=${encodeURIComponent(nextSlug)}&anime=${encodeURIComponent(animeName)}`;
            a.textContent = "Episode Berikutnya →";
            nav.appendChild(a);
        }
    }
}

function buildOploverzFallbackUrl() {
    return `https://oploverz.am/${slug || ""}`;
}

loadEpisode();
