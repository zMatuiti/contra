import { chromium } from '@playwright/test';
const browser=await chromium.launch({channel:'chrome'});const page=await browser.newPage({viewport:{width:1440,height:1000}});await page.goto('http://127.0.0.1:5173');await page.waitForTimeout(700);
console.log(await page.locator('media-time-slider').evaluate(e=>{const b=e.getBoundingClientRect();return {rect:b.toJSON(),style:getComputedStyle(e).cssText,hit:document.elementFromPoint(b.x+b.width/2,b.y+b.height/2)?.outerHTML.slice(0,500),html:e.outerHTML.slice(0,1500)}}));
await page.route('**/media/aurora.mp4',r=>r.fulfill({status:404,body:''}));await page.reload();await page.waitForTimeout(1200);console.log(await page.locator('media-error-dialog').evaluate(e=>e.outerHTML));console.log(await page.locator('video').evaluate(v=>({error:v.error?.message,ready:v.readyState})));
await browser.close();
