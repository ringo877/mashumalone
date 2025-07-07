/* =============================================
   まほちゃん誕生日サイト — main JavaScript  (スマホ対応 + ポスター生成 v2)
   ============================================= */

/************* 0. 設定 *************/
// ↓ ご自分のパスワードを SHA‑256 変換した 64 文字に差し替えてください
const HASH = '7fb1d81b1242ca382756fcb35655500c11f55fa874b9a50ec729fd15f0669024';

/************* 1. ユーティリティ *************/
const $ = id => document.getElementById(id);
async function sha256(t){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');}

/************* 2. 要素参照 *************/
const introLayer = $('introVideo');     // イントロ黒幕
const video      = $('birthdayVideo');  // イントロ用動画
const mainVideo  = $('mainVideo');      // 本編セクションの動画 (存在しなければ null)
const skipBtn    = $('skipIntro');
const playBtn    = $('play-btn');
let   mainShown  = false;               // 二重遷移防止

/************* 3. 初期化 *************/
document.addEventListener('DOMContentLoaded',()=>{ playBtn.style.display='none'; });

/************* 4. パスワード入力 *************/
$('enter').addEventListener('click',async()=>{
  const pw=$('pw').value;
  if(await sha256(pw)!==HASH){ $('msg').textContent='パスワードが違います…'; return; }
  $('lock').style.display='none';
  introLayer.style.display='flex';
  video.play()?.catch(()=>{});
});

/************* 5. イントロ終了 or Skip *************/
function showMain(){
  if(mainShown) return;             // 1 回だけ
  mainShown = true;
  introLayer.style.display='none';
  $('content').hidden = false;
  document.body.classList.add('ready');

  // ヒーローギャラリー & タイトル & メイン 順にフェードイン
  $('heroGallery')?.classList.replace('hide-before','show-now');
  $('siteHeader') .classList.replace('hide-before','show-now');
  setTimeout(()=>{
    $('mainArea').classList.replace('hide-before','show-now');
    $('bgm').play()?.catch(()=>{});
    playBtn.style.display='block';
  },600);
}
video.addEventListener('ended', showMain, { once:true });
skipBtn.addEventListener('click', ()=>{ video.pause(); showMain(); });

/************* 6. BGM トグル *************/
playBtn.addEventListener('click',()=>{
  const b=$('bgm'); (b.paused?b.play():b.pause())?.catch(()=>{});
});

/************* 7. ヒーロースライドショー (画像フェード) *************/
(function heroSlider(){
  const imgs=[...document.querySelectorAll('#heroGallery img')];
  if(imgs.length<=1) return;
  let idx=0; imgs[0].classList.add('active');
  setInterval(()=>{ imgs[idx].classList.remove('active'); idx=(idx+1)%imgs.length; imgs[idx].classList.add('active'); },4000);
})();

/************* 8. ポスター生成 (動画の 1 フレームをキャプチャ) *************/
(function genPoster(){
  if(!video) return;
  video.addEventListener('loadeddata',()=>{
    if(video.readyState<2) return;
    const cvs=document.createElement('canvas');
    cvs.width = video.videoWidth;
    cvs.height= video.videoHeight;
    cvs.getContext('2d').drawImage(video,0,0);
    const dataURL = cvs.toDataURL('image/jpeg');
    // イントロ動画自体に設定（ポスター用途では見えませんが保険）
    video.setAttribute('poster',dataURL);
    // 本編側の動画にも同じポスターを適用
    if(mainVideo) mainVideo.setAttribute('poster',dataURL);
  },{ once:true });
})();
