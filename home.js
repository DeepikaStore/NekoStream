const heroSection=document.getElementById("hero-section"), trendingList=document.getElementById("trending-list"), latestList=document.getElementById("latest-list");
function renderHero(raw){const a=normalizeAnime(raw);heroSection.innerHTML=`<div class="hero-slide" style="background-image:url('${escapeHTML(a.poster)}')"><div class="hero-overlay"><h1 class="hero-title">${escapeHTML(a.title)}</h1><p class="hero-synopsis">Temukan dan tonton anime favoritmu.</p><div class="hero-buttons"><button class="btn-primary" id="hero-detail">▶ Detail Anime</button></div></div></div>`;document.getElementById("hero-detail")?.addEventListener("click",()=>location.href=`detail.html?id=${encodeURIComponent(a.id)}&name=${encodeURIComponent(a.routeName)}`);}
async function loadHomeData(){
    heroSection.innerHTML='<p class="loading">Memuat anime...</p>';
    try{
        const [op,cp]=await Promise.allSettled([getOngoingAnime(1),getCompletedAnime(1)]);
        const ongoing=op.status==='fulfilled'?asArray(unwrapData(op.value)).map(normalizeAnime):[];
        const completed=cp.status==='fulfilled'?asArray(unwrapData(cp.value)).map(normalizeAnime):[];
        const combined=[...ongoing,...completed];
        if(!combined.length){const reason=op.reason||cp.reason;throw reason||new Error('API tidak mengembalikan daftar anime.');}
        renderHero(combined[0]); trendingList.replaceChildren(); latestList.replaceChildren();
        combined.slice(0,6).forEach((a,i)=>trendingList.appendChild(createAnimeCard(a,true,i)));
        combined.slice(0,12).forEach(a=>latestList.appendChild(createAnimeCard(a)));
    }catch(err){console.error('Home Kuramanime:',err);heroSection.innerHTML=`<p class="error">Gagal mengambil data anime: ${escapeHTML(err.message)}<br>Pastikan API aktif dan mengizinkan CORS.</p>`;trendingList.replaceChildren();latestList.replaceChildren();}
}
function applyFilter(){const status=document.getElementById('filter-status')?.value||'';location.href=`search.html${status?`?status=${encodeURIComponent(status)}`:''}`;}
loadHomeData();
