const historyContainer = document.getElementById("history-container");

function loadHistoryPage() {
    const history = getHistory();
    if (history.length === 0) {
        historyContainer.innerHTML = `<div class="empty-state"><h3>Belum ada riwayat</h3><p>Anime yang lu tonton bakal muncul di sini.</p></div>`;
        return;
    }
    historyContainer.innerHTML = "";
    history.forEach((item, i) => {
        // Karena history nyimpen data episode, kita bikin kartu custom
        const card = document.createElement("div");
        card.className = "anime-card";
        card.innerHTML = `
            <img src="${item.poster}" referrerpolicy="no-referrer">
            <div class="card-info">
                <h3>${item.animeName}</h3>
                <div class="meta"><span style="color: var(--primary);">${item.episodeTitle}</span></div>
            </div>
        `;
        card.onclick = () => window.location.href = `watch.html?slug=${encodeURIComponent(item.slug)}&anime=${encodeURIComponent(item.animeName)}&poster=${encodeURIComponent(item.poster)}&series=${encodeURIComponent(item.seriesSlug)}`;
        historyContainer.appendChild(card);
    });
}
loadHistoryPage();
