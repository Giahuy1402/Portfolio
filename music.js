/* ================================================================
   MUSIC PLAYER ENGINE — Spotify Edition
   Vinyl spin · Needle · Visualizer · Smart playlist rows
   ================================================================ */

const playerSection = document.querySelector("#music-player");
if (!playerSection) { console.error("[Music] #music-player not found!"); }

/* ── Core DOM refs ── */
const musicImg     = document.getElementById('sp-album-img');
const musicName    = playerSection.querySelector(".name");
const musicArtist  = playerSection.querySelector(".artist");
const playPauseBtn = playerSection.querySelector(".play-pause");
const prevBtn      = document.getElementById('prev');
const nextBtn      = document.getElementById('next');
const mainAudio    = document.getElementById('main-audio');
const progressArea = playerSection.querySelector(".progress-area");
const progressBar  = progressArea ? progressArea.querySelector(".progress-bar") : null;

/* ── Vinyl & Needle ── */
const vinyl  = document.getElementById('sp-vinyl');
const needle = document.getElementById('sp-needle');

/* ── Playlist UL — use ID for reliability ── */
const ulTag = document.getElementById('sp-ul') || playerSection.querySelector("ul");

/* ── Search ── */
const musicSearchInput = document.getElementById('music-search');

/* ── Visualizer ── */
const visualizerCanvas = document.getElementById('music-visualizer');
const canvasCtx = visualizerCanvas ? visualizerCanvas.getContext("2d") : null;

let audioCtx, analyser, source, bufferLength, dataArray;

/* ── State ── */
let musicIndex = Math.floor(Math.random() * allMusic.length) + 1;
let isMusicPaused = true;

/* ================================================================
   BUILD PLAYLIST ROWS (with thumbnails + EQ bars)
   — Called first so the list is ready when page loads
   ================================================================ */
(function buildPlaylist() {
  if (!ulTag) { console.error("[Music] ul#sp-ul not found!"); return; }
  ulTag.innerHTML = ''; // Clear before building

  for (let i = 0; i < allMusic.length; i++) {
    const track  = allMusic[i];
    const songId = `song-id-${i}`;
    const idx    = String(i + 1).padStart(2, '0');

    const li = document.createElement('li');
    li.setAttribute('li-index', i + 1);
    li.innerHTML = `
      <span class="sp-track-num">${idx}</span>
      <div class="sp-eq"><span></span><span></span><span></span></div>
      <img class="sp-track-thumb" src="${track.img}" alt="${track.name}" loading="lazy" onerror="this.style.background='#1a1a1a'">
      <div class="row">
        <span>${track.name}</span>
        <p>${track.artist}</p>
      </div>
      <span id="${songId}" class="audio-duration">--:--</span>
    `;

    /* Click to play */
    li.addEventListener('click', () => {
      musicIndex = parseInt(li.getAttribute('li-index'));
      loadMusic(musicIndex);
      playMusic();
      playingSong();
    });

    ulTag.appendChild(li);

    /* Pre-load duration via hidden audio */
    const tempAudio = document.createElement('audio');
    tempAudio.preload = 'metadata';
    tempAudio.src = track.src;
    tempAudio.addEventListener('loadedmetadata', () => {
      const dur = tempAudio.duration;
      if (!isNaN(dur)) {
        const m = Math.floor(dur / 60);
        const s = String(Math.floor(dur % 60)).padStart(2, '0');
        const durEl = document.getElementById(songId);
        if (durEl) {
          durEl.innerText = `${m}:${s}`;
          durEl.setAttribute('t-duration', `${m}:${s}`);
        }
      }
      tempAudio.remove();
    });
  }

  /* Update count badge */
  const countEl = document.getElementById('sp-count');
  if (countEl) countEl.textContent = allMusic.length + ' bài';
})();

/* ================================================================
   LOAD TRACK
   ================================================================ */
function loadMusic(indexNumb) {
  const track = allMusic[indexNumb - 1];
  if (!track) return;
  if (musicName)   musicName.innerText   = track.name;
  if (musicArtist) musicArtist.innerText = track.artist;
  if (musicImg)    musicImg.src          = track.img;
  if (mainAudio)   mainAudio.src         = track.src;
}

/* ================================================================
   AUDIO CONTEXT (initialised on first play — required by browsers)
   ================================================================ */
