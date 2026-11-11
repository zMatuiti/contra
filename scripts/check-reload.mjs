import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
const b=await chromium.launch({channel:'chrome'});
for(const [name,url] of [['live','https://aurora-skin-player.vercel.app'],['dev','http://127.0.0.1:5173']]){
 const c=await b.newContext({viewport:{width:1280,height:900}});const p=await c.newPage();const s=await c.newCDPSession(p);await s.send('Network.enable');await s.send('Network.setCacheDisabled',{cacheDisabled:true});await s.send('Network.emulateNetworkConditions',{offline:false,latency:300,downloadThroughput:100000,uploadThroughput:100000});await s.send('Emulation.setCPUThrottlingRate',{rate:4});
 await p.addInitScript(()=>{window.bootFrames=[];let n=0;const record=()=>{if(document.body){const sky=document.querySelector('.sky svg')?.getBoundingClientRect();window.bootFrames.push({t:Math.round(performance.now()),root:getComputedStyle(document.documentElement).backgroundColor,body:getComputedStyle(document.body).backgroundColor,svgWidth:sky?.width,svgHeight:sky?.height,player:!!document.querySelector('video')});}if(n++<180)requestAnimationFrame(record)};requestAnimationFrame(record)});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));const bad=[];p.on('response',r=>{if(r.status()>=400)bad.push({url:r.url(),status:r.status()})});
 await p.goto(url,{waitUntil:'commit'});await p.waitForTimeout(700);await p.screenshot({path:`design/implementation/boot-${name}-early.png`,timeout:10000});await p.waitForTimeout(3500);const f=await p.evaluate(()=>window.bootFrames);console.log(name,JSON.stringify({first:f?.slice(0,6),whiteFrames:f?.filter(x=>x.root==='rgba(0, 0, 0, 0)'&&x.body==='rgba(0, 0, 0, 0)').length,errors,bad}));await fs.writeFile(`design/boot-${name}-after.json`,JSON.stringify(f,null,2));await c.close();
}
await b.close();
