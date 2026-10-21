/* Canivete Assistente — navegação e entendimento mais fáceis (v1.0, junto com o Canivete v8.69)
 * 1 tour de boas-vindas · 2 botão Voltar fixo · 3 “Você está aqui” · 4 menu com um grupo aberto por vez
 * 5 “O que é isso?” em cada tela · 6 próximo passo · 7 busca com palavras do dia a dia
 * 8 barra de configuração do Canivete · 9 linguagem simples (com opção de termos técnicos) · 10 barra de baixo personalizável
 * Só acrescenta comportamento: não muda dados nem as funções que já existem.
 */
(function(){
'use strict';
if(window.__caniveteFacil)return;window.__caniveteFacil=true;
function $(id){return document.getElementById(id)}
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){return null}}
function json(k,def){try{var v=JSON.parse(localStorage.getItem(k)||'null');return v==null?def:v}catch(e){return def}}
function atual(){var s=document.querySelector('.section.active');return s?s.id:'hub'}
function ir(id){if(typeof window.showPage==='function')window.showPage(id);window.scrollTo({top:0,behavior:'smooth'})}

/* ---------- informações de cada tela ---------- */
var INFO={
 hub:['🧰','Início','Escolha o que você quer organizar. Comece pelo Financeiro ou pela Saúde.'],
 dashboard:['📊','Financeiro','Resumo do seu dinheiro: quanto entra, quanto sai e quanto pode sobrar no mês.'],
 renda:['💵','Renda','Anote quanto você recebe por mês (salário, benefícios e outros ganhos).'],
 despesas:['💸','Despesas','Anote suas contas e gastos do mês. Toque em ➕ para adicionar uma conta.'],
 dividas:['💳','Dívidas','Cartão, empréstimos e parcelas que você ainda está pagando.'],
 patrimonio:['🏦','O que eu tenho','Dinheiro guardado, investimentos, carro, casa: tudo o que é seu.'],
 metas:['🎯','Metas','Algo que você quer juntar dinheiro para comprar ou conquistar.'],
 projecoes:['📈','Como vai estar meu dinheiro','Uma previsão de quanto você terá nos próximos meses, se continuar assim.'],
 analise:['🧠','Para onde vai meu dinheiro','Mostra em que você mais gasta, para ajudar a economizar.'],
 historico:['🗓️','Histórico','Como foram os meses anteriores.'],
 perfil:['👤','Meu Perfil','Seus dados pessoais: nome, idade, peso e altura.'],
 saude:['💊','Remédios e saúde','Seus remédios, vitaminas, consultas e horários.'],
 habitos:['🔁','Hábitos','Pequenas tarefas do dia a dia, como beber água ou caminhar. Marque quando fizer.'],
 calendario:['📅','Calendário','Seus compromissos e datas importantes num só lugar.'],
 senhas:['🔐','Senhas','Guarde suas senhas com segurança, protegidas por um PIN.'],
 contatos:['📇','Contatos','Telefones importantes: médico, família, banco, emergência.'],
 datas:['🎂','Datas importantes','Aniversários, vencimentos e documentos (como a CNH).'],
 compras:['🛒','Lista de compras','Anote o que precisa comprar e marque o que já pegou.'],
 academia:['🏋️','Academia','Seus treinos e dias de exercício.'],
 veiculo:['🚗','Carro','Revisões, IPVA, seguro e manutenção do veículo.'],
 estudos:['🎓','Cursos e estudos','Cursos que você faz e o seu progresso.'],
 links:['🔗','Links','Sites que você usa sempre, num só lugar.'],
 configuracoes:['⚙️','Configurações','Ajustes do Canivete e “Guardar uma cópia” dos seus dados.'],
 buscaglobal:['🔎','Busca','Procure qualquer coisa que você já anotou no Canivete.'],
 meutime:['⚽','Meu time','Notícias e tabela do seu time.'],jogos:['🎮','Jogos','Joguinhos para passar o tempo.']
};
function infoDe(id){if(INFO[id])return INFO[id];var b=document.querySelector('#nav button[data-page="'+id+'"]');var t=b?b.childNodes[0].textContent.trim():id;var m=t.match(/^(\S+)\s+(.*)$/);return m?[m[1],m[2],'']:['📄',t,'']}

