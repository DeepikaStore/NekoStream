const API_BASE = "https://nexora-anime-api.vercel.app/oploverz";

const popularList = document.getElementById("popular-list");
const latestList = document.getElementById("latest-list");

function createAnimeCard(anime) {
    const card = document.createElement("div");
    card.className = "anime-card";

    const poster = anime.poster || "https://via.placeholder.com/200x280?text=No+Image";
    const title = anime.seriesName || anime.title || "Judul Tidak Diketahui";
    const episode = anime.episode || "-";
    const type = anime.type || "-";
    const status = anime.status || "";

    const metaParts = [`📺 ${type}`, `🎬 ${episode}`];
    if (status) metaParts.push(`📌 ${status}`);

    card.innerHTML = `
        <img src="${poster}" alt="${title}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x280?text=No+Image'">
        <div class="card-info">
            <h3>${title}</h3>
            <div class="meta">${metaParts.map(m => `<span>${m}</span>`).join("")}</div>
        </div>
    `;

    card.addEventListener("click", () => {
        if (anime.href) {
            window.open(anime.href, "_blank");
        }
    });

    return card;
}

async function fetchHome() {
    try {
        const response = await fetch(`${API_BASE}/home`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const json = await response.json();

        if (json.statusCode !== 200 || !json.data) {
            throw new Error("Response tidak valid");
        }

        const popularData = json.data.popularToday?.animeList || [];
        const latestData = json.data.latestRelease?.animeList || [];

        popularList.innerHTML = "";
        latestList.innerHTML = "";

        if (popularData.length === 0) {
            popularList.innerHTML = `<p class="error">Tidak ada data populer.</p>`;
        } else {
            popularData.forEach(anime => {
                popularList.appendChild(createAnimeCard(anime));
            });
        }

        if (latestData.length === 0) {
            latestList.innerHTML = `<p class="error">Tidak ada data rilis terbaru.</p>`;
        } else {
            latestData.forEach(anime => {
                latestList.appendChild(createAnimeCard(anime));
            });
        }
    } catch (error) {
        console.error("Gagal memuat data:", error);
        popularList.innerHTML = `<p class="error">Gagal memuat data populer. Coba refresh.</p>`;
        latestList.innerHTML = `<p class="error">Gagal memuat data rilis terbaru. Coba refresh.</p>`;
    }
}

fetchHome();
