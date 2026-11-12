# Saltline gameplay findings (non-rendering)

What Saltline does for movement, weapons, enemy AI, HUD, audio and game flow, read from the beautified bundle (`bundle.pretty.js`, 67 091 lines, prettier-3 pass at width 140 of the artifact script; reproducible from https://claude.ai/artifact/BGY1SztrAYcJQHSsnHHGmp). Complements `saltline-findings.md` and `saltline-deep-findings.md` (rendering). Owner has permitted reuse. Line numbers below are in the beautified file.

Saltline is a single-player first-person mission game (cut three relays, reach the boat) plus an endless "Holdout" wave mode. Its enemies are flying drones ("gulls") and four-legged ground robots ("hounds"), not people. So the AI, game flow and poses are ported as ideas, never as models; FolkTown targets stay bots and unnamed military NPCs.

## 1. Where things live (bundle lines)

| System | Lines | Notes |
|---|---|---|
| Module stubs / registry | 28930 | `weapon`, `enemies`, `hud`, `fx`, `audio` all have stub fallbacks (the same idea as FolkTown manifests with fallbacks) |
| Player controller `xE`, tuning table `Nt` | 53695 to 54060 | capsule move, bob, landing spring, recoil kick, shake, FOV |
| Input map | 53181 | Shift sprint, C or Ctrl crouch, R reload, Q swap, 1/2 weapons, gamepad and touch |
| Combat `ey` (player and enemy shots, explosions) | 54064 to 54150 | hitscan, weak point x2.2, explosion falloff |
| Weapon logic `O()` | 62200 to 62330 | fire, cooldown, spread, ADS, reload state machine |
| Rifle, pistol defs | 60195, 61435 | numbers in section 3 |
| Viewmodel motion tables `bh`, reload timeline `ft`/`It` | 56970 to 57100 | spring-driven procedural animation (rendering side, not ported) |
| Enemy director `W5`, tuning `Bi` | 64558, 64520 | perception, attack tokens, rally, alert, pooling |
| Drone AI `XS` | 63380 to 63770 | patrol, investigate, engage, orbit, telegraph, burst |
| Ground AI `jS` | 63800 to 64400 | cover/firing-position scoring, move, aim, telegraph, burst, lunge |
| HUD `sT` | 65040 to 65440 | all elements; CSS in `saltline.html` lines 8 to 190 |
| Menus, settings | 65530 to 65930 | title, paused, signal lost, debrief, settings and controls panes |
| Game director `pT` | 65935 to 66700 | mission, Holdout waves, difficulty presets, spawns |
| Audio engine `cE`/`uE` | 52091 to 53100 | pre-rendered bank, buses, panners, reverb IRs, ducking |
| Audio DSP and recipes | 47347 to 51200 | primitives `it Se xt Gn Xt Wa Fn`, gunshot `r6`, steps, impacts, UI |

## 2. Technique table

"Gap" is Saltline minus FolkTown on the current `mvp`. "Cost" is to port, in one Sonnet work package.

### 2.1 Controller feel

| Technique | Saltline parameters | FolkTown before this work | Gap | Cost | Status |
|---|---|---|---|---|---|
| Ground acceleration | accel 34 m/s2 on input, decel 26 on release; snap to target when within one step | instant velocity | stiff, snappy to a fault | S | Ported (`ACCEL_GROUND`, `DECEL_GROUND`) |
| Air control | accelAir 9 with input, 0.6 drift with none; momentum kept | 30% blend per tick, momentum bled | air strafing felt arcade | S | Ported (`ACCEL_AIR`, `AIR_DRIFT`) |
| Coyote time, jump buffer | 0.12 s, 0.13 s | none | missed jumps at ledges | S | Ported (`COYOTE_TIME`, `JUMP_BUFFER`; new `PlayerState.coyote/jumpBuffer`) |
| Speeds | walk 3.8, sprint 6.4, crouch 1.9, ADS 2.4, back x0.82 | 4.5, 7, 2.2, none, none | back and ADS speeds missing | S | Ported back x0.82 and ADS cap 3.0; kept FolkTown walk/sprint/crouch speeds (owner's tuning call) |
| Sprint rules | needs forward > 0.55, strafe < 0.6, not crouched, not ADS, not firing | forward > 0 | sprint while strafing | S | Ported (not-firing rule left out: needs weapon state in the controller) |
| Gravity, jump | gravity 21, apex 1.0 m (v = 6.5) | 20, apex 1.05 m | none | | Same |
| Head bob | stride-locked: walk 1.55 m, sprint 2.1, crouch 1.05; bobY 0.024, bobX 0.013; sprint x1.9, ADS x0.22, crouch x0.7; amplitude eased at 9/s | none on camera (viewmodel has its own) | no camera life | S | Ported (`game/feel.ts`) |
| Landing dip | spring k150 d17; dip 0.36 per m/s fall, cap 3.2 impulse, clamp -0.2 m; shake above 7.5 m/s | none | | S | Ported |
| Strafe roll | 0.02 rad at sprint speed, x0.4 when ADS, eased at 8/s | none | | S | Ported |
| FOV | base 74, sprint +6 (eased 7/s), ADS 52 (eased 30/s while blending) | HIP_FOV 70, ADS per weapon | sprint kick | S | Ported kick (`ViewModel.fovKick`) |
| Camera shake | trauma 0..1, amplitude trauma^2, decay 1.7/s, pitch 0.03 yaw 0.03 roll 0.045 rad, two sines each; hit adds 0.22 + dmg/70; shot adds 0.12; explosion by distance | none | | S | Ported (`CameraFeel.onEvents`) |
| Health regen | after 4 s without damage, 25 hp/s (hard 5.5 s, 16/s; brutal 7 s, 10/s) | none | big for single-player pacing | S | Not ported: design call (changes time-to-kill); see port list |
| Fall damage | (speed - 13) x 7 above 13 m/s | none | | S | Not ported (campus has stairs and ledges, risky) |
| Death camera | eye sinks to 0.22 m with roll and pitch tween over 0.85 s | fixed low cam | cosmetic | S | Not ported |
| Look | sens scale 0.6 when ADS; pitch limit 1.5 rad | similar | none | | Same |

### 2.2 Weapons

| Technique | Saltline | FolkTown before | Gap | Cost | Status |
|---|---|---|---|---|---|
| Rifle KR-style | 720 rpm, 26 dmg, 30 round mag, 150 reserve, range 300, auto, ADS 0.18 s | 650 rpm, 28 dmg, 30 mag, infinite | numbers differ, not wrong | | Kept FolkTown stats |
| Pistol | 420 rpm, 34 dmg, 15 mag, infinite reserve, range 120, ADS 0.14 s | 360 rpm, 22 dmg, 12 | numbers differ | | Kept |
| Reload times | tactical 2.24 s rifle, empty 2.72 (x1.21); pistol 1.5 and 1.9 | one time per weapon | no empty penalty | S | Ported `reloadTimeEmpty` |
| Spread model | hip 0.0125, ADS 0.0012, move +0.013 hip / +0.004 ADS (x speed/6), air +0.022, crouch -0.002 (hip only), bloom +0.17 per shot decaying 1.5/s, all eased at 18/s | hip/ADS x per-burst growth | no move/air/crouch terms | S | Ported (`shotSpread`, new `WeaponDef` fields) |
| Recoil model | per shot: 35% goes into the player's aim permanently ("keep"), 65% is view kick that recovers after a 0.09 s hold at 6.5/s; yaw is a sine walk plus jitter; shots 1 to 9 full strength, then x0.38; ADS recoil x0.55, crouch x0.85 | pattern list, one decay | no permanent climb | M | Not ported (needs sim recoil to split between aim and kick) |
| Semi-auto feel | trigger press queued for 0.13 s; auto reload 0.28 to 0.32 s after dry fire | press only | missed shots on fast clicking | S | Not ported (needs input queue in sim) |
| Headshot | weak point x2.2 | x2 | | | Kept |
| Hit feedback | hit marker 4 ticks: white 240 ms, weak amber, kill red x1.5 wider 420 ms; `player:hitEnemy` | one marker, red on head | no kill variant | S | Ported (`hitMarkerKind`) |
| Muzzle smoke, shell eject, light flash | heat-based smoke after bursts; shells with bounce sounds; point light 45 lm for 50 ms | flash sprite | | M | Not ported (rendering) |
| Inspect, weapon drop on death | idle 24 s inspect; dropped weapon tumbles with bounce sounds | none | cosmetic | M | Not ported |
| Viewmodel springs | per-weapon spring tables for walk, run, sway, inertia, recoil, land, wall-push | simple bob | richer weapon | L | Not ported (rendering, other agent's area) |

### 2.3 Screen effects and HUD

| Technique | Saltline | FolkTown before | Gap | Cost | Status |
|---|---|---|---|---|---|
| Damage pulse | `pulse = min(1, pulse + 0.35 + dmg/40)`, decays 1.9/s, drives red edge | binary 150 ms flash | | S | Ported (`DamageFx`) |
| Low-health vignette | smoothstep health 55% to 12%, eased at 4/s, added to the pulse in the post shader | none | | S | Ported (CSS vignette; the post-shader uniform is the render agent's) |
| Damage direction arcs | 4 SVG arcs, 1.5 s life, fade last 0.6 s, angle = atan2(src.x - p.x, -(src.z - p.z)) + yaw | none | | S | Ported |
| Crosshair | 4 ticks, gap follows spread (tan(spread)/tan(fov/2) x half height + 4 px, +10 px sprinting), hidden when ADS | static plus | gap does not show spread | S | Not ported (cheap; list item) |
| Health | big number plus 10 segments, red at 3 or fewer, shown only when hurt | bar | | S | Ported (segments, crit) |
| Ammo | 76 px number, `/ reserve`, one pip per round, `Low ammo` at 27% of mag, `R - Reload` blinking when empty, alternate weapon line | text | | S | Ported cue and style (pips not ported) |
| Kill feed | 4 lines, 4.2 s, uppercase 13 px, letter-spacing .18em, bone-dim text with bold name and amber tag (`Weak point`) | 5 lines, plain | | S | Ported (amber `Headshot` tag, fade) |
| Compass tape | 450 deg strip, ticks every 5/15/45, headings, objective markers on the tape and in the world with distance and edge clamp | none (minimap exists) | | M | Not ported |
| Objective panel | typewriter text at 46 chars/s, relay pips, flash on change | none (FFA/TDM) | | S | Not applicable until objectives exist |
| Hold-to-interact prompt | ring fills, key cap, label | none | | S | Not needed yet |
| Radio line | typed at 58 chars/s on a dark plate, queue | none | | S | Not needed yet |
| Warn banner | amber, top 21%, 3.4 s keyframe | `msg` | | S | Same idea |
| Fonts and tokens | Big Shoulders Display (numbers), Barlow Condensed (labels), IBM Plex Mono (readouts); ink #0b0d0f, bone #e8e4da, signal amber #ffb347, rust #d2622a, steel #8d9aa3, alarm #ff5a40, plate rgba(11,13,15,.6), text-shadow 0 0 2px .75 + 0 1px 5px .55 | system-ui | no identity | S | Tokens ported; webfonts not loaded (fallback `Arial Narrow`); load via CSS import if the owner wants the exact look |
| Menus | title (SALTLINE word, deploy), paused, signal lost (dead stats), debrief (time, accuracy, kills, retries, rating), settings pane (quality, sens, invert Y, volume, FOV, difficulty, mode, view) and controls pane; gamepad and touch navigation; settings in `saltline.settings.v1` | start menu, match-over | settings missing | M | Not ported |
| Touch and gamepad | virtual stick, buttons; pad mapping | none | | L | Not ported |

### 2.4 Enemy AI

| Technique | Saltline parameters | FolkTown before | Gap | Cost | Status |
|---|---|---|---|---|---|
| States | patrol, investigate, search, engage (director level) plus per-type attack machine (ground: move, aim, cool, tele, burst, wind, lunge, recover) | patrol, chase, attack, cover | similar | | |
| Perception | sight range 45 m, cone 200 deg (so near-360), LOS check every 0.11 to 0.19 s, close detection 3.5 m; seeT must exceed 0.55 s (patrol) or 0.25 s (alerted) before engaging; lose sight 4 s then search 8 s then patrol | sight by difficulty, LOS every 6 ticks, reaction timer | similar | | |
| Hearing | any `weapon:fire` alerts all enemies within 45 m (throttled 0.3 s); explosions 30 m; investigate for 9 to 13 s | none | bots never heard unseen shots | S | Ported (`BotBrain.hear`, `BOT_PARAMS.hear`) |
| Rally | on first sight, others within 18 m investigate the sighting; on being hit, within 20 m | none | no group reaction | S | Not ported (TDM-only; list item) |
| Exposure aim | `exposure` ramps to 1 at 0.1 to 0.18 per s while seen, decays 0.45/s; spread = lerp(far, near, exposure) (ground 0.12 to 0.045, drone 0.065 to 0.018) | fixed aim error | no "settling in" | S | Ported (`aimErrorScale`: x2.5 fresh to x1) |
| Target speed | spread x (1 + playerSpeed x 0.3 to 0.45) | none | strafing not rewarded | S | Ported (x(1 + 0.08 v)) |
| Attack tokens | at most 2 shooters at once (3 with five or more alive), 1.25 s gap; hard 3 / 4 and 0.85 s; brutal 4 / 5 and 0.6 s | none | all bots can focus one target | S | Ported as a per-target cap by difficulty (`maxShooters` 1/2/3), stateless |
| Telegraph | 0.5 s windup flare plus sound before a burst (drone 0.55 s, lunge 0.28 s) | reaction time only | no readable warning | S | Not ported (client cue plus sim windup; list item) |
| Burst and cooldown | ground: 4 shots 0.11 s apart then cooldown 1.8 to 3.0 s; drone: 3 shots, 1.9 to 3.3 s; lead target 0.2 to 0.85 of flight time | burst/pause by difficulty | | | Similar |
| Firing positions | pick best of cover points (-2 bonus), 7 random navmesh points, 5 points on an arc behind itself; score = path distance x 0.9 + penalties; penalty +22 if no LOS, +14x if same bearing as a squadmate, +16 if within 3 m of one; range band 8 to 18 m; replan after 1 to 2 bursts | cover node when hurt, strafe | no flanking, no spread-out squad | M | Not ported |
| Strafe / orbit | drone orbits at 12 to 25 m, flips direction every 3 to 8 s | strafe 0.7 to 1.8 s | | | Similar |
| Melee | lunge within 3 m: 0.28 s windup, 0.36 s dash at 9.5 m/s, 15 dmg (22 hard, 30 brutal), 3.5 s cooldown | none | | S | Not applicable (no melee in FolkTown) |
| Damaged behaviour | below 50% the drone jitters, smokes and spreads x1.5; hound smokes below 40% | none | | S | Not ported (cosmetic, client) |
| Difficulty presets | Standard / Hard / Brutal scale hp, bolt damage, burst, cooldown, spread, tokens, regen, wave sizes, max alive, pursuit (see 2.5) | easy / normal / hard bot params | similar | | |
| Procedural poses | enemies are rigs of named bones (`Oh` rig builder, line 62748) with spring-driven foot placement (hound legs step to ground targets, stride from speed and yaw rate, `tyaw`/`hyaw` torso and head tracking with rate caps 4.5 and 7 per s), recoil springs (`sP`, `sY`) on shots, death tumble | capsule figures with run bob and lean | humanoid poses are FolkTown-specific | L | Not ported (human rig is a separate job; the springs and caps are reusable: aim-at-target torso tracking at 4.5 rad/s, head at 7 rad/s) |

### 2.5 Game flow

| Technique | Saltline | FolkTown | Gap | Cost | Status |
|---|---|---|---|---|---|
| Modes | Mission (3 relays, extraction) and Holdout (endless waves) | FFA, TDM | no wave mode | M | Not ported; scaling functions below are ready |
| Wave sizes | opening waves {3 drones,1 hound}, {3,2}, {4,3}, then count(n) = min(5 + 2n, 30) with hound share min(0.45, 0.2 + 0.03n); stagger max(0.35, 0.9 - 0.04n) s between spawns; first wave after 3.5 s; 9 s breather; max alive 9 (+ floor(n/2) up to +5) | none | | S | Recorded (to port with the survival mode) |
| Wave scaling | hp x min(2.5, 1 + 0.07 (n-1)); damage x min(2, 1 + 0.05 (n-1)); cooldown x max(0.6, 1 - 0.03 (n-1)) | none | | S | Recorded |
| Between waves | resupply +90 reserve (cap 240), heal 35, bonus score 500 x wave, explosives reset every 2nd wave, 9 s breather | none | | S | Recorded |
| Scoring | kill 100 (drone) / 250 (ground) x (1 + 0.1 (wave-1)); best score in localStorage `saltline.holdout.best`; "NEW" record flag | kills limit | | S | Recorded |
| Spawn choice | candidate spawn scores random(0..1.5) + 2.x if beyond 18 m + 2.5 if out of player LOS, -3 if used in last 6 s; walkable jitter | `Match.spawn`: farthest of top three | similar | | Same idea |
| Spawn direction warning | banner `Wave n - NORTH-EAST` from the mean spawn bearing | none | cheap and good | S | Not ported (list item) |
| Pursuit | after the objective is done, extra enemies join every 7 s (5.5 hard, 4.5 brutal) while fewer than 4 alive, capped | none | | S | Recorded |
| Alert state | `alertT` 10 s after any enemy alert or 8 s after being hit drives music intensity | none | | S | Not ported |
| Retry | quick redeploy keeps retries count, rating uses retries and accuracy | respawn only | | S | Not applicable (death = respawn in FolkTown) |
| Pickups, progression | none (resupply is automatic) | none | | | Nothing to port |

### 2.6 Audio

All sound is synthesised in code, rendered once at boot into AudioBuffers (variants per sound, `n` in the bank table at line 51390), then played through a small mixing graph. That is the model FolkTown now supports as a second backend.

| Item | Saltline | FolkTown | Status |
|---|---|---|---|
| DSP kit | seeded RNG (mulberry32), RBJ biquads (static and swept cutoff), exponential decay envelopes with soft attack, filtered noise bursts, falling-pitch thump, modal resonators `[freq, tau, amp]`, sparse crackle for debris, tanh drive, peak normalise | none | Ported (`audio/synth.ts`) |
| Gunshot | 3 high/low-passed noise bands each with hold plus decay, thump (150 to 62 Hz), blast transient `(1-s)e^-s`, tanh drive, falling low-pass `lpEnd + lpMid e^(-t/tau) + lpTop e^(-t/tau2)`, 230 Hz shelf, level plateau, redrive, then two mechanical clicks and a spring ring; 5 pitch/brightness variants rifle, 4 pistol | CC0 files | Ported (rifle, pistol; shotgun is a derived heavier set, not in Saltline) |
| Footstep | thump 112 to 58 Hz, low-passed noise, mid band, gritty high noise with random gating, 4 variants per surface (concrete, metal ring, water) | CC0 files | Ported (concrete only) |
| Impacts | concrete (low-passed puff, thump, crack, debris crackle), metal (8 inharmonic partials 1, 1.58, 2.24 ..., 640/880/745 Hz sets), wood, glass (9 random shards), enemy hit (4 kHz tick, ringing 2.9/4.7/7.3 kHz, 320 Hz knock, 118 Hz gated rattle) | CC0 files | Ported concrete, dirt (derived), body (from enemy hit) |
| Player sounds | hurt (92 to 38 Hz thump, 320 Hz noise, 820 Hz band, tanh), land (124 to 44 Hz), jump, ear ring after explosions (3150/4013/5310 Hz sine stack) | files | Ported hurt; land, jump, ear ring not ported |
| Dry fire, UI | click partials 2260/3640/5880/8100 Hz; UI click 1820/2730/640 Hz; hover 3200/4800 | files | Ported dry fire and UI click |
| Reload set | magout, maginsert, magin, boltback, bolt, pistol equivalents, holster, draw, gear rustle: each a few clicks and thuds on a timeline matching the animation (`weapon:reload` phase events) | files (single reload sound) | Not ported (about 450 lines of recipes; the phase events need viewmodel timing) |
| Ambience | wind, sea, rain (+interior), thunder, foghorn, gull cries, halyards, rotor and servo loops | wind and birds files | Not ported (wind/birds stay files; rain and sea are excluded by FolkTown rules) |
| Music | 7 stems (drone, strings, pulse, ticks, drums, brass, lift) and one-shots, intensity-driven by alert state, ducked 6 dB on shots | none | Not ported (L; audio plus a mix director) |
| Engine | buses world/near/gun/tail/amb/dry/music into compressor, soft-clip waveshaper, master; voice pools with priority and per-sound caps; panners (HRTF for near, equal-power for far), refDistance per sound; two convolution reverbs with synthesised impulse responses (outdoor, shed) fed by send gains; interior flag crossfades; music duck on shots | master gain, per-sound voice cap, equal-power panner | Not ported (the reverb send and shot ducking are the next cheap wins, M) |

## 3. What was ported on `saltline-gameplay`

| Commit | Where | Tests |
|---|---|---|
| Acceleration controller (ground and air accel, coyote, jump buffer, backward and ADS speed, forward-only sprint) | `packages/shared/src/constants.ts`, `packages/sim/src/controller.ts`, `PlayerState.coyote/jumpBuffer` | `sim.test.ts`: ramp, stop, backward, strafe-sprint, ADS cap, air steering, coyote, buffer |
| Spread model and empty-reload time | `WeaponDef.spreadMove/spreadAir/spreadCrouch/reloadTimeEmpty`, `shotSpread` in `weapons.ts`, `match.ts` | `sim.test.ts`: speed, air, crouch, ADS terms; empty longer than tactical |
| Bot hearing, exposure and target-speed aim error, per-target shooter cap | `packages/sim/src/bots.ts` | `bots.test.ts`: aim scale, heard shot goes to chase, out of range/own/teammate ignored, shooter cap; 32-bot match still passes |
| Camera feel | `packages/client/src/game/feel.ts`, hook in `play.ts` (about 20 lines), `ViewModel.fovKick` | `feel.test.ts` (6) |
| HUD polish | `game/hud-fx.ts`, `game/hud.ts` | `hud-fx.test.ts` (9) |
| Synth audio backend | `audio/synth.ts`, `audio/manifest.ts` (`backend`, `synth`, `pickSource`), `audio/audio.ts`, `public/audio/manifest.json` | `synth.test.ts` (5), `manifest.test.ts` (+2) |

Listen with `?audio=synth` (and `?audio=files` to compare). The manifest default stays `files` until the owner has listened.

## 4. Ranked port list for what is left

Ordered by gain per effort. S = under an hour, M = half a day, L = a day or more.

| # | Item | Why | Cost | Where |
|---|---|---|---|---|
| 1 | Health regen after 4 s (25/s), difficulty-scaled | Single-player pacing; Saltline's biggest feel lever after movement | S, but a design decision (touches time-to-kill) | `sim/match.ts`, `MatchConfig.regen` |
| 2 | Recoil split: 35% permanent aim climb, 65% recovering kick | Recoil that must be fought; makes ADS skill matter | M | sim recoil plus client aim |
| 3 | Dynamic crosshair gap from `shotSpread` | Shows the spread model to the player | S | `game/hud.ts` (needs spread exposed by the sim) |
| 4 | Telegraph for bots (0.4 s windup cue before first burst, plus a sound) | Readable, fairer fights | S | `sim/bots.ts` plus audio |
| 5 | Rally and alert propagation (TDM): first sighting alerts allies within 18 m | Groups react together | S | `sim/bots.ts` |
| 6 | Reload and weapon-handling synth set | Completes the synth backend; the biggest remaining audio gap | M | `audio/synth.ts` |
| 7 | Reverb send and shot ducking in the audio graph | The "this is a place" feel; one synthesised outdoor IR | M | `audio/audio.ts` |
| 8 | Firing-position scoring for bots (cover points, squad spread, LOS, range band) | Flanking and spread-out squads | M | `sim/bots.ts`, needs cover points in zone data |
| 9 | Survival (wave) mode in `packages/sim` using the recorded scaling functions; spawn-bearing banner; resupply/heal between waves; local best score | A single-player mode with a loop | M to L | `sim/match.ts`, menu |
| 10 | Semi-auto press queue (0.13 s) and auto-reload after dry fire | Fewer swallowed shots | S | `sim/match.ts` |
| 11 | Settings pane (sens, invert Y, volume, FOV, quality, difficulty) saved to localStorage | Table stakes | M | `ui/` |
| 12 | Compass tape with objective markers | Useful once objectives exist | M | `ui/` |
| 13 | Land, jump, ear-ring sounds and fall damage | Completes movement | S | audio, sim |
| 14 | Death camera and weapon drop | Cosmetic | S to M | client |
| 15 | Music stems | Atmosphere | L | audio |
| 16 | Touch and gamepad | Reach | L | client input |
| 17 | Viewmodel spring tables | Weapon feel, depends on the render agent's weapon pass | L | `game/weapon.ts` |
| 18 | Humanoid procedural rig with torso/head tracking caps | Better bots | L | `game/figures.ts` |

## 5. Not read or not ported on purpose

- Rain, ocean, gull, skyline, crane and ship builders and the music score recipes were skipped (rendering, rules, or out of scope). The explosives module (barrels, fuse, chain blasts, lines 54150 to 54500) was read but not ported: FolkTown has no explosive props.
- The viewmodel animation tables (`bh`, `ft`, `It`) and the arms rig were read at summary level only; they belong with the render agent's weapon pass.
- Nothing in the bundle was unreadable. The bundle is not in the repo (3.6 MB); the beautified copy lives in the session scratchpad and can be rebuilt from the artifact URL above.
- Numbers not matched on purpose: weapon damage, rpm and magazine sizes (FolkTown's differ and are balanced against its own bots), and walk, sprint and crouch speeds.
