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
  // BGM再生時、他の曲audioをすべて停止
  Array.from(document.querySelectorAll('.song-audio')).forEach(aud=>{
    if (!aud.paused) {
      aud.pause();
      aud.currentTime = 0;
    }
  });
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


// 歌詞マップ（data-lyrics-id と紐付け）
const lyricsMap={
  maho_birthday:`『まほちゃんの誕生日』

まほちゃんお誕生日おめでとう
ハッピーバースデー まほちゃん
まほちゃんお誕生日おめでとう
ハッピーバースデー まほちゃん

生まれてきてくれてありがとう
いつも元気をくれてありがとう
楽しい日々をありがとう
お誕生日おめでとう

まほちゃんお誕生日おめでとう
ハッピーバースデー まほちゃん
まほちゃんお誕生日おめでとう
ハッピーバースデー まほちゃん

生まれてきてくれてありがとう
いつも元気をくれてありがとう
楽しい日々をありがとう
お誕生日おめでとう

まほちゃんお誕生日おめでとう
ハッピーバースデー まほちゃん
まほちゃんお誕生日おめでとう
ハッピーバースデー まほちゃん

生まれてきてくれてありがとう
いつも元気をくれてありがとう
楽しい日々をありがとう
お誕生日おめでとう`,

  the_claim:`『The Claim』

締め切りまであと何分？
焦り募る指先
縺れる心 振り切ってよanxiety

締め切りまであと何分？
研ぎ澄まして感覚
極限でこそ 発揮されるpotential

そう、それは
コンストラクティブスピーチ

コンストラクティブスピーチ

コンストラクティブスピーチ

締め切りまであと1分！
押し込むのはエンター
指の先から 広がるのはconviction

間に合った！
はずだったのに

そう、それは
コメント欄

コメント欄

コメント欄

迫真のコメント投下
空虚に響くGreeting

空白のプラットフォーム
孤独に輝くMaho Watanabe

過ぎる締切
冷やかしのWow
なにはともあれ
証拠を確保
これは言い訳？
いいや弁解

「投稿先を 間違えました！」

叫べ潔白
示せよ無罪

そう、それは
コンストラクティブスピーチ

コンストラクティブスピーチ

コンストラクティブスピーチ

忘れない

コンストラクティブスピーチ`,

  shaso:`『車窓からあの子』\n\nいつもと同じ駅前で\n気だるげなあくびをひとつこぼして\nそろそろバスが来るかしら\nぼんやりと道路を眺めるわたし\n\nため息をついた\n\n真っ先に乗り込んで\n始発のバスはがらんどう\nいつもの席に座って\n目が覚める頃には到着\n\n変わらない日々を繰り返す\nこれからもそうだと思っていたの\n\n(fadeout)\n閉まるドア\n動き出すバス\nふと外を見る\n目の端に影\nそれは\n\n(fadeout)\n乗り遅れたあの子\nゆっくりと立ち止まって\n思わず天を仰いでる\n\nやがてフェードアウト(fadeout)\n車窓からフェードアウト(fadeout)\n\nいつもと同じ駅前で\n実はちょっぴり期待しているの\n今日もあの子は来るかしら\nやっぱり間に合わないのかななんて\n\n思いが巡った\n\n真っ先に乗り込んで\n始発のバスはがらんどう\nいつもの席に座って\n目が覚める頃には到着\n\n変わらない日々を繰り返す\nこれからもそうだとわかっているの\n\nでも\n\n(fadeout)\n閉まるドア\n動き出すバス\nふと外を見る\n目の端に影\nそれは\n\n(fadeout)\n乗り遅れたあの子\n必死に息を整えて\n恥ずかしそうに目を伏せた\n\nやがてフェードアウト(fadeout)\n車窓からフェードアウト(fadeout)\n\nこの透明なガラス越し\nあの子の声は届かない\nだけど聞こえる気がしたの\n「ああ…」ってあの子の落胆が\n感情豊かなその仕草\nおもわず笑ってしまったの\n\n(fadeout)\n乗り遅れたあの子\nわたしと同じ制服\n今日もあと少しだったね\n\nやがてフェードアウト(fadeout)\n車窓からフェードアウト(fadeout)\n\nいつもと同じ駅前で\nいつもと違うわたしの心は\nあの子にとってこくかしら\nいつもと同じを期待している\n\nくすりと笑った(笑った)\n\n閉まるドア\n動き出すバス\n今日も待ってる\n期待してるの\nそれは\n\n車窓からあの子`,

  rag_girl:`『雑巾少女Z』\n\n「ぞうきん少女　ゼット！！」\n\n今日もはじまるお掃除タイム(Let's！)\n(ほら)机を下げて！\n(さあ)ほうきを持って！\n(いざ)ぞうきん絞って！(Clean up！)\n\n構えはもちろんクラウチング(go！)\n(ほら)両手をついて！\n(さあ)おしりを上げて！\n(いざ)スカートおさえて！(Clean up！)\n\n掃除は自分と向き合うことなの\n心の鏡をきれいに磨いて\nそっとのぞきこんだら\nそこにはなにが映るかな？\n\n「ほんとにお掃除すきだね」なんて\nちょっとあきれて友だちは言うけど\nあたりまえでしょ？\n\nだってわたしは\n\nぞうきん少女！(Maho！)\n不思議なお掃除パワーで\nみんなの心もピカピカ！(like a new penny！)\n\n汚れだって(No！)\n雑菌だって(boo！)\nぜんぶわたしにまかせて！(Clean up！)\n\nかがやく世界がまっている！\n\n「お掃除だなんてめんどくさい」(What！？)\n(ほら)机を下げて！\n(さあ)ほうきを持って！\n(いざ)ぞうきん絞って！(Clean up！)\n\n「なんだか楽しくなってきた」(Yes！)\n(ほら)両手をついて！\n(さあ)おしりを上げて！\n(いざ)ズボンをまくって！(Clean up！)\n\nみんなで一緒にちから合わせるの\nどんなことにも真剣に取り組んで\nそっと手をとりあったら\nいったいなにができるかな？\n\n「なんでそんなに頑張るの」なんて\n肩をすくめて友だちは言うけど\nあたりまえでしょ？\n\nだってわたしは\n\nぞうきん少女！(Maho！)\n不思議なお掃除パワーで\nみんなの心もピカピカ！(like a jewelry！)\n\n汚れだって(No！)\n雑菌だって(boo！)\nぜんぶわたしにまかせて！(Clean up！)\n\nかがやく世界はすぐそこよ！\n\n「この世にぞうきんがあるかぎり」\n「みんなの心はピッカピカ！」\n「ぞうきん少女」\n「Maho！！」\n\nそうよわたしは\n\nぞうきん少女！(Maho！)\n不思議なお掃除パワーで\nみんなの心もピカピカ！(like the sunshine！)\n\n汚れだって(No！)\n雑菌だって(boo！)\nぜんぶわたしにまかせて！(Clean up！)\n\n「わたしもお掃除すきかも」なんて\nはにかみながら友だちが言うから\nはじめちゃおうか！\n\nそうよあなたも\n\nぞうきん少女！(ゼット！)\n不思議なお掃除パワーで\nみんなの心もピカピカ！(like your eyes！)\n\n汚れだって(No！)\n雑菌だって(boo！)\nぜんぶわたしにまかせて！(Clean up！)\n\n手をとりあって\nかがやく世界をつくりだせ！\n\n「ゼット！！」`,

  violinist:`『ヴァイオリニスト』

君は小さなヴァイオリニスト
あこがれを胸に抱きしめて
その重さ受けとめながら
ひたむきに努力を重ねたんだ

行きつけの楽器店
君は会いにゆく
ほら
なじみのてんしゅ かんばんけん！

君はたしかに
ヴァイオリニスト
生まれながらに
ヴァイオリニスト

つたない指のはこびでも
懸命な音がきらめいてんだ！

前を向いてよヴァイオリニスト
戸惑わないで顔上げて
動揺はきれいに隠して
かっこいいとこ見せて欲しんだ！

ある秋の文化祭
君はあの子とデュオ
でも
走りだすピアノ 想定外！

そんな顔やめて
ヴァイオリニスト
笑って見せて
ヴァイオリニスト

乱れたって崩れたって
君の音色を聴かせてくれよ！

ぼくを見ないでヴァイオリニスト
こっちには目もくれないで
ぼくらなんて置き去りにして
輝きでこの目を焼いてくれよ！

あの日の演奏会
君は舞台の上
さあ
スポットライト 浴びながら！

君は羽ばたく
ヴァイオリニスト
気づけば遠く
ヴァイオリニスト

さみしさからは目をそらして
君に花束を捧げるんだ！

黒いドレスが揺れる
真剣な君のまなざし
知った気でいたのにさ
知らない君がそこにいる

まぶしさで目がくらんじゃうんだ
手を伸ばしても届きそうにないよ

手を差し伸べるヴァイオリニスト
君はぼくらを引き上げて
一緒に行こうと笑ってる
知ってるよ君はそういうやつさ！

連れて行ってよ
ヴァイオリニスト
一緒に飛ぶよ
ヴァイオリニスト

もう置いてけなんて言わないから
知らない景色を見せてくれよ！

振り向かないで
ヴァイオリニスト
追いかけてくよ
ヴァイオリニスト

風が吹く平野 空の中
君が奏でる音で世界旅行！

連れて行ってよヴァイオリニスト`,

  kokuhaku:`『まほちゃんに告白しようと思ってる』
  
  まほちゃんに、告白しようと思ってる。
  ゆいかちゃんには、悪いけど。
  抜け駆けで。
  次の誕生日、お金入るから。
  プレゼントして。そこで気持ち伝える。
  まほちゃんは女の人と付き合ったことないから。
  びっくりするかもだけど。
  もう気持ちを伝えるのを我慢できないから。`
};