function initAudioContext() {
  if (audioCtx) return;
  try {
    audioCtx  = new (window.AudioContext || window.webkitAudioContext)();
    analyser  = audioCtx.createAnalyser();
    source    = audioCtx.createMediaElementSource(mainAudio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize    = 256;
    bufferLength        = analyser.frequencyBinCount;
    dataArray           = new Uint8Array(bufferLength);
    drawVisualizer();
  } catch (e) {
    console.warn("[Music] Web Audio API:", e);
  }
}

/* ================================================================
   PLAY / PAUSE
   ================================================================ */
function playMusic() {
  initAudioContext();
  playerSection.classList.add("paused");
  const icon = playPauseBtn ? playPauseBtn.querySelector("i") : null;
  if (icon) icon.innerText = "pause";
  mainAudio.play().catch(e => console.warn("[Music] play():", e));
  isMusicPaused = false;
}

function pauseMusic() {
  playerSection.classList.remove("paused");
  const icon = playPauseBtn ? playPauseBtn.querySelector("i") : null;
  if (icon) icon.innerText = "play_arrow";
  mainAudio.pause();
  isMusicPaused = true;
}

function prevMusic() {
  musicIndex = musicIndex <= 1 ? allMusic.length : musicIndex - 1;
  loadMusic(musicIndex);
  playMusic();
  playingSong();
}

function nextMusic() {
  musicIndex = musicIndex >= allMusic.length ? 1 : musicIndex + 1;
  loadMusic(musicIndex);
  playMusic();
  playingSong();
}

/* ================================================================
   EVENTS
   ================================================================ */
if (playPauseBtn) {
  playPauseBtn.addEventListener("click", () => {
    playerSection.classList.contains("paused") ? pauseMusic() : playMusic();
    playingSong();
  });
}

if (prevBtn) prevBtn.addEventListener("click", prevMusic);
if (nextBtn) nextBtn.addEventListener("click", nextMusic);

/* Progress bar click — seek */
if (progressArea) {
  progressArea.addEventListener("click", (e) => {
    const rect   = progressArea.getBoundingClientRect();
    const offset = e.clientX - rect.left;
    const pct    = offset / progressArea.clientWidth;
    if (!isNaN(mainAudio.duration)) {
      mainAudio.currentTime = pct * mainAudio.duration;
    }
    playMusic();
    playingSong();
  });
}

/* Timeupdate — sync progress bar and timestamps */
mainAudio.addEventListener("timeupdate", () => {
  const cur = mainAudio.currentTime;
  const dur = mainAudio.duration;

  if (progressBar && !isNaN(dur) && dur > 0) {
    progressBar.style.width = `${(cur / dur) * 100}%`;
  }

  const curEl = playerSection.querySelector(".current-time");
  const maxEl = playerSection.querySelector(".max-duration");

  if (curEl) {
    curEl.innerText = `${Math.floor(cur / 60)}:${String(Math.floor(cur % 60)).padStart(2,'0')}`;
  }
  if (maxEl && !isNaN(dur)) {
    maxEl.innerText = `${Math.floor(dur / 60)}:${String(Math.floor(dur % 60)).padStart(2,'0')}`;
  }
});

/* ================================================================
   REPEAT / SHUFFLE
   ================================================================ */
const repeatBtn = document.getElementById('repeat-plist');
if (repeatBtn) {
  repeatBtn.addEventListener("click", () => {
    const iconEl  = repeatBtn.querySelector('i');
    const cur     = iconEl ? iconEl.innerText : 'repeat';
    const cycleMap = { repeat: 'repeat_one', repeat_one: 'shuffle', shuffle: 'repeat' };
    const next = cycleMap[cur] || 'repeat';
    if (iconEl) iconEl.innerText = next;
    repeatBtn.title = next === 'repeat_one' ? 'Song looped' : next === 'shuffle' ? 'Shuffled' : 'Playlist looped';
    repeatBtn.style.color = next !== 'repeat' ? 'var(--accent)' : '';
  });
}

mainAudio.addEventListener("ended", () => {
  const mode = repeatBtn ? (repeatBtn.querySelector('i')?.innerText || 'repeat') : 'repeat';
  if (mode === 'repeat') {
    nextMusic();
  } else if (mode === 'repeat_one') {
    mainAudio.currentTime = 0;
    playMusic();
  } else {
    let rand;
    do { rand = Math.floor(Math.random() * allMusic.length) + 1; }
    while (rand === musicIndex);
    musicIndex = rand;
    loadMusic(musicIndex);
    playMusic();
    playingSong();
  }
});

/* ================================================================
   VOLUME
   ================================================================ */
const volumeRange = document.getElementById('volume-range');
const volumeIcon  = document.getElementById('volume-icon');

function handleVolume() {
  if (!volumeRange) return;
  mainAudio.volume = parseFloat(volumeRange.value);
  const icon = volumeIcon ? volumeIcon.querySelector('i') : null;
  if (!icon) return;
  if (mainAudio.volume === 0)        icon.innerText = "volume_off";
  else if (mainAudio.volume <= 0.5)  icon.innerText = "volume_down";
  else                                icon.innerText = "volume_up";
}

function toggleMute() {
  if (!volumeRange) return;
  if (mainAudio.volume > 0) {
    volumeRange.dataset.volume = mainAudio.volume;
    volumeRange.value = 0;
  } else {
    volumeRange.value = volumeRange.dataset.volume || 1;
  }
  handleVolume();
}

if (volumeRange) volumeRange.addEventListener("input", handleVolume);
if (volumeIcon)  volumeIcon.addEventListener("click", toggleMute);

/* ================================================================
   SEARCH
   ================================================================ */
if (musicSearchInput && ulTag) {
  musicSearchInput.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    ulTag.querySelectorAll("li").forEach(li => {
      const name   = (li.querySelector(".row span")?.innerText || '').toLowerCase();
      const artist = (li.querySelector(".row p")?.innerText   || '').toLowerCase();
      li.style.display = (!q || name.includes(q) || artist.includes(q)) ? "flex" : "none";
    });
  });
}

