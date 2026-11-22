// Tiny WebAudio synth: every sound is generated, no audio files ship.
// A soft blip for loot, a rising two-tone for the alarm, a low thud for
// getting caught, a chime for the getaway. M toggles mute.
export function createAudio() {
  const audio = { ctx: null, muted: false, alarmOsc: null };
  audio.ensure = () => {
    if (!audio.ctx) {
      try {
        audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        audio.ctx = null;
      }
    }
    if (audio.ctx && audio.ctx.state === 'suspended') audio.ctx.resume();
    return audio.ctx;
  };
  audio.tone = (freq, dur, type, gain, when = 0) => {
    const ctx = audio.ensure();
    if (!ctx || audio.muted) return;
    const t = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(gain || 0.08, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  };
  audio.pickup = () => {
    audio.tone(880, 0.12, 'sine', 0.09);
    audio.tone(1318, 0.18, 'sine', 0.07, 0.07);
  };
  audio.diamond = () => {
    audio.tone(523, 0.14, 'triangle', 0.1);
    audio.tone(659, 0.14, 'triangle', 0.1, 0.1);
    audio.tone(784, 0.22, 'triangle', 0.1, 0.2);
    audio.tone(1046, 0.3, 'triangle', 0.09, 0.3);
  };
  audio.spotted = () => {
    audio.tone(196, 0.2, 'square', 0.06);
    audio.tone(147, 0.3, 'square', 0.06, 0.16);
  };
  audio.caught = () => {
    audio.tone(110, 0.4, 'sawtooth', 0.1);
    audio.tone(82, 0.5, 'sawtooth', 0.1, 0.2);
  };
  audio.win = () => {
    [523, 659, 784, 1046].forEach((f, i) => audio.tone(f, 0.25, 'triangle', 0.09, i * 0.12));
  };
  audio.click = () => audio.tone(1200, 0.05, 'square', 0.04);
  audio.toggleMute = () => {
    audio.muted = !audio.muted;
    return audio.muted;
  };
  return audio;
}
