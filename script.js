document.getElementById('play-btn').addEventListener('click', () => {
  const bgm = document.getElementById('bgm');
  if (bgm.paused) {
    bgm.play();
  } else {
    bgm.pause();
  }
});

/* ===== パスワード判定パート ===== */
const HASH = '7fb1d81b1242ca382756fcb35655500c11f55fa874b9a50ec729fd15f0669024';
// ↑ ↑ ↑ 「mypassword」を SHA-256 でハッシュした例。ご自分の値に置き換えて！

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,'0')).join('');
}

document.getElementById('enter').addEventListener('click', async () => {
  const pw = document.getElementById('pw').value;
  if (await sha256(pw) === HASH) {
    document.getElementById('lock').style.display = 'none';
    document.getElementById('content').style.display = 'block';
  } else {
    document.getElementById('msg').textContent = 'パスワードが違います…';
  }
});
