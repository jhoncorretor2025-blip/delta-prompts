// ==============================
// MENU LOADER + CONTROLES
// ==============================
(function(){try{var p=location.pathname;var isIndex=/\/index\.html$/.test(p)||/\/delta-prompts\/?$/.test(p)||p==='/'||p==='/delta-prompts';if(!isIndex){localStorage.setItem('deltaUltimaPagina',JSON.stringify({path:p,ts:Date.now()}))}}catch(e){}})();
// ===== HISTÓRICO DAS ÚLTIMAS 5 PÁGINAS VISITADAS =====
(function(){
  try{
    var p=location.pathname;
    var isIndex=/\/index\.html$/.test(p)||/\/delta-prompts\/?$/.test(p)||p==='/'||p==='/delta-prompts';
    if(isIndex)return; // nao conta a propria home
    function registrar(){
      var titulo=(document.title||'').split('|')[0].trim()||p;
      var hist=[];
      try{hist=JSON.parse(localStorage.getItem('deltaHistoricoPaginas'))||[]}catch(e){}
      hist=hist.filter(function(h){return h.path!==p}); // remove duplicata, vai pro topo de novo
      hist.unshift({path:p,titulo:titulo,ts:Date.now()});
      if(hist.length>5)hist=hist.slice(0,5);
      try{localStorage.setItem('deltaHistoricoPaginas',JSON.stringify(hist))}catch(e){}
    }
    if(document.title)registrar();else document.addEventListener('DOMContentLoaded',registrar,{once:true});
  }catch(e){}
})();

// ===== REGISTRO DE VISITAS (para o painel Meus Numeros) =====
(function(){
  try{
    var hoje=new Date().toISOString().slice(0,10);
    var dias=JSON.parse(localStorage.getItem('deltaVisitDates')||'[]');
    if(dias[dias.length-1]!==hoje){
      dias.push(hoje);
      if(dias.length>120)dias=dias.slice(-120);
      localStorage.setItem('deltaVisitDates',JSON.stringify(dias));
    }
  }catch(e){}
})();

// ===== COR DE DESTAQUE PERSONALIZADA =====
(function(){
  var CORES={roxo:'#5b5ce2',verde:'#16a34a',azul:'#2563eb',rosa:'#e11d48',laranja:'#ea580c'};
  function lerCor(){try{return localStorage.getItem('deltaCorDestaque')||'roxo'}catch(e){return'roxo'}}
  function aplicarCor(nome){
    var hex=CORES[nome]||CORES.roxo;
    document.documentElement.style.setProperty('--delta-accent',hex);
    try{localStorage.setItem('deltaCorDestaque',nome)}catch(e){}
    var toggle=document.querySelector('.theme-toggle');
    if(toggle)toggle.style.setProperty('background',hex,'important');
    var barra=document.getElementById('deltaProgressBar');
    if(barra)barra.style.background='linear-gradient(90deg,'+hex+','+hex+')';
    var ms=document.getElementById('deltaModoSimplesBtn');
    if(ms&&ms.textContent.indexOf('Ligado')!==-1)ms.style.setProperty('background',hex,'important');
  }
  aplicarCor(lerCor());
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){aplicarCor(lerCor())},{once:true})}
  else{setTimeout(function(){aplicarCor(lerCor())},50)}
  function criarSeletor(){
    if(document.getElementById('deltaCorBtn'))return;
    var wrap=document.createElement('div');
    wrap.id='deltaCorWrap';
    wrap.style.cssText='position:fixed;right:30px;bottom:210px;z-index:1400';
    var btn=document.createElement('button');
    btn.type='button';btn.id='deltaCorBtn';btn.title='Escolher cor de destaque';btn.textContent='🎨';
    btn.style.cssText='width:44px;height:44px;border-radius:50%;border:1px solid #e5e7eb;background:#fff;font-size:18px;cursor:pointer;box-shadow:0 8px 20px rgba(20,20,40,.14)';
    var painel=document.createElement('div');
    painel.style.cssText='display:none;position:absolute;bottom:52px;right:0;background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:10px;box-shadow:0 12px 30px rgba(20,20,40,.18);gap:8px;flex-wrap:wrap;width:150px';
    Object.keys(CORES).forEach(function(nome){
      var sw=document.createElement('button');
      sw.type='button';sw.title=nome;
      sw.style.cssText='width:28px;height:28px;border-radius:50%;border:2px solid #fff;outline:2px solid #e5e7eb;background:'+CORES[nome]+';cursor:pointer;margin:3px';
      sw.onclick=function(){aplicarCor(nome);painel.style.display='none'};
      painel.appendChild(sw);
    });
    painel.style.display='flex';
    var painelOculto=document.createElement('div');
    painelOculto.appendChild(painel);
    btn.onclick=function(){painel.style.display=(painel.style.display==='none')?'flex':'none'};
    painel.style.display='none';
    wrap.appendChild(btn);
    wrap.appendChild(painel);
    document.body.appendChild(wrap);
    document.addEventListener('click',function(e){if(!wrap.contains(e.target))painel.style.display='none'});
  }
  if(document.body)criarSeletor();else document.addEventListener('DOMContentLoaded',criarSeletor,{once:true});
})();

// ===== CRONÔMETRO DE SESSÃO =====
(function(){
  var CHAVE='deltaSessaoInicio';
  var inicio=(function(){
    try{
      var v=sessionStorage.getItem(CHAVE);
      if(v)return parseInt(v,10);
      var agora=Date.now();
      sessionStorage.setItem(CHAVE,String(agora));
      return agora;
    }catch(e){return Date.now()}
  })();
  function criarIndicador(){
    if(document.getElementById('deltaCronometro'))return;
    var estilo=document.createElement('style');
    estilo.textContent='#deltaCronometro{position:fixed;right:14px;top:14px;z-index:900;background:rgba(255,255,255,.92);border:1px solid #e5e7eb;border-radius:999px;padding:6px 12px;font-size:11.5px;font-weight:800;color:#667085;box-shadow:0 4px 12px rgba(20,20,40,.08);pointer-events:none;display:none}@media(min-width:900px){#deltaCronometro{display:block}}';
    document.head.appendChild(estilo);
    var el=document.createElement('div');
    el.id='deltaCronometro';
    document.body.appendChild(el);
    atualizar();
    setInterval(atualizar,30000);
  }
  function atualizar(){
    var el=document.getElementById('deltaCronometro');
    if(!el)return;
    var min=Math.floor((Date.now()-inicio)/60000);
    el.textContent=min<1?'⏱️ Você chegou agora':'⏱️ Você está aqui há '+min+' min';
  }
  if(document.body)criarIndicador();else document.addEventListener('DOMContentLoaded',criarIndicador,{once:true});
})();

