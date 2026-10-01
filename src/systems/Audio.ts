/**
 * Audio 100 % procédural (Web Audio API) : aucun fichier son à charger.
 *   - sfx : déclencheur photo, bêlement, pas, jingle de déblocage, "plop" UI
 *   - ambiance : vent doux
 *   - musique : harpe générative en gamme pentatonique (ambiance zen celtique)
 * iOS/iPadOS : le son ne démarre qu'après un premier geste de l'utilisateur
 * → unlock() est appelé au premier clic / bouton (voir Game.ts).
 */

const PENTA = [0, 2, 4, 7, 9]; // gamme pentatonique majeure (degrés en demi-tons)

export class Audio {
  private ctx: AudioContext | null = null;
  private sfxGain!: GainNode;
  private musicGain!: GainNode;
  private windGain!: GainNode;
  private nextNote = 0;
  private step = 0;
  sfxVolume = 0.8;
  musicVolume = 0.5;

  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AC();
    } catch {
      return;
    }
    const ctx = this.ctx!;
    this.sfxGain = ctx.createGain();
    this.musicGain = ctx.createGain();
    this.windGain = ctx.createGain();
    this.sfxGain.connect(ctx.destination);
    this.musicGain.connect(ctx.destination);
    this.windGain.connect(ctx.destination);
    this.setVolumes(this.sfxVolume, this.musicVolume);
    this.startWind();
  }

  dispose() {
    this.ctx?.close().catch(() => {});
    this.ctx = null;
  }

  setVolumes(sfx: number, music: number) {
    this.sfxVolume = sfx;
    this.musicVolume = music;
    if (!this.ctx) return;
    this.sfxGain.gain.value = sfx;
    this.musicGain.gain.value = music * 0.35;
    this.windGain.gain.value = sfx * 0.05;
  }

  /** À appeler chaque frame : fait avancer la musique générative. */
  update() {
    const ctx = this.ctx;
    if (!ctx || this.musicVolume <= 0) return;
    while (this.nextNote < ctx.currentTime + 0.2) {
      if (this.nextNote < ctx.currentTime) this.nextNote = ctx.currentTime + 0.05;
      this.step++;
      // Une note sur deux en moyenne, phrases de 16 pas
      if (Math.random() < (this.step % 8 === 0 ? 0.95 : 0.45)) {
        const octave = Math.random() < 0.3 ? 12 : 0;
        const deg = PENTA[Math.floor(Math.random() * PENTA.length)];
        this.pluck(220 * Math.pow(2, (deg + octave) / 12), this.nextNote, 0.12);
      }
      if (this.step % 16 === 0) this.pluck(110 * Math.pow(2, PENTA[Math.floor(Math.random() * 3)] / 12), this.nextNote, 0.1, 3);
      this.nextNote += 0.42;
    }
  }

  private pluck(freq: number, t: number, vol: number, decay = 1.6) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o2.type = 'sine';
    o.frequency.value = freq;
    o2.frequency.value = freq * 2.01;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    o.connect(g);
    o2.connect(g);
    g.connect(this.musicGain);
    o.start(t);
    o2.start(t);
    o.stop(t + decay + 0.1);
    o2.stop(t + decay + 0.1);
  }

  private noiseBuffer(seconds: number) {
    const ctx = this.ctx!;
    const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  private startWind() {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer(4);
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 400;
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 250;
    lfo.connect(lfoGain).connect(f.frequency);
    src.connect(f).connect(this.windGain);
    src.start();
    lfo.start();
  }

  shutter() {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    for (const [delay, freq] of [
      [0, 3000],
      [0.07, 1800],
    ]) {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer(0.05);
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.6, t + delay);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.05);
      src.connect(f).connect(g).connect(this.sfxGain);
      src.start(t + delay);
    }
  }

  bleat(pitch = 1) {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(330 * pitch, t);
    o.frequency.linearRampToValueAtTime(300 * pitch, t + 0.5);
    const vib = ctx.createOscillator();
    const vibG = ctx.createGain();
    vib.frequency.value = 18;
    vibG.gain.value = 25 * pitch;
    vib.connect(vibG).connect(o.frequency);
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 900;
    f.Q.value = 2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.35, t + 0.05);
    g.gain.linearRampToValueAtTime(0.25, t + 0.4);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
    o.connect(f).connect(g).connect(this.sfxGain);
    o.start(t);
    vib.start(t);
    o.stop(t + 0.7);
    vib.stop(t + 0.7);
  }

  jingle() {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    [0, 4, 7, 12].forEach((n, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'square';
      o.frequency.value = 523 * Math.pow(2, n / 12);
      g.gain.setValueAtTime(0.0001, t + i * 0.09);
      g.gain.linearRampToValueAtTime(0.12, t + i * 0.09 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.09 + 0.3);
      o.connect(g).connect(this.sfxGain);
      o.start(t + i * 0.09);
      o.stop(t + i * 0.09 + 0.35);
    });
  }

  blip(freq = 880) {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'square';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.06, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    o.connect(g).connect(this.sfxGain);
    o.start(t);
    o.stop(t + 0.08);
  }

  footstep(volume = 0.08) {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer(0.06);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 700;
    const g = ctx.createGain();
    g.gain.setValueAtTime(volume, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    src.connect(f).connect(g).connect(this.sfxGain);
    src.start(t);
  }
}
