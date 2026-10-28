import {LOCATION_THEMES} from './location-music.js';
// Original Bar the Gates score. MIDI pitches; null marks a breath.
// Soft triangle leads, plucked bass and low-level brushed noise keep long loops restful.
export const THEMES = Object.freeze({
  ...LOCATION_THEMES,
  title: { bpm: 76, melody: [69,null,72,76,74,null,72,69,67,null,64,67,69,72,71,null,69,null,72,76,79,null,76,74,72,71,69,67,64,null,67,null], roots: [45,41,48,43], mood: 'hushed', gain: .8 },
  overworld: { bpm: 104, melody: [67,71,74,null,76,74,71,69,67,null,64,67,69,71,74,null,76,79,78,74,71,null,69,67,64,67,69,71,69,null,67,null], roots: [43,40,48,38], mood: 'walking', gain: .85 },
  town: { bpm: 92, melody: [72,76,79,null,81,79,76,null,74,77,81,79,77,null,74,null,76,79,83,81,79,null,76,72,74,76,77,74,72,null,67,null], roots: [48,41,45,43], mood: 'warm', gain: .75 },
  casino: { bpm: 128, melody: [74,null,77,81,80,81,77,null,76,79,null,82,81,79,76,null,77,81,84,null,83,84,81,77,76,null,73,76,74,69,72,null], roots: [38,43,41,45], mood: 'swing', gain: .75 },
  dungeon: { bpm: 62, melody: [57,null,null,64,60,null,59,null,57,null,56,null,52,null,null,null,60,null,64,null,65,null,64,60,59,null,56,null,57,null,null,null], roots: [33,29,32,33], mood: 'hushed', gain: .65 },
  battle: { bpm: 132, melody: [62,null,69,69,74,null,73,69,67,69,71,null,69,66,62,null,66,69,74,78,76,null,74,73,71,69,67,66,62,null,69,null], roots: [38,43,47,45], mood: 'heroic', third:4, lead:'sawtooth', bass:'triangle', gain: .8 },
  victory: { bpm: 112, melody: [72,null,72,76,79,null,84,null,83,79,76,79,81,null,79,null,77,81,84,86,88,null,84,81,79,76,74,71,72,null,null,null], roots: [48,45,41,43], mood: 'bright', gain: .85 },
});

const hz = midi => 440 * 2 ** ((midi - 69) / 12);
const volume = (value, fallback) => Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : fallback;

export class AudioDirector {
  constructor(options = {}) {
    this.Context = options.AudioContext === undefined ? globalThis.AudioContext || globalThis.webkitAudioContext : options.AudioContext;
    this.MediaAudio = options.Audio === undefined ? globalThis.Audio : options.Audio;
    this.titlePlayer = null;
    this.titleUnavailable = false;
    this.interval = options.setInterval || globalThis.setInterval.bind(globalThis);
    this.clear = options.clearInterval || globalThis.clearInterval.bind(globalThis);
    this.fetch = options.fetch || globalThis.fetch?.bind(globalThis);
    this.encounterReady = null;
    this.encounterGeneration = 0;
    this.scene = 'title';
    this.musicVolume = .45;
    this.effectsVolume = .65;
    this.context = null;
    this.timer = null;
    this.voices = new Set();
    this.paused = false;
    this.destroyed = false;
    this.unlocking = null;
    this.transport = 0;
    this.positions = new Map();
  }

