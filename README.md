# NekoStream — Kuramanime API v1

Frontend NekoStream menggunakan API langsung (tanpa backend proxy).

**Base URL:** `https://v6.kuramanime.run`  
**Dokumentasi:** https://github.com/Kirara02/Kuramanime-API

| Fitur | Endpoint |
|---|---|
| Ongoing | `GET /api/v1/ongoing/:page` |
| Completed | `GET /api/v1/completed/:page` |
| Anime list | `GET /api/v1/anime` |
| Anime detail | `GET /api/v1/anime/:id/:name` |
| Episode detail | `GET /api/v1/anime/:id/:name/episode/:no` |

## Menjalankan

Upload seluruh isi folder ke hosting static atau jalankan dengan local web server (Live Server). Jangan membuka file HTML menggunakan `file://`.

## Catatan fitur

- Home dan jadwal memakai endpoint ongoing/completed.
- Pencarian dilakukan di browser dari data endpoint `/anime`, karena daftar endpoint yang diberikan tidak mencantumkan route pencarian khusus.
- Filter genre belum terhubung karena route genre tidak tercantum.
- Halaman detail dan episode memakai endpoint detail/episode. Struktur JSON aktual harus sesuai dengan field yang dikembalikan API.
- Direct API membutuhkan browser dapat mengakses host API melalui CORS. Jika DNS/API mati atau CORS diblokir, frontend tidak dapat memperbaikinya; gunakan API host yang aktif atau backend proxy.
- Link player/embed bisa memiliki pembatasan iframe, referer, atau codec dari penyedia video.
- Login username/password disimpan lokal di browser dan bukan autentikasi aman untuk akun produksi. Login Google memerlukan konfigurasi Firebase yang valid.

## Cache

Service worker versi `nekostream-static-v3` tidak menyimpan response API, dan memakai network-first untuk HTML/JavaScript agar perubahan API tidak tertahan cache lama. Setelah deploy, refresh halaman.
