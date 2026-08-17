import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp, increment, collection, addDoc, query, orderBy, where, limit, getDocs } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const firebaseConfig={apiKey:'AIzaSyAFMCGldhbqzcHqem-Nm8bPqSLHTf04UKc',authDomain:'delta-prompts.firebaseapp.com',projectId:'delta-prompts',storageBucket:'delta-prompts.firebasestorage.app',messagingSenderId:'755389200448',appId:'1:755389200448:web:0affd073b7c607169dc7a5',measurementId:'G-29MLGRJW66'};
const app=initializeApp(firebaseConfig);const auth=getAuth(app);const db=getFirestore(app);const provider=new GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});

function css(){if(document.getElementById('delta-auth-style'))return;const s=document.createElement('style');s.id='delta-auth-style';s.textContent=`.delta-auth-box{margin:26px 8px 16px;padding:12px;border:1px solid #e6e8f0;border-radius:14px;background:linear-gradient(135deg,#fafbff,#f5f3ff);position:relative}.delta-auth-box::before{content:'';position:absolute;top:-13px;left:12px;right:12px;height:1px;background:#e5e7eb}.delta-login-btn,.delta-logout-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:10px 12px;border:1px solid #d9dce7;border-radius:10px;background:#fff;color:#344054;font-weight:800;cursor:pointer}.delta-login-btn:hover{border-color:#818cf8;background:#f8f7ff}.delta-user{display:flex;align-items:center;gap:9px;width:100%;border:0;background:none;cursor:pointer;padding:4px;border-radius:10px;text-align:left}.delta-user:hover{background:rgba(91,92,226,.08)}.delta-user img{width:34px;height:34px;border-radius:50%;object-fit:cover;flex:0 0 auto}.delta-user-info{min-width:0;flex:1}.delta-user-info strong,.delta-user-info small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.delta-user-info small{font-size:11px;color:#667085}.delta-user-seta{font-size:11px;color:#98a2b3;transition:transform .2s}.delta-user-seta.aberto{transform:rotate(180deg)}.delta-user-menu{display:none;flex-direction:column;gap:4px;margin-top:8px;padding-top:9px;border-top:1px solid #e6e8f0}.delta-user-menu.aberto{display:flex}.delta-user-menu a,.delta-user-menu button{display:flex;align-items:center;gap:8px;width:100%;padding:9px 10px;border:0;background:none;border-radius:9px;color:#344054;font-weight:700;font-size:13px;cursor:pointer;text-align:left;text-decoration:none;box-sizing:border-box}.delta-user-menu a:hover,.delta-user-menu button:hover{background:#f1f0ff}.delta-logout-btn{padding:7px;font-size:12px;color:#b91c1c!important}.delta-auth-status{margin-top:7px;font-size:11px;color:#667085;text-align:center}.delta-auth-divisor{display:flex;align-items:center;gap:8px;margin:9px 0;font-size:10.5px;color:#98a2b3;text-transform:uppercase;font-weight:800}.delta-auth-divisor::before,.delta-auth-divisor::after{content:'';flex:1;height:1px;background:#e6e8f0}.delta-email-toggle{width:100%;background:none;border:0;color:#5b5ce2;font-weight:800;font-size:12px;cursor:pointer;padding:4px 0}.delta-email-form{display:flex;flex-direction:column;gap:7px;margin-top:8px}.delta-email-form input{width:100%;box-sizing:border-box;padding:9px 10px;border:1px solid #d9dce7;border-radius:9px;font-size:12.5px;font-family:inherit}.delta-email-submit{width:100%;padding:9px;border:0;border-radius:9px;background:#5b5ce2;color:#fff;font-weight:800;font-size:12.5px;cursor:pointer}.delta-email-links{display:flex;justify-content:space-between;font-size:11px;margin-top:2px}.delta-email-links button{background:none;border:0;color:#5b5ce2;font-weight:700;cursor:pointer;padding:0}.delta-email-erro{font-size:11px;color:#b91c1c;margin-top:4px}`;document.head.appendChild(s)}
function box(){const nav=document.querySelector('#menu .sidebar');if(!nav)return null;let el=document.getElementById('delta-auth-box');if(!el){el=document.createElement('div');el.id='delta-auth-box';el.className='delta-auth-box';nav.appendChild(el)}return el}
let modoEmail=null; // null | 'entrar' | 'criar'
function render(user){
  css();
  const el=box();
  if(!el)return;
  if(user){
    el.innerHTML=`<button type="button" class="delta-user" id="delta-user-toggle"><img src="${user.photoURL||''}" alt=""><div class="delta-user-info"><strong>${escapeHtml(user.displayName||'Minha conta')}</strong><small>${escapeHtml(user.email||'')}</small></div><span class="delta-user-seta" id="delta-user-seta">▾</span></button><div class="delta-user-menu" id="delta-user-menu"><a href="/delta-prompts/configuracao.html">⚙️ Configuração</a><button type="button" class="delta-logout-btn" id="delta-logout">🚪 Sair da conta</button></div>`;
    document.getElementById('delta-logout').onclick=()=>signOut(auth);
    const toggle=document.getElementById('delta-user-toggle');
    const menu=document.getElementById('delta-user-menu');
    const seta=document.getElementById('delta-user-seta');
    toggle.onclick=(e)=>{e.stopPropagation();const aberto=menu.classList.toggle('aberto');seta.classList.toggle('aberto',aberto)};
    document.addEventListener('click',(e)=>{if(!el.contains(e.target)){menu.classList.remove('aberto');seta.classList.remove('aberto')}});
    return;
  }
  if(!modoEmail){
    el.innerHTML=`<button class="delta-login-btn" id="delta-login"><span>G</span> Entrar com Google</button><div class="delta-auth-divisor">ou</div><button type="button" class="delta-email-toggle" id="delta-email-toggle">✉️ Entrar com e-mail e senha</button><div class="delta-auth-status">Sincronize sua conta e seus dados pessoais.</div>`;
    document.getElementById('delta-login').onclick=login;
    document.getElementById('delta-email-toggle').onclick=()=>{modoEmail='entrar';render()};
    return;
  }
  const criando=modoEmail==='criar';
  el.innerHTML=`<button class="delta-login-btn" id="delta-login"><span>G</span> Entrar com Google</button><div class="delta-auth-divisor">ou</div><form class="delta-email-form" id="delta-email-form"><input type="email" id="delta-email-input" placeholder="Seu e-mail" required autocomplete="email">${criando?'<input type="text" id="delta-nome-input" placeholder="Seu nome" required autocomplete="name">':''}<input type="password" id="delta-senha-input" placeholder="Sua senha" required minlength="6" autocomplete="${criando?'new-password':'current-password'}"><button type="submit" class="delta-email-submit">${criando?'✉️ Criar conta':'✉️ Entrar'}</button><div class="delta-email-links"><button type="button" id="delta-alternar-modo">${criando?'Já tenho conta':'Criar conta nova'}</button>${criando?'':'<button type="button" id=\"delta-esqueci\">Esqueci a senha</button>'}</div><div class="delta-email-erro" id="delta-email-erro" style="display:none"></div></form>`;
  document.getElementById('delta-login').onclick=login;
  document.getElementById('delta-alternar-modo').onclick=()=>{modoEmail=criando?'entrar':'criar';render()};
  const btnEsqueci=document.getElementById('delta-esqueci');
  if(btnEsqueci)btnEsqueci.onclick=async()=>{
    const email=document.getElementById('delta-email-input').value.trim();
    const erroEl=document.getElementById('delta-email-erro');
    if(!email){erroEl.textContent='Digite seu e-mail primeiro.';erroEl.style.display='block';return}
    try{await sendPasswordResetEmail(auth,email);erroEl.style.color='#15803d';erroEl.textContent='📧 E-mail de recuperação enviado! Confira sua caixa de entrada.';erroEl.style.display='block'}
    catch(e){erroEl.style.color='#b91c1c';erroEl.textContent=mensagemErroAuth(e);erroEl.style.display='block'}
  };
  document.getElementById('delta-email-form').onsubmit=async(ev)=>{
    ev.preventDefault();
    const email=document.getElementById('delta-email-input').value.trim();
    const senha=document.getElementById('delta-senha-input').value;
    const erroEl=document.getElementById('delta-email-erro');
    erroEl.style.display='none';
    try{
      if(criando){
        const nome=document.getElementById('delta-nome-input').value.trim();
        const cred=await createUserWithEmailAndPassword(auth,email,senha);
        if(nome)await updateProfile(cred.user,{displayName:nome});
        await saveProfile(cred.user);
      }else{
        await signInWithEmailAndPassword(auth,email,senha);
      }
      modoEmail=null;
    }catch(e){
      erroEl.style.color='#b91c1c';
      erroEl.textContent=mensagemErroAuth(e);
      erroEl.style.display='block';
    }
  };
}
function mensagemErroAuth(e){
  const c=e&&e.code||'';
  if(c==='auth/email-already-in-use')return'Esse e-mail já tem conta. Tente entrar em vez de criar.';
  if(c==='auth/invalid-email')return'E-mail inválido.';
  if(c==='auth/weak-password')return'A senha precisa ter pelo menos 6 caracteres.';
  if(c==='auth/wrong-password'||c==='auth/invalid-credential')return'E-mail ou senha incorretos.';
  if(c==='auth/user-not-found')return'Não achamos conta com esse e-mail. Que tal criar uma?';
  if(c==='auth/too-many-requests')return'Muitas tentativas. Aguarde um pouco e tente de novo.';
  return'Não foi possível concluir. Tente novamente.';
}
function escapeHtml(v){return String(v).replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]))}
async function saveProfile(user){if(!user)return;await setDoc(doc(db,'users',user.uid),{name:user.displayName||'',email:user.email||'',photoURL:user.photoURL||'',lastLoginAt:serverTimestamp()},{merge:true})}

