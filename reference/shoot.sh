#!/bin/bash
# usage: shoot.sh name "x,y,z,yaw,pitch"   — renders one still of the prototype from a camera position into reference/shots/
cd "$(dirname "$0")" && mkdir -p shots
IFS=, read x y z yaw pitch <<< "$2"
{ printf '<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;height:100%%}#start{display:none!important}</style></head><body>'; sed "s/^var START=.*/var START={x:$x,y:$y,z:$z,yaw:$yaw,pitch:$pitch};/" fidelity-test.html; printf '</body></html>'; } > "shots/$1.html"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --use-angle=metal --enable-webgl --ignore-gpu-blocklist --hide-scrollbars --window-size=1440,900 --virtual-time-budget=12000 --enable-logging=stderr --v=0 --screenshot="$PWD/shots/$1.png" "file://$PWD/shots/$1.html" 2>&1 | grep -E "CONSOLE|shader" | grep -v AudioContext | head -20
ls -la "shots/$1.png" | awk '{print $5" bytes"}'
