/* =============================
   まほちゃん誕生日サイト — main JavaScript (最新) 
   ============================= */

/************* 0. ユーティリティ *************/
async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

/************* 1. 設定（パスワードのハッシュを差し替えてください） *************/
const HASH = '7fb1d81b1242ca382756fcb35655500c11f55fa874b9a50ec729fd15f0669024';

/************* 2. 初期化：BGM ボタンを隠す *************/
document.addEventListener('DOMContentLoaded', () => {
  const playBtn = document.getElementById('play-btn');
  if (playBtn) playBtn.style.display = 'none';
});

/************* 3. 共通要素参照 *************/
const introLayer = document.getElementById('introVideo');
const video      = document.getElementById('birthdayVideo');
const skipBtn    = document.getElementById('skipIntro');
const playBtn    = document.getElementById('play-btn');
let mainShown    = false;  // 二重実行ガード

/************* 4. パスワード入力ハンドラ *************/
document.getElementById('enter').addEventListener('click', async () => {
  const pw = document.getElementById('pw').value;
  if (await sha256(pw) !== HASH) {
    document.getElementById('msg').textContent = 'パスワードが違います…';
    return;
  }
  document.getElementById('lock').style.display = 'none';
  introLayer.style.display = 'flex';
  video.play()?.catch(() => {});
});

/************* 5. イントロ終了 or スキップ *************/
function showMain() {
  if (mainShown) return;  // 1 回だけ
  mainShown = true;

  introLayer.style.display = 'none';
  document.getElementById('content').style.display = 'block';
  document.body.classList.add('ready');

  const header = document.getElementById('siteHeader');
  header.classList.replace('hide-before', 'show-now');

  setTimeout(() => {
    document.getElementById('mainArea').classList.replace('hide-before', 'show-now');
    const bgm = document.getElementById('bgm');
    bgm.play()?.catch(() => {});
    playBtn.style.display = 'block';
  }, 800);
}

/* 動画終了 */
video.addEventListener('ended', showMain, { once: true });

/* Skip ボタン */
skipBtn.addEventListener('click', () => {
  video.pause();
  showMain();
});

/************* 6. BGM 再生・停止トグル *************/
playBtn.addEventListener('click', () => {
  const bgm = document.getElementById('bgm');
  (bgm.paused ? bgm.play() : bgm.pause())?.catch(() => {});
});
