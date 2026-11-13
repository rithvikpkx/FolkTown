# Apple Maps reference capture (WALC)

Screenshots of the macOS Apple Maps app (satellite, 3D mesh) used as reference for the WALC model. The images are needs-clearance, live in `data/raw/apple-maps-walc/` (gitignored, this Mac only) and are never committed. Capture stopped early on the owner's call (12 November 2026): 16 of the 59 planned frames exist.

## How to run

`tools/apple-maps-capture.sh [frames.tsv] [outdir]` with Maps open (one window, labels hidden) and Accessibility plus Screen Recording granted to the terminal. It builds `tools/apple-maps-cam.swift`, walks `tools/apple-maps-walc-frames.tsv`, skips frames already on disk, and writes `<name>.png`, `thumbs/`, `manifest.json` and `contact.jpg`. It uses the mouse, so leave the machine alone while it runs. Only the Maps window is captured (`screencapture -x -o -l <windowID>`).

## Camera control: what works

| Control | Method | Notes |
|---|---|---|
| Centre and zoom | `open "maps://?ll=LAT,LON&spn=S,S&t=k"` | Resets to 2D, north up. `spn` 0.0007 is the closest Maps goes; smaller values and Zoom In are clamped. |
| Heading | Option+drag left/right, real mouse events at the HID tap | 0.25 degrees per point; drag right lowers the heading. Loop until the compass reads the target. |
| Tilt | Option+drag up/down, same events | From 2D: slider = (points up - 51) x 0.0108, clamped at 1.0 after about 150 points. Orbits the screen centre. |
| Read heading | Accessibility: button "Compass", value "Heading: 328 degrees Northwest" | Exact. |
| Read tilt | Accessibility: slider "View Angle", 0..1 (absent in 2D) | Degrees are an estimate: 70 x slider, about +/-8. |
| Window id and bounds | `CGWindowListCopyWindowInfo`, owner "Maps", layer 0 | |

What does not work or should be avoided: mouse events posted to the Maps pid are ignored (they must go through the HID tap with Maps frontmost, so the helper refuses otherwise); Option+arrow keys rotate in about 16 degree steps in one direction only and reset the tilt; setting the View Angle slider through accessibility tilts but moves the view centre forward; Zoom In or Option+Up while tilted moves off the target. Maps sometimes drops behind another app after a `maps://` URL, and its window is then off screen, so the script re-activates it before every frame and retries a frame three times.

Every frame is cropped to remove the toolbar strip (52 pt) and the control column with the account badge (72 pt): crop box x 0, y 104, 3056 x 1794 px in a 3200 x 1898 px window (1600 x 949 pt). The scale bar is not exposed to accessibility; the manifest value is OCR of the bar and is unreliable (100 and 150 ft appear for the same settings).

Known error in the frame list: the along-face offsets assumed a 110 x 76 m footprint. The real one is about 87 x 62 m (OSM, LiDAR), so the +/-44 m frames sit at or past the ends of the long faces (`west-5` shows WALC only at the right edge).

## Coverage (frames on disk)

| Subject | Lowest camera (about 70 deg) | Steeper (about 50 deg) | About 45 deg orbit | High oblique | Top-down |
|---|---|---|---|---|---|
| West glazed face | 5 (heading 90) | 1 | - | - | - |
| East face | 5 (heading 270) | 1 | - | - | - |
| South face | 3 (heading 0) | 1 | - | - | - |
| North face | - | - | - | - | - |
| Whole building, 8 headings | - | - | - | - | - |
| Roof and monitor | - | - | - | - | - |
| Corners, colonnade, east lobe, south bulge | - | - | - | - | - |
| Plaza paving and planters | - | - | - | - | - |

Gaps: the north face, the 8-heading orbit, all roof and top-down frames, the corner and detail frames, and the plaza. The frames per face are near-duplicates, because one frame at the closest zoom already spans about 160 m. At the lowest camera the Bell Tower and plaza trees hide part of the west face and the neighbouring building hides the lower east face. The mesh texture is soft (lettering is barely legible), so the frames show massing, roof form and bay rhythm, not facade detail.

## What the model took from it

`packages/saltline/src/campus/walc.js`: the tile roof is one C shape (a gable over the west bar joins the two hips; this replaced a plant box), and the flat roof is dark grey. Compare with `node tools/saltline-walk-shots.mjs am-top am-west am-sw`. Facades were not changed.
