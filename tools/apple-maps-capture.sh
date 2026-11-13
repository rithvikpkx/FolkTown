#!/bin/sh
# Capture reference screenshots of WALC from the macOS Apple Maps app (satellite, 3D mesh).
# See docs/apple-maps-capture.md. Output is needs-clearance reference material: it is gitignored, never commit it.
#
#   tools/apple-maps-capture.sh [frames.tsv] [outdir]
#
# Needs: Maps open with one window, labels hidden (View > Hide Labels), Accessibility and Screen Recording
# granted to the terminal, ImageMagick (`magick`) and `jq`. Only the Maps window is ever captured.
# The mouse is used (Option+drag), so leave the machine alone while it runs. Frames already on disk are skipped.
set -eu
HERE=$(cd "$(dirname "$0")" && pwd)
FRAMES=${1:-$HERE/apple-maps-walc-frames.tsv}
OUT=${2:-$HERE/../data/raw/apple-maps-walc}
LAT0=40.427416 LON0=-86.913225  # WALC footprint centre, measured from the top-down view
CAM=${TMPDIR:-/tmp}/apple-maps-cam
TMP=${TMPDIR:-/tmp}/apple-maps-raw.png
if [ ! -x "$CAM" ] || [ "$HERE/apple-maps-cam.swift" -nt "$CAM" ]; then swiftc -O "$HERE/apple-maps-cam.swift" -o "$CAM"; fi
mkdir -p "$OUT/thumbs"

# A maps:// URL or a click elsewhere can leave Maps behind another app, and then its window is off screen.
front() { open -a Maps; sleep 0.8; }

front
"$CAM" resize 40 38 1600 1000  # as large as a 1680x1050 screen allows; put it back by hand afterwards if wanted
sleep 1

# One frame, using the loop variables. Returns 1 if Maps did not end up where it was asked to go
# (a drag that did not register, or Maps pushed behind another app mid-frame); the caller retries.
shoot() {
  ll=$(awk -v n="$north" -v e="$east" -v la="$LAT0" -v lo="$LON0" 'BEGIN { printf "%.6f,%.6f", la + n / 111050, lo + e / 84740 }')
  # 1. centre and zoom: the URL resets the camera to 2D, north up, centred on ll.
  open "maps://?ll=$ll&spn=$spn,$spn&t=k"; sleep 3; front
  # 2. heading, then tilt (in this order: the tilt drag orbits the screen centre and keeps the heading).
  [ "$heading" = 0 ] || "$CAM" rotate "$heading" >/dev/null || return 1
  [ "$tilt" = 0 ] || "$CAM" tilt "$tilt" >/dev/null || return 1
  # 3. wait until the mesh has stopped streaming in: two captures 1.5 s apart must match.
  set -- $("$CAM" win) || return 1
  [ $# -ge 5 ] || return 1
  id=$1 wpt=$4 hpt=$5
  i=0; prev=
  while [ $i -lt 8 ]; do
    sleep 1.5
    screencapture -x -o -l "$id" "$TMP" || return 1
    cur=$(magick "$TMP" -resize 160x -depth 4 gray:- | md5)
    [ "$cur" = "$prev" ] && break
    prev=$cur; i=$((i + 1))
  done
  # 4. read the camera back and check it, crop off the toolbar strip (52 pt) and the control column (72 pt), write the manifest row.
  set -- $("$CAM" state) || return 1
  [ $# -ge 2 ] || return 1
  h=$1 v=$2
  awk -v h="$h" -v want="$heading" -v v="$v" -v t="$tilt" 'BEGIN {
    d = (h - want + 540) % 360 - 180; if (d < -2 || d > 2) exit 1
    if (t == 0) exit (v == "2D" ? 0 : 1)
    if (v == "2D") exit 1
    exit (t >= 1 ? v < 0.99 : (v - t > 0.08 || t - v > 0.08))
  }' || return 1
  W=$(magick identify -format '%w' "$TMP"); H=$(magick identify -format '%h' "$TMP")
  s=$((W / wpt)); cx=0 cy=$((52 * s)) cw=$((W - 72 * s)) ch=$((H - 52 * s))
  scale=$("$CAM" ocr "$TMP" $((W / 2 - 110 * s)) 0 $((250 * s)) $((36 * s)))
  magick "$TMP" -crop "${cw}x${ch}+${cx}+${cy}" +repage -write "$OUT/$name.png" -resize 480x -quality 75 "$OUT/thumbs/$name.jpg"
  rm -f "$TMP"  # the uncropped capture shows the account badge: do not keep it
  jq -cn --arg file "$name.png" --arg group "$group" --arg note "$note" --arg v "$v" --arg scale "$scale" --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --argjson h "$h" --argjson want "$heading" --argjson north "$north" --argjson east "$east" --argjson spn "$spn" \
    --argjson lat "${ll%,*}" --argjson lon "${ll#*,}" --argjson id "$id" --argjson wpt "$wpt" --argjson hpt "$hpt" \
    --argjson W "$W" --argjson H "$H" --argjson cx "$cx" --argjson cy "$cy" --argjson cw "$cw" --argjson ch "$ch" '{
      file: $file, group: $group, note: $note,
      heading_deg: ($h % 360), heading_requested_deg: $want,
      tilt_slider: (if $v == "2D" then 0 else ($v | tonumber) end),
      tilt_deg_est: (if $v == "2D" then 0 else (($v | tonumber) * 70 | round) end),
      zoom: {url_span_deg: $spn, scale_bar_ft: ([$scale | scan("[0-9]+") | tonumber] | max), scale_bar_text: $scale},
      centre_target: {lat: $lat, lon: $lon, north_m: $north, east_m: $east},
      timestamp: $ts, mode: (if $v == "2D" then "satellite 2D" else "satellite 3D" end),
      window: {id: $id, width_pt: $wpt, height_pt: $hpt, width_px: $W, height_px: $H},
      crop_box_px: {x: $cx, y: $cy, width: $cw, height: $ch},
      source: "Apple Maps macOS app", licence: "needs-clearance"}' >> "$OUT/manifest.jsonl"
  echo "$name heading=$h tilt=$v scale=[$scale] settle=$i"
}

while IFS="$(printf '\t')" read -r name group north east heading tilt spn note <&3; do
  case "$name" in ''|\#*) continue ;; esac
  [ -f "$OUT/$name.png" ] && continue
  shoot || shoot || shoot || echo "FAILED $name"
done 3< "$FRAMES"

# manifest.json keeps the last row written for each file that is still on disk
jq -s 'map({key: .file, value: .}) | from_entries | [.[]]' "$OUT/manifest.jsonl" > "$OUT/manifest.json"
magick montage -font /System/Library/Fonts/Helvetica.ttc -pointsize 11 -label '%t' "$OUT"/thumbs/*.jpg -tile 8x -geometry 320x+2+2 -quality 70 "$OUT/contact.jpg"
echo "$(jq length "$OUT/manifest.json") frames in $OUT"
