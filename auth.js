/* NekoStream local authentication + optional Firebase Google sign-in. */
function getUsers(){ try { const users=JSON.parse(localStorage.getItem("neko_users")); return Array.isArray(users)?users:[]; } catch { return []; } }
function registerUser(username,password){
    username=String(username||"").trim(); password=String(password||"");
    if(username.length<3 || password.length<6) return {success:false,message:"Username minimal 3 karakter dan password minimal 6 karakter."};
    const users=getUsers();
    if(users.some(u=>String(u.username).toLowerCase()===username.toLowerCase())) return {success:false,message:"Username sudah digunakan."};
    users.push({username,password}); localStorage.setItem("neko_users",JSON.stringify(users));
    return {success:true,message:"Registrasi berhasil! Silakan login."};
}
function loginUser(username,password){
    const user=getUsers().find(u=>String(u.username).toLowerCase()===String(username).toLowerCase() && u.password===password);
    if(!user) return {success:false,message:"Username atau password salah!"};
    localStorage.setItem("neko_session",JSON.stringify({username:user.username,loginAt:Date.now()}));
    return {success:true,message:"Login berhasil!"};
}
function getSession(){ try{return JSON.parse(localStorage.getItem("neko_session"));}catch{return null;} }
function logoutUser(){localStorage.removeItem("neko_session");location.href="index.html";}
function loginWithGoogle(){
    if(!window.firebase || !firebase.apps || !firebase.apps.length){alert("Login Google tidak tersedia: Firebase SDK belum siap.");return;}
    const auth=firebase.auth(), provider=new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then(({user})=>{
        localStorage.setItem("neko_session",JSON.stringify({username:user.displayName||user.email,email:user.email,photoURL:user.photoURL,uid:user.uid,loginAt:Date.now()}));
        location.href="index.html";
    }).catch(error=>{console.error("Google sign-in:",error);alert(`Gagal login Google: ${error.code||"error"}\n${error.message}`);});
}
function checkLoginState(){
    const session=getSession(), loginBtn=document.querySelector(".login-btn");
    if(session && loginBtn){const profile=document.createElement("div");profile.className="user-profile";const label=document.createElement("span");label.className="username";label.textContent=`👤 ${session.username}`;const btn=document.createElement("button");btn.className="logout-btn";btn.textContent="Keluar";btn.addEventListener("click",logoutUser);profile.append(label,btn);loginBtn.replaceWith(profile);}
}
document.addEventListener("DOMContentLoaded",()=>{
    checkLoginState();
    const googleButton=document.getElementById("btn-google");
    if(googleButton) googleButton.addEventListener("click",e=>{e.preventDefault();loginWithGoogle();});
    if(window.firebase && firebase.apps && firebase.apps.length){
        firebase.auth().getRedirectResult().then(result=>{if(result.user){const u=result.user;localStorage.setItem("neko_session",JSON.stringify({username:u.displayName||u.email,email:u.email,photoURL:u.photoURL,uid:u.uid,loginAt:Date.now()}));location.href="index.html";}}).catch(err=>console.error("Firebase redirect:",err));
    }
});
