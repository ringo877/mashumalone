/* =============================================
   まほちゃん誕生日サイト — main JavaScript  (スマホ対応 + ポスター生成 v2)
   ============================================= */

/************* 0. 設定 *************/
// ↓ ご自分のパスワードを SHA‑256 変換した 64 文字に差し替えてください
const HASH = '398f64de21a9d7228fc607938bde4f72015cb4aec977e20452356aacfbb13c89';
// パスワード誤入力回数をカウント
let pwFailCount = 0;

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

/* === 軽量化: 遅延読み込み設定 === */
document.addEventListener('DOMContentLoaded',()=>{
  // 画像は遅延読み込み
  document.querySelectorAll('img').forEach(img=>{
    img.loading = 'lazy';
    img.decoding = 'async';
  });

  // BGM だけはプリロードを維持し、それ以外を none に
  document.querySelectorAll('audio').forEach(aud=>{
    if(aud.id!=='bgm'){
      aud.preload = 'none';
    }
  });

  // 動画も初期読み込みしない
  document.querySelectorAll('video').forEach(v=>{
    v.preload = 'none';
  });
});

/************* 4. パスワード入力 *************/
$('enter').addEventListener('click',async()=>{
  const pw=$('pw').value;
  if(await sha256(pw)!==HASH){
    pwFailCount++;
    let msg='パスワードが違います…';
    if(pwFailCount>=2){ msg+='<br>💡 ヒント：鏡'; }
    $('msg').innerHTML = msg;
    return;
  }
  // 成功したらカウンタリセット
  pwFailCount=0;
  $('lock').style.display='none';
  introLayer.style.display='flex';

  /* === Autoplay Unlock: BGM を無音再生してポリシーを解除 === */
  try{
    const bgmEl=$('bgm');
    if(bgmEl.paused){
      // 音量 0 で再生し続け、モバイルの自動再生制限を解除するだけにとどめる
      // （pause すると端末によっては音が出てしまうケースがあったため）
      bgmEl.dataset.prevVol = bgmEl.volume.toString(); // 後で戻すため保存
      bgmEl.volume = 0;
      await bgmEl.play();
    }
  }catch(e){/* silent */}

  video.play()?.catch(()=>{});
});