// ===== FAVORITOS SINCRONIZADOS NA NUVEM (Firestore) =====
// Mantém o localStorage 'deltaFavoritos' (usado em todas as páginas) sincronizado
// com a conta do usuário, para funcionar em qualquer dispositivo após o login.
function _lerFavoritosLocais(){try{return JSON.parse(localStorage.getItem('deltaFavoritos'))||[]}catch(e){return[]}}
function _gravarFavoritosLocais(l){try{localStorage.setItem('deltaFavoritos',JSON.stringify(l))}catch(e){}}

function _avisarErroSync(){
  try{
    if(sessionStorage.getItem('deltaAvisoSyncMostrado'))return;
    sessionStorage.setItem('deltaAvisoSyncMostrado','1');
    var el=document.createElement('div');
    el.textContent='⚠️ Não conseguimos salvar seus favoritos na nuvem agora. Eles continuam salvos neste aparelho.';
    el.style.cssText='position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#7c2d12;color:#fff;padding:12px 18px;border-radius:12px;font-size:13px;font-weight:700;z-index:9999;max-width:90vw;text-align:center;box-shadow:0 10px 24px rgba(0,0,0,.25)';
    document.body.appendChild(el);
    setTimeout(function(){el.remove()},6000);
  }catch(e){}
}

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
  }catch(e){console.error('Erro ao sincronizar favoritos:',e);_avisarErroSync()}
}

