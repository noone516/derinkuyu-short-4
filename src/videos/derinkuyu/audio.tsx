// Audio event table for Derinkuyu short
// Events are synced to word timings from words.ts

export interface AudioEvent {
  time: number; // seconds
  type: "sfx" | "music" | "voice";
  name: string;
  params?: any;
}

export const AUDIO_EVENTS: AudioEvent[] = [
  // Hook flash
  { time: 0.5, type: "sfx", name: "flash", params: { gain: 0.3 } },

  // Surface wind
  { time: 3.5, type: "sfx", name: "wind", params: { gain: 0.4, fadeIn: 1 } },
  { time: 3.5, type: "music", name: "drone_low", params: { gain: 0.2, fadeIn: 2 } },

  // Horn at watchtower
  { time: 12.0, type: "sfx", name: "horn", params: { pitch: 0.8, gain: 0.6 } },
  { time: 12.5, type: "sfx", name: "horn_echo", params: { pitch: 0.6, gain: 0.3 } },

  // Door rolls shut
  { time: 14.5, type: "sfx", name: "stone_grind", params: { gain: 0.8, duration: 2 } },
  { time: 14.5, type: "sfx", name: "thud_heavy", params: { gain: 0.7 } },
  { time: 14.5, type: "sfx", name: "dust_puff", params: { gain: 0.3 } },

  // Footsteps descending
  { time: 17.5, type: "sfx", name: "footsteps_gravel", params: { gain: 0.4, rate: 2 } },
  { time: 18.5, type: "sfx", name: "footsteps_gravel", params: { gain: 0.4, rate: 2 } },

  // Goat bleat
  { time: 18.6, type: "sfx", name: "goat_bleat", params: { pitch: 1.0, gain: 0.5 } },
  { time: 19.2, type: "sfx", name: "goat_bleat", params: { pitch: 1.2, gain: 0.4 } },

  // Chicken cluck
  { time: 19.8, type: "sfx", name: "chicken_cluck", params: { gain: 0.3 } },
  { time: 20.2, type: "sfx", name: "chicken_cluck", params: { gain: 0.3 } },

  // Wine press creak
  { time: 21.0, type: "sfx", name: "wood_creak", params: { gain: 0.4 } },
  { time: 21.5, type: "sfx", name: "liquid_squish", params: { gain: 0.3 } },

  // Deeper - air movement
  { time: 23.5, type: "sfx", name: "air_rush", params: { gain: 0.3, filter: "lowpass" } },

  // Ventilation shaft - wind whistle
  { time: 25.5, type: "sfx", name: "wind_whistle", params: { gain: 0.5, pitch: 1.5 } },
  { time: 26.0, type: "sfx", name: "wind_whistle", params: { gain: 0.4, pitch: 1.3 } },

  // Smoke hit invisible ceiling
  { time: 29.0, type: "sfx", name: "smoke_hiss", params: { gain: 0.3 } },
  { time: 30.0, type: "sfx", name: "air_spread", params: { gain: 0.2 } },

  // Cross-section reveal - musical swell
  { time: 24.0, type: "music", name: "swell_strings", params: { gain: 0.4, fadeIn: 1 } },
  { time: 25.0, type: "music", name: "choir_pad", params: { gain: 0.3, fadeIn: 2 } },

  // Termite analogy - rhythmic tapping
  { time: 27.5, type: "sfx", name: "termite_tap", params: { gain: 0.4, rate: 4 } },
  { time: 28.5, type: "music", name: "marimba_motif", params: { gain: 0.3 } },

  // Doors open
  { time: 31.0, type: "sfx", name: "stone_grind_reverse", params: { gain: 0.6, duration: 1.5 } },
  { time: 31.5, type: "sfx", name: "light_rush", params: { gain: 0.4 } },
  { time: 31.5, type: "music", name: "resolve_chord", params: { gain: 0.5 } },

  // Surface return - birds, wind
  { time: 34.5, type: "sfx", name: "birds_chirp", params: { gain: 0.4 } },
  { time: 35.0, type: "sfx", name: "wind_open", params: { gain: 0.5 } },
  { time: 35.0, type: "music", name: "theme_main", params: { gain: 0.6, fadeIn: 1 } },

  // Modern tourist
  { time: 38.0, type: "sfx", name: "footstep_modern", params: { gain: 0.5 } },
  { time: 38.5, type: "sfx", name: "hand_on_stone", params: { gain: 0.3 } },

  // Final door touch
  { time: 41.5, type: "sfx", name: "stone_touch", params: { gain: 0.4 } },
  { time: 42.0, type: "sfx", name: "cool_air_rush", params: { gain: 0.3 } },

  // Callback - mountain remembers
  { time: 45.0, type: "music", name: "callback_motif", params: { gain: 0.5 } },
  { time: 48.5, type: "music", name: "final_chord", params: { gain: 0.6, fadeIn: 2 } },
  { time: 52.0, type: "sfx", name: "deep_resonance", params: { gain: 0.4, duration: 4 } },
  { time: 58.0, type: "music", name: "fade_out", params: { gain: 0, fadeOut: 4 } },
];

