const heroSection = document.getElementById("hero-section");
const trendingList = document.getElementById("trending-list");
const latestList = document.getElementById("latest-list");

// ... (Biarkan fungsi createAnimeCard, renderHero, loadHomeData SAMA PERSIS kayak sebelumnya) ...
// Tambahkan ini di dalam loadHomeData setelah latestList di-render:

function setupFilter() {
    const filterBtn = document.querySelector('.filter-btn');
    const selects = document.querySelectorAll('.filter-bar select');
    filterBtn.addEventListener('click', () => {
        const genre = selects[0].value;
        const year = selects[1].value;
        const status = selects[2].value;
        window.location.href = `search.html?genre=${genre}&year=${year}&status=${status}`;
    });
}

// Panggil setupFilter() di akhir loadHomeData()
