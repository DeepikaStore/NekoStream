const slug = getQueryParam("slug");
const animeName = getQueryParam("anime") || "";
const posterUrl = getQueryParam("poster") || "";
const seriesSlug = getQueryParam("series") || "";

const playerContainer = document.getElementById("player-container");
const serverListEl = document.getElementById("server-list");
const watchTitle = document.getElementById("watch-title");
const episodeNav = document.getElementById("episode-nav");

let servers = [];
let currentData = null;

async function loadEpisode() {
    if (!slug) {
        playerContainer.innerHTML = `<p class="error">Slug episode tidak ditemukan.</p>`;
        return;
    }

    watchTitle.textContent = animeName ? `Nonton: ${animeName}` : "Memuat video...";

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
        playServer(0); // Otomatis play server pertama
        renderEpisodeNav(currentData);
        
        // Update Judul (kalau API nyediain judul episode)
        if (currentData.title) {
            watchTitle.textContent = `Nonton: ${currentData.title}`;
        }

    } catch (err) {
        console.error(err);
        playerContainer.innerHTML = `<p class="error">Gagal memuat video. API mungkin sedang down.</p>`;
    }
}

// Fungsi buat nyari URL video di dalam response API
function extractServers(data) {
    const list = [];
    
    // 1. Ambil dari nested details (Kunci utama API Nexora/Oploverz)
    const details = data.details || data.detail || data;
    const streamUrl = details.streamingUrl || details.streamUrl || details.iframeUrl || details.embedUrl || details.playerUrl || "";

    if (streamUrl) {
        list.push({ name: "Server Utama", url: streamUrl });
    }

    // 2. Fallback kalau ada multiple server / mirror
    const multiServer = data.servers || details.servers || data.mirrors || details.mirrors || [];
    if (Array.isArray(multiServer)) {
        multiServer.forEach(s => {
            const name = s.name || s.server || s.provider || "Server Mirror";
            const url = s.url || s.iframeUrl || s.embedUrl || s.link || s.streamUrl || s.streamingUrl || "";
            if (url) list.push({ name, url });
        });
    }

    return list;
}

// Render tombol-tombol server (kalau ada lebih dari 1)
function renderServers() {
    serverListEl.innerHTML = "";
    if (servers.length <= 1) return; // Kalau cuma 1 server, sembunyiin tombolnya

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

// Fungsi utama buat nampilin iframe
function playServer(index) {
    const server = servers[index];
    if (!server || !server.url) {
        playerContainer.innerHTML = `<p class="error">Link video tidak valid.</p>`;
        return;
    }

    let embedUrl = server.url;
    // Pastiin URL pake HTTPS
    if (embedUrl.startsWith("//")) {
        embedUrl = "https:" + embedUrl;
    }

    // Render Iframe
    playerContainer.innerHTML = `
        <iframe
            src="${embedUrl}"
            allowfullscreen
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            referrerpolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-forms"
        ></iframe>
    `;

    // --- SIMPAN KE RIWAYAT (HISTORY) ---
    // Dipanggil setiap kali server berhasil dimuat
    const historyItem = {
        slug: slug,
        animeName: animeName || (currentData?.animeTitle ? currentData.animeTitle : "Anime Tanpa Judul"),
        episodeTitle: currentData?.title || currentData?.episode || "Episode",
        poster: posterUrl || "https://via.placeholder.com/200x280",
        seriesSlug: seriesSlug || ""
    };
    saveHistory(historyItem);
}

// Render tombol Next / Prev Episode
function renderEpisodeNav(data) {
    episodeNav.innerHTML = "";
    
    const details = data.details || data;
    const prev = data.prevEpisode || data.prev || details.prevEpisode || details.prev;
    const next = data.nextEpisode || data.next || details.nextEpisode || details.next;

    // Tombol Prev
    if (prev) {
        const prevSlug = prev.slug || prev.episodeId || extractSlugFromUrl(prev.href || prev.link || prev.url || "");
        if (prevSlug) {
            const a = document.createElement("a");
            // Bawa parameter poster & series biar history tetep jalan
            a.href = `watch.html?slug=${encodeURIComponent(prevSlug)}&anime=${encodeURIComponent(animeName)}&poster=${encodeURIComponent(posterUrl)}&series=${encodeURIComponent(seriesSlug)}`;
            a.innerHTML = "← Episode Sebelumnya";
            episodeNav.appendChild(a);
        }
    }

    // Tombol Next
    if (next) {
        const nextSlug = next.slug || next.episodeId || extractSlugFromUrl(next.href || next.link || next.url || "");
        if (nextSlug) {
            const a = document.createElement("a");
            a.href = `watch.html?slug=${encodeURIComponent(nextSlug)}&anime=${encodeURIComponent(animeName)}&poster=${encodeURIComponent(posterUrl)}&series=${encodeURIComponent(seriesSlug)}`;
            a.innerHTML = "Episode Berikutnya →";
            episodeNav.appendChild(a);
        }
    }
}

// Jalanin fungsi
loadEpisode();