/************* 5. イントロ終了 or Skip *************/
function showMain(){
  if(mainShown) return;             // 1 回だけ
  mainShown = true;
  introLayer.style.display='none';
  $('content').hidden = false;
  document.body.classList.add('ready');

  // ① タイトル (#siteHeader) を先行表示
  const headerEl = $('siteHeader');
  // 次フレームで hide-before → show-now に切り替え（初回ペイントを保証）
  requestAnimationFrame(()=>{
    headerEl.classList.replace('hide-before','show-now');
  });

  // ② 0.6 s 後にヒーロー / アルバムを表示
  setTimeout(()=>{
    $('heroGallery')?.classList.replace('hide-before','show-now');
    $('album')?.classList.replace('hide-before','show-now');
  },600);

  // ③ 1.2 s 後にメインコンテンツを表示
  setTimeout(()=>{
    $('mainArea').classList.replace('hide-before','show-now');
    // BGM の音量を元に戻し、頭出しして再生開始
    const bgmEl=$('bgm');
    try{
      bgmEl.currentTime = 0;
      if(bgmEl.volume === 0){
        const volStr = bgmEl.dataset.prevVol;
        bgmEl.volume = volStr ? parseFloat(volStr) : 1;
      }
      bgmEl.play()?.catch(()=>{});
    }catch(e){/* silent */}
    // BGM ボタン表示
    playBtn.style.display='block';
  },1200);

  /* === アルバムスライダーを初期状態にリセットしてから自動再生を開始 === */
  const sliderSlides = document.querySelector('.slides');
  const dots = document.querySelectorAll('.dots .dot');
  if(sliderSlides){
    // 画像位置を先頭へ
    sliderSlides.style.transform = 'translateX(0%)';
    // ドットの active を先頭に揃える
    dots.forEach((d,i)=>d.classList.toggle('active', i===0));
  }
  // スライダーに開始合図を送る
  document.dispatchEvent(new Event('site-ready'));
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

  shaso:`『車窓からあの子』


いつもと同じ駅前で
気だるげなあくびをひとつこぼして
そろそろバスが来るかしら
ぼんやりと道路を眺めるわたし

ため息をついた


真っ先に乗り込んで
始発のバスはがらんどう
いつもの席に座って
目が覚める頃には到着


変わらない日々を繰り返す
これからもそうだと思っていたの


閉まるドア
動き出すバス
ふと外を見る
目の端に影
それは


乗り遅れたあの子
ゆっくりと立ち止まって
思わず天を仰いでる

やがてフェードアウト
車窓からフェードアウト


いつもと同じ駅前で
実はちょっぴり期待しているの
今日もあの子は来るかしら
やっぱり間に合わないのかななんて

思いが巡った


真っ先に乗り込んで
始発のバスはがらんどう
いつもの席に座って
目が覚める頃には到着


変わらない日々を繰り返す
これからもそうだとわかっているの

でも

閉まるドア
動き出すバス
ふと外を見る
目の端に影
それは


乗り遅れたあの子
必死に息を整えて
恥ずかしそうに目を伏せた

やがてフェードアウト
車窓からフェードアウト


この透明なガラス越し
あの子の声は届かない
だけど聞こえる気がしたの
「ああ…」ってあの子の落胆が
感情豊かなその仕草
おもわず笑ってしまったの


乗り遅れたあの子
わたしと同じ制服
今日もあと少しだったね

やがてフェードアウト
車窓からフェードアウト


いつもと同じ駅前で
いつもと違うわたしの心は
あの子にとって酷かしら
いつもと同じを期待している

くすりと笑った


閉まるドア
動き出すバス
今日も待ってる
期待してるの
それは

車窓からあの子`,

  rag_girl:`『雑巾少女Z』

「雑巾少女　Z！！」


今日もはじまるお掃除タイム(Let's！)
(ほら)机を下げて！
(さあ)ほうきを持って！
(いざ)ぞうきん絞って！(Clean up！)

構えはもちろんクラウチング(go！)
(ほら)両手をついて！
(さあ)おしりを上げて！
(いざ)スカートおさえて！(Clean up！)


掃除は自分と向き合うことなの
心の鏡をきれいに磨いて
そっとのぞきこんだら
そこにはなにが映るかな？


「ほんとにお掃除すきだね」なんて
ちょっとあきれて友だちは言うけど
あたりまえでしょ？


だってわたしは

雑巾少女！(Maho！)
不思議なお掃除パワーで
みんなの心もピカピカ！(like a new penny！)

汚れだって(No！)
雑菌だって(boo！)
ぜんぶわたしにまかせて！(Clean up！)

かがやく世界がまっている！


「お掃除だなんてめんどくさい」(What！？)
(ほら)机を下げて！
(さあ)ほうきを持って！
(いざ)ぞうきん絞って！(Clean up！)

「なんだか楽しくなってきた」(Yes！)
(ほら)両手をついて！
(さあ)おしりを上げて！
(いざ)ズボンをまくって！(Clean up！)


みんなで一緒にちから合わせるの
どんなことも真剣に取り組んで
そっと手をとりあったら
いったいなにができるかな？


「なんでそんなに頑張るの」なんて
肩をすくめて友だちは言うけど
あたりまえでしょ？


だってわたしは

雑巾少女！(Maho！)
不思議なお掃除パワーで
みんなの心もピカピカ！(like a jewelry！)

汚れだって(No！)
雑菌だって(boo！)
ぜんぶわたしにまかせて！(Clean up！)

かがやく世界はすぐそこよ！


「この世にぞうきんがあるかぎり」
「みんなの心はピッカピカ！」
「雑巾少女」
「Maho！！」


そうよわたしは

雑巾少女！(Maho！)
不思議なお掃除パワーで
みんなの心もピカピカ！(like the sunshine！)

汚れだって(No！)
雑菌だって(boo！)
ぜんぶわたしにまかせて！(Clean up！)

「わたしもお掃除すきかも」なんて
はにかみながら友だちが言うから
はじめちゃおうか！


そうよあなたも

雑巾少女！(ゼット！)
不思議なお掃除パワーで
みんなの心もピカピカ！(like your eyes！)

汚れだって(No！)
雑菌だって(boo！)
ぜんぶわたしにまかせて！(Clean up！)

手をとりあって
かがやく世界をつくりだせ！

「Z！！」`,

  violinist:`『ヴァイオリニスト』


君は小さなヴァイオリニスト
あこがれを胸に抱きしめて
その重さ受けとめながら
ひたむきに努力を重ねたんだ


行きつけの楽器店
君は会いにゆく
ほら
馴染みの店主 看板犬！


君はたしかに
ヴァイオリニスト
生まれながらに
ヴァイオリニスト

つたない指の運びでも
懸命な音がきらめいてんだ！


前を向いてよヴァイオリニスト
戸惑わないで顔上げて
動揺はきれいに隠して
かっこいいとこ見せて欲しいんだ！


ある秋の文化祭
君はあの子とデュオ
でも
走り出すピアノ 想定外！


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


連れて行ってよヴァイオリニスト
`,

  kokuhaku:`『まほちゃんに告白しようと思ってる』
  

  まほちゃんに、告白しようと思ってる。
  ゆいかちゃんには、悪いけど。
  抜け駆けで。
  次の誕生日、お金入るから。
  プレゼントして。そこで気持ち伝える。
  まほちゃんは女の人と付き合ったことないから。
  びっくりするかもだけど。
  もう気持ちを伝えるのを我慢できないから。`,

  donuts:`『DONUTVS（ドーナトゥス）』


In nomine gluttonia... panis saccharum...
（暴食の名において… 糖のパンに祈りを…）


空洞の輪　咀嚼の輪廻（リンク）
胃の鐘を鳴らせ　甘味の審判（ジャッジ）
破滅、渇望、鼓動、焦燥
混ざり合う脂の饗宴（バッカナーレ）

嗚呼、選ばれし三名（トリニティ）
立ち向かうは——無限の揚げ輪
重なるドーナツ、沈む意思、響く律動


蜜と炎の共犯者（アリア）
シナモン・グレーズ・ポン・デ・デウス
甘美な地獄に堕ちていく
一口ごとに削られる魂

逃げ場はない　掟（ルール）は絶対
「残すな」それは契約（コントラクト）
我ら　今、喰らうのだ


DONUTVS（ドーナトゥス）——我が身を捧ぐ祭壇
貪欲という名の審判が下る
胃袋の鐘が鳴る　食らえ、終わりまで
血糖の海で溺れるならば
甘く、苦く、尊く、砕けよ
Saccharum, Finis, Amen.


見上げた塔　パイの墓標
意志を試す最後の輪（ループ）
喰らえ、喰らえ、喰らえ、無慈悲なる儀式
嗚呼　胃に刻まれる十字の後悔


我らが胃に刻め！ Tot Gluttonia！
終わりなきスイート・アポカリプス
膨張の果てに微笑む神よ
赦しなど、ない
Saccharum, Libera Me.


静寂、皿の上
残された一輪
「…誰が取ったんだこれ」`
};