// 歌詞ポップアップ
const lyricModal=document.getElementById('lyricModal');
const lyricText=document.getElementById('lyricText');
const closeLyric=document.getElementById('closeLyric');
closeLyric.addEventListener('click',()=>lyricModal.close());

// バナナポップアップ
const bananaImg=document.getElementById('bananaImg');
const bananaDialog=document.getElementById('bananaDialog');
const closeBanana=document.getElementById('closeBanana');
bananaImg?.addEventListener('click',()=>bananaDialog.showModal());
closeBanana?.addEventListener('click',()=>bananaDialog.close());

Array.from(document.querySelectorAll('.song-title')).forEach(el=>{
  el.style.cursor='pointer';
  el.addEventListener('click',()=>{
    const id = el.dataset.lyricsId;
    let rawLyrics = '';
    if(id && lyricsMap[id]){
      rawLyrics = lyricsMap[id];
    } else {
      rawLyrics = el.dataset.lyrics || '歌詞が登録されていません';
    }
    lyricText.innerHTML = rawLyrics.replace(/\n/g, '<br>');
    lyricModal.showModal();
    // スクロールを最上部にリセット
    lyricModal.scrollTop = 0;
    lyricText.scrollTop = 0;
  });
});

// BGM 選択機能
const bgm=document.getElementById('bgm');
const firstAudio=document.querySelector('.song-audio[data-default="true"]');
if(firstAudio){bgm.src=firstAudio.querySelector('source').src;}