export const SFX_PRESETS: Record<string, any> = {
  flash: { type: "noise", color: "white", duration: 0.1, envelope: "percussive" },
  wind: { type: "noise", color: "brown", duration: 30, envelope: "sustained", filter: { type: "lowpass", freq: 800 } },
  drone_low: { type: "oscillator", wave: "sine", freq: 55, duration: 60, envelope: "sustained" },
  horn: { type: "oscillator", wave: "sawtooth", freq: 220, duration: 1.5, envelope: { attack: 0.1, decay: 0.5, sustain: 0.6, release: 0.5 } },
  horn_echo: { type: "oscillator", wave: "sawtooth", freq: 165, duration: 2, envelope: { attack: 0.2, decay: 1, sustain: 0.3, release: 1 } },
  stone_grind: { type: "noise", color: "pink", duration: 2, envelope: { attack: 0.5, decay: 0, sustain: 1, release: 0.5 }, filter: { type: "bandpass", freq: 400, q: 2 } },
  thud_heavy: { type: "oscillator", wave: "sine", freq: 60, duration: 0.5, envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.2 } },
  dust_puff: { type: "noise", color: "white", duration: 0.3, envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.1 }, filter: { type: "highpass", freq: 2000 } },
  footsteps_gravel: { type: "sample", name: "gravel_step", duration: 0.2 },
  goat_bleat: { type: "oscillator", wave: "square", freq: 440, duration: 0.6, envelope: { attack: 0.05, decay: 0.2, sustain: 0.5, release: 0.2 }, modulation: { type: "vibrato", rate: 5, depth: 0.1 } },
  chicken_cluck: { type: "noise", color: "white", duration: 0.15, envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.05 }, filter: { type: "bandpass", freq: 2000, q: 3 } },
  wood_creak: { type: "oscillator", wave: "triangle", freq: 120, duration: 0.8, envelope: { attack: 0.2, decay: 0.3, sustain: 0.3, release: 0.2 } },
  liquid_squish: { type: "noise", color: "pink", duration: 0.3, envelope: { attack: 0.05, decay: 0.2, sustain: 0, release: 0.1 }, filter: { type: "lowpass", freq: 600 } },
  air_rush: { type: "noise", color: "brown", duration: 2, envelope: { attack: 0.5, decay: 0, sustain: 1, release: 1 }, filter: { type: "lowpass", freq: 300 } },
  wind_whistle: { type: "oscillator", wave: "sine", freq: 800, duration: 1, envelope: { attack: 0.1, decay: 0.3, sustain: 0.5, release: 0.3 }, modulation: { type: "fm", modulator: 10, index: 2 } },
  smoke_hiss: { type: "noise", color: "white", duration: 0.5, envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.2 }, filter: { type: "highpass", freq: 3000 } },
  air_spread: { type: "noise", color: "pink", duration: 1, envelope: { attack: 0.3, decay: 0, sustain: 1, release: 0.5 }, filter: { type: "lowpass", freq: 500 } },
  swell_strings: { type: "oscillator", wave: "sawtooth", freq: 110, duration: 8, envelope: { attack: 2, decay: 0, sustain: 1, release: 2 }, unison: 3, detune: 0.02 },
  choir_pad: { type: "oscillator", wave: "sine", freq: 220, duration: 10, envelope: { attack: 3, decay: 0, sustain: 1, release: 3 }, unison: 5, detune: 0.01 },
  termite_tap: { type: "oscillator", wave: "sine", freq: 1000, duration: 0.05, envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0 }, repeat: { interval: 0.25, count: 20 } },
  marimba_motif: { type: "oscillator", wave: "sine", freq: 523, duration: 0.3, envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.1 }, sequence: [523, 659, 784, 1047] },
  stone_grind_reverse: { type: "noise", color: "pink", duration: 1.5, envelope: { attack: 0.3, decay: 0, sustain: 1, release: 0.5 }, filter: { type: "bandpass", freq: 400, q: 2 }, reverse: true },
  light_rush: { type: "noise", color: "white", duration: 1, envelope: { attack: 0.1, decay: 0, sustain: 0.5, release: 0.5 }, filter: { type: "highpass", freq: 1000 } },
  resolve_chord: { type: "chord", notes: [220, 277, 330, 440], wave: "sine", duration: 3, envelope: { attack: 0.5, decay: 0, sustain: 1, release: 2 } },
  birds_chirp: { type: "sample", name: "bird_chirp", duration: 0.2, randomize: { pitch: 0.2, time: 0.5 } },
  wind_open: { type: "noise", color: "brown", duration: 10, envelope: { attack: 1, decay: 0, sustain: 1, release: 2 }, filter: { type: "lowpass", freq: 600 } },
  theme_main: { type: "melody", notes: [330, 392, 440, 392, 330, 294, 330], rhythm: [0.5, 0.5, 1, 0.5, 0.5, 1, 2], wave: "triangle", envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.3 } },
  footstep_modern: { type: "sample", name: "concrete_step", duration: 0.15 },
  hand_on_stone: { type: "noise", color: "pink", duration: 0.3, envelope: { attack: 0.05, decay: 0.2, sustain: 0, release: 0.1 }, filter: { type: "bandpass", freq: 800, q: 2 } },
  stone_touch: { type: "oscillator", wave: "sine", freq: 200, duration: 0.2, envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 } },
  cool_air_rush: { type: "noise", color: "brown", duration: 1, envelope: { attack: 0.2, decay: 0, sustain: 0.5, release: 0.5 }, filter: { type: "lowpass", freq: 200 } },
  callback_motif: { type: "melody", notes: [440, 392, 330], rhythm: [1, 1, 2], wave: "sine", envelope: { attack: 0.2, decay: 0.1, sustain: 0.6, release: 0.5 } },
  final_chord: { type: "chord", notes: [110, 165, 220, 277, 330], wave: "sine", duration: 8, envelope: { attack: 2, decay: 0, sustain: 1, release: 4 } },
  deep_resonance: { type: "oscillator", wave: "sine", freq: 41, duration: 4, envelope: { attack: 1, decay: 0, sustain: 1, release: 2 }, modulation: { type: "tremolo", rate: 0.5, depth: 0.3 } },
  fade_out: { type: "silence", duration: 4 },
};

export function mixAudio(events: AudioEvent[], presets: Record<string, any>): AudioBuffer {
  // This would be implemented with Web Audio API or offline rendering
  // For now, returns a placeholder
  return null as any;
}