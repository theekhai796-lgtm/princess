/* ========= SETTINGS (yahan apni marzi se badal lo) ========= */
const HER_NAME = "Meri Princess";          // uska naam ya pyar ka naam
const YOUR_NAME = "Tumhara Apna";          // apna naam
const TYPING_LINES = [
  "Today is all about you, my princess 👑",
  "You are the princess of my heart 💖",
  "Happy Princess Day, my love 🌸"
];
/* ============================================================ */

document.querySelectorAll('[data-her]').forEach(e => e.textContent = HER_NAME);
document.querySelectorAll('[data-you]').forEach(e => e.textContent = YOUR_NAME);

/* ---- Floating hearts / petals ---- */
const floaters = document.getElementById('floaters');
const hearts = ['💖','💕','💗'];
const flowerImages = ['fl 1 (1).png','fl 1 (2).png','fl 1 (3).png'];
function spawnFloat(){
  if(!floaters) return;
  const el = document.createElement('div');
  el.className = 'float';
  el.setAttribute('aria-hidden', 'true');
  const size = 14 + Math.random()*26;
  if(Math.random() < 3/8){
    el.textContent = hearts[Math.floor(Math.random()*hearts.length)];
    el.style.fontSize = size + 'px';
  } else {
    const flower = document.createElement('img');
    flower.src = flowerImages[Math.floor(Math.random()*flowerImages.length)];
    flower.alt = '';
    flower.style.width = size + 'px';
    flower.style.height = size + 'px';
    el.appendChild(flower);
  }
  el.style.left = Math.random()*100 + 'vw';
  const d = 7 + Math.random()*7;
  el.style.animationDuration = d + 's';
  floaters.appendChild(el);
  setTimeout(()=>el.remove(), d*1000);
}
setInterval(spawnFloat, 450);

/* ---- Sparkle trail on mouse / touch ---- */
function sparkle(x,y){
  const s = document.createElement('div');
  s.className = 'spark';
  s.textContent = ['✨','💖','🌸','⭐'][Math.floor(Math.random()*4)];
  s.style.left = x+'px'; s.style.top = y+'px';
  s.style.setProperty('--dx', (Math.random()*60-30)+'px');
  s.style.setProperty('--dy', (Math.random()*60+10)+'px');
  document.body.appendChild(s);
  setTimeout(()=>s.remove(), 900);
}
let last = 0;
document.addEventListener('mousemove', e => { const n = Date.now(); if(n-last>60){ sparkle(e.clientX,e.clientY); last=n; } });
document.addEventListener('touchmove', e => { const t=e.touches[0]; sparkle(t.clientX,t.clientY); }, {passive:true});

/* ---- Photo / GIF fallback (jab tak tum apni file nahi lagati) ---- */
document.querySelectorAll('img.ph').forEach(img => {
  const fix = () => {
    const box = document.createElement('div');
    box.className = 'ph-box';
    box.innerHTML = '📸<br>Yahan apni photo/GIF lagao<br><small>' + (img.getAttribute('src')||'') + '</small>';
    img.replaceWith(box);
  };
  img.addEventListener('error', fix);
  if(img.complete && img.naturalWidth === 0) fix();
});

/* ---- Typing effect ---- */
const typingEl = document.getElementById('typing');
if(typingEl){
  let li = 0, ci = 0, del = false;
  (function tick(){
    const line = TYPING_LINES[li];
    typingEl.textContent = line.slice(0, ci);
    if(!del && ci < line.length){ ci++; setTimeout(tick, 80); }
    else if(!del){ del = true; setTimeout(tick, 1600); }
    else if(ci > 0){ ci--; setTimeout(tick, 35); }
    else { del = false; li = (li+1)%TYPING_LINES.length; setTimeout(tick, 400); }
  })();
}

/* ---- Flip cards ---- */
document.querySelectorAll('.flip').forEach(c => c.addEventListener('click', () => { c.classList.toggle('on'); confetti(18); }));

