/* =============================================
   まほちゃん誕生日サイト — main JavaScript  (スマホ対応 + ポスター生成 v2)
   ============================================= */

/************* 0. 設定 *************/
// ↓ ご自分のパスワードを SHA‑256 変換した 64 文字に差し替えてください
const HASH = '398f64de21a9d7228fc607938bde4f72015cb4aec977e20452356aacfbb13c89';

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

/* ====== 追記分 ★★ 変更 start ======*/
//  サイドバーのスムーススクロール
Array.from(document.querySelectorAll('#sidebar button')).forEach(btn=>{
  btn.addEventListener('click',e=>{
    const target=document.querySelector(e.currentTarget.dataset.scroll);
    target?.scrollIntoView({behavior:'smooth'});
    // 開いたままだと邪魔なので閉じる
    sidebar.classList.remove('open');
    menuBtn.classList.remove('open');
  });
});

// ハンバーガー ↔︎ サイドバー開閉
const menuBtn=document.getElementById('menuToggle');
const sidebar=document.getElementById('sidebar');
menuBtn.addEventListener('click',()=>{
  menuBtn.classList.toggle('open');
  sidebar.classList.toggle('open');
});


// 歌詞ポップアップ
const lyricModal=document.getElementById('lyricModal');
const lyricText=document.getElementById('lyricText');
const closeLyric=document.getElementById('closeLyric');
closeLyric.addEventListener('click',()=>lyricModal.close());

Array.from(document.querySelectorAll('.song-title')).forEach(el=>{
  el.style.cursor='pointer';
  el.addEventListener('click',()=>{
    lyricText.textContent=el.dataset.lyrics||'歌詞が登録されていません';
    lyricModal.showModal();
  });
});

// BGM 選択機能
const bgm=document.getElementById('bgm');
const firstAudio=document.querySelector('.song-audio[data-default="true"]');
if(firstAudio){bgm.src=firstAudio.querySelector('source').src;}

// 曲をクリックで BGM にセット
Array.from(document.querySelectorAll('.song-audio')).forEach(aud=>{
  // aud.addEventListener('play',()=>{
  //   if(bgm.src!==aud.querySelector('source').src){
  //     bgm.pause();bgm.src=aud.querySelector('source').src;bgm.play()?.catch(()=>{});
  //   }

      aud.addEventListener('play',()=>{
        const newSrc=aud.querySelector('source').src;
        // audio 自体はすぐ停止し、BGM のみを再生させる
        aud.pause();aud.currentTime=0;
        if(bgm.src!==newSrc){
          bgm.pause();bgm.src=newSrc;bgm.play()?.catch(()=>{});
        }

  });
});
/* ====== 追記分 ★★ 変更 end =====*/