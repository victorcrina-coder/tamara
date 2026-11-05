(function(root){
 function quote(pricing, serviceIndex, categoryId, duration){
  if(Number(serviceIndex)===0)return {amount:pricing.consultation.price,label:'Consultație',duration:'De stabilit cu cabinetul',note:'Consultație: 400 MDL. Durata și disponibilitatea se stabilesc cu cabinetul.'};
  const category=pricing.categories.find(c=>c.id===categoryId);
  if(!category)return {amount:null,label:'Alege categoria',duration:duration+' min',note:'Selectează categoria tarifară pentru a vedea prețul.'};
  const amount=category.rates[String(duration)]??null;
  const note=amount!==null?'Tarif pentru o singură ședință. Categoria și disponibilitatea se confirmă cu cabinetul.':String(duration)==='60'?'Tariful se stabilește cu cabinetul în funcție de masa corporală.':'Tariful pentru această durată se confirmă cu cabinetul.';
  return {amount,label:category.label,duration:duration+' min',note};
 }
 if(typeof module!=='undefined'&&module.exports)module.exports=quote;else root.clinicQuote=quote;
})(typeof window!=='undefined'?window:globalThis);
