# Saltline source, for porting

Parts of Saltline's source that FolkTown builds on, cut from its published bundle on 12 November 2026:
https://claude.ai/artifact/BGY1SztrAYcJQHSsnHHGmp

Saltline belongs to its author. Its owner has given permission to reuse it in FolkTown (as stated by Rithvik, 12 November 2026).

The JavaScript is minified; the shader text inside it is intact and commented. Port from these files into `packages/client`; do not import them.

| File | Contents |
|---|---|
| `sky-shadows-post.txt` | The noise texture, the sky shader, the contact-hardening shadow filter, all post-processing passes, the function that wires the passes together with its tuning values, and the renderer setup (weapon camera, pixel budget, dynamic scale, start-up self test) |
| `materials.txt` | The shared noise and paint-damage functions and the 27 surface shaders that generate material textures on the GPU |

Not taken yet, still in the bundle: close-up material detail, the ground and water shaders, weapon and arm shaders, and all gameplay code. Pull them from the link above when a work package needs them.

`docs/saltline-findings.md` explains how the frame is built.

Second pass (`docs/saltline-deep-findings.md`) added: `material-system.txt`, `ground-wet-shader.txt`, `geometry-kit.txt`, `container-builder.txt`, `prop-kit-examples.txt`, `weapon-surface-shader.txt`, `arm-glove-shader.txt`. Their code is prettier-formatted with minified identifiers.