/* ================================================================
   HIGHLIGHT ACTIVE TRACK
   ================================================================ */
function playingSong() {
  if (!ulTag) return;
  ulTag.querySelectorAll("li").forEach(li => {
    const idx     = parseInt(li.getAttribute("li-index"));
    const isActive = idx === parseInt(musicIndex);
    li.classList.toggle("playing", isActive);

    const durEl = document.getElementById(`song-id-${idx - 1}`);
    if (durEl) {
      if (isActive) {
        durEl.innerText = "Playing";
      } else {
        const saved = durEl.getAttribute("t-duration");
        if (saved) durEl.innerText = saved;
      }
    }
  });

  /* Scroll active track into view smoothly inside its container only */
  const activeEl = ulTag.querySelector("li.playing");
  const trackListContainer = document.getElementById("sp-track-list");
  if (activeEl && trackListContainer) {
    setTimeout(() => {
      const containerRect = trackListContainer.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      if (activeRect.top < containerRect.top) {
        trackListContainer.scrollTo({
          top: activeRect.top - containerRect.top + trackListContainer.scrollTop,
          behavior: 'smooth'
        });
      } else if (activeRect.bottom > containerRect.bottom) {
        trackListContainer.scrollTo({
          top: activeRect.bottom - containerRect.bottom + trackListContainer.scrollTop,
          behavior: 'smooth'
        });
      }
    }, 150);
  }
}

/* ── Initial load ── */
window.addEventListener("load", () => {
  loadMusic(musicIndex);
  playingSong();
});

/* ================================================================
   VISUALIZER — Bar style with rounded tops
   ================================================================ */
function drawVisualizer() {
  if (!analyser || !canvasCtx || !visualizerCanvas) return;
  requestAnimationFrame(drawVisualizer);

  analyser.getByteFrequencyData(dataArray);

  const W = visualizerCanvas.offsetWidth || 300;
  const H = visualizerCanvas.offsetHeight || 48;
  visualizerCanvas.width  = W;
  visualizerCanvas.height = H;

  canvasCtx.clearRect(0, 0, W, H);

  const barCount = Math.min(bufferLength, 60);
  const barW     = Math.max(2, (W / barCount) - 1.5);

  for (let i = 0; i < barCount; i++) {
    const val   = dataArray[i] / 255;
    const barH  = Math.max(2, val * H);
    const alpha = 0.3 + val * 0.7;
    const hue   = 77 + val * 25;

    canvasCtx.fillStyle = `hsla(${hue}, 90%, 58%, ${alpha})`;
    const x = i * (barW + 1.5);
    const y = H - barH;

    /* Draw with rounded top (manual arc if roundRect not supported) */
    if (canvasCtx.roundRect) {
      canvasCtx.beginPath();
      canvasCtx.roundRect(x, y, barW, barH, [2, 2, 0, 0]);
      canvasCtx.fill();
    } else {
      canvasCtx.fillRect(x, y, barW, barH);
    }
  }
}