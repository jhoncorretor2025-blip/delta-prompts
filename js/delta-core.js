/* Delta Prompts — núcleo compartilhado V1.18
   Responsabilidade: armazenamento, projetos, atividades, resultados e XP.
   Compatível com dados antigos da V1.16.
*/
(function(){
  'use strict';
  const KEY={projects:'deltaProjects',xp:'deltaXP',usage:'deltaUsageDates',activities:'deltaActivities',results:'deltaResults'};
  function read(k,fallback){try{const v=localStorage.getItem(k);return v===null?fallback:JSON.parse(v)}catch(e){return fallback}}
  function write(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}
  function today(){return new Date().toISOString().slice(0,10)}
  function uid(prefix){return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)}
  function projects(){
    let p=read(KEY.projects,[]);
    if(!Array.isArray(p))p=[];
    return p.map((x,i)=>({
      id:x.id||('legacy-'+i+'-'+String(x.n||'projeto').toLowerCase().replace(/[^a-z0-9]+/g,'-')),
      n:x.n||x.name||'Projeto sem nome',
      d:x.d||x.description||'Projeto pessoal',
      objective:x.objective||'',
      status:x.status||'Em andamento',
      nextStep:x.nextStep||'Escolher uma melhoria',
      lastActivity:x.lastActivity||x.updatedAt||null,
      createdAt:x.createdAt||null
    }))
  }
  function saveProjects(p){return write(KEY.projects,p)}
  function addProject(data){
    const p=projects();const item={id:uid('proj'),n:String(data.n||'Projeto').trim(),d:String(data.d||'Projeto pessoal').trim(),objective:String(data.objective||'').trim(),status:data.status||'Em andamento',nextStep:String(data.nextStep||'Escolher uma melhoria').trim(),lastActivity:today(),createdAt:today()};
    p.push(item);saveProjects(p);return item
  }
  function updateProject(id,patch){
    const p=projects(),i=p.findIndex(x=>x.id===id);if(i<0)return null;
    p[i]=Object.assign({},p[i],patch,{lastActivity:today()});saveProjects(p);return p[i]
  }
  function removeProject(id){const p=projects().filter(x=>x.id!==id);saveProjects(p);return p}
  function xp(amount,reason){
    const value=Math.max(0,Number(read(KEY.xp,0))||0)+Number(amount||0);write(KEY.xp,value);
    markUsage();recordActivity({type:'xp',title:reason||'Uso do Delta',xp:Number(amount||0)});
    return value
  }
  function markUsage(){
    const dates=read(KEY.usage,[]);const d=today();if(!dates.includes(d))dates.push(d);
    dates.sort();write(KEY.usage,dates.slice(-365));try{localStorage.setItem('deltaLastUse',String(Date.now()))}catch(e){}
  }
  function recordActivity(a){
    const list=read(KEY.activities,[]);
    list.unshift(Object.assign({id:uid('act'),date:today(),ts:Date.now(),xp:0},a));
    write(KEY.activities,list.slice(0,200));return list[0]
  }
  function recordResult(data){
    const list=read(KEY.results,[]);
    if(data&&data.projectId){
      const proj=projects().find(x=>x.id===data.projectId);
      if(proj){
        const next=data.status==='funcionou'?'Validar a melhoria em celular e desktop':data.status==='parcial'?'Investigar o que ainda não funcionou':'Reproduzir o problema e registrar evidências';
        updateProject(proj.id,{nextStep:next});
      }
    }
    const item=Object.assign({id:uid('res'),date:today(),ts:Date.now(),status:'testar'},data);
    list.unshift(item);write(KEY.results,list.slice(0,200));
    markUsage();recordActivity({type:'result',title:data.title||'Resultado registrado',status:item.status,projectId:data.projectId||null});
    return item
  }
  function stats(){
    const activities=read(KEY.activities,[]),results=read(KEY.results,[]);
    const completed=results.filter(x=>x.status==='funcionou').length,partial=results.filter(x=>x.status==='parcial').length,failed=results.filter(x=>x.status==='falhou').length;return {xp:Number(read(KEY.xp,0))||0,projects:projects().length,activities:activities.length,results:results.length,completed,partial,failed,resolutionRate:results.length?Math.round(completed/results.length*100):0}
  }
  window.Delta={KEY,read,write,projects,saveProjects,addProject,updateProject,removeProject,xp,markUsage,recordActivity,recordResult,stats,today};
})();