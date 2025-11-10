const body = document.body;
// Rich gradient follows the pointer
document.addEventListener('pointermove',(e)=>{
  const x=(e.clientX/innerWidth*100).toFixed(2)+'%';
  const y=(e.clientY/innerHeight*100).toFixed(2)+'%';
  body.style.setProperty('--x',x);
  body.style.setProperty('--y',y);
});

// Floating hearts
const floaters=document.querySelector('.floaters');
const heartGlyphs=['❤','♡','❥','♥'];
for(let i=0;i<22;i++){
  const s=document.createElement('span');
  s.textContent=heartGlyphs[i%heartGlyphs.length];
  s.style.left=Math.random()*100+'vw';
  s.style.animationDelay=(-Math.random()*12)+'s';
  s.style.opacity=(0.08+Math.random()*0.12).toFixed(2);
  floaters.appendChild(s);
}

const yes=document.getElementById('yesBtn');
const no=document.getElementById('noBtn');
const overlay=document.getElementById('overlay');
const title=document.getElementById('title');
const lede=document.getElementById('lede');
const card=document.getElementById('card');
const sparkles=document.getElementById('sparkles');
const quips=document.getElementById('quips');
const btnRow=document.getElementById('btnRow');

// Audio Element Selections
const hoverAudio = document.getElementById('hoverSound'); 
const yesAudio = document.getElementById('yesSound'); // NEW: Select the yes audio element

// Make buttons bounce in
requestAnimationFrame(()=>btnRow.classList.add('ready'));

// Typewriter effect for title (progressively reveals text, keeps emoji)
(function typeTitle(){
  const t = document.getElementById('title');
  const caret = t.querySelector('.caret');
  const full = 'Go on a date with me? 🥹';
  let i = 0; t.firstChild && t.removeChild(t.firstChild);
  const span = document.createElement('span'); t.insertBefore(span, caret);
  const tick = ()=>{
    span.textContent = full.slice(0, i++);
    if(i<=full.length) setTimeout(tick, 30);
  };
  tick();
})();

// Parallax tilt
const tilt = (e)=>{
  const b = card.getBoundingClientRect();
  const rx = ((e.clientY - b.top)/b.height - .5) * -6; // tilt up/down
  const ry = ((e.clientX - b.left)/b.width - .5) * 6;  // tilt left/right
  card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
};
card.classList.add('tilt');
card.addEventListener('pointermove', tilt);
card.addEventListener('pointerleave', ()=>{ card.style.transform='rotateX(0) rotateY(0)'; });

// Ripple on YES
yes.addEventListener('click',(e)=>{
  // 1. Play 'Yes' audio
  if (yesAudio) {
    // We don't expect rapid clicks here, but we still ensure it plays from the start.
    yesAudio.currentTime = 0;
    yesAudio.play().catch(e => console.error("Yes Audio play failed:", e));
  }
  
  // 2. Ripple effect
  const r = document.createElement('span');
  r.className='ripple';
  const rect = yes.getBoundingClientRect();
  r.style.left = (e.clientX - rect.left) + 'px';
  r.style.top  = (e.clientY - rect.top) + 'px';
  yes.appendChild(r);
  setTimeout(()=>r.remove(),700);
  yes.classList.remove('heartbeat');

  // 3. Trigger overlay and confetti
  overlay.classList.add('show');
  no.style.display='none';
  spawnConfetti();
  title.textContent='Best decision ever!';
  if(lede) lede.textContent='Counting down to our date…';
});

// --- NO button helper functions (unchanged) ---
let dodging=false; let cooldown=false;
const SAFE_PAD=10; 

function bounds(){ return card.getBoundingClientRect(); }
function randomSpotInCard(){
  const btn=no.getBoundingClientRect();
  const b=bounds();
  const maxX=b.width-btn.width-SAFE_PAD;
  const maxY=b.height-btn.height-SAFE_PAD;
  const x=Math.random()*maxX+SAFE_PAD/2;
  const y=Math.random()*maxY+SAFE_PAD/2;
  return{x,y};
}
function moveNoToCardIfNeeded(){
  if(no.parentElement!==card){
    const r=no.getBoundingClientRect();
    const b=bounds();
    const relX=r.left-b.left; const relY=r.top-b.top;
    no.style.position='absolute';
    no.style.left=relX+'px';
    no.style.top=relY+'px';
    card.appendChild(no);
  }
}
function spark(x,y){
  const el=document.createElement('div');
  el.className='sparkle';
  el.textContent = Math.random()>.5 ? '✨' : '❤';
  el.style.left=x+'px';
  el.style.top=y+'px';
  sparkles.appendChild(el);
  setTimeout(()=>el.remove(), 900);
}
const QUIPS = ['hehe ✨','too slow 😜','nice try!','nope 😶','almost!','catch me? 🏃‍♀️💨','hmm…'];
function popQuip(x,y){
  const q=document.createElement('div');
  q.className='quip';
  q.textContent=QUIPS[Math.floor(Math.random()*QUIPS.length)];
  q.style.left=(x+10)+'px';
  q.style.top=(Math.max(10,y-30))+'px';
  quips.appendChild(q);
  setTimeout(()=>q.remove(),1100);
}

