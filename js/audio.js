/**
 * LOTUS BOTANICAL ROMANCE - Audio Controller & Music Manager
 * Mendukung pemutaran file musik MP3 eksternal (misal: assets/audio/song.mp3)
 * serta fallback otomatis ke synthesizer harpa romantis jika file MP3 belum dimasukkan.
 * Dilengkapi efek suara fisik (wax seal crack & paper rustle).
 */

class RomanticAudioController {
  constructor() {
    this.audioElement = null;
    this.useAudioElement = false;
    this.audioCtx = null;
    this.isPlaying = false;
    this.tempo = 72; // BPM untuk synthesizer
    this.step = 0;
    this.timerId = null;
    this.masterGain = null;

    // Arpeggio harpa romantis F Major / D minor untuk fallback
    this.chords = [
      [174.61, 261.63, 329.63, 349.23, 440.00, 523.25, 659.25], // Fmaj9
      [164.81, 246.94, 329.63, 392.00, 493.88, 659.25, 783.99], // C/E
      [146.83, 220.00, 293.66, 349.23, 440.00, 587.33, 698.46], // Dm9
      [116.54, 233.08, 293.66, 349.23, 440.00, 466.16, 587.33], // Bbmaj7
      [98.00,  196.00, 293.66, 349.23, 440.00, 587.33, 698.46], // Gm9
      [110.00, 220.00, 261.63, 329.63, 440.00, 523.25, 659.25], // Am7
      [116.54, 233.08, 293.66, 349.23, 440.00, 587.33, 739.99], // Bbmaj9
      [130.81, 196.00, 261.63, 349.23, 392.00, 523.25, 698.46]  // Csus4
    ];

    this.currentChordIdx = 0;

    // Cek elemen audio ketika DOM siap
    document.addEventListener('DOMContentLoaded', () => {
      this.initAudioElement();
    });
  }

  initAudioElement() {
    this.audioElement = document.getElementById('weddingMusic');
    if (this.audioElement) {
      // Event listener jika lagu selesai atau error
      this.audioElement.addEventListener('error', () => {
        console.info('File audio MP3 tidak ditemukan atau belum diset. Beralih ke fallback harpa romantis Web Audio.');
        this.useAudioElement = false;
      });

      this.audioElement.addEventListener('play', () => {
        this.isPlaying = true;
        this.updateUI(true);
      });

      this.audioElement.addEventListener('pause', () => {
        this.isPlaying = false;
        this.updateUI(false);
      });

      // Cek apakah src valid
      const src = this.audioElement.getAttribute('src');
      if (src && src.trim() !== '') {
        this.useAudioElement = true;
      }
    }
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(0.35, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Efek suara: Segel Lilin Terbuka (Wax Seal Crack)
  playSealBreak() {
    this.initContext();
    const t = this.audioCtx.currentTime;
    
    const osc = this.audioCtx.createOscillator();
    const snapGain = this.audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.12);

    snapGain.gain.setValueAtTime(0.6, t);
    snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(snapGain);
    snapGain.connect(this.audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.15);

    const oscClick = this.audioCtx.createOscillator();
    const clickGain = this.audioCtx.createGain();
    oscClick.type = 'sine';
    oscClick.frequency.setValueAtTime(740, t);
    oscClick.frequency.exponentialRampToValueAtTime(180, t + 0.09);

    clickGain.gain.setValueAtTime(0.3, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    oscClick.connect(clickGain);
    clickGain.connect(this.audioCtx.destination);
    oscClick.start(t);
    oscClick.stop(t + 0.1);
  }

  // Efek suara: Gesekan Kertas Undangan (Paper Rustle)
  playPaperRustle() {
    this.initContext();
    const t = this.audioCtx.currentTime;
    const bufferSize = this.audioCtx.sampleRate * 0.45;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.frequency.exponentialRampToValueAtTime(700, t + 0.45);
    filter.Q.value = 1.8;

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
  }

  // Fallback Web Audio: Nada Harpa Akustik
  playHarpTone(freq, time, velocity = 0.5) {
    if (!this.audioCtx) return;

    const osc1 = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, time);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 1.001, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, time);
    filter.frequency.exponentialRampToValueAtTime(600, time + 2.5);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(velocity * 0.28, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 3.2);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 3.3);
    osc2.stop(time + 3.3);
  }

  stepSequence() {
    if (!this.isPlaying || !this.audioCtx) return;

    const chord = this.chords[this.currentChordIdx];
    const now = this.audioCtx.currentTime;

    const noteIdx = this.step % chord.length;
    const freq = chord[noteIdx];
    const velocity = (noteIdx === 0) ? 0.7 : 0.45;

    this.playHarpTone(freq, now, velocity);

    if (this.step % 4 === 0) {
      this.playHarpTone(chord[0] * 0.5, now, 0.4);
    }

    this.step++;
    if (this.step % 8 === 0) {
      this.currentChordIdx = (this.currentChordIdx + 1) % this.chords.length;
    }

    const interval = (60 / this.tempo / 2) * 1000;
    this.timerId = setTimeout(() => this.stepSequence(), interval);
  }

  // Putar Musik (Otomatis mendeteksi file MP3 atau Synthesizer)
  play() {
    // 1. Coba putar file MP3 jika ada
    if (this.audioElement && this.audioElement.getAttribute('src')) {
      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.isPlaying = true;
          this.updateUI(true);
        }).catch(() => {
          // Jika gagal (misal file belum ada atau di-block browser), beralih ke synthesizer
          this.playSynthesizer();
        });
        return;
      }
    }

    // 2. Jika tidak ada file MP3, jalankan synthesizer
    this.playSynthesizer();
  }

  playSynthesizer() {
    this.initContext();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.stepSequence();
    this.updateUI(true);
  }

  // Hentikan / Jeda Musik
  pause() {
    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
    }
    this.isPlaying = false;
    if (this.timerId) clearTimeout(this.timerId);
    this.updateUI(false);
  }

  // Toggle Play / Pause dari tombol mengambang
  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  // Ubah lagu baru lewat Javascript (opsional)
  setMusicSource(url) {
    if (!this.audioElement) {
      this.initAudioElement();
    }
    if (this.audioElement) {
      this.pause();
      this.audioElement.src = url;
      this.audioElement.load();
      this.play();
    }
  }

  updateUI(playing) {
    const btn = document.getElementById('audioToggleBtn');
    if (!btn) return;
    if (playing) {
      btn.classList.add('playing');
      btn.setAttribute('aria-label', 'Pause Music');
    } else {
      btn.classList.remove('playing');
      btn.setAttribute('aria-label', 'Play Music');
    }
  }
}

window.romanticAudio = new RomanticAudioController();