// 歌詞ポップアップ
const lyricModal=document.getElementById('lyricModal');
const lyricText=document.getElementById('lyricText');
const closeLyric=document.getElementById('closeLyric');

// === ページスクロール固定ユーティリティ ===
let savedScrollY=0;
function lockScroll(){
  savedScrollY = window.scrollY || document.documentElement.scrollTop;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${savedScrollY}px`;
  document.body.style.width='100%';
  document.body.style.overflowY='scroll'; // スクロールバーを残す
}
function unlockScroll(){
  document.body.style.position='';
  document.body.style.top='';
  document.body.style.overflowY='';
  window.scrollTo(0, savedScrollY);
}

closeLyric.addEventListener('click',()=>{
  lyricModal.close();
  unlockScroll();
});

// バナナポップアップ
const bananaImg=document.getElementById('bananaImg');
const bananaDialog=document.getElementById('bananaDialog');
const closeBanana=document.getElementById('closeBanana');
bananaImg?.addEventListener('click',()=>{lockScroll();bananaDialog.showModal();});
closeBanana?.addEventListener('click',()=>{bananaDialog.close();unlockScroll();});

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
    lockScroll();
    lyricModal.showModal();
    // スクロールを最上部にリセット（モバイルSafari対策）
    lyricText.scrollTop = 0;
    requestAnimationFrame(()=>{ lyricText.scrollTop = 0; });
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
  let autoId = null;
  function startAutoPlay(){
    if(autoId!==null) return; // 二重起動防止
    // スライド位置をリセット
    index = 0;
    update();
    autoId = setInterval(()=>{
      document.querySelector('.next').click();
    },4000);
  }

  // サイト表示完了後（showMain → site-ready イベント発火）に自動再生を開始
  document.addEventListener('site-ready', startAutoPlay, { once:true });
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