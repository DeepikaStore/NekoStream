const top10Container = document.getElementById("top10-container");

async function loadTop10() {
    try {
        const res = await fetch(`${API_BASE}/home`);
        const json = await res.json();
        const popular = json.data?.popularToday?.animeList || [];
        
        top10Container.innerHTML = "";
        
        popular.slice(0, 10).forEach((anime, i) => {
            const slug = extractSeriesSlug(anime);
            const title = anime.seriesName || anime.title || "Anime";
            const poster = anime.poster || "https://via.placeholder.com/200x280";
            
            const item = document.createElement("div");
            item.className = "top10-item";
            item.innerHTML = `
                <div class="top10-rank">#${i + 1}</div>
                <img src="${poster}" class="top10-img" referrerpolicy="no-referrer">
                <div class="top10-info">
                    <h3>${title}</h3>
                    <p>${anime.episode || 'Ongoing'}</p>
                </div>
            `;
            item.onclick = () => {
                if (slug) window.location.href = `detail.html?slug=${encodeURIComponent(slug)}`;
            };
            top10Container.appendChild(item);
        });
    } catch (err) {
        top10Container.innerHTML = `<p class="error">Gagal memuat Top 10. API mungkin down.</p>`;
    }
}
loadTop10();