// ===== VOLTAR AO TOPO =====
(function(){
  function criarBotao(){
    if(document.getElementById('deltaVoltarTopoBtn'))return;
    var btn=document.createElement('button');
    btn.type='button';
    btn.id='deltaVoltarTopoBtn';
    btn.title='Voltar ao topo';
    btn.textContent='⬆️';
    btn.style.cssText='position:fixed;right:30px;bottom:150px;z-index:1400;width:44px;height:44px;border-radius:50%;border:1px solid #e5e7eb;background:#fff;color:#172033;font-size:18px;cursor:pointer;box-shadow:0 8px 20px rgba(20,20,40,.14);display:none;align-items:center;justify-content:center';
    btn.onclick=function(){window.scrollTo({top:0,behavior:'smooth'})};
    document.body.appendChild(btn);
    window.addEventListener('scroll',function(){btn.style.display=window.scrollY>500?'flex':'none'},{passive:true});
  }
  if(document.body)criarBotao();else document.addEventListener('DOMContentLoaded',criarBotao,{once:true});
})();

// ===== ATALHO DE TECLADO "/" PARA FOCAR NA BUSCA =====
(function(){
  document.addEventListener('keydown',function(e){
    if(e.key!=='/')return;
    var alvo=e.target;
    var tag=alvo&&alvo.tagName;
    if(tag==='INPUT'||tag==='TEXTAREA'||(alvo&&alvo.isContentEditable))return;
    var busca=document.getElementById('busca')||document.querySelector('input[type="search"]');
    if(busca){e.preventDefault();busca.focus()}
  });
})();

// ===== PWA: manifest, service worker e icones (instalar como app) =====
(function(){
  try{
    if(!document.querySelector('link[rel="manifest"]')){
      var link=document.createElement('link');
      link.rel='manifest';
      link.href='/delta-prompts/manifest.json';
      document.head.appendChild(link);
    }
    if(!document.querySelector('meta[name="theme-color"]')){
      var tema=document.createElement('meta');
      tema.name='theme-color';
      tema.content='#5b5ce2';
      document.head.appendChild(tema);
    }
    if(!document.querySelector('link[rel="apple-touch-icon"]')){
      var appleIcon=document.createElement('link');
      appleIcon.rel='apple-touch-icon';
      appleIcon.href='/delta-prompts/apple-touch-icon.png';
      document.head.appendChild(appleIcon);
    }
    if('serviceWorker' in navigator){
      navigator.serviceWorker.register('/delta-prompts/sw.js').catch(function(){});
    }
  }catch(e){}
})();

// ===== BARRA DE PROGRESSO DE LEITURA =====
(function(){
  function montar(){
    if(document.getElementById('deltaProgressBar'))return;
    var bar=document.createElement('div');
    bar.id='deltaProgressBar';
    bar.style.cssText='position:fixed;top:0;left:0;height:4px;background:linear-gradient(90deg,#5b5ce2,#7a5bff);width:0%;z-index:2000;transition:width .12s linear;pointer-events:none';
    document.body.appendChild(bar);
  }
  function atualizar(){
    var bar=document.getElementById('deltaProgressBar');
    if(!bar)return;
    var alturaTotal=document.documentElement.scrollHeight-window.innerHeight;
    var progresso=alturaTotal>0?(window.scrollY/alturaTotal)*100:0;
    bar.style.width=Math.min(100,Math.max(0,progresso))+'%';
  }
  if(document.body)montar();else document.addEventListener('DOMContentLoaded',montar,{once:true});
  window.addEventListener('scroll',atualizar,{passive:true});
  window.addEventListener('resize',atualizar);
  document.addEventListener('DOMContentLoaded',atualizar);
  setTimeout(atualizar,500);
})();

// ===== MODO LEITURA (aumenta a fonte dos prompts para ler melhor) =====
(function(){
  function lerAtivo(){try{return localStorage.getItem('deltaModoLeitura')==='true'}catch(e){return false}}
  function aplicar(ativo){document.documentElement.setAttribute('data-modo-leitura',ativo?'true':'false');try{localStorage.setItem('deltaModoLeitura',ativo?'true':'false')}catch(e){}}
  aplicar(lerAtivo());
  function criarBotao(){
    if(document.getElementById('deltaModoLeituraBtn'))return;
    var btn=document.createElement('button');
    btn.type='button';
    btn.id='deltaModoLeituraBtn';
    btn.title='Modo Leitura: aumenta o texto dos prompts para ler melhor';
    function atualizarTexto(){var lig=lerAtivo();btn.textContent=lig?'🔍 Leitura: Ligado':'🔍 Modo Leitura';btn.style.background=lig?'#0891b2':'#fff';btn.style.color=lig?'#fff':'#172033'}
    btn.style.cssText='position:fixed;left:14px;bottom:66px;z-index:1400;border:1px solid #e5e7eb;border-radius:999px;padding:9px 15px;font-weight:800;font-size:13px;cursor:pointer;box-shadow:0 8px 20px rgba(20,20,40,.14)';
    atualizarTexto();
    btn.onclick=function(){aplicar(!lerAtivo());atualizarTexto()};
    document.body.appendChild(btn);
  }
  if(document.body)criarBotao();else document.addEventListener('DOMContentLoaded',criarBotao,{once:true});
})();

// ===== PREENCHER POR VOZ (nos campos editaveis dos prompts) =====
(function(){
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR)return; // navegador sem suporte, nao adiciona o botao
  function criarBotaoMic(input){
    if(input.dataset.micAdicionado)return;
    input.dataset.micAdicionado='1';
    var btn=document.createElement('button');
    btn.type='button';
    btn.title='Preencher por voz';
    btn.textContent='🎤';
    btn.style.cssText='border:1px solid #e5e7eb;background:#fff;border-radius:9px;padding:0 12px;cursor:pointer;font-size:15px;flex:0 0 auto;margin-left:6px';
    var linha=document.createElement('div');
    linha.style.cssText='display:flex;align-items:center;gap:0';
    input.parentNode.insertBefore(linha,input);
    linha.appendChild(input);
    linha.appendChild(btn);
    btn.addEventListener('click',function(){
      var rec=new SR();
      rec.lang='pt-BR';
      rec.interimResults=false;
      btn.textContent='🔴';
      btn.disabled=true;
      rec.onresult=function(ev){
        var texto=ev.results[0][0].transcript;
        input.value=input.value?input.value+' '+texto:texto;
        input.dispatchEvent(new Event('input',{bubbles:true}));
      };
      rec.onerror=function(){btn.textContent='🎤';btn.disabled=false};
      rec.onend=function(){btn.textContent='🎤';btn.disabled=false};
      try{rec.start()}catch(e){btn.textContent='🎤';btn.disabled=false}
    });
  }
  function escanear(){document.querySelectorAll('.campo-label input').forEach(criarBotaoMic)}
  var t=null;
  function agendar(delay){clearTimeout(t);t=setTimeout(escanear,delay||300)}
  setTimeout(escanear,900);
  document.addEventListener('click',function(){agendar(300)},true);
  document.addEventListener('input',function(){agendar(500)},true);
})();

