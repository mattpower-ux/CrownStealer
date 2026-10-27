import test from 'node:test';
import assert from 'node:assert/strict';

const audio = await import('../public/game/audio.js').catch(() => ({}));

function harness() {
  const timers = new Map();
  let nextTimer = 0;
  const contexts = [];
  class Param {
    value = 0;
    setValueAtTime(value) { this.value = value; }
    linearRampToValueAtTime(value) { this.value = value; }
    exponentialRampToValueAtTime(value) { this.value = value; }
    cancelScheduledValues() {}
    setTargetAtTime(value) { this.value = value; }
  }
  class Node {
    gain = new Param(); frequency = new Param(); Q = new Param();
    connections = []; stopped = false; disconnected = false;
    connect(target) { this.connections.push(target); return target; }
    disconnect() { this.disconnected = true; }
    start(time) { this.startedAt = time; }
    stop(time) { this.stopped = true; this.stoppedAt = time; }
  }
  class Context {
    currentTime = 0; state = 'suspended'; sampleRate = 44100;
    destination = new Node(); nodes = []; gains = [];
    constructor() { contexts.push(this); }
    createGain() { const node = new Node(); this.gains.push(node); return node; }
    createOscillator() { const node = new Node(); this.nodes.push(node); return node; }
    createBufferSource() { const node = new Node(); this.nodes.push(node); return node; }
    createBuffer(channels, length) { return { getChannelData: () => new Float32Array(length) }; }
    createBiquadFilter() { return new Node(); }
    async resume() { this.state = 'running'; }
    async suspend() { this.state = 'suspended'; }
    async close() { this.state = 'closed'; }
  }
  const options = { AudioContext: Context,
    setInterval(fn) { const id = ++nextTimer; timers.set(id, fn); return id; },
    clearInterval(id) { timers.delete(id); } };
  return { options, contexts, timers };
}

test('encounter cue uses the supplied decoded sample on the effects bus',async()=>{
 const h=harness();let requested='';const sample={duration:.8};
 h.options.fetch=async url=>{requested=url;return {ok:true,arrayBuffer:async()=>new ArrayBuffer(8)};};
 const director=new audio.AudioDirector(h.options);await director.unlock();director.setScene('battle');
 director.context.decodeAudioData=async()=>sample;
 const before=director.context.nodes.length;await director.effect('encounter');
 const notes=director.context.nodes.slice(before);assert.equal(notes.length,1);
 assert.equal(requested,'/assets/encounter.mp3');assert.equal(notes[0].buffer,sample);
 assert.ok(notes[0].connections[0].connections.includes(director.effects));
 await director.destroy();
});

test('a late encounter decode cannot play after leaving battle',async()=>{
 const h=harness();h.options.fetch=async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(8)});
 const director=new audio.AudioDirector(h.options);await director.unlock();director.setScene('battle');
 let finish;director.context.decodeAudioData=()=>new Promise(resolve=>{finish=resolve;});
 const pending=director.effect('encounter');while(!finish)await Promise.resolve();
 director.setScene('overworld');finish({duration:.8});await pending;
 assert.equal([...director.voices].some(v=>v.encounter),false);await director.destroy();
});

test('original score supplies location-specific playable themes without browser globals', () => {
  assert.equal(typeof audio.AudioDirector, 'function');
  assert.ok(Object.keys(audio.THEMES).length >= 33);
  const melodies = new Set();
  for (const theme of Object.values(audio.THEMES)) {
    assert.ok(theme.bpm >= 50 && theme.bpm <= 180);
    assert.ok(theme.melody.length >= 16);
    assert.ok(theme.melody.every(note => note === null || (Number.isInteger(note) && note >= 36 && note <= 96)));
    melodies.add(JSON.stringify(theme.melody));
  }
  assert.equal(melodies.size, Object.keys(audio.THEMES).length);
});

test('construction and locked calls never allocate an audio context', async () => {
  assert.equal(typeof audio.AudioDirector, 'function');
  const h = harness();
  const director = new audio.AudioDirector(h.options);
  director.setScene('town'); director.effect('click'); director.setVolumes(.2, .6);
  assert.equal(h.contexts.length, 0);
  assert.equal(h.timers.size, 0);
  assert.equal(await director.unlock(), true);
  assert.equal(h.contexts.length, 1);
  assert.ok(h.contexts[0].nodes.length >= 3);
  assert.equal(h.timers.size, 1);
  await director.destroy();
});

