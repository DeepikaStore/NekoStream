const genreListEl=document.getElementById('genre-list'), resultList=document.getElementById('result-list'), resultTitle=document.getElementById('result-title'), searchForm=document.getElementById('search-form'), searchInput=document.getElementById('search-input'), searchPagination=document.getElementById('search-pagination');
let currentPage=1, activeList=[];
function loadGenres(){if(genreListEl)genreListEl.innerHTML='<p class="loading">Filter genre belum tersedia pada endpoint Kuramanime yang terdokumentasi.</p>';}
async function loadList(page=1,query=''){
 currentPage=page;resultList.innerHTML='<p class="loading">Memuat anime...</p>';searchPagination.innerHTML='';
 try{
  const status=getQueryParam('status')||'';
  let raw=[];
  if(status==='ongoing') raw=asArray(unwrapData(await getOngoingAnime(page)));
  else if(status==='completed') raw=asArray(unwrapData(await getCompletedAnime(page)));
  else raw=asArray(unwrapData(await getAnimeList()));
  let list=raw.map(normalizeAnime);
  if(query)list=list.filter(a=>`${a.title} ${a.synopsis||a.description||''}`.toLowerCase().includes(query.toLowerCase()));
  activeList=list;
  // API list has no documented page argument; local pagination applies only to the returned collection.
  const start=(page-1)*PER_PAGE, items=list.slice(start,start+PER_PAGE);
  renderResults(items);
  const pages=Math.ceil(list.length/PER_PAGE);if(pages>1)renderPagination(page,pages);
 }catch(err){console.error('Search Kuramanime:',err);resultList.innerHTML=`<p class="error">Gagal memuat anime: ${escapeHTML(err.message)}</p>`;}
}
function renderResults(list){resultList.replaceChildren();if(!list.length){resultList.innerHTML='<p class="error">Anime tidak ditemukan pada data yang tersedia.</p>';return;}list.forEach((a,i)=>resultList.appendChild(createAnimeCard(a,false,i)));}
function renderPagination(page,pages){searchPagination.replaceChildren();if(page>1){const b=document.createElement('button');b.textContent='← Sebelumnya';b.onclick=()=>{loadList(page-1,searchInput.value.trim());scrollTo(0,0);};searchPagination.appendChild(b);}const label=document.createElement('button');label.textContent=`Halaman ${page}/${pages}`;label.disabled=true;searchPagination.appendChild(label);if(page<pages){const b=document.createElement('button');b.textContent='Berikutnya →';b.onclick=()=>{loadList(page+1,searchInput.value.trim());scrollTo(0,0);};searchPagination.appendChild(b);}}
if(searchForm)searchForm.addEventListener('submit',e=>{e.preventDefault();const q=searchInput.value.trim();history.pushState({},'',q?`?q=${encodeURIComponent(q)}`:'search.html');if(resultTitle)resultTitle.textContent=q?`🔍 Hasil Pencarian: "${q}"`:'🆕 Daftar Anime';loadList(1,q);});
loadGenres();const initialQuery=getQueryParam('q')||'';if(searchInput)searchInput.value=initialQuery;if(resultTitle)resultTitle.textContent=initialQuery?`🔍 Hasil Pencarian: "${initialQuery}"`:'🆕 Daftar Anime';loadList(1,initialQuery);
