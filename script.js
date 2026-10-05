// Aura Music Track Catalog
const playlist = [
  { id: 1, title: "8-Bit Pulse Wave", artist: "Synth Engine", duration: 30, freq: 220, icon: "⚡" },
  { id: 2, title: "Ambient Melody", artist: "Audio Context", duration: 30, freq: 330, icon: "🌌" },
  { id: 3, title: "Chill Harmonic", artist: "Web Audio", duration: 30, freq: 440, icon: "🎧" }
];

let currentIndex = 0;
let isPlaying = false;
let currentTime = 0;
let timerInterval = null;

// Built-in Synthesizer Engine
let audioCtx = null;
let oscillator = null;
let gainNode = null;

function initAudioEngine() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioCtx.createGain();
    gainNode.connect(audioCtx.destination);
    gainNode.gain.value = 0.8;
  }
}

function startSynth(frequency) {
  initAudioEngine();
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  stopSynth();
  oscillator = audioCtx.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
  oscillator.connect(gainNode);
  oscillator.start();
}

function stopSynth() {
  if (oscillator) {
    oscillator.stop();
    oscillator.disconnect();
    oscillator = null;
  }
}

// DOM Elements
const playBtn = document.getElementById("play-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const progressBar = document.getElementById("progress-bar");
const volumeBar = document.getElementById("volume-bar");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");
const titleEl = document.getElementById("current-title");
const artistEl = document.getElementById("current-artist");
const coverEl = document.getElementById("current-cover");
const playlistContainer = document.getElementById("playlist-container");

// Render Playlist UI
function renderPlaylist() {
  playlistContainer.innerHTML = "";
  playlist.forEach((track, idx) => {
    const row = document.createElement("div");
    row.className = `track-row ${idx === currentIndex ? "active" : ""}`;
    row.innerHTML = `
      <span>${idx + 1}</span>
      <span class="track-title-cell">${track.title}</span>
      <span>${track.artist}</span>
      <span>0:${track.duration}</span>
    `;
    row.addEventListener("click", () => {
      currentIndex = idx;
      loadTrack(playlist[currentIndex]);
      playTrack();
    });
    playlistContainer.appendChild(row);
  });
}

// Load Selected Track
function loadTrack(track) {
  titleEl.textContent = track.title;
  artistEl.textContent = track.artist;
  coverEl.textContent = track.icon;
  currentTime = 0;
  updateProgressUI();
  renderPlaylist();
}

// Playback Logic
function playTrack() {
  isPlaying = true;
  startSynth(playlist[currentIndex].freq);
  playBtn.innerHTML = `<i class="fa-solid fa-pause"></i>`;
  
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    currentTime++;
    if (currentTime >= playlist[currentIndex].duration) {
      nextTrack();
    } else {
      updateProgressUI();
    }
  }, 1000);
}

function pauseTrack() {
  isPlaying = false;
  stopSynth();
  clearInterval(timerInterval);
  playBtn.innerHTML = `<i class="fa-solid fa-play"></i>`;
}

function nextTrack() {
  currentIndex = (currentIndex + 1) % playlist.length;
  loadTrack(playlist[currentIndex]);
  playTrack();
}

function prevTrack() {
  currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
  loadTrack(playlist[currentIndex]);
  playTrack();
}

function updateProgressUI() {
  const duration = playlist[currentIndex].duration;
  const progress = (currentTime / duration) * 100;
  progressBar.value = progress;
  currentTimeEl.textContent = formatTime(currentTime);
  durationEl.textContent = formatTime(duration);
}

// Event Listeners
playBtn.addEventListener("click", () => {
  isPlaying ? pauseTrack() : playTrack();
});

prevBtn.addEventListener("click", prevTrack);
nextBtn.addEventListener("click", nextTrack);

progressBar.addEventListener("input", (e) => {
  const duration = playlist[currentIndex].duration;
  currentTime = Math.floor((e.target.value / 100) * duration);
  updateProgressUI();
});

volumeBar.addEventListener("input", (e) => {
  if (gainNode) {
    gainNode.gain.value = e.target.value / 100;
  }
});

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// Initialize App
loadTrack(playlist[currentIndex]);