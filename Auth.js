// --- SISTEM AUTHENTICATION (SIMULASI LOCALSTORAGE) ---

function getUsers() {
    return JSON.parse(localStorage.getItem('neko_users')) || [];
}

function registerUser(username, password) {
    const users = getUsers();
    const userExists = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (userExists) {
        return { success: false, message: "Username udah dipake, cari yang lain!" };
    }
    
    users.push({ username, password });
    localStorage.setItem('neko_users', JSON.stringify(users));
    return { success: true, message: "Registrasi berhasil! Silakan login." };
}

function loginUser(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    
    if (user) {
        // Simpan session login
        localStorage.setItem('neko_session', JSON.stringify({ username: user.username, loginAt: Date.now() }));
        return { success: true, message: "Login berhasil!" };
    }
    
    return { success: false, message: "Username atau password salah!" };
}

function getSession() {
    return JSON.parse(localStorage.getItem('neko_session'));
}

function logoutUser() {
    localStorage.removeItem('neko_session');
    window.location.href = 'index.html';
}

// Fungsi buat update UI Topbar kalau user udah login
function checkLoginState() {
    const session = getSession();
    const loginBtn = document.querySelector('.login-btn');
    
    if (session && loginBtn) {
        // Ganti tombol jadi nama user + tombol logout
        loginBtn.outerHTML = `
            <div class="user-profile">
                <span class="username">👤 ${session.username}</span>
                <button class="logout-btn" onclick="logoutUser()">Keluar</button>
            </div>
        `;
    }
}

// Jalanin cek session pas halaman dimuat
document.addEventListener('DOMContentLoaded', checkLoginState);
