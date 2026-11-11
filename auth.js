// --- SISTEM AUTHENTICATION (SIMULASI LOCALSTORAGE) ---

function getUsers() {
    return JSON.parse(localStorage.getItem('neko_users')) || [];
}

// Inisialisasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCy6_D_EZxAFeZ-iZe9SkJjORvIQWNhgT4",
  authDomain: "nekostream-nexora.firebaseapp.com",
  projectId: "nekostream-nexora",
  storageBucket: "nekostream-nexora.firebasestorage.app",
  messagingSenderId: "1091365553729",
  appId: "1:1091365553729:web:ecb51e37a9680d7fa4a8c0"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// Fungsi Login Google
function loginWithGoogle() {
  auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      localStorage.setItem('neko_session', JSON.stringify({
        username: user.displayName || user.email,
        email: user.email,
        photoURL: user.photoURL,
        uid: user.uid,
        loginAt: Date.now()
      }));
      window.location.href = 'index.html';
    })
    .catch((error) => {
      console.error("Google login error:", error.code, error.message);
      alert("Gagal login dengan Google: " + error.message);
    });
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
// Inisialisasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCy6_D_EZxAFeZ-iZe9SkJjORvIQWNhgT4",
  authDomain: "nekostream-nexora.firebaseapp.com",
  projectId: "nekostream-nexora",
  storageBucket: "nekostream-nexora.firebasestorage.app",
  messagingSenderId: "1091365553729",
  appId: "1:1091365553729:web:ecb51e37a9680d7fa4a8c0",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth(); {
const provider = new firebase.auth.GoogleAuthProvider();
}
function logoutUser() {
    localStorage.removeItem('neko_session');
    window.location.href = 'index.html';
}
// Event listener buat tombol Google
document.addEventListener('DOMContentLoaded', () => {
    const btnGoogle = document.getElementById('btn-google');
    if (btnGoogle) {
        btnGoogle.addEventListener('click', (e) => {
            e.preventDefault(); // Mencegah form ke-submit
            loginWithGoogle();
        });
    }
});


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