  async unlock() {
    if (this.destroyed || !this.Context) return false;
    if (this.unlocking) return this.unlocking;
    this.unlocking = (async () => {
      try {
        if (!this.context) {
          this.context = new this.Context();
          this.music = this.context.createGain();
          this.effects = this.context.createGain();
          this.music.connect(this.context.destination);
          this.effects.connect(this.context.destination);
          this.setVolumes(this.musicVolume, this.effectsVolume);
          const length = Math.floor(this.context.sampleRate * .2);
          this.noise = this.context.createBuffer(1, length, this.context.sampleRate);
          const data = this.noise.getChannelData(0);
          // Seeded noise means the score is reproducible without recording assets.
          let seed = 7183;
          for (let i = 0; i < data.length; i++) {
            seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
            data[i] = (seed / 4294967296 * 2 - 1) * (1 - i / length);
          }
        }
        if (!this.paused) await this.context.resume();
        if(!this.titlePlayer&&this.MediaAudio){this.titlePlayer=new this.MediaAudio('/assets/title-theme.mp3');this.titlePlayer.loop=true;this.titlePlayer.preload='none';this.titlePlayer.volume=this.musicVolume;this.titlePlayer.onerror=()=>{this.titleUnavailable=true;if(this.scene==='title'&&!this.paused&&!this.destroyed)this.start();};}
        if (this.destroyed) return false;
        if (!this.paused) this.start();
        if(this.context.decodeAudioData) this.loadEncounter();
        return true;
      } catch {
        // Autoplay denial or an unavailable audio device never blocks gameplay.
        return false;
      } finally {
        this.unlocking = null;
      }
    })();
    return this.unlocking;
  }

  setVolumes(music, effects) {
    this.musicVolume = volume(music, this.musicVolume);
    this.effectsVolume = volume(effects, this.effectsVolume);
    if(this.titlePlayer)this.titlePlayer.volume=this.musicVolume;
    if (!this.context || this.destroyed) return;
    const now = this.context.currentTime;
    this.music.gain.setTargetAtTime(this.musicVolume, now, .035);
    this.effects.gain.setTargetAtTime(this.effectsVolume, now, .035);
  }

  setScene(name) {
    if (this.destroyed || !Object.hasOwn(THEMES, name) || name === this.scene) return;
    this.positions.set(this.scene,this.beat||0);
    this.scene = name;
    if(name!=='title')this.titlePlayer?.pause();
    this.encounterGeneration++;
    this.stopSchedule();
    this.retire('music');
    if (this.context && !this.paused && this.context.state === 'running') this.start();
  }

  start() {
    if (this.timer !== null || this.paused || this.destroyed || this.context.state !== 'running') return;
    if(this.scene==='title'&&this.titlePlayer&&!this.titleUnavailable){if(this.titlePlayer.paused)this.titlePlayer.play().catch(()=>{this.titleUnavailable=true;if(this.scene==='title'&&!this.paused&&!this.destroyed)this.start();});return;}
    this.beat = this.positions.get(this.scene)||0;
    this.nextNote = this.context.currentTime + .035;
    this.schedule();
    this.timer = this.interval(() => this.schedule(), 50);
  }

  stopSchedule() {
    if (this.timer !== null) this.clear(this.timer);
    this.timer = null;
  }