// ===== EXPORTAR PROMPT EM PDF (por card, em qualquer pagina) =====
(function(){
  var jsPDFPromise=null;
  function carregarJsPDF(){
    if(jsPDFPromise)return jsPDFPromise;
    jsPDFPromise=new Promise(function(resolve,reject){
      if(window.jspdf&&window.jspdf.jsPDF){resolve(window.jspdf.jsPDF);return}
      var script=document.createElement('script');
      script.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload=function(){resolve(window.jspdf.jsPDF)};
      script.onerror=reject;
      document.head.appendChild(script);
    });
    return jsPDFPromise;
  }
  function gerarPDF(titulo,texto,btn){
    var textoOriginal=btn.textContent;
    btn.textContent='⏳';
    carregarJsPDF().then(function(jsPDF){
      var doc=new jsPDF({unit:'pt',format:'a4'});
      var margem=48,largura=595-margem*2,y=0;
      doc.setFillColor(91,92,226);
      doc.rect(0,0,595,70,'F');
      doc.setTextColor(255,255,255);
      doc.setFont('helvetica','bold');
      doc.setFontSize(18);
      doc.text('Δ Delta Prompts',margem,44);
      y=110;
      doc.setTextColor(20,20,30);
      doc.setFont('helvetica','bold');
      doc.setFontSize(15);
      var linhasTitulo=doc.splitTextToSize(titulo.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu,'').trim(),largura);
      doc.text(linhasTitulo,margem,y);
      y+=linhasTitulo.length*20+16;
      doc.setDrawColor(230,230,235);
      doc.line(margem,y,595-margem,y);
      y+=26;
      doc.setFont('helvetica','normal');
      doc.setFontSize(11);
      doc.setTextColor(50,50,60);
      var linhas=doc.splitTextToSize(texto,largura);
      linhas.forEach(function(linha){
        if(y>780){doc.addPage();y=48}
        doc.text(linha,margem,y);
        y+=15;
      });
      doc.setFontSize(9);
      doc.setTextColor(150,150,160);
      doc.text('jhoncorretor2025-blip.github.io/delta-prompts',margem,820);
      var nomeArquivo=titulo.replace(/[^a-zA-Z0-9]+/g,'-').toLowerCase().slice(0,50)+'.pdf';
      doc.save(nomeArquivo);
      btn.textContent=textoOriginal;
    }).catch(function(){btn.textContent=textoOriginal;alert('Não foi possível gerar o PDF agora. Tente novamente.')});
  }
  function criarBotaoPDF(favBtn){
    var acoes=favBtn.closest('.acoes');
    if(!acoes||acoes.querySelector('.delta-pdf-btn'))return;
    var id=favBtn.dataset.id;
    if(!id)return;
    var b=document.createElement('button');
    b.type='button';b.className='delta-pdf-btn';
    b.style.cssText='flex:1 1 100px;border:0;border-radius:11px;padding:10px;font-weight:800;cursor:pointer;font-size:inherit;background:#fee2e2;color:#b91c1c';
    b.textContent='📄 PDF';
    b.addEventListener('click',function(){
      var card=favBtn.closest('.card')||favBtn.closest('[id^="card-"]');
      if(!card)return;
      var h=card.querySelector('h3');
      var texto=card.querySelector('.prompt-text,pre');
      if(!h||!texto)return;
      gerarPDF(h.textContent.trim(),texto.textContent.trim(),b);
    });
    acoes.appendChild(b);
  }
  function escanearPDF(){document.querySelectorAll('[data-acao="favoritar"]').forEach(criarBotaoPDF)}
  var tp=null;
  function agendarPDF(delay){clearTimeout(tp);tp=setTimeout(escanearPDF,delay||300)}
  setTimeout(escanearPDF,950);
  document.addEventListener('click',function(){agendarPDF(300)},true);
  document.addEventListener('change',function(){agendarPDF(300)},true);
  document.addEventListener('input',function(){agendarPDF(450)},true);
})();

