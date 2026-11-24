(function(root){
 function quote(pricing, serviceIndex, categoryId, duration){
  const ru=typeof document!=='undefined'&&document.documentElement.lang==='ru';
  if(Number(serviceIndex)===0)return {amount:pricing.consultation.price,label:ru?'Консультация':'Consultație',duration:ru?'Уточняется в клинике':'De stabilit cu cabinetul',note:ru?'Консультация: 400 MDL. Длительность и доступность согласуются с клиникой.':'Consultație: 400 MDL. Durata și disponibilitatea se stabilesc cu cabinetul.'};
  const category=pricing.categories.find(c=>c.id===categoryId);
  if(!category)return {amount:null,label:ru?'Выберите категорию':'Alege categoria',duration:duration+(ru?' мин.':' min'),note:ru?'Выберите тарифную категорию, чтобы увидеть цену.':'Selectează categoria tarifară pentru a vedea prețul.'};
  const amount=category.rates[String(duration)]??null;
  const note=amount!==null?(ru?'Цена за одно занятие. Категорию и доступность подтвердит клиника.':'Tarif pentru o singură ședință. Categoria și disponibilitatea se confirmă cu cabinetul.'):String(duration)==='60'?(ru?'Стоимость согласуется с клиникой с учётом массы тела.':'Tariful se stabilește cu cabinetul în funcție de masa corporală.'):(ru?'Стоимость занятия этой длительности уточняется в клинике.':'Tariful pentru această durată se confirmă cu cabinetul.');
  return {amount,label:category.label,duration:duration+(ru?' мин.':' min'),note};
 }
 if(typeof module!=='undefined'&&module.exports)module.exports=quote;else root.clinicQuote=quote;
})(typeof window!=='undefined'?window:globalThis);