  schedule() {
    if (this.paused || this.destroyed || this.context.state !== 'running') return;
    const theme = THEMES[this.scene];
    const step = 30 / theme.bpm;
    // Drop missed notes after a delayed background timer instead of bursting them.
    if (this.nextNote < this.context.currentTime) this.nextNote = this.context.currentTime + .02;
    while (this.nextNote < this.context.currentTime + .18) {
      const i = this.beat % theme.melody.length;
      const root = theme.roots[Math.floor(i / 8) % theme.roots.length];
      const when = this.nextNote;
      const note = theme.melody[i];
      if(theme.ambient){
        // Low unresolved drones, irregular answering notes, and distant metallic whispers.
        const cycle=Math.floor(this.beat/theme.melody.length);
        if(note!==null&&(cycle+i)%5!==3)this.tone(hz(note+(cycle%3===2?-12:0)),when,step*(2.8+i%4*.4),'triangle',.055*theme.gain,'music');
        if(i%16===0){this.tone(hz(root),when,step*15.5,'sine',.1*theme.gain,'music');this.tone(hz(root+7),when+.2,step*11,'sine',.025*theme.gain,'music');}
        if(i%32===21)this.tone(hz(root+25),when,step*5,'sine',.025*theme.gain,'music');
        if(i%23===7)this.brush(when,.18,.018,'music',420+(i%7)*90);
        this.beat++;this.nextNote+=step;continue;
      }
      if (note !== null) this.tone(hz(note), when, step * (theme.noteLength||.86), theme.lead || 'triangle', (theme.lead==='sawtooth'?.035:.085) * theme.gain, 'music');
      if (i % 4 === 0) this.tone(hz(root + (i % 8 === 4 ? 7 : 0)), when, step * 2.5, theme.bass||'triangle', .07 * theme.gain, 'music');
      if (i % 8 === 0) {
        const third = theme.third ?? (['town', 'victory'].includes(this.scene) ? 4 : 3);
        for (const offset of [12, 12 + third, 19]) this.tone(hz(root + offset), when, step * 6.8, 'sine', .022 * theme.gain, 'music');
      }
      if(theme.drone&&i%8===0)this.tone(hz(root-12),when,step*7.8,'sine',.09*theme.gain,'music');
      if(theme.bells&&note!==null&&i%4===0)this.tone(hz(note+12),when,step*1.8,'sine',.035*theme.gain,'music');
      if (theme.drums??(theme.mood !== 'hushed')) {
        if (i % 4 === 0) this.tone(92, when, .10, 'sine', .10, 'music', 38);
        if (i % 4 === 2) this.brush(when, .075, .025, 'music', 1100);
        if (i % 2 === 1) this.brush(when, .028, .012, 'music', 5500);
      } else if (i % 8 === 4) this.brush(when, .14, .008, 'music', 1400);
      this.beat++;
      this.nextNote += step * (theme.mood === 'swing' ? (i % 2 === 0 ? 1.14 : .86) : 1);
    }
  }

  voice(source, envelope, extra, bus, when, duration, amplitude) {
    const gain = envelope.gain;
    gain.setValueAtTime(.0001, when);
    gain.linearRampToValueAtTime(amplitude, when + Math.min(.012, duration / 5));
    gain.exponentialRampToValueAtTime(.0001, when + duration);
    envelope.connect(bus === 'music' ? this.music : this.effects);
    const entry = { source, envelope, extra, bus };
    this.voices.add(entry);
    source.onended = () => this.disconnect(entry);
    source.start(when);
    source.stop(when + duration + .02);
  }

