/* Canivete Assistente — menu lateral compartilhado para as páginas separadas (v1.0)
 * Uso: <script src="/delta-prompts/js/canivete-menu.js?v=1.0" defer></script>
 * As seções internas abrem o Canivete já na tela certa (canivete.html?pagina=ID).
 */
(function(){
'use strict';
if(window.__caniveteMenu)return;window.__caniveteMenu=true;
var BASE='/delta-prompts/canivete.html';
var GRUPOS=[
 ['Principal',[['hub','🧰 Início do Canivete'],['dashboard','📊 Financeiro'],['perfil','👤 Meu Perfil'],['calendario','📅 Calendário'],['buscaglobal','🔍 Busca'],['configuracoes','⚙️ Configurações']]],
 ['Planejamento',[['renda','💼 Renda & benefícios'],['despesas','💸 Despesas'],['dividas','💳 Dívidas'],['patrimonio','🏦 Patrimônio']]],
 ['Acompanhamento',[['metas','🎯 Metas'],['projecoes','📈 Projeções'],['analise','🧠 Análise'],['historico','📅 Histórico']]],
 ['Extras',[['compras','🛒 Lista de Compras'],['senhas','🔐 Senhas'],['contatos','📇 Contatos Importantes'],['datas','🎂 Datas Importantes'],['academia','🏋️ Academia'],['meutime','⚽ Meu Time'],['habitos','🔁 Hábitos'],['veiculo','🚗 Manutenção do Veículo'],['estudos','🎓 Cursos & Estudos'],['jogos','🎮 Jogos'],['mapavendas','🔥 Mapa de Vendas'],['comparador','🔍 Comparador de Demonstrativos'],['links','🔗 Links Importantes'],['saude','💊 Medicamentos & Vitaminas']]],
 ['Criação e IA',[['@/delta-prompts/canivete/aprender-a-cantar.html','🎤 Aprender a Cantar'],['@/delta-prompts/canivete/teleprompter.html','🎬 Teleprompter IA'],['@/delta-prompts/canivete/clonagem-de-voz-master.html','🎙️ Clonagem de Voz'],['@/delta-prompts/canivete/criar-videos-ia.html','🎞️ Criar Vídeos IA'],['@/delta-prompts/canivete-ias-gratuitas.html','🤖 IAs Gratuitas']]]
];
function href(id){return id.charAt(0)==='@'?id.slice(1):BASE+'?pagina='+encodeURIComponent(id)}
var aqui=location.pathname.replace(/\/+$/,'');
var html='<div class="cvm-brand"><a href="'+BASE+'?pagina=hub">🧰 Canivete Assistente</a><small>Seu painel pessoal</small></div>'+
 '<a class="cvm-voltar" href="/delta-prompts/index.html">← Voltar ao Delta Prompts</a>'+
 GRUPOS.map(function(g){return '<div class="cvm-grupo"><div class="cvm-tit">'+g[0]+'</div>'+g[1].map(function(it){var h=href(it[0]);var ativo=it[0].charAt(0)==='@'&&aqui===it[0].slice(1).replace(/\/+$/,'');return '<a href="'+h+'"'+(ativo?' class="ativo" aria-current="page"':'')+'>'+it[1]+'</a>'}).join('')+'</div>'}).join('');
var css=document.createElement('style');css.id='canivete-menu-css';
css.textContent=
 '.cvm-side{position:fixed;top:0;bottom:0;left:0;width:250px;box-sizing:border-box;overflow-y:auto;padding:20px 14px calc(24px + env(safe-area-inset-bottom));background:#fff;color:#172033;border-right:1px solid #eaeaea;z-index:900;font:14px/1.35 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}'+
 '.cvm-brand a{display:block;font-size:18px;font-weight:900;color:#172033;text-decoration:none}.cvm-brand small{display:block;color:#55607a;font-size:12px;margin:2px 0 12px}'+
 '.cvm-voltar{display:block;margin:0 0 12px;padding:9px 10px;border-radius:10px;background:#eff6ff;color:#1d4ed8;font-weight:800;text-decoration:none;font-size:13px}'+
 '.cvm-grupo{margin:0 0 12px}.cvm-tit{font-size:11px;font-weight:900;letter-spacing:.06em;text-transform:uppercase;color:#55607a;margin:6px 8px}'+
 '.cvm-side .cvm-grupo a{display:block;padding:8px 10px;border-radius:10px;color:#172033;text-decoration:none;font-weight:650}'+
 '.cvm-side .cvm-grupo a:hover,.cvm-side .cvm-grupo a:focus-visible{background:#f1f5f9}'+
 '.cvm-side .cvm-grupo a.ativo{background:#2563eb;color:#fff}'+
 '.cvm-toggle{display:none;position:fixed;top:calc(10px + env(safe-area-inset-top));left:10px;z-index:950;border:0;border-radius:12px;padding:9px 12px;background:#2563eb;color:#fff;font:800 14px system-ui,sans-serif;box-shadow:0 6px 18px rgba(37,99,235,.3);cursor:pointer}'+
 '.cvm-fundo{display:none;position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:899}'+
 '@media(min-width:901px){body.cvm-com-menu{padding-left:250px!important}}'+
 '@media(max-width:900px){.cvm-side{transform:translateX(-105%);transition:transform .2s;box-shadow:0 10px 40px rgba(0,0,0,.25);padding-top:calc(60px + env(safe-area-inset-top))}.cvm-toggle{display:block}body.cvm-aberto .cvm-side{transform:none}body.cvm-aberto .cvm-fundo{display:block}body.cvm-com-menu{padding-top:52px}}'+
 '@media(prefers-color-scheme:dark){html:not([data-theme="light"]) .cvm-side{background:#0f172a;color:#e5e7eb;border-color:#1e293b}html:not([data-theme="light"]) .cvm-brand a,html:not([data-theme="light"]) .cvm-side .cvm-grupo a{color:#e5e7eb}html:not([data-theme="light"]) .cvm-side .cvm-grupo a:hover{background:#1e293b}html:not([data-theme="light"]) .cvm-voltar{background:#172554;color:#bfdbfe}}'+
 '[data-theme="dark"] .cvm-side{background:#0f172a;color:#e5e7eb;border-color:#1e293b}[data-theme="dark"] .cvm-brand a,[data-theme="dark"] .cvm-side .cvm-grupo a{color:#e5e7eb}[data-theme="dark"] .cvm-side .cvm-grupo a:hover{background:#1e293b}[data-theme="dark"] .cvm-voltar{background:#172554;color:#bfdbfe}'+
 '@media(prefers-reduced-motion:reduce){.cvm-side{transition:none}}'+
 '@media print{.cvm-side,.cvm-toggle,.cvm-fundo{display:none!important}body.cvm-com-menu{padding:0!important}}';
function montar(){
 if(document.querySelector('.cvm-side'))return;
 document.head.appendChild(css);
 var side=document.createElement('nav');side.className='cvm-side';side.id='caniveteMenu';side.setAttribute('aria-label','Menu do Canivete');side.innerHTML=html;
 var bt=document.createElement('button');bt.type='button';bt.className='cvm-toggle';bt.setAttribute('aria-controls','caniveteMenu');bt.setAttribute('aria-expanded','false');bt.textContent='☰ Canivete';
 var fundo=document.createElement('div');fundo.className='cvm-fundo';
 document.body.insertBefore(fundo,document.body.firstChild);document.body.insertBefore(side,document.body.firstChild);document.body.insertBefore(bt,document.body.firstChild);
 document.body.classList.add('cvm-com-menu');
 function abrir(v){document.body.classList.toggle('cvm-aberto',v);bt.setAttribute('aria-expanded',String(v));bt.textContent=v?'✕ Fechar':'☰ Canivete';if(v){var a=side.querySelector('a');if(a)try{a.focus({preventScroll:true})}catch(e){}}}
 bt.addEventListener('click',function(){abrir(!document.body.classList.contains('cvm-aberto'))});
 fundo.addEventListener('click',function(){abrir(false)});
 document.addEventListener('keydown',function(e){if(e.key==='Escape'&&document.body.classList.contains('cvm-aberto')){abrir(false);bt.focus()}});
 var ativo=side.querySelector('a.ativo');if(ativo)side.scrollTop=Math.max(0,ativo.offsetTop-side.clientHeight/2);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',montar);else montar();
})();