// ===== NAVEGAÇÃO POR TECLADO ENTRE PROMPTS =====
(function(){
  var indiceAtual=-1;
  function estaDigitando(){var a=document.activeElement;return a&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA'||a.isContentEditable)}
  function pegarCards(){return [].slice.call(document.querySelectorAll('.card, .prompt-card'))}
  function limparDestaqueTeclado(){document.querySelectorAll('.teclado-foco').forEach(function(c){c.classList.remove('teclado-foco')})}
  function focarCard(idx,cards){
    if(!cards.length)return;
    idx=Math.max(0,Math.min(idx,cards.length-1));
    limparDestaqueTeclado();
    var card=cards[idx];
    card.classList.add('teclado-foco');
    card.scrollIntoView({behavior:'smooth',block:'center'});
    indiceAtual=idx;
  }
  document.addEventListener('keydown',function(e){
    if(estaDigitando())return;
    var teclas=['ArrowDown','ArrowUp','ArrowRight','ArrowLeft','Enter'];
    if(teclas.indexOf(e.key)===-1)return;
    var cards=pegarCards();
    if(!cards.length)return;
    if(e.key==='ArrowDown'||e.key==='ArrowRight'){e.preventDefault();focarCard(indiceAtual+1,cards)}
    else if(e.key==='ArrowUp'||e.key==='ArrowLeft'){e.preventDefault();focarCard(indiceAtual-1,cards)}
    else if(e.key==='Enter'&&indiceAtual>=0&&cards[indiceAtual]){
      var card=cards[indiceAtual];
      var btnCopiar=card.querySelector('[data-acao="copiar"], .copiar')||[].slice.call(card.querySelectorAll('button')).find(function(b){return /copiar/i.test(b.textContent)&&!/sugest/i.test(b.textContent)});
      if(btnCopiar){e.preventDefault();btnCopiar.click()}
    }
  });
  var estilo=document.createElement('style');
  estilo.textContent='.teclado-foco{outline:3px solid #5b5ce2!important;outline-offset:3px}';
  document.head.appendChild(estilo);
})();

// ===== FIXAR PROMPT NO TOPO (funciona em qualquer pagina com botao de favoritar) =====
(function(){
  function _loadPins(){try{return JSON.parse(localStorage.getItem('deltaPins'))||[]}catch(e){return[]}}
  function _savePins(l){try{localStorage.setItem('deltaPins',JSON.stringify(l))}catch(e){}}
  function isPinned(id){return _loadPins().indexOf(id)!==-1}
  function estiloBotao(b,fixado){b.textContent=fixado?'📌 Fixado':'📌 Fixar';b.style.background=fixado?'#fef3c7':'#f1f5f9';b.style.color=fixado?'#b45309':'#475467'}
  function togglePin(id){var l=_loadPins();var idx=l.indexOf(id);if(idx===-1)l.unshift(id);else l.splice(idx,1);_savePins(l)}
  function criarBotaoPin(id){
    var b=document.createElement('button');
    b.type='button';b.className='delta-pin-btn';b.dataset.pinId=id;
    b.style.cssText='flex:1 1 100px;border:0;border-radius:11px;padding:10px;font-weight:800;cursor:pointer;font-size:inherit';
    estiloBotao(b,isPinned(id));
    b.onclick=function(){togglePin(id);estiloBotao(b,isPinned(id));reordenar()};
    return b;
  }
  function injetarBotoes(){
    document.querySelectorAll('[data-acao="favoritar"]').forEach(function(favBtn){
      var acoes=favBtn.closest('.acoes');
      if(!acoes||acoes.querySelector('.delta-pin-btn'))return;
      var id=favBtn.dataset.id;
      if(!id)return;
      acoes.insertBefore(criarBotaoPin(id),favBtn.nextSibling);
    });
  }
  function reordenar(){
    var pins=_loadPins();
    if(!pins.length)return;
    var vistos=[];
    document.querySelectorAll('.delta-pin-btn').forEach(function(btn){
      var card=btn.closest('.card')||btn.closest('[id^="card-"]');
      if(!card||!card.parentElement)return;
      if(vistos.indexOf(card.parentElement)!==-1)return;
      vistos.push(card.parentElement);
    });
    vistos.forEach(function(cont){
      var filhosComPin=[].slice.call(cont.children).filter(function(el){return el.querySelector&&el.querySelector('.delta-pin-btn')});
      var fixados=filhosComPin.filter(function(el){var b=el.querySelector('.delta-pin-btn');return pins.indexOf(b.dataset.pinId)!==-1});
      var ordemFixados=fixados.slice().sort(function(a,b){var ba=a.querySelector('.delta-pin-btn').dataset.pinId,bb=b.querySelector('.delta-pin-btn').dataset.pinId;return pins.indexOf(ba)-pins.indexOf(bb)});
      ordemFixados.slice().reverse().forEach(function(el){cont.prepend(el)});
    });
  }
  function rodar(){injetarBotoes();reordenar()}
  var t=null;
  function agendarRodada(delay){clearTimeout(t);t=setTimeout(rodar,delay||300)}
  setTimeout(rodar,900);
  document.addEventListener('click',function(){agendarRodada(250)},true);
  document.addEventListener('change',function(){agendarRodada(250)},true);
  document.addEventListener('input',function(){agendarRodada(450)},true);
})();
(function(){
  function lerModoSimples(){try{return localStorage.getItem('deltaModoSimples')==='true'}catch(e){return false}}
  function aplicar(ativo){document.documentElement.setAttribute('data-modo-simples',ativo?'true':'false');try{localStorage.setItem('deltaModoSimples',ativo?'true':'false')}catch(e){}}
  var ativo=lerModoSimples();
  aplicar(ativo);
  if(ativo){
    setTimeout(function(){
      var btn=document.querySelector('#filtrosNivel [data-nivel="basico"], .filtro-nivel [data-nivel="basico"], [id^="filtrosNivel"] [data-nivel="basico"]');
      if(btn&&!btn.classList.contains('ativo'))btn.click();
    },700);
  }
  function criarBotao(){
    if(document.getElementById('deltaModoSimplesBtn'))return;
    var btn=document.createElement('button');
    btn.type='button';
    btn.id='deltaModoSimplesBtn';
    btn.title='Modo Simples: letras maiores e só o essencial, ótimo para quem está começando';
    function atualizarTexto(){var lig=lerModoSimples();btn.textContent=lig?'🧓 Modo Simples: Ligado':'🧓 Modo Simples';btn.style.background=lig?'#16a34a':'#fff';btn.style.color=lig?'#fff':'#172033'}
    btn.style.cssText='position:fixed;left:14px;bottom:14px;z-index:1400;border:1px solid #e5e7eb;border-radius:999px;padding:11px 18px;font-weight:800;font-size:14px;cursor:pointer;box-shadow:0 8px 20px rgba(20,20,40,.14)';
    atualizarTexto();
    btn.onclick=function(){aplicar(!lerModoSimples());atualizarTexto();location.reload()};
    document.body.appendChild(btn);
  }
  if(document.body)criarBotao();else document.addEventListener('DOMContentLoaded',criarBotao,{once:true});
})();
(function(){
  if(document.querySelector('.delta-bottom-nav'))return;
  var nav=document.createElement('nav');
  nav.className='delta-bottom-nav';
  nav.setAttribute('aria-label','Navegação rápida');
  nav.innerHTML='<a href="/delta-prompts/index.html"><span aria-hidden="true">🏠</span>Início</a><a href="/delta-prompts/index.html#buscar"><span aria-hidden="true">🔎</span>Buscar</a><a href="/delta-prompts/favoritos.html"><span aria-hidden="true">❤️</span>Favoritos</a><button type="button"><span aria-hidden="true">☰</span>Menu</button>';
  function anexar(){
    document.body.appendChild(nav);
    var btnMenu=nav.querySelector('button');
    btnMenu.addEventListener('click',function(){
      var toggle=document.querySelector('.menu-toggle');
      if(toggle)toggle.click();
    });
  }
  if(document.body)anexar();else document.addEventListener('DOMContentLoaded',anexar,{once:true});
})();
(function(){function getMenuCandidates(){const version='delta-prompts-20260831-menu-v47';return[`/delta-prompts/menu.html?v=${version}`,`${new URL('/delta-prompts/menu.html',window.location.origin).href}?v=${version}`]}async function fetchMenu(){for(const url of [...new Set(getMenuCandidates())]){try{const res=await fetch(url,{cache:'default'});if(res.ok)return res.text()}catch(e){}}throw new Error('Falha ao carregar menu')}window.attachMenuControls=function(){const menuEl=document.getElementById('menu'),sidebar=menuEl&&menuEl.querySelector('.sidebar'),toggle=menuEl&&menuEl.querySelector('.menu-toggle');if(!menuEl||!sidebar||!toggle)return;let open=false;function setOpen(value){open=!!value;sidebar.classList.toggle('active',open);toggle.setAttribute('aria-expanded',String(open));document.documentElement.classList.toggle('menu-open',open)}toggle.onclick=function(e){e.preventDefault();e.stopPropagation();setOpen(!open)};menuEl.addEventListener('click',function(e){const link=e.target.closest&&e.target.closest('a');if(link)setOpen(false);const title=e.target.closest&&e.target.closest('.menu-title');if(title){const section=title.closest('.menu-section'),links=section&&section.querySelector('.menu-links');if(links){menuEl.querySelectorAll('.menu-links.active').forEach(m=>{if(m!==links)m.classList.remove('active')});links.classList.toggle('active')}}});document.addEventListener('keydown',function(e){if(e.key==='Escape')setOpen(false)},{passive:true})};let authPromise=null;let deltaUid=null;let pushFavTimer=null;let pushUsosTimer=null;var DELTA_ADMIN_EMAIL='jhoncorretor2025@gmail.com';function loadAuth(){if(!authPromise){authPromise=import('/delta-prompts/firebase-auth.js?v=20260830').then(function(mod){window.deltaAuth={login:mod.login,logout:mod.logout,getUser:mod.getUser,syncFavoritos:mod.syncFavoritosFromCloud,pushFavoritos:mod.pushFavoritosToCloud,syncUsos:mod.syncUsosFromCloud,pushUsos:mod.pushUsosToCloud,registrarFeedbackGlobal:mod.registrarFeedbackGlobal,obterFeedbackGlobal:mod.obterFeedbackGlobal,registrarPageView:mod.registrarPageView,obterTopFeedback:mod.obterTopFeedback,obterTopPageViews:mod.obterTopPageViews,authPronto:mod.authPronto,registrarPresenca:mod.registrarPresenca,contarPessoasOnline:mod.contarPessoasOnline};mod.initAuthWatcher();mod.registrarPageView(location.pathname);mod.registrarPresenca();setInterval(mod.registrarPresenca,25000);return mod}).catch(function(err){console.error('Falha ao carregar autenticacao:',err)})}return authPromise}window.deltaLoadAuth=loadAuth;window.addEventListener('delta-auth-changed',function(e){deltaUid=e.detail&&e.detail.user?e.detail.user.uid:null;var user=e.detail&&e.detail.user;if(user&&user.email===DELTA_ADMIN_EMAIL){setTimeout(function(){var links=document.querySelector('.sidebar .menu-links:last-of-type')||document.querySelector('.sidebar');if(links&&!document.getElementById('deltaAdminLink')){var a=document.createElement('a');a.id='deltaAdminLink';a.href='/delta-prompts/admin.html';a.textContent='🔐 Painel Admin';links.appendChild(a)}},400)}});window.addEventListener('delta:favoritos-updated',function(){clearTimeout(pushFavTimer);pushFavTimer=setTimeout(function(){loadAuth().then(function(mod){return mod&&mod.authPronto}).then(function(){if(deltaUid&&window.deltaAuth&&window.deltaAuth.pushFavoritos)window.deltaAuth.pushFavoritos(deltaUid)})},600)});document.addEventListener('click',function(e){const btn=e.target.closest&&e.target.closest('[data-acao="copiar"],[data-acao="chat"],[data-acao="gemini"]');if(!btn||!deltaUid||!window.deltaAuth||!window.deltaAuth.pushUsos)return;clearTimeout(pushUsosTimer);pushUsosTimer=setTimeout(function(){window.deltaAuth.pushUsos(deltaUid)},800)},true);
// ===== Guarda titulo/link de cada prompt usado (para o Top 5 em Meus Numeros) e registra atividade diaria =====
document.addEventListener('click',function(e){
  var btn=e.target.closest&&e.target.closest('[data-acao="copiar"],[data-acao="chat"],[data-acao="gemini"]');
  if(!btn)return;
  var id=btn.dataset.id;
  var card=btn.closest('.card');
  var h3=card&&card.querySelector('h3');
  if(id&&h3){
    try{
      var mapa=JSON.parse(localStorage.getItem('deltaTituloPorId')||'{}');
      mapa[id]={titulo:h3.textContent.trim(),url:location.pathname};
      localStorage.setItem('deltaTituloPorId',JSON.stringify(mapa));
    }catch(err){}
  }
  try{
    var hoje=new Date().toISOString().slice(0,10);
    var ativ=JSON.parse(localStorage.getItem('deltaAtividadeDiaria')||'{}');
    ativ[hoje]=(ativ[hoje]||0)+1;
    localStorage.setItem('deltaAtividadeDiaria',JSON.stringify(ativ));
  }catch(err){}
},true);
fetchMenu().then(html=>{const container=document.getElementById('menu');if(!container)return;container.innerHTML=html;window.attachMenuControls();loadAuth();aplicarMenuInteligente()}).catch(err=>console.error(err))})();

// ===== MENU INTELIGENTE: reordena os 5 grupos grandes pelo uso de cada pessoa =====
(function(){
  var CHAVES={pessoal:'PESSOAL & DIA A DIA',carreira:'CARREIRA PESSOAL',empresa:'GESTÃO DE EMPRESA',avancado:'IA & RECURSOS',biblioteca:'BIBLIOTECA'};
  function chaveDoTitulo(texto){
    texto=(texto||'').toUpperCase();
    for(var k in CHAVES){if(texto.indexOf(CHAVES[k])!==-1)return k}
    return null;
  }
  function lerScores(){try{return JSON.parse(localStorage.getItem('deltaGrupoScores'))||{}}catch(e){return{}}}
  function salvarScores(s){try{localStorage.setItem('deltaGrupoScores',JSON.stringify(s))}catch(e){}}
  function somarScore(grupo,pontos){
    if(!grupo)return;
    var s=lerScores();
    s[grupo]=(s[grupo]||0)+pontos;
    salvarScores(s);
  }
  function grupoDaPaginaAtual(sidebar){
    var caminho=location.pathname;
    var titulos=sidebar.querySelectorAll('.menu-group-title');
    for(var i=0;i<titulos.length;i++){
      var el=titulos[i].nextElementSibling;
      while(el&&!el.classList.contains('menu-group-title')){
        var links=el.querySelectorAll('a[href]');
        for(var j=0;j<links.length;j++){
          try{if(new URL(links[j].href,location.origin).pathname===caminho)return chaveDoTitulo(titulos[i].textContent)}catch(e){}
        }
        el=el.nextElementSibling;
      }
    }
    return null;
  }
  window._deltaGrupoAtual=null;

  function criarGruposRecolhiveis(sidebar){
    var titulos=[].slice.call(sidebar.querySelectorAll('.menu-group-title'));
    if(!titulos.length)return;
    function lerColapsados(){try{return JSON.parse(localStorage.getItem('deltaGruposColapsados'))||{}}catch(e){return{}}}
    function salvarColapsados(o){try{localStorage.setItem('deltaGruposColapsados',JSON.stringify(o))}catch(e){}}
    var colapsados=lerColapsados();
    var funcoesAplicar=[];
    function atualizarBotaoExpandirTudo(){
      var c=lerColapsados();
      var algumFechado=Object.keys(c).some(function(k){return c[k]});
      var btn=document.getElementById('deltaExpandirTudoBtn');
      if(btn)btn.style.display=algumFechado?'block':'none';
    }
    titulos.forEach(function(titulo){
      if(titulo.dataset.recolhivel)return; // ja preparado, evita duplicar
      titulo.dataset.recolhivel='1';
      var chave=chaveDoTitulo(titulo.textContent)||titulo.textContent;
      var els=[];
      var el=titulo.nextElementSibling;
      while(el&&!el.classList.contains('menu-group-title')){els.push(el);el=el.nextElementSibling}
      var seta=document.createElement('span');
      seta.textContent='▾';
      seta.style.cssText='float:right;transition:transform .2s ease;font-size:12px;opacity:.6';
      titulo.appendChild(seta);
      titulo.style.cursor='pointer';
      titulo.style.userSelect='none';
      function aplicar(colapsado){
        els.forEach(function(e){e.style.display=colapsado?'none':''});
        seta.style.transform=colapsado?'rotate(-90deg)':'rotate(0deg)';
      }
      funcoesAplicar.push(aplicar);
      var estadoInicial=!!colapsados[chave];
      aplicar(estadoInicial);
      titulo.addEventListener('click',function(){
        var c=lerColapsados();
        var novoEstado=!c[chave];
        c[chave]=novoEstado;
        salvarColapsados(c);
        aplicar(novoEstado);
        atualizarBotaoExpandirTudo();
      });
    });
    if(!document.getElementById('deltaExpandirTudoBtn')){
      var brand=sidebar.querySelector('.menu-brand');
      if(brand){
        var btnExpandir=document.createElement('button');
        btnExpandir.type='button';btnExpandir.id='deltaExpandirTudoBtn';
        btnExpandir.textContent='↕️ Expandir todos os menus';
        btnExpandir.style.cssText='display:none;width:100%;text-align:left;border:1px solid #fed7aa;background:#fff7ed;color:#c2410c;border-radius:10px;padding:9px 12px;cursor:pointer;font-size:12.5px;font-weight:800;margin-bottom:8px';
        btnExpandir.addEventListener('click',function(){
          try{localStorage.setItem('deltaGruposColapsados','{}')}catch(e){}
          funcoesAplicar.forEach(function(fn){fn(false)});
          atualizarBotaoExpandirTudo();
        });
        brand.parentNode.insertBefore(btnExpandir,brand.nextSibling);
      }
    }
    atualizarBotaoExpandirTudo();
  }

  function lerOrdemManual(){try{return JSON.parse(localStorage.getItem('deltaGrupoOrdemManual'))}catch(e){return null}}

  function reordenarGrupos(sidebar){
    var titulos=[].slice.call(sidebar.querySelectorAll('.menu-group-title'));
    if(!titulos.length)return;
    var blocos=titulos.map(function(titulo){
      var els=[titulo];
      var el=titulo.nextElementSibling;
      while(el&&!el.classList.contains('menu-group-title')){els.push(el);el=el.nextElementSibling}
      return{chave:chaveDoTitulo(titulo.textContent),els:els};
    });
    var ordemManual=lerOrdemManual();
    var comIndice;
    if(ordemManual&&ordemManual.length){
      comIndice=blocos.map(function(b,i){var pos=ordemManual.indexOf(b.chave);return{b:b,i:i,score:pos===-1?999:-pos}});
      comIndice.sort(function(a,b){if(b.score!==a.score)return b.score-a.score;return a.i-b.i});
    }else{
      var scores=lerScores();
      comIndice=blocos.map(function(b,i){return{b:b,i:i,score:b.chave?(scores[b.chave]||0):0}});
      comIndice.sort(function(a,b){if(b.score!==a.score)return b.score-a.score;return a.i-b.i});
    }
    comIndice.forEach(function(item){
      item.b.els.forEach(function(el){sidebar.insertBefore(el,null)});
    });
  }

  function criarMinimizarAtalhos(sidebar){
    var brand=sidebar.querySelector('.menu-brand');
    if(!brand)return;
    var el=brand.nextElementSibling;
    var candidatos=[];
    while(el&&!el.classList.contains('menu-group-title')){
      if(el.tagName==='A'&&!el.classList.contains('menu-fav-fixo'))candidatos.push(el); // so os links originais (Inicio, Mais Acessados, Novo Prompt, Gerador Pro); Favoritos/Biblioteca fixos ficam sempre visiveis
      el=el.nextElementSibling;
    }
    if(!candidatos.length)return;
    if(document.getElementById('deltaMinimizarAtalhos'))return;
    var btn=document.createElement('button');
    btn.type='button';btn.id='deltaMinimizarAtalhos';
    btn.style.cssText='display:block;width:100%;text-align:left;border:0;background:none;color:#8a92a6;font-size:12px;font-weight:800;padding:6px 4px;cursor:pointer;margin-bottom:4px';
    function lerEstado(){try{return localStorage.getItem('deltaAtalhosMinimizados')==='true'}catch(e){return false}}
    function aplicar(min){
      candidatos.forEach(function(c){c.style.display=min?'none':''});
      btn.textContent=min?'▸ Mostrar atalhos':'▾ Minimizar atalhos';
      try{localStorage.setItem('deltaAtalhosMinimizados',min?'true':'false')}catch(e){}
    }
    btn.addEventListener('click',function(){aplicar(!lerEstado())});
    brand.parentNode.insertBefore(btn,brand.nextSibling);
    aplicar(lerEstado());
  }

  var NOVIDADES=[
    {id:'menu-inteligente',texto:'🧭 Menu inteligente: os grupos se reorganizam pelo seu uso'},
    {id:'quiz',texto:'🧭 Novo quiz "Qual prompt eu uso?"'},
    {id:'meus-numeros',texto:'📊 Nova página "Meus Números" com seu streak de uso'},
    {id:'cor-destaque',texto:'🎨 Escolha sua cor de destaque favorita'},
    {id:'pdf-export',texto:'📄 Agora dá pra exportar qualquer prompt em PDF'},
    {id:'voz-campos',texto:'🎤 Preencha os campos dos prompts falando, por voz'},
    {id:'modo-leitura',texto:'🔍 Modo Leitura: letras maiores pra ler melhor'},
    {id:'modo-simples',texto:'🧓 Modo Simples pra quem está começando agora'},
    {id:'fixar-topo',texto:'📌 Agora dá pra fixar seus prompts favoritos no topo'},
    {id:'por-onde-comeco',texto:'🧭 Seção "Por onde eu começo?" em várias páginas'}
  ];
  function lerNovidadesVistas(){try{return JSON.parse(localStorage.getItem('deltaNovidadesVistas'))||[]}catch(e){return[]}}
  function salvarNovidadesVistas(v){try{localStorage.setItem('deltaNovidadesVistas',JSON.stringify(v))}catch(e){}}
  function novidadesNaoVistas(){var vistos=lerNovidadesVistas();return NOVIDADES.filter(function(n){return vistos.indexOf(n.id)===-1})}
  function marcarNovidadesVistas(){salvarNovidadesVistas(NOVIDADES.map(function(n){return n.id}))}

  function criarSinoNovidades(sidebar){
    if(document.getElementById('deltaSinoNovidades'))return;
    var brand=sidebar.querySelector('.menu-brand');
    if(!brand)return;
    var wrap=document.createElement('div');
    wrap.style.cssText='position:relative;margin-bottom:8px';
    var btn=document.createElement('button');
    btn.type='button';btn.id='deltaSinoNovidades';
    btn.style.cssText='display:flex;align-items:center;gap:8px;width:100%;text-align:left;border:1px solid #e5e7eb;background:#fff;border-radius:10px;padding:9px 12px;cursor:pointer;font-size:13px;font-weight:800;color:#344055';
    function atualizarTexto(){var n=novidadesNaoVistas().length;btn.innerHTML='🔔 Novidades'+(n>0?' <span style="background:#ef4444;color:#fff;font-size:11px;border-radius:999px;padding:1px 7px;margin-left:auto">'+n+'</span>':'')}
    atualizarTexto();
    var painel=document.createElement('div');
    painel.style.cssText='display:none;position:absolute;top:calc(100% + 6px);left:0;right:0;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 12px 30px rgba(20,20,40,.18);padding:10px;z-index:50;max-height:280px;overflow-y:auto';
    painel.innerHTML=NOVIDADES.map(function(item){return '<div style="padding:8px 6px;font-size:12.5px;border-bottom:1px solid #f1f5f9;line-height:1.4">'+item.texto+'</div>'}).join('');
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      var aberto=painel.style.display==='block';
      painel.style.display=aberto?'none':'block';
      if(!aberto){marcarNovidadesVistas();atualizarTexto()}
    });
    document.addEventListener('click',function(e){if(!wrap.contains(e.target))painel.style.display='none'});
    wrap.appendChild(btn);
    wrap.appendChild(painel);
    brand.parentNode.insertBefore(wrap,brand.nextSibling);
  }

  window.aplicarMenuInteligente=function(){
    var sidebar=document.querySelector('#menu .sidebar');
    if(!sidebar)return;
    reordenarGrupos(sidebar);
    criarGruposRecolhiveis(sidebar);
    criarSinoNovidades(sidebar);
    criarMinimizarAtalhos(sidebar);
    var grupo=grupoDaPaginaAtual(sidebar);
    window._deltaGrupoAtual=grupo;
    if(grupo)somarScore(grupo,1); // visita conta 1 ponto
  };

  // Acoes reais (copiar, favoritar) somam mais peso ao grupo da pagina atual
  document.addEventListener('click',function(e){
    var btn=e.target.closest&&e.target.closest('button,a');
    if(!btn||!window._deltaGrupoAtual)return;
    var texto=(btn.textContent||'').trim();
    var ehCopiar=/copiar/i.test(texto)&&!/sugest/i.test(texto);
    var ehFavoritar=btn.classList&&(btn.classList.contains('favoritar')||btn.classList.contains('fav-btn'));
    if(ehCopiar||ehFavoritar)somarScore(window._deltaGrupoAtual,3);
  },true);
})();
(function(){function enhanceCategoryPage(){const hasPromptCards=document.querySelector('.prompt-text, pre.prompt-text, #lista, #lista-prompts');const hasCategoryHeading=document.querySelector('main > h1');if(hasPromptCards&&hasCategoryHeading)document.body.classList.add('category-page')}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhanceCategoryPage,{once:true});else enhanceCategoryPage()})();
(function(){function load(){if(window.gtag)return;const GA_ID='G-1YF2VY4HXW',script=document.createElement('script');script.async=true;script.src=`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;document.head.appendChild(script);window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config',GA_ID)}if('requestIdleCallback'in window)requestIdleCallback(load,{timeout:4000});else setTimeout(load,2500)})();
(function(){const API='https://api.counterapi.dev/v1',NAMESPACE='delta-prompts-jhoncorretor2025';function key(){return(window.location.pathname.replace(/^\/delta-prompts\/?/,'').replace(/\/$/,'')||'inicio').replace(/\.html$/,'').replace(/[^a-zA-Z0-9_-]+/g,'-').toLowerCase()}function start(){const main=document.querySelector('main'),h1=main&&main.querySelector('h1');if(!h1||document.getElementById('page-view-counter'))return;const badge=document.createElement('div');badge.id='page-view-counter';badge.className='page-view-counter';badge.innerHTML='<span>👁️</span> <strong>—</strong> visualizações';h1.insertAdjacentElement('afterend',badge);const controller=new AbortController();setTimeout(()=>controller.abort(),3500);fetch(`${API}/${NAMESPACE}/${key()}/up`,{cache:'no-store',signal:controller.signal}).then(r=>r.ok?r.json():Promise.reject()).then(d=>{const n=Number(d.count??d.value??d.data?.count??d.data?.value??d.data);if(Number.isFinite(n)&&n>=200)badge.querySelector('strong').textContent=new Intl.NumberFormat('pt-BR').format(n);else badge.remove()}).catch(()=>badge.remove())}const style=document.createElement('style');style.textContent='.page-view-counter{display:inline-flex;align-items:center;gap:5px;margin:6px 0 14px;padding:7px 11px;border:1px solid #e5e7eb;border-radius:999px;background:#fff;color:#667085;font-size:13px}.page-view-counter strong{color:#4f46e5}';document.head.appendChild(style);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start()})();
(function(){const STORAGE_KEY='deltaFavoritos';function normalizarId(v){return String(v??'').trim()}window.getFavoritos=function(){try{const data=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');return Array.isArray(data)?data:[]}catch(e){return[]}};window.saveFavoritos=function(list){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(Array.isArray(list)?list:[]));window.dispatchEvent(new CustomEvent('delta:favoritos-updated'))}catch(e){}};window.isFavorito=function(id){id=normalizarId(id);return getFavoritos().some(f=>normalizarId(f.id)===id)};window.toggleFavorito=function(item){item=item||{};item.id=normalizarId(item.id)||('fav-'+Date.now());const list=getFavoritos(),i=list.findIndex(f=>normalizarId(f.id)===item.id);if(i<0)list.unshift({...item,createdAt:Date.now()});else list.splice(i,1);saveFavoritos(list);return i<0};window.updateFavButtonUI=function(button){if(!button)return;const fav=isFavorito(button.dataset.id);button.classList.toggle('favorito',fav);if(button.matches('.fav-btn'))button.innerText=fav?'❤️':'🤍'};function extrairPrompt(btn){const card=btn.closest('.card,.prompt-card,article')||btn.parentElement;const prompt=card&&card.querySelector('.prompt-text,pre,.prompt,.texto-prompt');const titulo=btn.dataset.titulo||(card&&card.querySelector('h2,h3,.titulo')?.textContent)||'Prompt favorito';const texto=btn.dataset.texto||(prompt&&prompt.textContent)||'';const categoria=btn.dataset.categoria||(card&&card.dataset.categoria)||document.querySelector('main h1')?.textContent?.replace(/^\S+\s*/,'').trim()||'Geral';let id=normalizarId(btn.dataset.id);if(!id){let hash=0,s=titulo+'|'+texto;for(let i=0;i<s.length;i++)hash=((hash<<5)-hash+s.charCodeAt(i))|0;id='prompt-'+Math.abs(hash)}btn.dataset.id=id;return{id,titulo:titulo.trim(),texto:texto.trim(),categoria:categoria.trim()}};document.addEventListener('click',e=>{const btn=e.target.closest&&e.target.closest('.fav-btn');if(!btn)return;e.preventDefault();e.stopPropagation();const item=extrairPrompt(btn);toggleFavorito(item);updateFavButtonUI(btn)});function iniciar(){document.querySelectorAll('.fav-btn').forEach(btn=>{if(!btn.dataset.id)extrairPrompt(btn);updateFavButtonUI(btn)})}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar,{once:true});else iniciar()})();
// PADRAO VISUAL + PAGINACAO PARA PAGINAS COM MUITOS PROMPTS
(function(){const path=location.pathname;if(!/\/(imagens|trend|estudo|saude)\.html$/.test(path))return;const POR_PAGINA=10;let pagina=1,timer,processando=false;const style=document.createElement('style');style.textContent='.prompt-padrao{max-height:105px;overflow:hidden;white-space:pre-wrap;background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:15px;line-height:1.55;font-family:inherit}.prompt-padrao.aberto{max-height:none}.ver-prompt-global{margin:8px 0 0;border:0;background:transparent;color:#5b5ce2;font-weight:800;cursor:pointer;padding:5px 0}.paginacao-prompts{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;margin:28px 0}.paginacao-prompts button{border:1px solid #d9dce5;background:#fff;border-radius:10px;padding:10px 14px;font-weight:800;cursor:pointer}.paginacao-prompts button:disabled{opacity:.4;cursor:not-allowed}.paginacao-prompts .pag-ativa{background:#5b5ce2;color:#fff;border-color:#5b5ce2}.filtro-categorias-estudo{display:flex;gap:7px;flex-wrap:wrap;margin:-10px 0 20px}.filtro-categorias-estudo button{border:1px solid #e1e4ef;background:#fff;border-radius:999px;padding:8px 11px;font-size:12px;font-weight:800;cursor:pointer}.filtro-categorias-estudo button.ativo{background:#5b5ce2;color:#fff;border-color:#5b5ce2}@media(max-width:700px){.paginacao-prompts{gap:6px}.paginacao-prompts button{padding:9px 11px}}';document.head.appendChild(style);
function prepararCards(container){container.querySelectorAll('.card').forEach(card=>{const prompt=card.querySelector('.prompt-text,pre');if(prompt&&!prompt.dataset.padronizado){prompt.dataset.padronizado='1';prompt.classList.add('prompt-padrao');if(!card.querySelector('.ver-prompt-global')){const btn=document.createElement('button');btn.className='ver-prompt-global';btn.textContent='📖 Ver prompt completo';btn.onclick=()=>{prompt.classList.toggle('aberto');btn.textContent=prompt.classList.contains('aberto')?'📕 Recolher prompt':'📖 Ver prompt completo'};prompt.insertAdjacentElement('afterend',btn)}}})}
function coletarCards(container){const diretos=[...container.querySelectorAll(':scope > .card')];if(diretos.length)return diretos;return [...container.querySelectorAll('.grid-prompts > .card,.secao-categoria .card')]}
function aplicar(){if(processando)return;const container=document.getElementById('lista-prompts');if(!container)return;processando=true;prepararCards(container);const cards=coletarCards(container);if(!cards.length){processando=false;return}const total=Math.ceil(cards.length/POR_PAGINA);if(pagina>total)pagina=1;cards.forEach((c,i)=>c.style.display=(i>=(pagina-1)*POR_PAGINA&&i<pagina*POR_PAGINA)?'':'none');container.querySelectorAll('.secao-categoria').forEach(sec=>{const vis=[...sec.querySelectorAll('.card')].some(c=>c.style.display!=='none');sec.style.display=vis?'':'none'});let nav=document.getElementById('paginacao-prompts');if(total<=1){if(nav)nav.remove();processando=false;return}if(!nav){nav=document.createElement('nav');nav.id='paginacao-prompts';nav.className='paginacao-prompts';container.insertAdjacentElement('afterend',nav)}let html='<button data-p="prev" '+(pagina===1?'disabled':'')+'>← Anterior</button>';for(let i=1;i<=total;i++)html+='<button data-p="'+i+'" class="'+(i===pagina?'pag-ativa':'')+'">'+i+'</button>';html+='<button data-p="next" '+(pagina===total?'disabled':'')+'>Próxima →</button>';nav.innerHTML=html;nav.querySelectorAll('button:not(:disabled)').forEach(b=>b.onclick=()=>{const p=b.dataset.p;pagina=p==='prev'?pagina-1:p==='next'?pagina+1:Number(p);aplicar();container.scrollIntoView({behavior:'smooth',block:'start'})});processando=false}
function categoriasEstudo(){if(!/\/estudo\.html$/.test(path)||document.querySelector('.filtro-categorias-estudo'))return;const nivel=document.querySelector('.filtro-nivel'),busca=document.getElementById('busca');if(!nivel||!busca)return;const cats=['Todas categorias','🧭 Preparação','📚 Estruturação','🎓 Didática','🧠 Memorização','📊 Avaliação','🧠 Aprimoramento','🚀 Aplicação Profissional com IA'];const box=document.createElement('div');box.className='filtro-categorias-estudo';box.innerHTML=cats.map((c,i)=>`<button class="${i===0?'ativo':''}" data-cat="${c}">${c}</button>`).join('');nivel.insertAdjacentElement('afterend',box);box.onclick=e=>{const b=e.target.closest('button');if(!b)return;box.querySelectorAll('button').forEach(x=>x.classList.remove('ativo'));b.classList.add('ativo');busca.value=b.dataset.cat==='Todas categorias'?'':b.dataset.cat;pagina=1;if(typeof window.filtrarPrompts==='function')window.filtrarPrompts();setTimeout(aplicar,50)}}
function iniciar(){const container=document.getElementById('lista-prompts');if(!container)return;categoriasEstudo();const obs=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(()=>{pagina=1;aplicar()},100)});obs.observe(container,{childList:true,subtree:false});setTimeout(aplicar,220)}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar,{once:true});else iniciar()})();