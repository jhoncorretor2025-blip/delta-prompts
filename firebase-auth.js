import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp, increment, collection, query, orderBy, limit, getDocs } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const firebaseConfig={apiKey:'AIzaSyAFMCGldhbqzcHqem-Nm8bPqSLHTf04UKc',authDomain:'delta-prompts.firebaseapp.com',projectId:'delta-prompts',storageBucket:'delta-prompts.firebasestorage.app',messagingSenderId:'755389200448',appId:'1:755389200448:web:0affd073b7c607169dc7a5',measurementId:'G-29MLGRJW66'};
const app=initializeApp(firebaseConfig);const auth=getAuth(app);const db=getFirestore(app);const provider=new GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});

function css(){if(document.getElementById('delta-auth-style'))return;const s=document.createElement('style');s.id='delta-auth-style';s.textContent=`.delta-auth-box{margin:12px 8px 8px;padding:12px;border:1px solid #e6e8f0;border-radius:14px;background:linear-gradient(135deg,#fafbff,#f5f3ff)}.delta-login-btn,.delta-logout-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:10px 12px;border:1px solid #d9dce7;border-radius:10px;background:#fff;color:#344054;font-weight:800;cursor:pointer}.delta-login-btn:hover{border-color:#818cf8;background:#f8f7ff}.delta-user{display:flex;align-items:center;gap:9px;margin-bottom:9px}.delta-user img{width:34px;height:34px;border-radius:50%;object-fit:cover}.delta-user-info{min-width:0}.delta-user-info strong,.delta-user-info small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.delta-user-info small{font-size:11px;color:#667085}.delta-logout-btn{padding:7px;font-size:12px}.delta-auth-status{margin-top:7px;font-size:11px;color:#667085;text-align:center}`;document.head.appendChild(s)}
function box(){const nav=document.querySelector('#menu .sidebar');if(!nav)return null;let el=document.getElementById('delta-auth-box');if(!el){el=document.createElement('div');el.id='delta-auth-box';el.className='delta-auth-box';const brand=nav.querySelector('.menu-brand');brand?brand.insertAdjacentElement('afterend',el):nav.prepend(el)}return el}
function render(user){css();const el=box();if(!el)return;if(user){el.innerHTML=`<div class="delta-user"><img src="${user.photoURL||''}" alt=""><div class="delta-user-info"><strong>${escapeHtml(user.displayName||'Minha conta')}</strong><small>${escapeHtml(user.email||'')}</small></div></div><button class="delta-logout-btn" id="delta-logout">Sair da conta</button>`;document.getElementById('delta-logout').onclick=()=>signOut(auth)}else{el.innerHTML=`<button class="delta-login-btn" id="delta-login"><span>G</span> Entrar com Google</button><div class="delta-auth-status">Sincronize sua conta e seus dados pessoais.</div>`;document.getElementById('delta-login').onclick=login}}
function escapeHtml(v){return String(v).replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]))}
async function saveProfile(user){if(!user)return;await setDoc(doc(db,'users',user.uid),{name:user.displayName||'',email:user.email||'',photoURL:user.photoURL||'',lastLoginAt:serverTimestamp()},{merge:true})}

// ===== FAVORITOS SINCRONIZADOS NA NUVEM (Firestore) =====
// Mantém o localStorage 'deltaFavoritos' (usado em todas as páginas) sincronizado
// com a conta do usuário, para funcionar em qualquer dispositivo após o login.
function _lerFavoritosLocais(){try{return JSON.parse(localStorage.getItem('deltaFavoritos'))||[]}catch(e){return[]}}
function _gravarFavoritosLocais(l){try{localStorage.setItem('deltaFavoritos',JSON.stringify(l))}catch(e){}}

export async function syncFavoritosFromCloud(uid){
  if(!uid)return;
  try{
    const snap=await getDoc(doc(db,'users',uid));
    const nuvem=(snap.exists()&&snap.data().favoritos)||[];
    const local=_lerFavoritosLocais();
    const mapa=new Map();
    [...nuvem,...local].forEach(f=>{if(f&&f.id)mapa.set(f.id,f)});
    const mesclado=[...mapa.values()].sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
    _gravarFavoritosLocais(mesclado);
    await setDoc(doc(db,'users',uid),{favoritos:mesclado},{merge:true});
    window.dispatchEvent(new CustomEvent('delta:favoritos-updated'));
  }catch(e){console.error('Erro ao sincronizar favoritos:',e)}
}

export async function pushFavoritosToCloud(uid){
  if(!uid)return;
  try{await setDoc(doc(db,'users',uid),{favoritos:_lerFavoritosLocais()},{merge:true})}
  catch(e){console.error('Erro ao enviar favoritos para a nuvem:',e)}
}

