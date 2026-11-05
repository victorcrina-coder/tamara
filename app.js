const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
$('.menu').addEventListener('click',()=>{const state=$('nav').classList.toggle('open');$('.menu').setAttribute('aria-expanded',state)});
$('#privacy').addEventListener('click',()=>$('#privacy-dialog').showModal());$('.close').addEventListener('click',()=>$('#privacy-dialog').close());
const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('reveal');observer.unobserve(e.target)}}),{threshold:.08});$$('.age-card,.service-card,.steps article,.section-heading').forEach(e=>observer.observe(e));
if($('.filters')){let filter=new URLSearchParams(location.search).get('grupa')||'Toate';if(!$$('[data-filter]').some(b=>b.dataset.filter===filter))filter='Toate';const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();function update(){const query=normalize($('#service-search').value);let count=0;$$('.service-card').forEach(c=>{let visible=(filter==='Toate'||c.dataset.age===filter||c.dataset.age==='Toate')&&normalize(c.dataset.title).includes(query);c.hidden=!visible;if(visible)count++});$$('[data-filter]').forEach(b=>{b.classList.toggle('selected',b.dataset.filter===filter);b.setAttribute('aria-pressed',b.dataset.filter===filter)});$('#result-count').textContent=count+' servicii pentru tine';$('#no-results').hidden=count!==0}$$('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;update()}));$('#service-search').addEventListener('input',update);update()}
if($('.check-item')){let checks=[];try{checks=JSON.parse(localStorage.getItem('hk-checklist')||'[]')}catch{}const inputs=$$('[data-check]');inputs.forEach((e,i)=>e.checked=checks.includes(i));function progress(){const selected=inputs.map((e,i)=>e.checked?i:null).filter(x=>x!==null);$('#check-count').textContent=selected.length+' din '+inputs.length+' pregătite';$('#check-progress').max=inputs.length;$('#check-progress').value=selected.length;try{localStorage.setItem('hk-checklist',JSON.stringify(selected))}catch{}}inputs.forEach(e=>e.addEventListener('change',progress));$('#reset-list').onclick=()=>{inputs.forEach(e=>e.checked=false);progress()};progress()}
if($('#booking-form')){
 const submit=$('#booking-form button[type="submit"]');submit.disabled=true;
 Promise.all([fetch('/tamara/services.json').then(r=>{if(!r.ok)throw Error();return r.json()}),fetch('/tamara/pricing.json').then(r=>{if(!r.ok)throw Error();return r.json()})]).then(([services,pricing])=>{
  const chosen=new URLSearchParams(location.search).get('serviciu');
  if(chosen!==null&&/^\d+$/.test(chosen)&&services[Number(chosen)])$('#service-select').value=chosen;
  const localToday=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Chisinau'}).format(new Date());
  $('#date').min=localToday();let downloadUrl;
  const getQuote=()=>window.clinicQuote(pricing,$('#service-select').value,$('#category-select').value,$('#duration-select').value);
  const priceText=q=>q.amount===null?'De confirmat cu cabinetul':q.amount.toLocaleString('ro-RO')+' MDL';
  function resetResult(){ $('#booking-result').hidden=true;if(downloadUrl){URL.revokeObjectURL(downloadUrl);downloadUrl=null} }
  function update(){
   const consultation=Number($('#service-select').value)===0;
   $('#session-fields').hidden=consultation;$('#category-select').disabled=consultation;$('#duration-select').disabled=consultation;
   const q=getQuote(),s=services[Number($('#service-select').value)];
   $('#summary-service').textContent=s[0];$('#summary-duration').textContent=q.duration;$('#summary-category').textContent=q.label;
   $('#summary-price').textContent=priceText(q);$('#summary-price').classList.toggle('price-message',q.amount===null);
   $('#summary-note').textContent=q.note;
   $('#category-note').textContent=pricing.categories.find(c=>c.id===$('#category-select').value)?.note||'';
   if(!$('#category-select').value)$('#category-note').textContent='Alege categoria împreună cu cabinetul dacă nu ești sigur.';
   resetResult();
  }
  ['#service-select','#category-select','#duration-select'].forEach(s=>$(s).addEventListener('change',update));
  $('#date').addEventListener('input',()=>{$('#date').setCustomValidity('');resetResult()});$('#time').addEventListener('change',resetResult);
  update();submit.disabled=false;
  $('#booking-form').addEventListener('submit',e=>{
   e.preventDefault();const date=$('#date').value;
   if(date<localToday()){$('#date').setCustomValidity('Alege o dată de astăzi sau din viitor.');$('#date').reportValidity();return}
   const q=getQuote(),s=services[Number($('#service-select').value)];
   if(Number($('#service-select').value)!==0&&!$('#category-select').value){$('#category-select').reportValidity();return}
   const summary='SOLICITARE DE PROGRAMARE — NECONFIRMATĂ\nHealth Kinesiology\n\nServiciu: '+s[0]+'\nCategorie: '+q.label+'\nDurată: '+q.duration+'\nTarif: '+priceText(q)+'\n'+q.note+'\nData preferată: '+date+'\nInterval preferat: '+$('#time').value+'\n\nAceastă solicitare nu a fost trimisă cabinetului și nu reprezintă o rezervare. Categoria tarifară și disponibilitatea se confirmă direct cu cabinetul.';
   resetResult();const result=$('#booking-result');result.replaceChildren();result.hidden=false;
   const title=document.createElement('b');title.textContent='Rezumatul este pregătit. Programarea nu este confirmată.';
   const p=document.createElement('p');p.textContent=s[0]+' · '+q.duration+' · '+priceText(q)+'. '+q.note;
   const a=document.createElement('a');a.className='underlink';a.textContent='Descarcă solicitarea (.txt) ↓';downloadUrl=URL.createObjectURL(new Blob([summary],{type:'text/plain;charset=utf-8'}));a.href=downloadUrl;a.download='solicitare-health-kinesiology.txt';
   result.append(title,p,a);result.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});
  });
 }).catch(()=>{$('#booking-result').hidden=false;$('#booking-result').textContent='Tarifele nu s-au încărcat. Reîncarcă pagina pentru a încerca din nou.';$('#summary-price').textContent='Indisponibil';});
}
if(document.querySelector('#course-dialog')){const dialog=document.querySelector('#course-dialog');document.querySelectorAll('.course-buy').forEach(button=>button.addEventListener('click',()=>{document.querySelector('#course-dialog-title').textContent=button.dataset.course;document.querySelector('#course-dialog-price').textContent=button.dataset.price+' MDL · preț exemplu';dialog.showModal()}));document.querySelectorAll('.course-close,.course-dismiss').forEach(button=>button.addEventListener('click',()=>dialog.close()))}
