const favContainer = document.getElementById("fav-container");

function loadFavorites() {
    const favs = getFavorites();
    if (favs.length === 0) {
        favContainer.innerHTML = `<div class="empty-state"><h3>Belum ada anime favorit</h3><p>Klik ikon ❤️ di kartu anime untuk menyimpannya.</p></div>`;
        return;
    }
    favContainer.innerHTML = "";
    favs.forEach((anime, i) => favContainer.appendChild(createAnimeCard(anime, false, i)));
}
loadFavorites();