// 曲をクリックで BGM にセット
Array.from(document.querySelectorAll('.song-audio')).forEach(aud=>{
      aud.addEventListener('play',()=>{
    // 曲audio再生時、BGMは止める
    if(!bgm.paused){
      bgm.pause();
    }
    // 以降はaudio自身で再生・シークバーも動く（BGMにはセットしない）
  });
});

// 「BGMに設定」ボタン機能
Array.from(document.querySelectorAll('.set-bgm-btn')).forEach(btn=>{
  btn.addEventListener('click',()=>{
    let src = btn.dataset.src;
    if(!src){
      // data-src が無ければ既存のロジックで同一 li 内最初の audio を使用
      const audio = btn.parentElement.querySelector('.song-audio');
      src = audio?.querySelector('source')?.src;
    }
    if (src && bgm) {
      // 他の曲 audio を停止
      Array.from(document.querySelectorAll('.song-audio')).forEach(a=>{
        if(!a.paused){ a.pause(); a.currentTime=0; }
      });

      // BGM を新しい曲に切り替え
      bgm.pause();
      bgm.src = src;
      bgm.currentTime = 0;
      bgm.play()?.catch(()=>{});
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelector('.slides');
  const slideCount = slides.children.length;
  let index = 0;

  /* ==== ドットナビゲーション生成 ==== */
  const sliderEl = slides.closest('.slider');
  const dotsWrap = document.createElement('div');
  dotsWrap.className = 'dots';
  const dots = [];
  for(let i=0;i<slideCount;i++){
    const dot=document.createElement('span');
    dot.className='dot';
    if(i===0) dot.classList.add('active');
    dot.addEventListener('click',()=>{
      index=i;
      update();
    });
    dotsWrap.appendChild(dot);
    dots.push(dot);
  }
  sliderEl.after(dotsWrap);

  function update(){
    slides.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d,idx)=>d.classList.toggle('active', idx===index));
  }

  document.querySelector('.next').addEventListener('click', () => {
    index = (index + 1) % slideCount;
    update();
  });

  document.querySelector('.prev').addEventListener('click', () => {
    index = (index - 1 + slideCount) % slideCount;
    update();
  });

  /* 4 秒ごとに自動再生 */
  setInterval(() => {
    document.querySelector('.next').click();
  }, 4000);
});

// ===== 画像クリック → フルサイズ表示 =====
const imgModal=document.getElementById('imgModal');
const fullImg=document.getElementById('fullImg');
const closeImg=document.getElementById('closeImg');
closeImg?.addEventListener('click',()=>imgModal.close());
Array.from(document.querySelectorAll('#album .slides img')).forEach(img=>{
  img.style.cursor='pointer';
  img.addEventListener('click',()=>{
    fullImg.src = img.src;
    fullImg.alt = img.alt || '';
    imgModal.showModal();
  });
});