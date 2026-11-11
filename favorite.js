const favContainer = document.getElementById("fav-container");

function loadFavoritesPage() {
    const favs = getFavorites();
    
    if (favs.length === 0) {
        favContainer.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <h3>Belum ada anime favorit nih 😿</h3>
                <p>Klik ikon ❤️ di kartu anime buat nyimpennya ke sini.</p>
                <a href="index.html" class="btn-primary" style="display:inline-block; margin-top:15px; text-decoration:none;">Cari Anime</a>
            </div>`;
        return;
    }

    favContainer.innerHTML = "";
    favs.forEach((anime, i) => favContainer.appendChild(createAnimeCard(anime, false, i)));
}

loadFavoritesPage();