/* ---- Confetti ---- */
const cv = document.getElementById('confetti');
let pieces = [], running = false;
function confetti(n=120, x=innerWidth/2, y=innerHeight/3){
  if(!cv) return;
  cv.width = innerWidth; cv.height = innerHeight;
  const colors = ['#ff5c9a','#ff8fb8','#ffc2da','#fff','#ffd700','#d6336c'];
  for(let i=0;i<n;i++) pieces.push({
    x, y, vx:(Math.random()-.5)*14, vy:Math.random()*-12-2, g:.28,
    s:5+Math.random()*7, c:colors[Math.floor(Math.random()*colors.length)], r:Math.random()*6, vr:(Math.random()-.5)*.4, life:160
  });
  if(!running){ running = true; loop(); }
}
function loop(){
  const ctx = cv.getContext('2d');
  ctx.clearRect(0,0,cv.width,cv.height);
  pieces.forEach(p => {
    p.vy += p.g; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life--;
    ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
    ctx.globalAlpha = Math.max(p.life/160,0);
    ctx.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6); ctx.restore();
  });
  pieces = pieces.filter(p => p.life>0 && p.y<cv.height+20);
  if(pieces.length) requestAnimationFrame(loop); else { running=false; ctx.clearRect(0,0,cv.width,cv.height); }
}
document.querySelectorAll('[data-confetti]').forEach(b => b.addEventListener('click', () => confetti(160)));
window.addEventListener('load', () => { if(document.body.dataset.welcome) setTimeout(()=>confetti(140), 500); });

/* ---- Surprise gift ---- */
const gift = document.getElementById('gift');
if(gift){
  gift.addEventListener('click', () => {
    gift.classList.add('hidden');
    const box = document.getElementById('surprise');
    box.classList.remove('hidden'); box.classList.add('reveal');
    confetti(250, innerWidth/2, innerHeight/2);
    setTimeout(()=>confetti(200, innerWidth*.2, innerHeight/2), 400);
    setTimeout(()=>confetti(200, innerWidth*.8, innerHeight/2), 700);
  });
}

/* ---- Shared music across pages ---- */
const musicButton = document.getElementById('music');
const audio = document.getElementById('background-music');
if(musicButton && audio){
  const musicTimeKey = 'princessMusicTime';
  const musicPlayingKey = 'princessMusicPlaying';
  audio.loop = true;
  audio.preload = 'auto';
  let navigating = false;
  let restored = false;
  let lastSavedAt = 0;

  function saveMusicPosition(){
    if(Number.isFinite(audio.currentTime)){
      sessionStorage.setItem(musicTimeKey, String(audio.currentTime));
    }
  }
  function setMusicButton(playing){
    musicButton.textContent = playing ? '⏸️' : '🎵';
    musicButton.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
    musicButton.title = playing ? 'Pause music' : 'Play music';
  }
  function startMusic(){
    audio.play().catch(error => {
      setMusicButton(false);
      if(!navigating){
        sessionStorage.setItem(musicPlayingKey, 'false');
        musicButton.title = error.name === 'NotAllowedError' ? 'Tap to start music' : 'Unable to play song.mp3';
      }
    });
  }
  function restoreMusic(){
    if(restored) return;
    restored = true;
    const savedTime = Number(sessionStorage.getItem(musicTimeKey));
    if(Number.isFinite(savedTime) && savedTime > 0 && audio.duration > 0){
      audio.currentTime = savedTime % audio.duration;
    }
    const shouldPlay = sessionStorage.getItem(musicPlayingKey) === 'true'
      || document.body.dataset.welcome === '1';
    if(shouldPlay) startMusic();
  }

  audio.addEventListener('loadedmetadata', restoreMusic, {once:true});
  if(audio.readyState >= 1) restoreMusic();
  audio.addEventListener('play', () => {
    sessionStorage.setItem(musicPlayingKey, 'true');
    setMusicButton(true);
  });
  audio.addEventListener('pause', () => {
    setMusicButton(false);
    if(!navigating){
      sessionStorage.setItem(musicPlayingKey, 'false');
      saveMusicPosition();
    }
  });
  audio.addEventListener('timeupdate', () => {
    if(Date.now() - lastSavedAt >= 1000){
      saveMusicPosition();
      lastSavedAt = Date.now();
    }
  });
  audio.addEventListener('error', () => {
    setMusicButton(false);
    musicButton.title = 'Unable to load song.mp3';
    if(!navigating) sessionStorage.setItem(musicPlayingKey, 'false');
  });
  setMusicButton(!audio.paused);
  musicButton.addEventListener('click', () => {
    if(audio.paused){
      sessionStorage.setItem(musicPlayingKey, 'true');
      startMusic();
    } else {
      sessionStorage.setItem(musicPlayingKey, 'false');
      audio.pause();
    }
  });
  document.querySelectorAll('a[href]').forEach(link => {
    link.addEventListener('click', () => {
      navigating = true;
      saveMusicPosition();
      sessionStorage.setItem(musicPlayingKey, String(!audio.paused));
    });
  });
  window.addEventListener('pagehide', () => {
    navigating = true;
    saveMusicPosition();
    sessionStorage.setItem(musicPlayingKey, String(!audio.paused));
  });
}
