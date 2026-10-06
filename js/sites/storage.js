/* Delta Prompts Sites — armazenamento V1.17
   Compatibilidade preservada com as chaves existentes.
*/
window.DeltaSitesStorage=(function(){
  const K={fav:'deltaFavoritos',projects:'deltaSitesProjetos',applied:'deltaSitesAplicados',uses:'deltaSitesUsos',feedback:'deltaSitesFeedback'};
  function read(key,fallback){try{const v=localStorage.getItem(key);return v===null?fallback:JSON.parse(v)}catch(e){return fallback}}
  function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch(e){return false}}
  return {
    favorites:()=>read(K.fav,[]),
    saveFavorites:v=>write(K.fav,v),
    projects:()=>read(K.projects,{}),
    saveProjects:v=>write(K.projects,v),
    applied:()=>read(K.applied,[]),
    saveApplied:v=>write(K.applied,v),
    uses:()=>read(K.uses,{}),
    saveUses:v=>write(K.uses,v),
    feedback:()=>read(K.feedback,{}),
    saveFeedback:v=>write(K.feedback,v)
  };
})();