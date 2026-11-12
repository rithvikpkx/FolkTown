// usage: node bench.js <scale> [shot.png]   — runs the scene in headless Chrome on the real GPU, uncapped, and reads the page's own FPS counter
const {spawn}=require('child_process'),fs=require('fs'),path=require('path'),os=require('os');
const dir=__dirname,scale=process.argv[2]||'2',shot=process.argv[3];
const html='<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;height:100%}</style></head><body>'+fs.readFileSync(path.join(dir,'fidelity-test.html'),'utf8')+'</body></html>';
const out=path.join(__dirname,'shots');fs.mkdirSync(out,{recursive:true});const page=path.join(out,'bench.html');fs.writeFileSync(page,html);
const prof=fs.mkdtempSync(path.join(os.tmpdir(),'ftbench-')),port=9300+Math.floor(Math.random()*400);
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--use-angle=metal','--enable-webgl','--ignore-gpu-blocklist','--disable-gpu-vsync','--disable-frame-rate-limit','--hide-scrollbars','--window-size=1440,900','--force-device-scale-factor='+scale,'--remote-debugging-port='+port,'--user-data-dir='+prof,'--no-first-run','file://'+page],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{try{
  let t;for(let i=0;i<40&&!t;i++){await sleep(250);try{t=(await(await fetch('http://127.0.0.1:'+port+'/json')).json()).find(x=>x.type==='page')}catch(e){}}
  const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pend={};
  ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend[d.id]){pend[d.id](d.result);delete pend[d.id]}};
  const send=(method,params)=>new Promise(r=>{pend[++id]=r;ws.send(JSON.stringify({id,method,params}))});
  const ev=async e=>(await send('Runtime.evaluate',{expression:e,returnByValue:true})).result.value;
  for(let i=0;i<60;i++){await sleep(500);if(await ev("!document.getElementById('go').disabled"))break}
  console.log('GPU:',await ev("(()=>{const g=document.createElement('canvas').getContext('webgl');const e=g.getExtension('WEBGL_debug_renderer_info');return e?g.getParameter(e.UNMASKED_RENDERER_WEBGL):'unknown'})()"));
  await ev("document.getElementById('go').click()");
  const key=c=>ev("window.dispatchEvent(new KeyboardEvent('keydown',{code:'"+c+"'}));window.dispatchEvent(new KeyboardEvent('keyup',{code:'"+c+"'}))");
  const label=()=>ev("['res','efx','shd'].map(i=>document.getElementById(i).textContent.replace(/ \\[.\\]/,'')).join(' | ')+' | '+document.getElementById('st3').textContent+' | '+document.getElementById('st2').textContent.split(' · ').slice(1).join(', ')");
  const measure=async()=>{await sleep(1800);let s=[];for(let i=0;i<6;i++){await sleep(520);s.push(+await ev("document.getElementById('fps').textContent"))}s.sort((a,b)=>a-b);return{med:s[3],min:s[0]}};
  const n=await ev("document.getElementById('res').textContent"); // cycle through every resolution, effects on then off
  for(let fx=0;fx<2;fx++){for(let r=0;r<3;r++){const m=await measure();console.log(String(m.med).padStart(4)+' fps (low '+m.min+')  '+await label());await key('KeyR')}await key('KeyP')}
  if(shot){await sleep(600);const png=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,shot),Buffer.from(png.data,'base64'))}
}catch(e){console.log('bench error',e&&e.message)}finally{chrome.kill();setTimeout(()=>{try{fs.rmSync(prof,{recursive:true,force:true})}catch(e){}process.exit(0)},300)}})();
