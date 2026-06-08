const HUBS = [
  {
    id:'jordan', icon:'🌊', title:'요단강 도하 허브', subtitle:'약속의 땅으로 들어가는 믿음의 첫걸음',
    theme:'하나님은 요단강을 멈추시고 언약 백성을 약속의 땅으로 인도하시며, 광야 시대를 끝내고 정복 시대를 시작하게 하신다.',
    map:'assets/jordan-map.png',
    mapText:'이스라엘 백성은 싯딤에서 출발하여 언약궤를 앞세우고 요단강을 건넌 뒤 길갈에 진을 쳤다. 길갈은 가나안 정복의 첫 전진기지가 되었고, 이후 여리고 함락으로 정복 여정이 이어졌다.',
    verse:'“내가 오늘부터 시작하여 너를 온 이스라엘의 목전에서 크게 하여 내가 모세와 함께 있었던 것 같이 너와 함께 있는 것을 그들이 알게 하리라.”<br><strong>여호수아 3:7</strong>',
    events:['여호수아가 모세의 뒤를 이어 지도자로 세워짐','언약궤를 멘 제사장들이 요단강에 먼저 들어섬','하나님께서 요단강 물을 멈추심','온 백성이 마른 땅으로 강을 건넘','열두 돌을 세워 하나님의 구원을 기억하게 함','길갈에 진을 치고 가나안 정복을 시작함'],
    meaning:['광야 생활의 종료와 약속의 땅 진입','믿음은 물이 갈라진 뒤가 아니라 말씀을 따라 발을 내딛는 순종임','언약궤는 하나님의 임재와 인도를 상징함','열두 돌은 다음 세대에게 전할 기억의 신앙을 보여줌','여호수아의 지도력이 이스라엘 앞에서 확증됨'],
    connections:['홍해 도하 ↔ 요단강 도하: 출애굽의 시작과 가나안 입성의 시작','언약궤 ↔ 성막 ↔ 성전: 하나님의 임재가 백성을 인도함','열두 돌 ↔ 후대 교육: 구원의 사건을 기억하고 전승함','요단강 ↔ 예수님의 세례: 새로운 사역과 새 출발의 상징','길갈 ↔ 여리고: 정복 시대의 전진기지와 첫 전투'],
    integrated:['구속의 흐름: 출애굽 → 광야 → 요단강 → 가나안','언약의 흐름: 시내산 언약 → 언약궤 → 요단강 → 세겜 언약','하나님 나라의 흐름: 약속 → 인도 → 정복 → 기업 분배','임재의 흐름: 구름기둥 → 성막 → 언약궤 → 성전'],
    refs:['여호수아 1장','여호수아 3장','여호수아 4장','출애굽기 14장','히브리서 11장'],
    message:'요단강 도하는 단순한 강 건너기가 아니라, 하나님의 약속을 믿고 실제 땅으로 들어가는 순종의 사건이다. 하나님은 언약 백성을 광야에서 약속의 땅으로 옮기시며 새로운 구속사의 장을 여셨다.',
    prev:null,next:'jericho'
  },
  {id:'jericho',icon:'🏰',title:'여리고 함락 허브',subtitle:'준비 중',theme:'다음 단계에서 제작할 허브입니다.',prev:'jordan',next:'conquest'},
  {id:'conquest',icon:'⚔️',title:'가나안 정복 허브',subtitle:'준비 중',theme:'다음 단계에서 제작할 허브입니다.',prev:'jericho',next:'inheritance'},
  {id:'inheritance',icon:'🗺️',title:'기업 분배 허브',subtitle:'준비 중',theme:'다음 단계에서 제작할 허브입니다.',prev:'conquest',next:'shechem'},
  {id:'shechem',icon:'📜',title:'세겜 언약 허브',subtitle:'준비 중',theme:'다음 단계에서 제작할 허브입니다.',prev:'inheritance',next:null}
];
const byId = Object.fromEntries(HUBS.map(h=>[h.id,h]));
const params = new URLSearchParams(location.search);
let current = params.get('hub') || 'jordan';
if(!byId[current]) current='jordan';
function fillList(id, items){
  const el=document.getElementById(id); el.innerHTML='';
  (items||['다음 단계에서 세부 내용을 연결합니다.']).forEach(t=>{const li=document.createElement('li');li.textContent=t;el.appendChild(li);});
}
function render(id){
  const h=byId[id]||byId.jordan; current=h.id;
  document.title = h.title + ' | 정복시대';
  document.getElementById('hubIcon').textContent=h.icon||'▣';
  document.getElementById('title').textContent=h.title;
  document.getElementById('subtitle').textContent=h.subtitle||'';
  document.getElementById('theme').textContent=h.theme||'';
  const map=document.getElementById('map');
  map.src=h.map||'assets/jordan-map.png';
  document.getElementById('mapText').textContent=h.mapText||'지도와 설명은 다음 단계에서 보완합니다.';
  document.getElementById('verse').innerHTML=h.verse||'대표성구는 다음 단계에서 입력합니다.';
  fillList('events',h.events); fillList('meaning',h.meaning); fillList('connections',h.connections); fillList('integrated',h.integrated); fillList('refs',h.refs);
  document.getElementById('message').textContent=h.message||'이 허브는 다음 단계에서 제작합니다.';
  const prev=document.getElementById('prevBtn'), next=document.getElementById('nextBtn');
  prev.textContent=h.prev?'이전':'Matrix'; prev.onclick=()=> h.prev ? go(h.prev) : location.href='../index.html';
  next.textContent=h.next?'다음':'Matrix'; next.onclick=()=> h.next ? go(h.next) : location.href='../index.html';
  history.replaceState(null,'',`?hub=${h.id}`);
}
function go(id){ render(id); window.scrollTo({top:0,behavior:'smooth'}); closeList(); }
function openList(){
  const box=document.getElementById('hubList'); box.innerHTML='';
  HUBS.forEach(h=>{const b=document.createElement('button');b.className='hubItem';b.innerHTML=`<span class="hubItemIcon">${h.icon}</span><span class="hubItemText">${h.title}<small>${h.subtitle||''}</small></span>`;b.onclick=()=>go(h.id);box.appendChild(b);});
  document.getElementById('listModal').classList.add('show');
}
function closeList(){document.getElementById('listModal').classList.remove('show');}
window.openList=openList; window.closeList=closeList;
render(current);