/* ---------- 9) linguagem simples ---------- */
var SIMPLES={patrimonio:'O que eu tenho',projecoes:'Como vai estar meu dinheiro',analise:'Para onde vai meu dinheiro'};
function termosTecnicos(){return ls('canivete-termos-tecnicos')==='1'}
var originais={};
function aplicarLinguagem(){
 var tec=termosTecnicos();
 document.querySelectorAll('#nav button[data-page]').forEach(function(b){
  var id=b.dataset.page;if(!SIMPLES[id])return;var tn=b.childNodes[0];if(!tn||tn.nodeType!==3)return;
  if(!originais[id])originais[id]=tn.textContent;
  var emoji=(originais[id].trim().match(/^\S+/)||[''])[0];
  tn.textContent=tec?originais[id]:emoji+' '+SIMPLES[id];
 });
 document.querySelectorAll('#conteudoPrincipal button,#conteudoPrincipal h2,#conteudoPrincipal h3').forEach(function(el){
  if(el.children.length)return;var t=el.textContent;
  if(!tec&&/\bBackup\b/.test(t)&&!el.dataset.orig){el.dataset.orig=t;el.textContent=t.replace(/\bBackup\b/g,'Cópia de segurança')}
  else if(tec&&el.dataset.orig){el.textContent=el.dataset.orig;delete el.dataset.orig}
 });
}

/* ---------- 2, 3, 5) barra do topo: Voltar + Você está aqui + O que é isso? ---------- */
var pilha=[];
function montarBarra(){
 var main=$('conteudoPrincipal');if(!main||$('cfBarra'))return;
 var bar=document.createElement('div');bar.id='cfBarra';bar.className='cf-barra';
 bar.innerHTML='<button type="button" class="cf-voltar" id="cfVoltar" aria-label="Voltar para a tela anterior">← Voltar</button><div class="cf-aqui" aria-live="polite"><small>Você está em</small><b id="cfAquiNome"></b></div><button type="button" class="cf-ajuda" id="cfAjuda" aria-expanded="false" aria-controls="cfAjudaBox" aria-label="O que é esta tela?">?</button>';
 var box=document.createElement('div');box.id='cfAjudaBox';box.className='cf-ajuda-box';box.hidden=true;
 main.insertBefore(box,main.firstChild);main.insertBefore(bar,main.firstChild);
 $('cfVoltar').addEventListener('click',function(){pilha.pop();var ant=pilha.pop()||'hub';ir(ant)});
 $('cfAjuda').addEventListener('click',function(){var aberto=!box.hidden;box.hidden=aberto;this.setAttribute('aria-expanded',String(!aberto));if(!aberto)preencherAjuda()});
}
function preencherAjuda(){
 var i=infoDe(atual()),box=$('cfAjudaBox');if(!box)return;
 box.innerHTML='<b>'+i[0]+' '+i[1]+'</b><p>'+(i[2]||'Use os botões desta tela para anotar e ver suas informações.')+'</p><div class="cf-ajuda-acoes"><button type="button" data-cf="tour">🎒 Ver o tour de novo</button><button type="button" data-cf="termos">'+(termosTecnicos()?'🗣️ Usar palavras simples':'📚 Usar termos técnicos')+'</button><button type="button" data-cf="fechar">Fechar</button></div>';
}
function atualizarBarra(id){
 var bar=$('cfBarra');if(!bar)return;var i=infoDe(id);
 $('cfAquiNome').textContent=i[0]+' '+(termosTecnicos()?(originais[id]?originais[id].replace(/^\S+\s+/,''):i[1]):i[1]);
 $('cfVoltar').hidden=(id==='hub');
 var box=$('cfAjudaBox');if(box&&!box.hidden)preencherAjuda();
}

/* ---------- 6) próximo passo ---------- */
var PROXIMO={renda:['despesas','Agora anote suas despesas'],despesas:['dividas','Tem dívidas ou parcelas? Anote aqui'],dividas:['patrimonio','Agora o que você já tem guardado'],patrimonio:['metas','Que tal criar uma meta?'],metas:['dashboard','Pronto! Veja o resumo do seu dinheiro'],perfil:['saude','Agora cadastre seus remédios'],saude:['habitos','Crie hábitos saudáveis'],habitos:['hub','Voltar ao início']};
function proximoPasso(id){
 document.querySelectorAll('.cf-proximo').forEach(function(e){e.remove()});
 var p=PROXIMO[id];var sec=$(id);if(!p||!sec)return;var dest=infoDe(p[0]);
 var c=document.createElement('button');c.type='button';c.className='cf-proximo';c.innerHTML='<span>✅ Próximo passo</span><b>'+p[1]+' →</b><small>'+dest[0]+' '+dest[1]+'</small>';
 c.addEventListener('click',function(){ir(p[0])});sec.appendChild(c);
}

