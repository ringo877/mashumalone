/* ===== ユーティリティ：SHA-256 ハッシュ ===== */
async function sha256(text){
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)]
           .map(b=>b.toString(16).padStart(2,'0'))
           .join('');
}

/* ★ ここにご自分のパスワードを SHA-256 変換した 64 桁を貼り付けてください */
const HASH = '7fb1d81b1242ca382756fcb35655500c11f55fa874b9a50ec729fd15f0669024';

/* ===== パスワード入力 → イントロ動画 → 本編 & BGM ===== */
document.getElementById('enter').addEventListener('click', async () => {
  const pw = document.getElementById('pw').value;
  if (await sha256(pw) !== HASH){
    document.getElementById('msg').textContent = 'パスワードが違います…';
    return;
  }

  /* Step-1: ロック解除 */
  document.getElementById('lock').style.display = 'none';

  /* Step-2: イントロ動画レイヤーを表示して再生 */
  const introLayer = document.getElementById('introVideo');
  const video      = document.getElementById('birthdayVideo');
  introLayer.style.display = 'flex';
  video.play()?.catch(()=>{});                // 自動再生

  /* Step-3 & 4: 動画終了 → タイトル → 0.8s 後にメイン＋BGM */
  video.addEventListener('ended', () => {
    introLayer.style.display = 'none';        // 黒幕を閉じる

    const content = document.getElementById('content');
    content.style.display = 'block';
    document.body.classList.add('ready');     // 背景色を元に戻す

    const header = document.getElementById('siteHeader');
    header.classList.replace('hide-before','show-now');  // タイトルふわっ

    setTimeout(() => {
      document.getElementById('mainArea')
              .classList.replace('hide-before','show-now'); // 他コンテンツふわっ
      document.getElementById('bgm').play()?.catch(()=>{}); // BGM 開始
    }, 800);  // タイトルのフェードイン時間と合わせる
  }, { once:true });
});

/* ===== BGM 手動トグル（任意クリックで再生・停止） ===== */
document.getElementById('play-btn').addEventListener('click', () => {
  const bgm = document.getElementById('bgm');
  (bgm.paused ? bgm.play() : bgm.pause())?.catch(()=>{});
});
