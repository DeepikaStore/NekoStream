const scheduleContainer = document.getElementById("schedule-container");

async function loadSchedule() {
    try {
        const res = await fetch(`${API_BASE}/schedule`);
        if (!res.ok) throw new Error("Gagal");
        const json = await res.json();
        
        const data = json.data || json;
        scheduleContainer.innerHTML = "";

        // Urutan hari biar rapi
        const daysOrder = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

        for (const day of daysOrder) {
            // Cari key yang mirip (case insensitive)
            const key = Object.keys(data).find(k => k.toLowerCase() === day.toLowerCase());
            if (key && Array.isArray(data[key]) && data[key].length > 0) {
                const daySection = document.createElement("div");
                daySection.className = "schedule-day";
                daySection.innerHTML = `<h3>${day}</h3><div class="schedule-grid" id="day-${day}"></div>`;
                scheduleContainer.appendChild(daySection);
                
                const grid = document.getElementById(`day-${day}`);
                data[key].forEach(anime => grid.appendChild(createAnimeCard(anime)));
            }
        }
        
        // Kalau API nggak ngasih format hari, fallback tampilin semua
        if (scheduleContainer.innerHTML === "") {
            scheduleContainer.innerHTML = `<p class="error">Jadwal rilis belum tersedia dari API.</p>`;
        }
    } catch (err) {
        scheduleContainer.innerHTML = `<p class="error">Gagal memuat jadwal. API mungkin sedang down.</p>`;
    }
}
loadSchedule();