/* ---------- 4) menu: só o grupo da tela atual aberto ---------- */
function menuSanfona(id){
 var grupos=document.querySelectorAll('#nav details.v90-menu-group');if(!grupos.length)return;
 grupos.forEach(function(g){var tem=!!g.querySelector('button[data-page="'+id+'"]');if(tem)g.open=true});
 if(!document.body.__cfSanfona){document.body.__cfSanfona=true;
  grupos.forEach(function(g){g.addEventListener('toggle',function(){if(g.open)grupos.forEach(function(o){if(o!==g&&!o.querySelector('button.active'))o.open=false})})});
 }
}

/* ---------- 7) busca com palavras do dia a dia ---------- */
var SINONIMOS=[
 ['remedio remédio comprimido vitamina medicamento farmacia farmácia consulta medico médico saude saúde','saude'],
 ['conta luz agua água internet aluguel gasto gastos despesa pagar boleto mercado','despesas'],
 ['salario salário renda ganho recebo pagamento vale beneficio benefício','renda'],
 ['cartao cartão emprestimo empréstimo parcela divida dívida','dividas'],
 ['guardado poupança investimento casa carro bens patrimonio patrimônio','patrimonio'],
 ['meta objetivo sonho viagem juntar','metas'],
 ['senha senhas login banco acesso','senhas'],
 ['telefone contato numero número','contatos'],
 ['aniversario aniversário data cnh documento vencimento','datas'],
 ['compra compras lista mercado feira','compras'],
 ['agua água beber caminhar habito hábito rotina','habitos'],
 ['peso altura idade nome perfil','perfil'],
 ['carro revisao revisão ipva seguro oleo óleo','veiculo'],
 ['treino academia exercicio exercício','academia'],
 ['curso estudo aula faculdade','estudos'],
 ['compromisso agenda calendario calendário dia','calendario'],
 ['copia cópia backup salvar exportar configuracao configuração tema','configuracoes'],
 ['resumo quanto sobra financeiro dinheiro','dashboard'],
 ['previsao previsão futuro projecao projeção','projecoes'],
 ['onde gasto analise análise economizar','analise']
];
function sem(t){return String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function buscar(q){q=sem(q).trim();if(q.length<2)return[];var res=[],vistos={};
 SINONIMOS.forEach(function(s){if(sem(s[0]).split(' ').some(function(w){return w.indexOf(q)===0||q.indexOf(w)>=0})&&!vistos[s[1]]){vistos[s[1]]=1;res.push(s[1])}});
 document.querySelectorAll('#nav button[data-page]').forEach(function(b){if(!vistos[b.dataset.page]&&sem(b.textContent).indexOf(q)>=0){vistos[b.dataset.page]=1;res.push(b.dataset.page)}});
 return res.slice(0,5);}
function montarBusca(){
 var hub=$('hub');if(!hub||$('cfBusca'))return;
 var w=document.createElement('div');w.className='cf-busca';w.innerHTML='<label for="cfBusca">🔎 O que você procura?</label><input id="cfBusca" type="search" autocomplete="off" placeholder="Ex.: remédio, conta de luz, senha do banco"><div class="cf-busca-res" id="cfBuscaRes" role="listbox"></div>';
 var ref=hub.querySelector('.hub2-principais');if(ref)ref.parentNode.insertBefore(w,ref);else hub.insertBefore(w,hub.firstChild);
 var inp=$('cfBusca'),res=$('cfBuscaRes');
 function mostrar(){var r=buscar(inp.value);res.innerHTML=r.length?r.map(function(id){var i=infoDe(id);return '<button type="button" role="option" data-cf-ir="'+id+'">'+i[0]+' '+i[1]+'<small>'+(i[2]||'')+'</small></button>'}).join(''):(inp.value.trim().length>1?'<p class="cf-nada">Não achei. Tente outra palavra, como “remédio” ou “conta”.</p>':'')}
 inp.addEventListener('input',mostrar);inp.addEventListener('keydown',function(e){if(e.key==='Enter'){var p=res.querySelector('[data-cf-ir]');if(p)p.click()}});
}

/* ---------- 8) barra de configuração ---------- */
function progresso(){
 var D=window.d||(typeof d!=='undefined'?d:{});var itens=[];
 itens.push(['renda','💵 Renda',(Number(D.salary)||0)>0]);
 itens.push(['despesas','💸 Despesas',Array.isArray(D.expenses)&&D.expenses.some(function(x){return (Number(x&&x.value)||0)>0})]);
 itens.push(['perfil','👤 Perfil',!!(D.nomeUsuarioPerfil||D.pesoAtual||json('canivete-historico-peso',[]).length)]);
 itens.push(['saude','💊 Remédios',json('canivete-remedios',[]).length>0||json('canivete-consultas',[]).length>0]);
 itens.push(['habitos','🔁 Hábitos',json('canivete-habitos',[]).length>0]);
 itens.push(['metas','🎯 Metas',Array.isArray(D.goals)&&D.goals.length>0]);
 return itens;
}
function montarProgresso(){
 var hub=$('hub');if(!hub)return;var box=$('cfProgresso');
 if(!box){box=document.createElement('div');box.id='cfProgresso';box.className='cf-progresso';var ref=$('cfBusca')&&$('cfBusca').parentNode;if(ref)ref.insertAdjacentElement('afterend',box);else hub.insertBefore(box,hub.firstChild)}
 var it=progresso(),feitos=it.filter(function(x){return x[2]}).length,pct=Math.round(feitos/it.length*100),falta=it.filter(function(x){return !x[2]});
 box.innerHTML='<div class="cf-prog-top"><b>⚙️ Seu Canivete está '+pct+'% configurado</b><span>'+feitos+' de '+it.length+'</span></div><div class="cf-prog-barra"><span style="width:'+pct+'%"></span></div>'+
  (falta.length?'<div class="cf-prog-falta"><small>Falta:</small>'+falta.map(function(x){return '<button type="button" data-cf-ir="'+x[0]+'">'+x[1]+' →</button>'}).join('')+'</div>':'<p class="cf-prog-ok">🎉 Tudo configurado! Agora é só ir anotando no dia a dia.</p>');
}

/* ---------- 10) barra de baixo com as telas favoritas ---------- */
var CURTO={dashboard:'Finanças',despesas:'Despesas',saude:'Saúde',habitos:'Hábitos',renda:'Renda',senhas:'Senhas',compras:'Compras',calendario:'Agenda',contatos:'Contatos',metas:'Metas',veiculo:'Carro',academia:'Academia',perfil:'Perfil'};
var OPCOES_BARRA=['dashboard','despesas','saude','habitos','renda','senhas','compras','calendario','contatos','metas','veiculo','academia','perfil'];
function favoritas(){var f=json('canivete-barra-favoritas',null);return Array.isArray(f)&&f.length?f.slice(0,3):null}
function montarBarraBaixo(){
 var nav=$('bottomNav');if(!nav)return;var f=favoritas();if(!f)return;
 var itens=nav.querySelectorAll('.bn-item[data-page]');var trocaveis=[].slice.call(itens).filter(function(b){return b.dataset.page!=='hub'});
 trocaveis.forEach(function(b,i){var id=f[i];if(!id){b.hidden=true;return}b.hidden=false;var inf=infoDe(id);b.dataset.page=id;var ic=b.querySelector('.bn-icon'),lb=b.querySelector('.bn-label');if(ic)ic.textContent=inf[0];if(lb)lb.textContent=CURTO[id]||inf[1].split(' ')[0]});
}
function abrirEscolhaBarra(){
 var f=favoritas()||['dashboard','despesas','saude'];
 var m=document.createElement('div');m.className='cf-modal';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label','Escolher atalhos da barra de baixo');
 m.innerHTML='<div class="cf-modal-box"><h3>📱 Escolha 3 telas para a barra de baixo</h3><p>O 🧰 Início e o ☰ Menu ficam sempre lá.</p><div class="cf-op">'+OPCOES_BARRA.map(function(id){var i=infoDe(id);return '<label><input type="checkbox" value="'+id+'"'+(f.indexOf(id)>=0?' checked':'')+'> '+i[0]+' '+i[1]+'</label>'}).join('')+'</div><p class="cf-op-aviso" aria-live="polite"></p><div class="cf-modal-acoes"><button type="button" class="cf-salvar">💾 Salvar</button><button type="button" class="cf-cancelar">Cancelar</button></div></div>';
 document.body.appendChild(m);
 var aviso=m.querySelector('.cf-op-aviso');
 m.addEventListener('change',function(){var mar=m.querySelectorAll('input:checked');if(mar.length>3){var ult=[].slice.call(mar).filter(function(x){return x!==document.activeElement})[0];if(ult)ult.checked=false;aviso.textContent='Pode escolher até 3.'}else aviso.textContent=''});
 m.querySelector('.cf-cancelar').onclick=function(){m.remove()};
 m.querySelector('.cf-salvar').onclick=function(){var sel=[].slice.call(m.querySelectorAll('input:checked')).map(function(x){return x.value}).slice(0,3);if(!sel.length){aviso.textContent='Escolha pelo menos 1.';return}ls('canivete-barra-favoritas',JSON.stringify(sel));m.remove();montarBarraBaixo();if(typeof window.mostrarToastCanivete==='function')window.mostrarToastCanivete('✅ Barra de baixo atualizada!')};
 m.addEventListener('click',function(e){if(e.target===m)m.remove()});
 var p=m.querySelector('input');if(p)p.focus();
}
function botaoPersonalizarBarra(){
 var hub=$('hub');if(!hub||$('cfBarraFav'))return;var b=document.createElement('button');b.type='button';b.id='cfBarraFav';b.className='cf-link';b.textContent='📱 Escolher os atalhos da barra de baixo';b.onclick=abrirEscolhaBarra;
 var ref=$('cfProgresso');if(ref)ref.insertAdjacentElement('afterend',b);else hub.appendChild(b);
}

/* ---------- 1) tour de boas-vindas ---------- */
var TOUR=[['🧰','Este é o Canivete','Um caderninho digital para organizar seu dinheiro, sua saúde e sua rotina. Tudo fica salvo só neste aparelho.'],['💰','Comece pelo Financeiro ou pela Saúde','Na tela inicial, toque num dos dois cartões grandes. Depois é só seguir o “Próximo passo” no fim de cada tela.'],['☰','Para se achar','O “← Voltar” fica sempre no topo, e o “?” explica cada tela. No ☰ Menu você encontra todas as seções. Para letras maiores, toque em 🔠.']];
function tour(i){
 i=i||0;var old=document.querySelector('.cf-tour');if(old)old.remove();if(i>=TOUR.length){ls('canivete-tour-visto','1');return}
 var t=TOUR[i],m=document.createElement('div');m.className='cf-modal cf-tour';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label',t[1]);
 m.innerHTML='<div class="cf-modal-box cf-tour-box"><div class="cf-tour-ic">'+t[0]+'</div><h3>'+t[1]+'</h3><p>'+t[2]+'</p><div class="cf-tour-pontos">'+TOUR.map(function(_,k){return '<span class="'+(k===i?'on':'')+'"></span>'}).join('')+'</div><div class="cf-modal-acoes"><button type="button" class="cf-salvar">'+(i<TOUR.length-1?'Próximo →':'Começar 🚀')+'</button><button type="button" class="cf-cancelar">Pular</button></div></div>';
 document.body.appendChild(m);
 m.querySelector('.cf-salvar').onclick=function(){tour(i+1)};m.querySelector('.cf-cancelar').onclick=function(){ls('canivete-tour-visto','1');m.remove()};
 m.querySelector('.cf-salvar').focus();
}
document.addEventListener('keydown',function(e){if(e.key==='Escape'){var m=document.querySelector('.cf-modal');if(m){if(m.classList.contains('cf-tour'))ls('canivete-tour-visto','1');m.remove()}}});

/* ---------- cliques gerais ---------- */
document.addEventListener('click',function(e){
 var a=e.target.closest('[data-cf-ir]');if(a){ir(a.getAttribute('data-cf-ir'));var bi=$('cfBusca');if(bi){bi.value='';$('cfBuscaRes').innerHTML=''}return}
 var c=e.target.closest('[data-cf]');if(!c)return;var acao=c.getAttribute('data-cf');
 if(acao==='tour'){$('cfAjudaBox').hidden=true;tour(0)}
 if(acao==='fechar'){$('cfAjudaBox').hidden=true;$('cfAjuda').setAttribute('aria-expanded','false')}
 if(acao==='termos'){ls('canivete-termos-tecnicos',termosTecnicos()?'0':'1');aplicarLinguagem();atualizarBarra(atual());preencherAjuda()}
});

/* ---------- tudo junto ---------- */
function aoMudarTela(id){
 if(pilha[pilha.length-1]!==id)pilha.push(id);if(pilha.length>30)pilha.shift();
 atualizarBarra(id);proximoPasso(id);menuSanfona(id);aplicarLinguagem();
 if(id==='hub'){montarBusca();montarProgresso();botaoPersonalizarBarra()}
 var box=$('cfAjudaBox');if(box){box.hidden=true;var b=$('cfAjuda');if(b)b.setAttribute('aria-expanded','false')}
}
function iniciar(){
 montarBarra();montarBarraBaixo();
 if(typeof window.showPage==='function'&&!window.showPage.__cf){var o=window.showPage;window.showPage=function(id){var r=o.apply(this,arguments);try{aoMudarTela(id)}catch(e){}return r};window.showPage.__cf=true}
 aoMudarTela(atual());
 if(!ls('canivete-tour-visto')&&atual()==='hub')setTimeout(function(){tour(0)},700);
}
var css=document.createElement('style');css.id='canivete-facil-css';
css.textContent=
 '.cf-barra{position:sticky;top:0;z-index:40;display:flex;align-items:center;gap:10px;margin:0 0 12px;padding:8px 10px;border-radius:14px;background:var(--card,#fff);border:1px solid var(--line,#e5e7eb);box-shadow:0 4px 14px rgba(15,23,42,.06)}'+
 '.cf-voltar{min-height:44px;padding:8px 14px;border-radius:12px;border:1px solid var(--line,#e5e7eb);background:var(--bg,#f8fafc);color:var(--ink,#172033);font:inherit;font-weight:800;font-size:15px;cursor:pointer;flex:0 0 auto}'+
 '.cf-aqui{flex:1 1 auto;min-width:0}.cf-aqui small{display:block;font-size:12px;color:#4b5563}.cf-aqui b{display:block;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
 '.cf-ajuda{flex:0 0 auto;width:44px;height:44px;border-radius:50%;border:2px solid #2563eb;background:#eff6ff;color:#1d4ed8;font:900 20px system-ui,sans-serif;cursor:pointer}'+
 '.cf-ajuda-box{margin:-4px 0 14px;padding:14px 16px;border-radius:14px;background:#eff6ff;border:1px solid #bfdbfe;font-size:15px;line-height:1.5}.cf-ajuda-box p{margin:6px 0 10px}'+
 '.cf-ajuda-acoes{display:flex;flex-wrap:wrap;gap:8px}.cf-ajuda-acoes button,.cf-link{min-height:44px;padding:8px 12px;border-radius:12px;border:1px solid #bfdbfe;background:#fff;color:#1d4ed8;font:inherit;font-weight:800;cursor:pointer}'+
 '.cf-proximo{display:flex;flex-direction:column;align-items:flex-start;gap:2px;width:100%;margin:18px 0 6px;padding:16px 18px;border-radius:16px;border:2px solid #16a34a;background:#f0fdf4;color:#14532d;font:inherit;text-align:left;cursor:pointer}'+
 '.cf-proximo span{font-size:13px;font-weight:800;color:#15803d}.cf-proximo b{font-size:17px}.cf-proximo small{font-size:13px;color:#166534}'+
 '.cf-busca{margin:0 0 14px}.cf-busca label{display:block;font-weight:900;font-size:16px;margin-bottom:6px}.cf-busca input{width:100%;box-sizing:border-box;min-height:50px;padding:10px 14px;border-radius:14px;border:2px solid #cbd5e1;font:inherit;font-size:16px}'+
 '.cf-busca input:focus{border-color:#2563eb}.cf-busca-res{display:grid;gap:6px;margin-top:6px}.cf-busca-res button{display:flex;flex-direction:column;align-items:flex-start;padding:12px 14px;border-radius:12px;border:1px solid var(--line,#e5e7eb);background:var(--card,#fff);color:inherit;font:inherit;font-weight:800;font-size:15px;text-align:left;cursor:pointer}.cf-busca-res small{font-weight:500;color:#4b5563;font-size:13px}.cf-nada{margin:6px 0;color:#4b5563}'+
 '.cf-progresso{margin:0 0 12px;padding:14px 16px;border-radius:16px;border:1px solid var(--line,#e5e7eb);background:var(--card,#fff)}.cf-prog-top{display:flex;justify-content:space-between;gap:10px;font-size:15px}'+
 '.cf-prog-barra{height:12px;border-radius:999px;background:#e2e8f0;overflow:hidden;margin:8px 0}.cf-prog-barra span{display:block;height:100%;background:linear-gradient(90deg,#22c55e,#16a34a)}'+
 '.cf-prog-falta{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.cf-prog-falta small{font-weight:800;color:#4b5563}.cf-prog-falta button{min-height:40px;padding:6px 12px;border-radius:999px;border:1px solid #fde68a;background:#fffbeb;color:#92400e;font:inherit;font-weight:800;font-size:14px;cursor:pointer}.cf-prog-ok{margin:4px 0 0;font-weight:800;color:#15803d}'+
 '.cf-link{display:block;width:100%;margin:0 0 16px;text-align:left}'+
 '.cf-modal{position:fixed;inset:0;z-index:5000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(15,23,42,.55)}'+
 '.cf-modal-box{width:min(440px,100%);max-height:88vh;overflow:auto;padding:22px;border-radius:22px;background:var(--card,#fff);color:var(--ink,#172033);box-shadow:0 30px 70px rgba(0,0,0,.3);font-size:16px;line-height:1.5}.cf-modal-box h3{margin:0 0 6px;font-size:20px}'+
 '.cf-op{display:grid;gap:6px;margin:10px 0}.cf-op label{display:flex;align-items:center;gap:10px;min-height:44px;padding:6px 10px;border-radius:12px;border:1px solid var(--line,#e5e7eb);cursor:pointer}.cf-op input{width:22px;height:22px}.cf-op-aviso{color:#b45309;font-weight:800;min-height:20px;margin:0}'+
 '.cf-modal-acoes{display:flex;gap:8px;margin-top:12px}.cf-modal-acoes button{flex:1;min-height:48px;border-radius:14px;font:inherit;font-weight:900;font-size:16px;cursor:pointer;border:1px solid var(--line,#e5e7eb)}.cf-salvar{background:#2563eb!important;border-color:#2563eb!important;color:#fff}.cf-cancelar{background:var(--card,#fff);color:inherit}'+
 '.cf-tour-box{text-align:center}.cf-tour-ic{font-size:52px;line-height:1.1;margin-bottom:6px}.cf-tour-pontos{display:flex;justify-content:center;gap:8px;margin:12px 0 2px}.cf-tour-pontos span{width:10px;height:10px;border-radius:50%;background:#cbd5e1}.cf-tour-pontos span.on{background:#2563eb;width:26px;border-radius:999px}'+
 '[data-theme="dark"] .cf-ajuda-box{background:#172554;border-color:#1e3a8a}[data-theme="dark"] .cf-ajuda-acoes button,[data-theme="dark"] .cf-link{background:#0f172a;border-color:#1e3a8a;color:#bfdbfe}[data-theme="dark"] .cf-proximo{background:#052e16;color:#bbf7d0}[data-theme="dark"] .cf-proximo span,[data-theme="dark"] .cf-proximo small{color:#86efac}[data-theme="dark"] .cf-aqui small,[data-theme="dark"] .cf-busca-res small{color:#cbd5e1}'+
 '#caniveteToast{pointer-events:none}'+
 '@media(max-width:900px){#caniveteWaterOpen{bottom:calc(84px + env(safe-area-inset-bottom))!important;right:12px!important}#btnGastoRapidoFlutuante{bottom:calc(140px + env(safe-area-inset-bottom))!important}}'+
 '@media print{.cf-barra,.cf-ajuda-box,.cf-proximo,.cf-busca,.cf-progresso,.cf-link{display:none!important}}';
document.head.appendChild(css);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(iniciar,80)});else setTimeout(iniciar,80);
})();
