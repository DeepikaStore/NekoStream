async function loadGenres() {
    // Hardcode list genre karena API /genre lagi error
    const genres = [
        { id: "action", name: "Action" },
        { id: "adventure", name: "Adventure" },
        { id: "comedy", name: "Comedy" },
        { id: "drama", name: "Drama" },
        { id: "fantasy", name: "Fantasy" },
        { id: "horror", name: "Horror" },
        { id: "mecha", name: "Mecha" },
        { id: "music", name: "Music" },
        { id: "mystery", name: "Mystery" },
        { id: "psychological", name: "Psychological" },
        { id: "romance", name: "Romance" },
        { id: "sci-fi", name: "Sci-Fi" },
        { id: "slice-of-life", name: "Slice of Life" },
        { id: "sports", name: "Sports" },
        { id: "supernatural", name: "Supernatural" },
        { id: "thriller", name: "Thriller" }
    ];

    genreListEl.innerHTML = "";
    genres.forEach(g => {
        const card = document.createElement("div");
        card.className = "genre-card";
        card.textContent = g.name;
        card.addEventListener("click", () => loadByGenre(g.id, g.name));
        genreListEl.appendChild(card);
    });
}