// ===== FEEDBACK GLOBAL (útil / não útil de todos os usuários, agregado) =====
export async function registrarFeedbackGlobal(promptId,tipo,delta){
  if(!promptId||(tipo!=='up'&&tipo!=='down'))return;
  delta=delta||1;
  try{await setDoc(doc(db,'feedbackGlobal',promptId),{[tipo]:increment(delta)},{merge:true})}
  catch(e){console.error('Erro ao registrar feedback global:',e)}
}
export async function obterFeedbackGlobal(promptId){
  try{const snap=await getDoc(doc(db,'feedbackGlobal',promptId));return snap.exists()?{up:snap.data().up||0,down:snap.data().down||0}:{up:0,down:0}}
  catch(e){return{up:0,down:0}}
}

// ===== CONTADOR DE USO SINCRONIZADO NA NUVEM =====
// Cada pagina guarda seu proprio contador (ex: 'deltaFinancasUsos', 'deltaSaudeUsos'...).
// Aqui a gente sincroniza TODAS as chaves que terminam em "Usos" de uma vez.
function _todasChavesUso(){
  const chaves=[];
  try{
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);
      if(k&&/Usos$/.test(k))chaves.push(k);
    }
  }catch(e){}
  return chaves;
}

export async function syncUsosFromCloud(uid){
  if(!uid)return;
  try{
    const snap=await getDoc(doc(db,'users',uid));
    const nuvem=(snap.exists()&&snap.data().usos)||{};
    Object.keys(nuvem).forEach(chave=>{
      let local={};
      try{local=JSON.parse(localStorage.getItem(chave))||{}}catch(e){}
      const mesclado={...local};
      Object.keys(nuvem[chave]||{}).forEach(id=>{
        mesclado[id]=Math.max(local[id]||0,nuvem[chave][id]||0);
      });
      try{localStorage.setItem(chave,JSON.stringify(mesclado))}catch(e){}
    });
    await pushUsosToCloud(uid);
  }catch(e){console.error('Erro ao sincronizar uso:',e)}
}

export async function pushUsosToCloud(uid){
  if(!uid)return;
  try{
    const obj={};
    _todasChavesUso().forEach(k=>{try{obj[k]=JSON.parse(localStorage.getItem(k))}catch(e){}});
    await setDoc(doc(db,'users',uid),{usos:obj},{merge:true});
  }catch(e){console.error('Erro ao enviar uso para a nuvem:',e)}
}

// ===== ESTATÍSTICAS GLOBAIS DO SITE (para o Painel Administrativo) =====
export async function registrarPageView(caminho){
  try{
    const id=(caminho||'raiz').replace(/[\/.]/g,'_')||'raiz';
    await setDoc(doc(db,'pageViews',id),{path:caminho,views:increment(1)},{merge:true});
  }catch(e){console.error('Erro ao registrar visualização de página:',e)}
}

export async function obterTopFeedback(qtd){
  try{
    const q=query(collection(db,'feedbackGlobal'),orderBy('up','desc'),limit(qtd||20));
    const snap=await getDocs(q);
    const resultado=[];
    snap.forEach(d=>resultado.push({id:d.id,up:d.data().up||0,down:d.data().down||0}));
    return resultado;
  }catch(e){console.error('Erro ao buscar ranking de feedback:',e);return[]}
}

export async function obterTopPageViews(qtd){
  try{
    const q=query(collection(db,'pageViews'),orderBy('views','desc'),limit(qtd||30));
    const snap=await getDocs(q);
    const resultado=[];
    snap.forEach(d=>resultado.push({id:d.id,path:d.data().path||d.id,views:d.data().views||0}));
    return resultado;
  }catch(e){console.error('Erro ao buscar ranking de páginas:',e);return[]}
}

export async function login(){try{const result=await signInWithPopup(auth,provider);await saveProfile(result.user)}catch(e){if(['auth/popup-blocked','auth/cancelled-popup-request','auth/operation-not-supported-in-this-environment'].includes(e.code)){await signInWithRedirect(auth,provider);return}console.error('Erro no login Google:',e);alert('Não foi possível entrar com o Google. Tente novamente.')}}
export function logout(){return signOut(auth)}
export function getUser(){return auth.currentUser}

// Chamado uma unica vez, DEPOIS que o menu ja existe no DOM (sem MutationObserver, sem loop).
export function initAuthWatcher(){
  getRedirectResult(auth).then(r=>r&&saveProfile(r.user)).catch(console.error);
  onAuthStateChanged(auth,user=>{window.deltaUser=user||null;window.dispatchEvent(new CustomEvent('delta-auth-changed',{detail:{user}}));render(user);if(user){saveProfile(user).catch(console.error);syncFavoritosFromCloud(user.uid);syncUsosFromCloud(user.uid)}});
}
