/* DELTA V1.68 — Barra "Minha área": junta Configuração, Minhas páginas, Meus números e Meu progresso */
(function(){
  'use strict';
  var BASE='/delta-prompts/';
  var ITENS=[
    {href:BASE+'configuracao.html',ic:'⚙️',t:'Configuração',d:'Deixe o site do seu jeito'},
    {href:BASE+'central-paginas.html',ic:'🗂️',t:'Minhas páginas',d:'Ache e favorite páginas'},
    {href:BASE+'meus-numeros.html',ic:'📊',t:'Meus números',d:'Seu uso e sua meta'},
    {href:BASE+'paginas/progresso.html',ic:'🏆',t:'Meu progresso',d:'XP, nível e conquistas'}
  ];
  function montar(){
    if(document.getElementById('deltaMinhaArea'))return;
    var main=document.querySelector('main');if(!main)return;
    var atual=location.pathname.replace(/\/+$/,'');
    var css=document.createElement('style');
    css.textContent='#deltaMinhaArea{margin:0 0 16px}#deltaMinhaArea .ma-tit{font-size:12px;font-weight:900;letter-spacing:.06em;color:#667085;margin:0 0 6px}#deltaMinhaArea .ma-abas{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}#deltaMinhaArea a{display:flex;gap:10px;align-items:center;padding:10px 12px;border:1px solid #e5e7eb;border-radius:14px;background:#fff;color:#111827;text-decoration:none;min-width:0}#deltaMinhaArea a:hover{border-color:#5b5ce2}#deltaMinhaArea a.atual{background:#5b5ce2;border-color:#5b5ce2;color:#fff}#deltaMinhaArea a.atual small{color:#e0e7ff}#deltaMinhaArea .ic{font-size:20px}#deltaMinhaArea b{display:block;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#deltaMinhaArea small{display:block;font-size:11.5px;color:#667085;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}@media(max-width:760px){#deltaMinhaArea .ma-abas{grid-template-columns:repeat(2,minmax(0,1fr))}}[data-theme="dark"] #deltaMinhaArea a:not(.atual){background:#111827;border-color:#374151;color:#e5e7eb}';
    document.head.appendChild(css);
    var nav=document.createElement('nav');nav.id='deltaMinhaArea';nav.setAttribute('aria-label','Minha área');
    nav.innerHTML='<p class="ma-tit">👤 MINHA ÁREA</p><div class="ma-abas">'+ITENS.map(function(i){var on=atual===i.href.replace(/\/+$/,'');return '<a href="'+i.href+'"'+(on?' class="atual" aria-current="page"':'')+'><span class="ic">'+i.ic+'</span><span style="min-width:0"><b>'+i.t+'</b><small>'+i.d+'</small></span></a>'}).join('')+'</div>';
    var hero=main.querySelector('section.hero'),depois=hero&&hero.nextElementSibling;
    if(depois&&depois.classList.contains('wrap'))depois.insertBefore(nav,depois.firstChild);
    else main.insertBefore(nav,main.firstElementChild&&/breadcrumb/.test(main.firstElementChild.className||'')?main.firstElementChild.nextSibling:main.firstChild);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',montar);else montar();
})();