export async function pushFavoritosToCloud(uid){
  if(!uid)return;
  try{await setDoc(doc(db,'users',uid),{favoritos:_lerFavoritosLocais()},{merge:true})}
  catch(e){console.error('Erro ao enviar favoritos para a nuvem:',e);_avisarErroSync()}
}

// ===== PERFIL PUBLICO (compartilhar so os favoritos marcados como publicos) =====
export async function obterPerfilPublico(uid){
  if(!uid)return null;
  try{
    const snap=await getDoc(doc(db,'users',uid));
    if(!snap.exists())return null;
    const dados=snap.data();
    const favoritos=(dados.favoritos||[]).filter(f=>f&&f.publico===true);
    // so o primeiro nome, sem sobrenome nem email - privacidade
    const nomeCompleto=dados.name||'';
    const primeiroNome=nomeCompleto.split(' ')[0]||'Alguém';
    return{nome:primeiroNome,favoritos};
  }catch(e){console.error('Erro ao buscar perfil publico:',e);return null}
}

// ===== TODAS AS CONFIGURACOES DO SITE (esconder categorias, ordem do menu, perfil, cor, etc) =====
const CHAVES_CONFIG=['deltaCategoriasEscondidas','deltaSecoesEscondidas','deltaGrupoOrdemManual','deltaPerfilAtivo','deltaCorDestaque','deltaAtalhosMinimizados','deltaFiltroNovidades','deltaTheme','deltaModoSimples'];
export async function syncConfiguracoesFromCloud(uid){
  if(!uid)return;
  try{
    const snap=await getDoc(doc(db,'users',uid));
    const nuvem=(snap.exists()&&snap.data().configuracoes)||{};
    const paraSalvar={};
    CHAVES_CONFIG.forEach(k=>{
      const local=localStorage.getItem(k);
      if(local===null&&nuvem[k]!==undefined){
        try{localStorage.setItem(k,nuvem[k])}catch(e){}
        paraSalvar[k]=nuvem[k];
      }else if(local!==null){
        paraSalvar[k]=local;
      }
    });
    await setDoc(doc(db,'users',uid),{configuracoes:paraSalvar},{merge:true});
    window.dispatchEvent(new CustomEvent('delta:config-sincronizada'));
  }catch(e){console.error('Erro ao sincronizar configuracoes:',e)}
}
export async function pushConfiguracoesToCloud(uid){
  if(!uid)return;
  try{
    const paraSalvar={};
    CHAVES_CONFIG.forEach(k=>{const v=localStorage.getItem(k);if(v!==null)paraSalvar[k]=v});
    await setDoc(doc(db,'users',uid),{configuracoes:paraSalvar},{merge:true});
  }catch(e){console.error('Erro ao enviar configuracoes para a nuvem:',e)}
}

