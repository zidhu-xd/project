

'use strict';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let W = canvas.width, H = canvas.height;

const input = document.getElementById('typingInput');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const levelEl = document.getElementById('level');
const highscoreEl = document.getElementById('highscore');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const muteBtn = document.getElementById('muteBtn');

let running = false, paused = false, muted = false;
let words = [];
let lastSpawn = 0, spawnInterval = 2000;
let speedBase = 60; 
let lastTime = 0;
let score = 0, lives = 5, level = 1;

const WORDS = [
  'apple','banana','orbit','matrix','cipher','quantum','vector','binary','function','object',
  'array','element','server','client','packet','rocket','planet','galaxy','syntax','variable',
  'compile','execute','react','node','python','flask','canvas','stream','pixel','thread',
  'alpha','bravo','charlie','delta','echo','foxtrot','guitar','holiday','island','jungle'
];


let soundHit=null, soundFail=null;
try{
  soundHit = new Audio('assets/hit.wav');
  soundFail = new Audio('assets/fail.wav');
}catch(e){/* ignore */}

function resize(){
  const ratio = 16/9;
  const maxW = Math.min(window.innerWidth-40, 1200);
  W = Math.floor(maxW);
  H = Math.floor(W/ratio);
  canvas.width = W; canvas.height = H;
}
window.addEventListener('resize', resize);
resize();

function randInt(a,b){return Math.floor(Math.random()*(b-a+1))+a}

function spawnWord(){
  const text = WORDS[randInt(0, WORDS.length-1)];
  const y = randInt(40, H-40);
  
  const speed = (speedBase + level*15) * (0.8 + Math.random()*0.8);
  words.push({text,y,x:W+50,w:0,h:0,speed});
}

function update(dt){
  if(!running || paused) return;
  // sp logic
  lastSpawn += dt;
  const interval = Math.max(600, spawnInterval - (level-1)*150);
  if(lastSpawn > interval){ spawnWord(); lastSpawn = 0; }


  for(let i=words.length-1;i>=0;--i){
    const w = words[i];
    w.x -= (w.speed * dt / 1000);
    if(w.x < -200){

      words.splice(i,1);
      loseLife();
    }
  }
}

function draw(){

  ctx.clearRect(0,0,W,H);
 
  ctx.fillStyle = '#04121a';
  ctx.fillRect(0,0,W,H);

  
  ctx.fillStyle = 'rgba(255,255,255,0.02)';
  ctx.fillRect(0,0,160,H);


  ctx.font = '28px monospace';
  ctx.textBaseline = 'middle';
  for(const w of words){

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillText(w.text, w.x+2, w.y+2);
  
    ctx.fillStyle = '#9be7ff';
    ctx.fillText(w.text, w.x, w.y);
  }


}

function loseLife(){
  lives -= 1; updateHUD();
  if(soundFail && !muted) soundFail.play();
  if(lives <=0) gameOver();
}

function updateHUD(){
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  levelEl.textContent = level;
  const hs = Number(localStorage.getItem('typing-blaster-highscore')||0);
  highscoreEl.textContent = hs;
}

function checkInput(text){
  if(!text) return;

  let bestIdx=-1, bestLen=0;
  for(let i=0;i<words.length;i++){
    if(words[i].text === text){
      if(words[i].text.length > bestLen){ bestLen = words[i].text.length; bestIdx = i; }
    }
  }
  if(bestIdx>=0){
   
    const removed = words.splice(bestIdx,1)[0];
    const gained = Math.ceil(10 + removed.text.length * 5 + level*2);
    score += gained;
    if(soundHit && !muted) soundHit.play();

    if(score >= level*200){ levelUp(); }
    updateHUD();
  }
}

function levelUp(){
  level += 1;

  spawnInterval = Math.max(600, spawnInterval - 150);
  lives = Math.min(10, lives + 1);
}

function gameOver(){
  running = false;
  paused = false;
  // highscore sav xd
  const hsKey = 'typing-blaster-highscore';
  const hs = Number(localStorage.getItem(hsKey) || 0);
  if(score > hs) localStorage.setItem(hsKey, score);
  updateHUD();

  setTimeout(()=>{
    const again = confirm(`Game over! Score: ${score}.\nPlay again?`);
    if(again) startGame();
  }, 50);
}

function startGame(){
  score = 0; lives = 5; level = 1; words = []; lastSpawn=0; spawnInterval=2000; running = true; paused=false; updateHUD(); input.value=''; input.focus();
}

function gameLoop(ts){
  if(!lastTime) lastTime = ts;
  const dt = ts - lastTime; lastTime = ts;
  update(dt); draw();
  requestAnimationFrame(gameLoop);
}

// input
input.addEventListener('keydown', (e)=>{
  if(e.code==='Space' || e.code==='Enter'){
    e.preventDefault();
    const val = input.value.trim();
    if(val) checkInput(val.toLowerCase());
    input.value = '';
  }else if(e.code==='Escape'){
    input.value='';
  }
});

startBtn.addEventListener('click', ()=>startGame());

pauseBtn.addEventListener('click', ()=>{
  if(!running) return;
  paused = !paused; pauseBtn.textContent = paused ? 'Resume' : 'Pause';
});

muteBtn.addEventListener('click', ()=>{ muted = !muted; muteBtn.textContent = muted ? 'Unmute' : 'Mute'; });


(function init(){
  const hs = Number(localStorage.getItem('typing-blaster-highscore')||0);
  highscoreEl.textContent = hs;
  updateHUD();
  requestAnimationFrame(gameLoop);
})();
```

