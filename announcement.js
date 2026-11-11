// Daftar Pengumuman (Bisa lo edit manual di sini)
const announcementsData = [
    {
        id: "ann-001",
        title: "Work In Progress ⚠",
        content: "Fitur Google Bagian Login/Daftar sedang dalam perbaikan.",
        date: "12 Nov 2026",
        type: "WIP"
    },
    {
        id: "ann-002",
        title: "test",
        content: "test announcement",
        date: "11 Nov 2026",
        type: "test"
    }
];

// Cek apakah user udah baca semua pengumuman
function getUnreadAnnouncements() {
    const readIds = JSON.parse(localStorage.getItem('neko_read_ann')) || [];
    return announcementsData.filter(a => !readIds.includes(a.id));
}

// Tandai semua pengumuman udah dibaca
function markAllAsRead() {
    const allIds = announcementsData.map(a => a.id);
    localStorage.setItem('neko_read_ann', JSON.stringify(allIds));
    updateBellBadge();
}

// Update angka merah di ikon lonceng
function updateBellBadge() {
    const unread = getUnreadAnnouncements();
    const badge = document.getElementById('bell-badge');
    if (badge) {
        if (unread.length > 0) {
            badge.textContent = unread.length;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Tampilkan Pop-up saat pertama kali buka web
function showAnnouncementPopup() {
    const unread = getUnreadAnnouncements();
    if (unread.length === 0) return; // Kalau udah baca semua, jangan munculin

    const popupOverlay = document.createElement('div');
    popupOverlay.className = 'ann-overlay';
    
    let listHTML = "";
    unread.forEach(ann => {
        listHTML += `
            <div class="ann-item-popup">
                <h3>${ann.type === 'warning' ? '⚠️' : '🎉'} ${ann.title}</h3>
                <p>${ann.content}</p>
                <span class="ann-date">${ann.date}</span>
            </div>
        `;
    });

    popupOverlay.innerHTML = `
        <div class="ann-popup-card">
            <div class="ann-popup-header">
                <h2>📢 Pengumuman</h2>
            </div>
            <div class="ann-popup-body">
                ${listHTML}
            </div>
            <div class="ann-popup-footer">
                <button id="btn-close-ann" class="btn-primary" style="width: 100%; padding: 12px; border-radius: 8px; font-weight: 600;">Mengerti</button>
            </div>
        </div>
    `;

    document.body.appendChild(popupOverlay);

    document.getElementById('btn-close-ann').addEventListener('click', () => {
        popupOverlay.remove();
        markAllAsRead(); // Tandai udah baca pas ditutup
    });
}

// Tampilkan Modal List Pengumuman (Pas ikon lonceng diklik)
function showAnnouncementModal() {
    const popupOverlay = document.createElement('div');
    popupOverlay.className = 'ann-overlay';
    
    let listHTML = "";
    announcementsData.forEach(ann => {
        const isRead = !getUnreadAnnouncements().find(a => a.id === ann.id);
        listHTML += `
            <div class="ann-list-item ${isRead ? 'read' : 'unread'}">
                <div class="ann-icon">${ann.type === 'warning' ? '⚠️' : '🎉'}</div>
                <div class="ann-text">
                    <h4>${ann.title}</h4>
                    <p>${ann.content}</p>
                    <span class="ann-date">${ann.date}</span>
                </div>
            </div>
        `;
    });

    popupOverlay.innerHTML = `
        <div class="ann-popup-card">
            <div class="ann-popup-header">
                <h2>🔔 Kotak Masuk</h2>
                <button id="btn-close-modal" style="background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;">×</button>
            </div>
            <div class="ann-popup-body">
                ${listHTML}
            </div>
        </div>
    `;

    document.body.appendChild(popupOverlay);

    document.getElementById('btn-close-modal').addEventListener('click', () => {
        popupOverlay.remove();
        markAllAsRead(); // Tandai udah baca pas modal ditutup
    });
}

// Jalanin pas halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    updateBellBadge();
    
    // Munculin popup setelah 1.5 detik biar web ke-load dulu
    setTimeout(showAnnouncementPopup, 1500);

    // Pasang event listener ke ikon lonceng
    const bellBtn = document.querySelector('.icon-btn'); // Ikon lonceng di topbar
    if (bellBtn) {
        bellBtn.addEventListener('click', showAnnouncementModal);
        bellBtn.style.cursor = 'pointer'; // Biar cursor berubah jadi tangan
    }
});
