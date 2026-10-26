/* 루쿠 NFC 룰렛: 정적 웹사이트, 로컬 수집 도감. */
(() => {
  'use strict';
  const KEY = 'rucue-goods-collection-v1';
  const prizes = [
    {id:'keycap_basic', name:'키캡(기본)', icon:'⌨️', weight:33},
    {id:'keycap_squish', name:'키캡(찌부)', icon:'🐾', weight:33},
    {id:'keycap_halloween', name:'키캡(할로윈)', icon:'🎃', weight:33},
    {id:'pouch', name:'파우치', icon:'🎒', weight:1},
  ];
  const $ = id => document.getElementById(id);
  let collection = {};
  let storageAvailable = true;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) collection = saved;
  } catch(e) { storageAvailable = false; }
  function render() {
    $('inventory').replaceChildren();
    let total=0;
    for (const prize of prizes) {
      const count = Number(collection[prize.id]) || 0;
      total += count;
      const el=document.createElement('div');
      el.textContent=`${prize.icon} ${prize.name} × ${count}`;
      el.style.opacity=count?1:.55;
      $('inventory').append(el);
    }
    $('total').textContent=`누적 획득: ${total}개 · 수집 종류: ${prizes.filter(p=>collection[p.id]>0).length}/${prizes.length}`;
  }
  function randomFraction() {
    if (globalThis.crypto?.getRandomValues) {
      const n = new Uint32Array(1);
      crypto.getRandomValues(n);
      return n[0] / 4294967296;
    }
    return Math.random();
  }
  function pick() {
    const roll = randomFraction()*100;
    let cumulative=0;
    for (let i=0;i<prizes.length;i++) {
      cumulative += prizes[i].weight;
      if (roll < cumulative) return {prize:prizes[i], index:i};
    }
    return {prize:prizes[prizes.length-1],index:prizes.length-1};
  }
  function start() {
    render();
    const {prize,index}=pick();
    const startPercent=prizes.slice(0,index).reduce((sum,p)=>sum+p.weight,0);
    const targetDeg=(startPercent+prize.weight/2)*3.6;
    // CSS conic-gradient begins at top; wheel rotates clockwise, pointer remains at top.
    const landing=360-targetDeg;
    const turns=360*6;
    const wheel=$('wheel');
    const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    $('status').textContent='🎡 파란여우의 룰렛이 돌아간다!';
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      wheel.style.transform=`rotate(${turns+landing}deg)`;
    }));
    window.setTimeout(()=>{
      collection[prize.id]=(Number(collection[prize.id])||0)+1;
      try { localStorage.setItem(KEY,JSON.stringify(collection)); }
      catch(e) {storageAvailable=false;}
      render();
      $('status').textContent='🎉 이번 방문의 굿즈 룰렛 결과!';
      $('result').textContent=`${prize.icon} ${prize.name} 획득!`;
      $('notice').textContent=storageAvailable?'브라우저에 결과를 저장했어! 실제 굿즈 수령은 운영자 확인이 필요해.':'저장에 실패했어. 브라우저의 사이트 저장 설정을 확인해줘.';
    },reduceMotion?150:4500);
  }
  // 페이지 로드당 한 번만 시작. NFC 자체를 브라우저에서 감지하지는 않음.
  start();
})();
