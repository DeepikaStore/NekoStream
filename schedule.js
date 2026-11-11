const scheduleContainer = document.getElementById("schedule-container");

async function loadSchedule() {
    try {
        const res = await fetch(`${API_BASE}/schedule`);
        if (!res.ok) throw new Error("Gagal");
        const json = await res.json();
        
        // API Oploverz biasanya ngasih data object per hari
        const data = json.data || json;
        scheduleContainer.innerHTML = "";

        for (const [day, animes] of Object.entries(data)) {
            if (Array.isArray(animes) && animes.length > 0) {
                const daySection = document.createElement("div");
                daySection.className = "schedule-day";
                daySection.innerHTML = `<h3>${day}</h3><div class="schedule-grid" id="day-${day}"></div>`;
                scheduleContainer.appendChild(daySection);
                
                const grid = document.getElementById(`day-${day}`);
                animes.forEach(anime => grid.appendChild(createAnimeCard(anime)));
            }
        }
    } catch (err) {
        scheduleContainer.innerHTML = `<p class="error">Gagal memuat jadwal. API mungkin down.</p>`;
    }
}
loadSchedule();