// --- NO button main interaction function (with audio finishing check) ---
function handleNoInteraction(){
  if (hoverAudio) {
    // Check if the audio is paused OR has finished
    const isFinished = hoverAudio.paused || hoverAudio.currentTime >= hoverAudio.duration - 0.1;
    
    if (isFinished) {
        hoverAudio.currentTime = 0;
        hoverAudio.play().catch(e => console.error("No Audio play failed:", e)); 
    }
  }

  // Existing dodge logic
  if(cooldown) return;
  cooldown=true;
  moveNoToCardIfNeeded();
  const {x, y} = randomSpotInCard();
  no.style.position='absolute';
  no.style.left=x+'px';
  no.style.top=y+'px';
  no.classList.remove('wobble'); void no.offsetWidth; no.classList.add('wobble');
  spark(x,y);
  popQuip(x,y);
  for(let i=0;i<3;i++){
    setTimeout(()=>spark(x + (Math.random()*20-10), y + (Math.random()*12-6)), i*70);
  }
  setTimeout(()=>cooldown=false,360);
}

function nudgeAway(e){
  const r=no.getBoundingClientRect();
  const cx=r.left+r.width/2, cy=r.top+r.height/2;
  const d=Math.hypot(e.clientX-cx,e.clientY-cy);
  if(d<120){
    card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
    handleNoInteraction();
  }
}

// NO button event listeners
card.addEventListener('pointermove',(e)=>{ if(dodging) nudgeAway(e); });
no.addEventListener('mouseenter',()=>{ dodging=true; handleNoInteraction(); });
no.addEventListener('click',()=>{ dodging=true; handleNoInteraction(); });
no.addEventListener('focus',()=>{ dodging=true; handleNoInteraction(); });
no.addEventListener('touchstart',()=>{ dodging=true; handleNoInteraction(); },{passive:true});


function spawnConfetti(){
  const confetti=document.getElementById('confetti');
  confetti.innerHTML='';
  const total=110;
  for(let i=0;i<total;i++){
    const d=document.createElement('div');
    d.className='heart';
    d.textContent=i%3?'❤':'💕';
    d.style.left=Math.random()*100+'vw';
    const size=14+Math.random()*18;
    d.style.fontSize=size+'px';
    const duration=1700+Math.random()*1800;
    const dx=(Math.random()*2-1)*120;
    const delay=Math.random()*300;
    d.style.opacity=0.9;
    confetti.appendChild(d);
    const startY=-20; const endY=innerHeight+20;
    const keyframes=[
      {transform:`translate(0px, ${startY}px)`,opacity:0},
      {transform:`translate(${dx/2}px, ${innerHeight*0.4}px)`,opacity:1},
      {transform:`translate(${dx}px, ${endY}px)`,opacity:0}
    ];
    d.animate(keyframes,{duration,delay,easing:'cubic-bezier(.2,.7,.2,1)'});
    setTimeout(()=>d.remove(),duration+delay+60);
  }
}

// Reset with R
window.addEventListener('keydown',(e)=>{
  if(e.key.toLowerCase()==='r'){
    overlay.classList.remove('show');
    // put No back into row, side-by-side
    btnRow.insertBefore(no, btnRow.children[1] || null);
    no.style.display='inline-block';
    no.style.position='relative';
    no.style.left=''; no.style.top='';
    dodging=false; cooldown=false;
    title.textContent='Katy, Go on a Date with me?';
    if(lede) lede.textContent='I'll pick you up, Art Gallery, Snack inbetween, and Dinner. What do you say?';
    sparkles.innerHTML='';
    quips.innerHTML='';
  }
});