  tone(frequency, when, duration, type, amplitude, bus, endFrequency) {
    const oscillator = this.context.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, when);
    if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, when + duration);
    const envelope = this.context.createGain();
    oscillator.connect(envelope);
    this.voice(oscillator, envelope, null, bus, when, duration, amplitude);
  }

  brush(when, duration, amplitude, bus, cutoff) {
    const source = this.context.createBufferSource();
    source.buffer = this.noise;
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, when);
    const envelope = this.context.createGain();
    source.connect(filter); filter.connect(envelope);
    this.voice(source, envelope, filter, bus, when, duration, amplitude);
  }

  loadEncounter() {
    if(!this.context?.decodeAudioData||!this.fetch)return Promise.resolve(null);
    if(!this.encounterReady)this.encounterReady=this.fetch('/assets/encounter.mp3')
      .then(r=>{if(!r.ok)throw Error('Encounter audio unavailable');return r.arrayBuffer();})
      .then(bytes=>this.context.decodeAudioData(bytes)).catch(()=>null);
    return this.encounterReady;
  }

  async playEncounter() {
    const transport=this.transport,generation=this.encounterGeneration;
    const buffer=await this.loadEncounter();
    if(!buffer||this.scene!=='battle'||generation!==this.encounterGeneration||this.destroyed||this.paused||transport!==this.transport||this.context.state!=='running')return;
    for(const voice of [...this.voices])if(voice.encounter){try{voice.source.stop();}catch{}this.disconnect(voice);}
    const source=this.context.createBufferSource(),envelope=this.context.createGain();
    source.buffer=buffer;envelope.gain.setValueAtTime(.85,this.context.currentTime);
    source.connect(envelope);envelope.connect(this.effects);
    const entry={source,envelope,extra:null,bus:'effects',encounter:true};
    this.voices.add(entry);source.onended=()=>this.disconnect(entry);source.start(this.context.currentTime+.005);
  }

  effect(name) {
    if (!this.context || this.paused || this.destroyed || this.context.state !== 'running') return;
    const now = this.context.currentTime + .005;
    const tone = (frequency, delay, length, amplitude = .14, end, type = 'triangle') =>
      this.tone(frequency, now + delay, length, type, amplitude, 'effects', end);
    switch (name) {
      case 'encounter': return this.playEncounter();
      case 'vomit': for(let i=0;i<7;i++)tone(140+i%2*60,i*.08,.13,.10,45,'sawtooth');this.brush(now+.1,.5,.035,'effects',500);break;
      case 'whinny': tone(420,0,.22,.10,1100,'sawtooth');for(let i=0;i<9;i++)tone(1000-i*60,.2+i*.085,.10,.085,650-i*35,'triangle');this.brush(now+.85,.18,.035,'effects',900);break;
      case 'step': this.brush(now, .055, .07, 'effects', 700); break;
      case 'hit': this.brush(now, .035, .055, 'effects', 3600); tone(1319, .025, .12, .13); tone(2093, .105, .38, .12); tone(2637, .11, .25, .045); break;
      case 'miss': this.brush(now, .15, .09, 'effects', 1600); break;
      case 'block': this.brush(now, .07, .12, 'effects', 4000); tone(880, 0, .18, .13, 420, 'square'); break;
      case 'victory': [60, 64, 67, 72].forEach((note, i) => tone(hz(note), i * .08, .25, .09)); break;
      case 'hurt': tone(210, 0, .21, .16, 70, 'sawtooth'); break;
      case 'applause': for(let i=0;i<42;i++)this.brush(now+i*.047+(i%3)*.009,.055+(i%4)*.012,.045*(1-i/60),'effects',1100+(i%7)*370); [72,76,79,84].forEach((n,i)=>tone(hz(n),i*.09,.35,.055)); break;
      case 'coin': tone(988, 0, .12, .10); tone(1319, .08, .24, .09); break;
      case 'door': this.brush(now, .18, .11, 'effects', 450); tone(110, 0, .20, .12, 55); break;
      case 'magic': [64, 71, 76, 83, 88].forEach((note, i) => tone(hz(note), i * .055, .26, .09)); break;
      case 'click': tone(660, 0, .045, .06, 440); break;
      case 'defeat': [64, 60, 57, 52].forEach((note, i) => tone(hz(note), i * .18, .35, .12)); break;
      default: break;
    }
  }

  disconnect(entry) {
    entry.source.disconnect();
    entry.envelope.disconnect();
    entry.extra?.disconnect();
    this.voices.delete(entry);
  }

  retire(bus) {
    for (const entry of [...this.voices]) {
      if (bus && entry.bus !== bus) continue;
      try { entry.source.stop(); } catch { /* Already ended. */ }
      this.disconnect(entry);
    }
  }

  async suspend() {
    this.positions.set(this.scene,this.beat||0);
    this.paused = true;
    this.titlePlayer?.pause();
    this.transport++;
    this.stopSchedule();
    this.retire();
    if (this.context && !this.destroyed && this.context.state !== 'closed') {
      try { await this.context.suspend(); } catch { /* Device was removed. */ }
    }
  }

  async resume() {
    if (this.destroyed) return false;
    this.paused = false;
    const transport = ++this.transport;
    if (!this.context) return false;
    try {
      await this.context.resume();
      if (transport !== this.transport || this.paused || this.destroyed) return false;
      this.start();
      return true;
    } catch { return false; }
  }

  async destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.titlePlayer?.pause();
    this.transport++;
    this.stopSchedule();
    this.retire();
    this.music?.disconnect();
    this.effects?.disconnect();
    if (this.context && this.context.state !== 'closed') {
      try { await this.context.close(); } catch { /* Already closed externally. */ }
    }
  }
}
