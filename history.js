const historyContainer = document.getElementById("history-container");

function loadHistoryPage() {
    const history = getHistory();
    
    if (history.length === 0) {
        historyContainer.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <h3>Belum ada riwayat nonton 📺</h3>
                <p>Anime yang lu tonton bakal muncul di sini.</p>
                <a href="index.html" class="btn-primary" style="display:inline-block; margin-top:15px; text-decoration:none;">Mulai Nonton</a>
            </div>`;
        return;
    }

    historyContainer.innerHTML = "";
    history.forEach((item, i) => {
        const card = document.createElement("div");
        card.className = "anime-card";
        card.innerHTML = `
            <img src="${item.poster}" referrerpolicy="no-referrer" onerror="this.src='https://via.placeholder.com/200x280?text=No+Image'">
            <div class="card-info">
                <h3>${item.animeName}</h3>
                <div class="meta"><span style="color: var(--primary); font-weight: 600;">${item.episodeTitle}</span></div>
            </div>
        `;
        card.onclick = () => {
            window.location.href = `watch.html?slug=${encodeURIComponent(item.slug)}&anime=${encodeURIComponent(item.animeName)}&poster=${encodeURIComponent(item.poster)}&series=${encodeURIComponent(item.seriesSlug)}`;
        };
        historyContainer.appendChild(card);
    });
}

loadHistoryPage();
