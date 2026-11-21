/* NekoStream - Kuramanime API v1 adapter */
const API_BASE = "https://v6.kuramanime.run";
const API_ROOT = `${API_BASE}/api/v1`;
const PER_PAGE = 24;

async function apiGet(path) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 18000);
    let response;
    try {
        response = await fetch(`${API_ROOT}${path}`, {
            method: "GET", headers: { Accept: "application/json" },
            signal: controller.signal, cache: "no-store"
        });
    } catch (error) {
        if (error.name === "AbortError") throw new Error("Permintaan API timeout (18 detik).");
        if (error instanceof TypeError) throw new Error("Tidak dapat terhubung ke Kuramanime. Periksa DNS, server API, atau CORS.");
        throw error;
    } finally { clearTimeout(timer); }
    if (!response.ok) throw new Error(`Kuramanime API HTTP ${response.status}`);
    const type = response.headers.get("content-type") || "";
    if (!type.includes("json")) throw new Error("API tidak mengembalikan JSON. Server mungkin sedang error atau dibatasi.");
    const payload = await response.json();
    if (payload && (payload.success === false || payload.status === "error"))
        throw new Error(payload.message || payload.error || "Kuramanime mengembalikan error.");
    return payload;
}
function unwrapData(payload) {
    let value = payload?.data ?? payload?.result ?? payload?.response ?? payload;
    for (let i=0; i<4 && value && !Array.isArray(value) && typeof value === "object"; i++) {
        const key = ["animeList","anime_list","animes","anime","items","results","list","ongoing","completed","detail","episode","episodes"]
            .find(k => value[k] !== undefined && value[k] !== null);
        if (!key) break;
        value = value[key];
    }
    return value;
}
function asArray(value) {
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") {
        for (const key of ["animeList","anime_list","items","results","list","data","animes","episodes","episode_list"])
            if (Array.isArray(value[key])) return value[key];
        // Some APIs wrap list data one level deeper.
        for (const child of Object.values(value)) if (Array.isArray(child)) return child;
    }
    return [];
}
function pick(obj, keys, fallback = "") {
    for (const key of keys) if (obj?.[key] !== undefined && obj[key] !== null && obj[key] !== "") return obj[key];
    return fallback;
}
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>\"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
function animeId(anime) { return String(pick(anime, ["id","anime_id","animeId","animeID"], "")); }
function animeName(anime) { return String(pick(anime, ["title","anime_name","animeName","judul","name","slug","anime_slug"], "Tanpa Judul")); }
function animeRouteName(anime) {
    const explicit = pick(anime, ["slug","anime_slug","animeSlug","name_slug","route_name","name"], "");
    return String(explicit || animeName(anime).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""));
}
function animePoster(anime) { return String(pick(anime, ["poster","image","cover","thumbnail","poster_url","image_url","thumb"], "https://placehold.co/300x420?text=No+Image")); }
function animeEpisode(anime) { return String(pick(anime, ["episode","latest_episode","latestEpisode","episode_number","latestEpisodeNumber","status","type"], "")); }
function normalizeAnime(anime) {
    if (!anime || typeof anime !== "object") return {};
    const id = animeId(anime), title = animeName(anime), routeName = animeRouteName(anime);
    return { ...anime, id, name: title, title, seriesName: title, poster: animePoster(anime), episode: animeEpisode(anime), seriesSlug: routeName, routeName };
}
function extractSlugFromUrl(url) {
    if (!url) return "";
    try { const u = new URL(url, location.href); const parts = u.pathname.split("/").filter(Boolean); return parts[parts.length-1] || ""; }
    catch { return ""; }
}
function extractSeriesSlug(anime) { return String(pick(anime,["slug","anime_slug","animeSlug","seriesSlug","seriesId"],extractSlugFromUrl(pick(anime,["href","link","url"],""))) || animeRouteName(anime)); }
function getQueryParam(name) { return new URLSearchParams(window.location.search).get(name); }
function getFavorites() { try { const v=JSON.parse(localStorage.getItem("neko_favs")); return Array.isArray(v)?v:[]; } catch { return []; } }
function isFavorite(slug) { return getFavorites().some(f => f.slug === slug); }
function getHistory() { try { const v=JSON.parse(localStorage.getItem("neko_history")); return Array.isArray(v)?v:[]; } catch { return []; } }
function saveHistory(item) {
    const history = getHistory().filter(h => h.slug !== item.slug);
    history.unshift({ ...item, timestamp: Date.now() });
    localStorage.setItem("neko_history", JSON.stringify(history.slice(0,30)));
}
function createAnimeCard(rawAnime, isTrending = false, index = 0) {
    const anime = normalizeAnime(rawAnime);
    const card = document.createElement("div"); card.className = isTrending ? "anime-card trending-card" : "anime-card";
    const slug = extractSeriesSlug(anime), title = anime.title, poster = anime.poster;
    card.innerHTML = `${isTrending ? `<div class="rank-badge">#${index+1}</div>` : ""}<button class="heart-btn ${isFavorite(slug)?"active":""}" type="button" aria-label="Favorit">❤️</button><img src="${escapeHTML(poster)}" alt="${escapeHTML(title)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.src='https://placehold.co/300x420?text=No+Image'"><div class="card-info"><h3>${escapeHTML(title)}</h3><div class="meta"><span class="rating">${escapeHTML(animeEpisode(anime) || "Anime")}</span></div></div>`;
    card.querySelector(".heart-btn").addEventListener("click", e => {
        e.stopPropagation(); const favs=getFavorites(), idx=favs.findIndex(f=>f.slug===slug);
        if(idx>=0){favs.splice(idx,1);e.currentTarget.classList.remove("active");}
        else{favs.push({slug,id:anime.id,name:anime.routeName,title,poster});e.currentTarget.classList.add("active");}
        localStorage.setItem("neko_favs",JSON.stringify(favs));
    });
    card.addEventListener("click",()=>{
        if(anime.id && anime.routeName) location.href=`detail.html?id=${encodeURIComponent(anime.id)}&name=${encodeURIComponent(anime.routeName)}`;
    });
    return card;
}
async function getOngoingAnime(page=1){ return apiGet(`/ongoing/${Math.max(1,Number(page)||1)}`); }
async function getCompletedAnime(page=1){ return apiGet(`/completed/${Math.max(1,Number(page)||1)}`); }
async function getAnimeList(){ return apiGet(`/anime`); }
async function getAnimeDetail(id,name){ return apiGet(`/anime/${encodeURIComponent(id)}/${encodeURIComponent(name)}`); }
async function getEpisodeDetail(id,name,no){ return apiGet(`/anime/${encodeURIComponent(id)}/${encodeURIComponent(name)}/episode/${encodeURIComponent(no)}`); }
