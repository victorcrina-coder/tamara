const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
$('.menu').addEventListener('click',()=>{const state=$('nav').classList.toggle('open');$('.menu').setAttribute('aria-expanded',state)});
if($('#privacy')&&$('#privacy-dialog'))$('#privacy').addEventListener('click',()=>$('#privacy-dialog').showModal());if($('.close')&&$('#privacy-dialog'))$('.close').addEventListener('click',()=>$('#privacy-dialog').close());
const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('reveal');observer.unobserve(e.target)}}),{threshold:.08});$$('.age-card,.service-card,.steps article,.section-heading').forEach(e=>observer.observe(e));
if($('.filters')){const allFilter=document.documentElement.lang==='ru'?'Все':'Toate';let filter=new URLSearchParams(location.search).get('grupa')||allFilter;if(!$$('[data-filter]').some(b=>b.dataset.filter===filter))filter=allFilter;const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();function update(){const query=normalize($('#service-search').value);let count=0;$$('.service-card').forEach(c=>{let visible=(filter===allFilter||c.dataset.age===filter||c.dataset.age===allFilter)&&normalize(c.dataset.title).includes(query);c.hidden=!visible;if(visible)count++});$$('[data-filter]').forEach(b=>{b.classList.toggle('selected',b.dataset.filter===filter);b.setAttribute('aria-pressed',b.dataset.filter===filter)});$('#result-count').textContent=document.documentElement.lang==='ru'?count+' услуг для вас':count+' servicii pentru tine';$('#no-results').hidden=count!==0}$$('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;update()}));$('#service-search').addEventListener('input',update);update()}
if($('.check-item')){let checks=[];try{checks=JSON.parse(localStorage.getItem('hk-checklist')||'[]')}catch{}const inputs=$$('[data-check]');inputs.forEach(e=>e.checked=checks.includes(Number(e.dataset.check)));function progress(){const selected=inputs.map(e=>e.checked?Number(e.dataset.check):null).filter(x=>x!==null);$('#check-count').textContent=document.documentElement.lang==='ru'?selected.length+' из '+inputs.length+' подготовлено':selected.length+' din '+inputs.length+' pregătite';$('#check-progress').max=inputs.length;$('#check-progress').value=selected.length;try{localStorage.setItem('hk-checklist',JSON.stringify(selected))}catch{}}inputs.forEach(e=>e.addEventListener('change',progress));$('#reset-list').onclick=()=>{inputs.forEach(e=>e.checked=false);progress()};progress()}
if($('#booking-form')){
 const submit=$('#booking-form button[type="submit"]');submit.disabled=true;
 const isRussian=document.documentElement.lang==='ru';
 Promise.all([fetch(isRussian?'services-ru.json':'services.json').then(r=>{if(!r.ok)throw Error();return r.json()}),fetch(isRussian?'pricing-ru.json':'pricing.json').then(r=>{if(!r.ok)throw Error();return r.json()})]).then(([services,pricing])=>{
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
  ['#full-name','#mobile-number'].forEach(s=>$(s).addEventListener('input',resetResult));
  $('#date').addEventListener('input',()=>{$('#date').setCustomValidity('');resetResult()});$('#time').addEventListener('change',resetResult);
  update();submit.disabled=false;
  let sending=false;
  $('#booking-form').addEventListener('submit',async e=>{
   e.preventDefault();if(sending)return;
   const date=$('#date').value;
   if(date<localToday()){$('#date').setCustomValidity(isRussian?'Выберите сегодняшнюю или будущую дату.':'Alege o dată de astăzi sau din viitor.');$('#date').reportValidity();return}
   sending=true;submit.disabled=true;submit.textContent=isRussian?'Отправка…':'Se trimite…';
   resetResult();
   const result=$('#booking-result');
   try{
    const response=await fetch('/api/bookings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:$('#full-name').value,phone:$('#mobile-number').value,service:$('#service-select').value,category:$('#category-select').value,duration:$('#duration-select').value,date,time:$('#time').value})});
    const data=await response.json();
    if(!response.ok||!data.ok)throw new Error(data.error||'Solicitarea nu a putut fi trimisă.');
    result.textContent=isRussian?'Заявка на запись отправлена. Мы позвоним вам для подтверждения.':'Solicitarea de programare a fost trimisă. Vă vom contacta telefonic pentru confirmare.';
    submit.textContent=isRussian?'Заявка отправлена ✓':'Solicitare trimisă ✓';
    $('#booking-form').querySelectorAll('input:not([data-check]),select').forEach(el=>el.disabled=true);
    $('#booking-preparation').hidden=false;
   }catch(error){
    const apiErrors={'Verifică numele, numărul mobil și preferințele selectate.':'Проверьте имя, номер телефона и выбранные предпочтения.','Solicitare nepermisă.':'Запрос отклонён.','Format invalid.':'Неверный формат данных.','Solicitare prea mare.':'Слишком большой запрос.','Date invalide.':'Неверные данные.','Programările sunt temporar indisponibile. Sună la 068 656 170.':'Запись временно недоступна. Позвоните по номеру 068 656 170.','Solicitarea nu a putut fi salvată. Sună la 068 656 170.':'Не удалось сохранить заявку. Позвоните по номеру 068 656 170.','Salvarea nu a fost confirmată. Sună la 068 656 170.':'Сохранение не подтверждено. Позвоните по номеру 068 656 170.','Nu am putut verifica salvarea. Contactează cabinetul la 068 656 170 înainte de a retrimite.':'Не удалось проверить сохранение. Перед повторной отправкой свяжитесь с клиникой по номеру 068 656 170.'};
    result.textContent=(isRussian?(apiErrors[error.message]||'Не удалось отправить заявку. Перед повторной отправкой свяжитесь с клиникой.'):error.message)||(isRussian?'Соединение прервано. Перед повторной отправкой свяжитесь с клиникой.':'Conexiunea a fost întreruptă. Contactează cabinetul înainte de a retrimite.');
    sending=false;submit.disabled=false;submit.textContent=isRussian?'Отправить заявку ↗':'Trimite solicitarea ↗';
   }
   result.hidden=false;result.scrollIntoView({behavior:'smooth',block:'center'});
  });
 }).catch(()=>{$('#booking-result').hidden=false;$('#booking-result').textContent=document.documentElement.lang==='ru'?'Не удалось загрузить цены. Обновите страницу и попробуйте ещё раз.':'Tarifele nu s-au încărcat. Reîncarcă pagina pentru a încerca din nou.';$('#summary-price').textContent=document.documentElement.lang==='ru'?'Недоступно':'Indisponibil';});
}
if(document.querySelector('#course-dialog')){const dialog=document.querySelector('#course-dialog');document.querySelectorAll('.course-buy').forEach(button=>button.addEventListener('click',()=>{document.querySelector('#course-dialog-title').textContent=button.dataset.course;document.querySelector('#course-dialog-price').textContent=button.dataset.price+(document.documentElement.lang==='ru'?' MDL · примерная цена':' MDL · preț exemplu');dialog.showModal()}));document.querySelectorAll('.course-close,.course-dismiss').forEach(button=>button.addEventListener('click',()=>dialog.close()))}