// ===== CANIVETE ASSISTENTE (dados financeiros do usuario) =====
export async function pushCaniveteToCloud(uid,dados){
  if(!uid)return;
  try{await setDoc(doc(db,'users',uid),{canivete:dados},{merge:true})}
  catch(e){console.error('Erro ao enviar dados do canivete para a nuvem:',e)}
}
export async function obterCaniveteDaNuvem(uid){
  if(!uid)return null;
  try{const snap=await getDoc(doc(db,'users',uid));return snap.exists()?(snap.data().canivete||null):null}
  catch(e){console.error('Erro ao buscar dados do canivete:',e);return null}
}

// ===== FEEDBACK GLOBAL (útil / não útil de todos os usuários, agregado) =====
export async function registrarFeedbackGlobal(promptId,tipo,delta){
  if(!promptId||(tipo!=='up'&&tipo!=='down'))return;
  delta=delta||1;
  try{await setDoc(doc(db,'feedbackGlobal',promptId),{[tipo]:increment(delta)},{merge:true})}
  catch(e){console.error('Erro ao registrar feedback global:',e)}
}

// ===== QUAL IA RESPONDEU MELHOR (por prompt, agregado de todo mundo) =====
export async function registrarPreferenciaIA(promptId,ia,delta){
  if(!promptId||(ia!=='chatgpt'&&ia!=='gemini'&&ia!=='empate'))return;
  delta=delta||1;
  try{await setDoc(doc(db,'preferenciaIA',promptId),{[ia]:increment(delta)},{merge:true})}
  catch(e){console.error('Erro ao registrar preferencia de IA:',e)}
}
export async function obterPreferenciaIA(promptId){
  try{const snap=await getDoc(doc(db,'preferenciaIA',promptId));return snap.exists()?{chatgpt:snap.data().chatgpt||0,gemini:snap.data().gemini||0,empate:snap.data().empate||0}:{chatgpt:0,gemini:0,empate:0}}
  catch(e){return{chatgpt:0,gemini:0,empate:0}}
}

export async function obterFeedbackGlobal(promptId){
  try{const snap=await getDoc(doc(db,'feedbackGlobal',promptId));return snap.exists()?{up:snap.data().up||0,down:snap.data().down||0}:{up:0,down:0}}
  catch(e){return{up:0,down:0}}
}

// ===== SUGESTOES CENTRALIZADAS (de qualquer pagina do site) =====
export async function registrarSugestao(texto,pagina){
  if(!texto||!texto.trim())return;
  try{await addDoc(collection(db,'sugestoes'),{texto:texto.trim(),pagina:pagina||location.pathname,ts:serverTimestamp(),lida:false})}
  catch(e){console.error('Erro ao registrar sugestao:',e)}
}
export async function obterSugestoes(qtd){
  try{
    const q=query(collection(db,'sugestoes'),orderBy('ts','desc'),limit(qtd||50));
    const snap=await getDocs(q);
    return snap.docs.map(d=>({id:d.id,...d.data()}));
  }catch(e){return[]}
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
let _resolverAuthPronto;
export const authPronto=new Promise(r=>{_resolverAuthPronto=r});
// ===== PRESENÇA (pessoas navegando agora) =====
export async function registrarPresenca(){
  try{
    let sid;
    try{
      sid=sessionStorage.getItem('deltaSessaoId');
      if(!sid){sid='s-'+Math.random().toString(36).slice(2)+Date.now();sessionStorage.setItem('deltaSessaoId',sid)}
    }catch(e){sid='s-'+Math.random().toString(36).slice(2)}
    await setDoc(doc(db,'presenca',sid),{ultimoPing:serverTimestamp()});
  }catch(e){}
}

export async function contarPessoasOnline(){
  try{
    const doisMinAtras=new Date(Date.now()-2*60*1000);
    const q=query(collection(db,'presenca'),where('ultimoPing','>',doisMinAtras));
    const snap=await getDocs(q);
    return snap.size;
  }catch(e){return null}
}

export function initAuthWatcher(){
  getRedirectResult(auth).then(r=>r&&saveProfile(r.user)).catch(console.error);
  let primeiraVez=true;
  onAuthStateChanged(auth,user=>{window.deltaUser=user||null;window.dispatchEvent(new CustomEvent('delta-auth-changed',{detail:{user}}));render(user);if(user){saveProfile(user).catch(console.error);syncFavoritosFromCloud(user.uid);syncUsosFromCloud(user.uid)}if(primeiraVez){primeiraVez=false;_resolverAuthPronto(user)}});
}
