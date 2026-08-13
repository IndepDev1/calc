import { generarFestivosCO } from './festivos.js';
import { RESOLUCIONES_SUSPENSION } from './suspensiones.js';

const form = document.querySelector('#calculator-form');
const results = document.querySelector('#results');
const details = document.querySelector('#details');
const message = document.querySelector('#message');
const detailButton = document.querySelector('#detail-button');
const qualificationButton = document.querySelector('#qualification-button');
const resultQualification = document.querySelector('#result-calificacion');
const resultDue = document.querySelector('#result-vencimiento');
const resultExtended = document.querySelector('#result-prorrogado');
let lastCalculation = null;

function parseDate(value) { const [y,m,d] = value.split('-').map(Number); return new Date(y,m-1,d,12); }
function iso(date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
function clone(date) { return new Date(date.getTime()); }
function nextDay(date) { const d=clone(date); d.setDate(d.getDate()+1); return d; }
function addCalendarDays(date, amount) { const d=clone(date); d.setDate(d.getDate()+amount); return d; }
function format(date) { return new Intl.DateTimeFormat('es-CO',{weekday:'short',year:'numeric',month:'long',day:'numeric'}).format(date); }
function addYears(date,n) { const d=clone(date), day=d.getDate(); d.setDate(1); d.setFullYear(d.getFullYear()+n); d.setMonth(date.getMonth()); d.setDate(Math.min(day,new Date(d.getFullYear(),d.getMonth()+1,0).getDate())); return d; }
function addMonths(date,n) { const d=clone(date), day=d.getDate(); d.setDate(1); d.setMonth(d.getMonth()+n); d.setDate(Math.min(day,new Date(d.getFullYear(),d.getMonth()+1,0).getDate())); return d; }

function suspensionFor(date) {
  const key=iso(date);
  return RESOLUCIONES_SUSPENSION.find(r => key>=r.inicio && key<=r.fin) || null;
}
function classify(date, holidays, includeSuspension=true) {
  const weekday=date.getDay();
  if (weekday===0 || weekday===6) return {business:false,reason:'Fin de semana'};
  if (holidays.has(iso(date))) return {business:false,reason:'Festivo nacional'};
  const suspension=includeSuspension ? suspensionFor(date) : null;
  if (suspension) return {business:false,reason:suspension.resolucion,suspension};
  return {business:true,reason:'Día hábil'};
}
function addBusinessDays(start, amount, holidays, log=false) {
  let date=clone(start), counted=0; const days=[];
  while (counted<amount) {
    date=nextDay(date);
    const status=classify(date,holidays,true);
    if (status.business) counted++;
    if (log) days.push({date:clone(date),number:status.business?counted:'—',...status});
  }
  return {date,days};
}
function suspensionExtension(start, anniversary) {
  const dates=[]; let cursor=nextDay(start);
  while (cursor<=anniversary) {
    const suspension=suspensionFor(cursor);
    if (suspension) dates.push({date:clone(cursor),resolution:suspension.resolucion});
    cursor=nextDay(cursor);
  }
  return dates;
}
function setText(id,date){ document.querySelector(id).textContent=format(date); }
function showMessage(text,error=false){message.textContent=text;message.className=`message${error?' error':''}`;message.hidden=false;}
function qualificationDate(presentation) {
  const holidays=generarFestivosCO(presentation.getFullYear()-1,presentation.getFullYear()+2);
  return addBusinessDays(presentation,30,holidays).date;
}

qualificationButton.addEventListener('click',()=>{
  message.hidden=true; details.hidden=true; lastCalculation=null; detailButton.disabled=true;
  const value=document.querySelector('#presentacion').value;
  if(!value){
    results.hidden=true;
    showMessage('Ingrese la fecha de presentación para calcular la fecha límite de calificación.',true);
    document.querySelector('#presentacion').focus();
    return;
  }
  const qualification=qualificationDate(parseDate(value));
  setText('#r-calificacion',qualification);
  resultQualification.hidden=false; resultDue.hidden=true; resultExtended.hidden=true;
  results.hidden=false;
  showMessage('Fecha límite de calificación calculada.');
});

form.addEventListener('submit', event => {
  event.preventDefault(); message.hidden=true; details.hidden=true; lastCalculation=null;
  const values=['presentacion','auto','notificacion'].map(id=>document.querySelector(`#${id}`).value);
  if(values.some(v=>!v)){ results.hidden=true; detailButton.disabled=true; showMessage('Complete las tres fechas antes de calcular.',true); return; }
  const [presentation,auto,notification]=values.map(parseDate);
  const minYear=Math.min(...[presentation,notification,auto].map(d=>d.getFullYear()))-1;
  const maxYear=Math.max(...[presentation,notification,auto].map(d=>d.getFullYear()))+5;
  const holidays=generarFestivosCO(minYear,maxYear);
  const qualification=addBusinessDays(presentation,30,holidays).date;
  setText('#r-calificacion',qualification);
  resultQualification.hidden=false; resultDue.hidden=false; resultExtended.hidden=false;
  results.hidden=false;
  const usesNotification=auto<=qualification;
  const baseDate=usesNotification?notification:presentation;
  const baseLabel=usesNotification?'fecha de notificación':'fecha de presentación';
  const anniversary=addYears(baseDate,1);
  const suspended=suspensionExtension(baseDate,anniversary);
  const due=addCalendarDays(anniversary,suspended.length);
  const sixMonthAnniversary=addMonths(due,6);
  const suspendedSixMonths=suspensionExtension(due,sixMonthAnniversary);
  const extendedDue=addCalendarDays(sixMonthAnniversary,suspendedSixMonths.length);
  setText('#r-vencimiento',due); setText('#r-seis-meses',extendedDue);
  document.querySelector('#r-vencimiento-rule').textContent=`${baseLabel[0].toUpperCase()+baseLabel.slice(1)} + 1 año + días calendario de suspensión`;
  lastCalculation={anniversary,suspended,due,sixMonthAnniversary,suspendedSixMonths,extendedDue,baseDate,baseLabel,usesNotification}; detailButton.disabled=false;
  showMessage(`Cálculo completado. Se adicionaron ${suspended.length} día(s) calendario al año y ${suspendedSixMonths.length} día(s) calendario a los seis meses.`);
});

form.addEventListener('reset',()=>{setTimeout(()=>{results.hidden=true;details.hidden=true;message.hidden=true;detailButton.disabled=true;lastCalculation=null;},0);});
detailButton.addEventListener('click',()=>{ if(!lastCalculation)return; renderDetails(lastCalculation); details.hidden=false; details.scrollIntoView({behavior:'smooth',block:'start'}); });
document.querySelector('#close-detail').addEventListener('click',()=>{details.hidden=true;detailButton.focus();});

function renderDetails(calc){
  const suspension=document.querySelector('#suspension-detail');
  const condition=calc.usesNotification?'El estado del auto fue anterior o igual al límite de calificación.':'El estado del auto fue posterior al límite de calificación.';
  suspension.innerHTML=`<h3>Resumen del cálculo</h3><div class="notice">${condition}<br>Fecha base aplicada: <strong>${format(calc.baseDate)} (${calc.baseLabel})</strong></div>`;
  suspension.appendChild(detailBlock('1. Cálculo del vencimiento anual',calc.baseDate,calc.anniversary,calc.suspended,calc.due,'1 año'));
  suspension.appendChild(detailBlock('2. Cálculo del vencimiento prorrogado',calc.due,calc.sixMonthAnniversary,calc.suspendedSixMonths,calc.extendedDue,'6 meses'));
}

function detailBlock(title,start,initialEnd,suspended,finalEnd,periodLabel){
  const section=document.createElement('section');
  section.innerHTML=`<h3>${title}</h3><div class="notice">Fecha inicial: <strong>${format(start)}</strong><br>Resultado al sumar ${periodLabel}: <strong>${format(initialEnd)}</strong><br>Días calendario de suspensión adicionados: <strong>${suspended.length}</strong><br>Resultado ajustado: <strong>${format(finalEnd)}</strong></div>`;
  const grouped=new Map();
  suspended.forEach(item=>{const list=grouped.get(item.resolution)||[];list.push(item.date);grouped.set(item.resolution,list);});
  if(grouped.size){
    const list=document.createElement('ul'); list.className='resolution-list';
    grouped.forEach((dates,res)=>{const li=document.createElement('li');li.textContent=`${res}: ${dates.length} día(s) calendario (${iso(dates[0])}${dates.length>1?` a ${iso(dates[dates.length-1])}`:''})`;list.appendChild(li);});
    section.appendChild(list);
  } else section.insertAdjacentHTML('beforeend','<p>No hubo días de suspensión en este período.</p>');
  return section;
}
