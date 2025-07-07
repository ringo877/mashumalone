/* ========= main JavaScript ========= */
const HASH='7fb1d81b1242ca382756fcb35655500c11f55fa874b9a50ec729fd15f0669024'; // 置き換えてください

const qs=id=>document.getElementById(id);
const introLayer=qs('introVideo');
const video     =qs('birthdayVideo');
const skipBtn   =qs('skipIntro');
const playBtn   =qs('play-btn');
let mainShown=false;

async function sha256(t){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');}

qs('enter').addEventListener('click',async()=>{
  const pw=qs('pw').value;
  if(await sha256(pw)!==HASH){qs('msg').textContent='パスワードが違います…';return;}
  qs('lock').style.display='none';
  introLayer.style.display='flex';
  video.play()?.catch(()=>{});
});

function showMain(){
  if(mainShown)return;mainShown=true;
  introLayer.style.display='none';
  qs('content').hidden=false;
  document.body.classList.add('ready');

  qs('siteHeader').classList.replace('hide-before','show-now');
  setTimeout(()=>{
    qs('mainArea').classList.replace('hide-before','show-now');
    qs('bgm').play()?.catch(()=>{});
    playBtn.style.display='block';
  },600);
}

video.addEventListener('ended',showMain,{once:true});
skipBtn.addEventListener('click',()=>{video.pause();showMain();});

playBtn.addEventListener('click',()=>{const b=qs('bgm');(b.paused?b.play():b.pause())?.catch(()=>{});});