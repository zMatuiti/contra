import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome'});
const context=await browser.newContext();
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const results=[];
for(const [w,h] of [[320,740],[390,844],[600,900],[768,1024],[844,390],[1024,768],[1440,1000]]){
 await page.setViewportSize({width:w,height:h});await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>document.querySelector('video')?.readyState>=2);
 const data=await page.evaluate(()=>{const box=s=>document.querySelector(s)?.getBoundingClientRect().toJSON();return {pageOverflow:document.documentElement.scrollWidth>innerWidth,player:box('#player'),dock:box('.video-controls-bottom'),center:box('.video-controls-center-play'),font:getComputedStyle(document.querySelector('.atmosphere-heading span')).fontSize};});
 results.push({w,h,...data});
 await page.screenshot({path:`design/implementation/audit-${w}x${h}.png`,fullPage:true});
}
await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>document.querySelector('video')?.readyState>=2);
await page.locator('#player').evaluate(e=>e.style.aspectRatio='16/9');
await page.screenshot({path:'design/implementation/audit-embedded-16x9.png',fullPage:true});
console.log('16:9',await page.evaluate(()=>{const rect=s=>document.querySelector(s).getBoundingClientRect().toJSON();return{player:rect('#player'),dock:rect('.video-controls-bottom'),center:rect('.video-controls-center-play')}}));
if (await page.getByRole('button',{name:'Playback speed',exact:true}).isVisible()) await page.getByRole('button',{name:'Playback speed',exact:true}).click(); else { await page.getByRole('button',{name:'Settings',exact:true}).click(); await page.getByRole('menuitem',{name:/Speed/}).click(); }
console.log('mobile menu',await page.getByRole('menu').boundingBox());
await page.screenshot({path:'design/implementation/audit-narrow-menu.png',fullPage:true});
const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
console.log('menu axe',scan.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})));
await fs.writeFile('design/audit-viewport-results.json',JSON.stringify({results,errors},null,2));
console.log(JSON.stringify({results,errors},null,2));
await browser.close();