test('repeated unlock and scene changes own exactly one scheduler and retire old voices', async () => {
  assert.equal(typeof audio.AudioDirector, 'function');
  const h = harness(); const director = new audio.AudioDirector(h.options);
  await Promise.all([director.unlock(), director.unlock()]);
  const context = h.contexts[0]; const old = [...context.nodes];
  director.setScene('battle'); director.setScene('overworld');
  assert.equal(h.contexts.length, 1);
  assert.equal(h.timers.size, 1);
  assert.ok(old.every(node => node.stopped));
  const before = context.nodes.length;
  context.currentTime = 1;
  for (const tick of h.timers.values()) tick();
  assert.ok(context.nodes.length > before, 'scheduler replenishes voices as audio time advances');
  await director.destroy();
  assert.equal(h.timers.size, 0);
  assert.equal(context.state, 'closed');
  assert.ok(context.nodes.every(node => node.disconnected));
  assert.equal(await director.unlock(), false);
});

test('music and effects route to independent gains with clamped volume values', async () => {
  assert.equal(typeof audio.AudioDirector, 'function');
  const h = harness(); const director = new audio.AudioDirector(h.options);
  director.setVolumes(.2, .7); await director.unlock();
  const context = h.contexts[0];
  assert.equal(context.gains[0].gain.value, .2);
  assert.equal(context.gains[1].gain.value, .7);
  assert.ok(context.nodes.every(node => node.connections[0].connections.includes(context.gains[0])));
  const before = context.nodes.length;
  for (const effect of ['step', 'hit', 'hurt', 'coin', 'door', 'magic', 'click', 'defeat']) director.effect(effect);
  assert.ok(context.nodes.length >= before + 8);
  for (const node of context.nodes.slice(before)) {
    const downstream = node.connections[0];
    assert.ok(downstream.connections.includes(context.gains[1]) || downstream.connections[0].connections.includes(context.gains[1]), 'effect voices route through the effects bus');
    node.onended();
    assert.ok(node.disconnected, 'ended sources release their audio connections');
  }
  director.setVolumes(-2, 5);
  assert.equal(context.gains[0].gain.value, 0);
  assert.equal(context.gains[1].gain.value, 1);
  await director.destroy();
});

test('suspension silences scheduling and effects, then resumes one fresh schedule', async () => {
  assert.equal(typeof audio.AudioDirector, 'function');
  const h = harness(); const director = new audio.AudioDirector(h.options);
  await director.unlock();
  const staleTick = [...h.timers.values()][0];
  await director.suspend();
  assert.equal(h.timers.size, 0);
  const context = h.contexts[0]; const before = context.nodes.length;
  context.currentTime = 10;
  staleTick();
  director.effect('hit'); director.setScene('casino');
  assert.equal(context.nodes.length, before);
  assert.equal(context.state, 'suspended');
  await director.resume(); await director.resume();
  assert.equal(context.state, 'running');
  assert.equal(h.timers.size, 1);
  assert.ok(context.nodes.length > before);
  await director.destroy();
});

test('unsupported audio remains a silent usable game', async () => {
  assert.equal(typeof audio.AudioDirector, 'function');
  const director = new audio.AudioDirector({ AudioContext: null });
  assert.equal(await director.unlock(), false);
  director.setScene('title'); director.effect('click');
  await director.suspend(); await director.resume(); await director.destroy();
});

test('hiding and reopening the tab before the first gesture still allows sound activation', async () => {
  const h = harness(); const director = new audio.AudioDirector(h.options);
  await director.suspend();
  await director.resume();
  assert.equal(h.contexts.length, 0, 'visibility changes must not allocate audio before a gesture');
  assert.equal(h.timers.size, 0);
  await director.unlock();
  assert.equal(h.contexts[0].state, 'running');
  assert.equal(h.timers.size, 1);
  assert.ok(h.contexts[0].nodes.length > 0, 'the gesture starts music after returning to the tab');
  await director.destroy();
});

