document.getElementById('play-btn').addEventListener('click', () => {
  const bgm = document.getElementById('bgm');
  if (bgm.paused) {
    bgm.play();
  } else {
    bgm.pause();
  }
});