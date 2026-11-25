# Derinkuyu Short - Audio Cues

## Voice
- Source: `../voice/voice.wav` (Coqui TTS, ~62s)
- Word timings: `../voice/words.json` (249 words, ~4 wps)
- Level: 0 dB (reference)

## Music Stems (pre-rendered)
| Stem | Duration | Description |
|------|----------|-------------|
| drone_low.wav | 65s | Sub-bass A1, sustained |
| swell_strings.wav | 10s | Slow attack string pad |
| choir_pad.wav | 12s | Ethereal choir |
| marimba_motif.wav | 1.5s | Termite analogy motif |
| resolve_chord.wav | 3s | Major resolution chord |
| theme_main.wav | 20s | Main melodic theme |
| callback_motif.wav | 4s | Ending callback |
| final_chord.wav | 10s | Final sustained chord |

## SFX Events (procedural)
| Time | Event | Params |
|------|-------|--------|
| 3.95 | flash | gain 0.3 |
| 3.95 | wind | gain 0.4, fadeIn 1 |
| 3.95 | drone_low | gain 0.2, fadeIn 2 |
| 12.0 | horn | pitch 0.8, gain 0.6 |
| 12.5 | horn_echo | pitch 0.6, gain 0.3 |
| 14.8 | stone_grind | gain 0.8, dur 2 |
| 14.8 | thud_heavy | gain 0.7 |
| 14.8 | dust_puff | gain 0.3 |
| 17.8 | footsteps_gravel | gain 0.4, rate 2 |
| 18.8 | footsteps_gravel | gain 0.4, rate 2 |
| 18.8 | goat_bleat | pitch 1.0, gain 0.5 |
| 19.4 | goat_bleat | pitch 1.2, gain 0.4 |
| 20.0 | chicken_cluck | gain 0.3 |
| 20.4 | chicken_cluck | gain 0.3 |
| 21.2 | wood_creak | gain 0.4 |
| 21.7 | liquid_squish | gain 0.3 |
| 25.0 | wind_whistle | gain 0.5, pitch 1.5 |
| 25.5 | wind_whistle | gain 0.4, pitch 1.3 |
| 29.1 | smoke_hiss | gain 0.3 |
| 30.1 | air_spread | gain 0.2 |
| 35.0 | swell_strings | gain 0.4, fadeIn 1 |
| 36.0 | choir_pad | gain 0.3, fadeIn 2 |
| 32.5 | termite_tap | gain 0.4, rate 4 |
| 33.5 | marimba_motif | gain 0.3 |
| 42.0 | stone_grind_reverse | gain 0.6, dur 1.5 |
| 42.5 | light_rush | gain 0.4 |
| 42.5 | resolve_chord | gain 0.5 |
| 45.5 | birds_chirp | gain 0.4 |
| 46.0 | wind_open | gain 0.5 |
| 46.0 | theme_main | gain 0.6, fadeIn 1 |
| 49.5 | footstep_modern | gain 0.5 |
| 50.0 | hand_on_stone | gain 0.3 |
| 53.5 | stone_touch | gain 0.4 |
| 54.0 | cool_air_rush | gain 0.3 |
| 57.0 | callback_motif | gain 0.5 |
| 60.5 | final_chord | gain 0.6, fadeIn 2 |
| 64.0 | deep_resonance | gain 0.4, dur 4 |
| 70.0 | fade_out | gain 0, fadeOut 4 |

## Mix Levels
- Music: +3 dB
- SFX: -6 dB
- Voice: 0 dB (reference)

## Output
- Final mix: `../out/derinkuyu/mix.wav` (48kHz, 62s)
- Stems: `voice_stem.wav`, `music_stem.wav`, `sfx_stem.wav`

## QA Checklist
- [ ] No clipping (peak < 0 dBFS)
- [ ] Loudness: -14 LUFS target (YouTube)
- [ ] Voice intelligibility throughout
- [ ] Sync: SFX land 0-3 frames before word
- [ ] No pops/clicks at edit points
- [ ] Fade in/out smooth