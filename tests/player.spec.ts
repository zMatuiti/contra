import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

async function ready(page: Page) {
  await page.goto('/');
  await expect.poll(() => page.locator('video').evaluate(v => (v as HTMLVideoElement).readyState)).toBeGreaterThanOrEqual(2);
}
const media = <T>(page: Page, property: string) => page.locator('video').evaluate((v, p) => (v as unknown as Record<string, T>)[p], property);

test('real playback advances, pauses and resumes from official buttons', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await ready(page);
  await page.getByRole('button', { name: 'Play', exact: true }).last().click();
  await expect.poll(() => media<number>(page, 'currentTime')).toBeGreaterThan(.5);
  await page.getByRole('button', { name: 'Pause', exact: true }).last().click();
  expect(await media(page, 'paused')).toBe(true);
  const time = await media<number>(page, 'currentTime');
  await page.waitForTimeout(350);
  expect(await media(page, 'currentTime')).toBe(time);
  await page.getByRole('button', { name: 'Play', exact: true }).first().click();
  await expect.poll(() => media<number>(page, 'currentTime')).toBeGreaterThan(time + .25);
  expect(errors).toEqual([]);
});

test('keyboard play, mute, seek and visible focus', async ({ page }) => {
  await ready(page);
  const play = page.getByRole('button', { name: 'Play', exact: true }).last();
  await play.focus();
  expect(await play.evaluate(e => getComputedStyle(e).outlineStyle)).toBe('solid');
  await page.keyboard.press('Enter');
  await expect.poll(() => media(page, 'paused')).toBe(false);
  await page.keyboard.press('k');
  await expect.poll(() => media(page, 'paused')).toBe(true);
  await page.keyboard.press('m');
  await expect.poll(() => media(page, 'muted')).toBe(true);
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => media<number>(page, 'currentTime')).toBeGreaterThan(4);
  await page.getByRole('slider', { name: 'Seek', exact: true }).focus();
  await page.keyboard.press('End');
  await expect.poll(() => media<number>(page, 'currentTime')).toBeGreaterThan(127);
  await page.keyboard.press('Home');
  await expect.poll(() => media<number>(page, 'currentTime')).toBeLessThan(1);
});

test('skip controls, timeline pointer and volume keyboard operate media', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: 'Seek forward 10 seconds' }).click();
  await expect.poll(() => media<number>(page, 'currentTime')).toBeCloseTo(10, 0);
  await page.getByRole('button', { name: 'Seek backward 10 seconds' }).click();
  await expect.poll(() => media<number>(page, 'currentTime')).toBeLessThan(1);
  const seek = page.locator('media-time-slider');
  const bounds = (await seek.boundingBox())!;
  await seek.click({ position: { x: bounds.width / 2, y: bounds.height / 2 } });
  await expect.poll(() => media<number>(page, 'currentTime')).toBeGreaterThan(55);
  const volume = page.getByRole('slider', { name: 'Volume', exact: true });
  await volume.focus();
  await page.keyboard.press('Home');
  await expect.poll(() => media<number>(page, 'volume')).toBe(0);
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => media<number>(page, 'volume')).toBeGreaterThan(0);
});

test('speed menu is keyboard accessible and changes playback rate', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: 'Playback speed', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menuitemradio', { name: '1.5' })).toBeVisible();
  await page.getByRole('menuitemradio', { name: '1.5' }).focus();
  await page.keyboard.press('Enter');
  await expect.poll(() => media<number>(page, 'playbackRate')).toBe(1.5);
  await expect(page.locator('.aurora-speed-label')).toHaveText('1.5×');
});

test('captions display real VTT cues and settings offers track selection', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: 'Enable captions' }).click();
  await page.getByRole('button', { name: 'Play', exact: true }).last().click();
  await expect.poll(() => page.locator('video').evaluate(v => Array.from((v as HTMLVideoElement).textTracks).some(t => t.mode === 'showing' && (t.activeCues?.length ?? 0) > 0))).toBe(true);
  await page.getByRole('button', { name: 'Pause', exact: true }).last().click();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('menuitem', { name: /Captions/ }).click();
  await expect(page.getByRole('menuitemradio', { name: /Español/ })).toBeVisible();
  await page.getByRole('menuitemradio', { name: /Español/ }).click();
  await expect.poll(() => page.locator('video').evaluate(v => Array.from((v as HTMLVideoElement).textTracks).find(t => t.mode === 'showing')?.language)).toBe('es');
});

test('fullscreen enters and exits with official control', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: 'Enter fullscreen' }).click();
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true);
  await page.getByRole('button', { name: 'Exit fullscreen' }).click();
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(false);
});

test('ended state changes to replay and restarts actual media', async ({ page }) => {
  await ready(page);
  await page.locator('video').evaluate(v => { const video = v as HTMLVideoElement; video.currentTime = video.duration - .3; });
  await page.getByRole('button', { name: 'Play', exact: true }).last().click();
  await expect.poll(() => media(page, 'ended')).toBe(true);
  await expect(page.getByRole('button', { name: /replay|restart/i }).last()).toBeVisible();
  await page.getByRole('button', { name: /replay|restart/i }).last().click();
  await expect.poll(() => media(page, 'ended')).toBe(false);
  expect(await media<number>(page, 'currentTime')).toBeLessThan(2);
});

test('network loading shows buffering and recovers to playback', async ({ page }) => {
  let release!: () => void;
  const hold = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/media/aurora.mp4', async route => { await hold; await route.continue(); });
  await page.goto('/');
  await page.getByRole('button', { name: 'Play', exact: true }).last().click();
  await expect(page.locator('media-buffering-indicator.media-buffering-indicator')).toHaveAttribute('data-visible', '');
  await page.screenshot({ path: 'design/implementation/loading.png' });
  release();
  await expect.poll(() => media<number>(page, 'currentTime')).toBeGreaterThan(.2);
});

test('invalid media presents the official error dialog', async ({ page }) => {
  await page.route('**/media/aurora.mp4', route => route.fulfill({ status: 404, body: '' }));
  await page.goto('/');
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await expect(page.locator('media-dialog-description')).not.toBeEmpty();
  await page.screenshot({ path: 'design/implementation/error.png' });
});

test('Living Aurora samples colors, stops when paused and respects intensity', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: 'Play', exact: true }).last().click();
  await expect(page.locator('#stage')).toHaveAttribute('data-aurora-sampling', 'active');
  await expect.poll(() => page.locator('#stage').evaluate(e => e.style.getPropertyValue('--aurora-left'))).toMatch(/rgb\(/);
  await page.getByRole('button', { name: 'Pause', exact: true }).last().click();
  await expect(page.locator('#stage')).toHaveAttribute('data-aurora-motion', 'false');
  await page.getByRole('button', { name: 'Ambient light', exact: true }).click();
  expect(await page.locator('#stage').evaluate(e => e.style.getPropertyValue('--aurora-opacity'))).toBe('0');
  await page.getByRole('button', { name: 'Focus mode', exact: true }).click();
  await expect(page.locator('body')).toHaveClass(/focus-mode/);
});

test('reduced motion disables animation and frame sampling during playback', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page);
  await page.getByRole('button', { name: 'Play', exact: true }).last().click();
  await expect.poll(() => media<number>(page, 'currentTime')).toBeGreaterThan(.2);
  await expect(page.locator('#stage')).toHaveAttribute('data-aurora-motion', 'false');
  expect(await page.locator('#stage').getAttribute('data-aurora-sampling')).toBeNull();
  expect(await page.locator('#stage').evaluate(e => getComputedStyle(e, '::before').animationName)).toBe('none');
});

test('idle controls hide and keyboard focus restores them', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: 'Play', exact: true }).last().click();
  await page.mouse.click(30, 200);
  await page.mouse.move(20, 180);
  await expect(page.locator('media-controls-content')).not.toHaveAttribute('data-visible', '', { timeout: 10000 });
  await page.locator('media-play-button').last().focus();
  await expect(page.locator('media-controls-content')).toHaveAttribute('data-visible', '');
});

test('desktop accessibility scan and shortcuts dialog keyboard flow', async ({ page }) => {
  await ready(page);
  const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(scan.violations).toEqual([]);
  await page.getByRole('button', { name: 'Keyboard shortcuts' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Keyboard shortcuts' })).toBeFocused();
});

test('mobile touch playback, seeking, target size and no horizontal overflow', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await ready(page);
  await page.getByRole('button', { name: 'Play', exact: true }).last().tap();
  await expect.poll(() => media<number>(page, 'currentTime')).toBeGreaterThan(.2);
  const surface = (await page.locator('media-container').boundingBox())!;
  await page.touchscreen.tap(surface.x + surface.width * .8, surface.y + surface.height * .27);
  await page.waitForTimeout(90);
  await page.touchscreen.tap(surface.x + surface.width * .8, surface.y + surface.height * .27);
  await expect.poll(() => media<number>(page, 'currentTime')).toBeGreaterThan(10);
  const bounds = (await page.locator('media-time-slider').boundingBox())!;
  await page.touchscreen.tap(bounds.x + bounds.width * .5, bounds.y + bounds.height * .5);
  await expect.poll(() => media<number>(page, 'currentTime')).toBeGreaterThan(55);
  await page.getByRole('button', { name: 'Pause', exact: true }).last().tap();
  for (const button of await page.locator('.video-controls-bottom .media-button').all()) {
    if (await button.isVisible()) { const b = (await button.boundingBox())!; expect(b.width).toBeGreaterThanOrEqual(44); expect(b.height).toBeGreaterThanOrEqual(44); }
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(scan.violations).toEqual([]);
  await page.screenshot({ path: 'design/implementation/mobile-tested.png', fullPage: true });
  await context.close();
});

test('Adaptive Glass responds to real bright and dark frames', async ({ page }) => {
  const fixture = await readFile(new URL('./fixtures/contrast.mp4', import.meta.url));
  await page.route('**/media/aurora.mp4', route => route.fulfill({ contentType: 'video/mp4', body: fixture }));
  await ready(page);
  await page.getByRole('button', { name: 'Play', exact: true }).last().click();
  await expect.poll(() => page.locator('#stage').evaluate(e => e.style.getPropertyValue('--aurora-glass-alpha'))).toBe('.94');
  await page.screenshot({ path: 'design/implementation/bright-video.png' });
  await page.locator('video').evaluate(v => { (v as HTMLVideoElement).currentTime = 3.3; });
  await expect.poll(() => page.locator('#stage').evaluate(e => e.style.getPropertyValue('--aurora-glass-alpha'))).toBe('.86');
  await page.locator('media-play-button').last().focus();
  await expect(page.locator('media-controls-content')).toHaveAttribute('data-visible', '');
  await page.screenshot({ path: 'design/implementation/dark-video.png' });
  expect(await page.locator('video').evaluate(v => (v as HTMLVideoElement).webkitAudioDecodedByteCount)).toBeGreaterThan(0);
});

test('ambient canvas security fallback preserves real playback', async ({ page }) => {
  await page.addInitScript(() => {
    CanvasRenderingContext2D.prototype.getImageData = () => { throw new DOMException('Test: tainted canvas', 'SecurityError'); };
  });
  await ready(page);
  await page.getByRole('button', { name: 'Play', exact: true }).last().click();
  await expect(page.locator('#stage')).toHaveAttribute('data-aurora-sampling', 'fallback');
  await expect.poll(() => media<number>(page, 'currentTime')).toBeGreaterThan(.5);
});

test('presets change intensity and manual intensity remains keyboard accessible', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: 'Vivid', exact: true }).click();
  await expect(page.getByLabel('Intensity', { exact: true })).toHaveValue('90');
  await expect(page.getByRole('button', { name: 'Vivid', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByLabel('Intensity', { exact: true }).focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByLabel('Intensity', { exact: true })).toHaveValue('85');
  await expect(page.locator('#intensity-value')).toHaveText('85%');
});

test('320px layout, workbench, standalone preview and credits load', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await ready(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/workbench.html');
  await expect(page.locator('iframe')).toBeVisible();
  await page.goto('/preview.html');
  await expect(page.locator('.video-controls-start media-play-button')).toBeVisible();
  await page.goto('/credits.html');
  await expect(page.getByRole('heading', { name: 'Behind the light.' })).toBeVisible();
});

test('public theme tokens change the actual player surface and timeline', async ({ page }) => {
  await ready(page);
  await page.locator('video-player').evaluate(e => {
    (e as HTMLElement).style.setProperty('--media-accent-color', '#f08a60');
    (e as HTMLElement).style.setProperty('--media-border-radius', '12px');
  });
  expect(await page.locator('media-container').evaluate(e => getComputedStyle(e).borderTopLeftRadius)).toBe('12px');
  expect(await page.locator('.media-time-slider-fill').first().evaluate(e => getComputedStyle(e).backgroundImage)).toContain('240, 138, 96');
});

test('ambient presets change the rendered halo and off removes both layers', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: 'Subtle', exact: true }).click();
  await expect(page.locator('#preset-description')).toContainText('quiet edge');
  await expect.poll(() => page.locator('#stage').evaluate(e => Number(getComputedStyle(e, '::before').opacity))).toBeCloseTo(.205, 2);
  const subtle = await page.locator('#stage').evaluate(e => parseFloat(getComputedStyle(e, '::before').top));
  await page.getByRole('button', { name: 'Vivid', exact: true }).click();
  await expect(page.locator('#preset-description')).toContainText('wide wash');
  await expect.poll(() => page.locator('#stage').evaluate(e => Number(getComputedStyle(e, '::before').opacity))).toBeCloseTo(.738, 2);
  const vivid = await page.locator('#stage').evaluate(e => parseFloat(getComputedStyle(e, '::before').top));
  expect(vivid).toBeLessThan(subtle);
  await page.screenshot({ path: 'design/implementation/ambient-vivid.png', fullPage: true });
  await page.getByRole('button', { name: 'Ambient light', exact: true }).click();
  await expect(page.locator('#preset-description')).toHaveText('Ambient light is off.');
  for (const pseudo of ['::before','::after']) {
    await expect.poll(() => page.locator('#stage').evaluate((e,p) => Number(getComputedStyle(e,p).opacity), pseudo)).toBe(0);
  }
});

test('speed menu offers 1.75x and 2x with a synchronized value in raw skin preview', async ({ page }) => {
  await page.goto('/preview.html');
  await expect.poll(() => media<number>(page, 'readyState')).toBeGreaterThanOrEqual(2);
  await page.getByRole('button', { name: 'Playback speed', exact: true }).click();
  await expect(page.getByRole('menuitemradio', { name: '1.75×', exact: true })).toHaveCount(1);
  await page.getByRole('menuitemradio', { name: '2×', exact: true }).click();
  await expect.poll(() => media<number>(page, 'playbackRate')).toBe(2);
  await expect(page.locator('.aurora-speed-label')).toHaveText('2×');
  await page.getByRole('button', { name: 'Playback speed', exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('menuitemradio', { name: /1×.*Normal/ }).click();
  await expect(page.locator('.aurora-speed-label')).toHaveText('1.0×');
});

test('compact skin stays inside 320–768px frames without center/dock collisions', async ({ page }) => {
  for (const width of [320,390,600,768]) {
    await page.setViewportSize({width,height:900});
    await ready(page);
    for (const ratio of ['1/1','16/9']) {
      await page.locator('#player').evaluate((e,r) => { (e as HTMLElement).style.aspectRatio = r; }, ratio);
      await page.waitForTimeout(100);
      const geometry = await page.locator('media-container').evaluate(root => {
        const frame = root.getBoundingClientRect();
        const dock = root.querySelector('.video-controls-bottom')!.getBoundingClientRect();
        const center = root.querySelector('.video-controls-center')!.getBoundingClientRect();
        const buttons = [...root.querySelectorAll('.video-controls-bottom .media-button')].filter(e => e.getBoundingClientRect().width > 0).map(e => { const b=e.getBoundingClientRect(); return b.left >= frame.left && b.right <= frame.right; });
        return {clear:center.height === 0 || center.bottom + 4 <= dock.top,contained:dock.left>=frame.left && dock.right<=frame.right,buttons};
      });
      expect(geometry.clear, `${width}px ${ratio}: center intersects dock`).toBe(true);
      expect(geometry.contained).toBe(true);
      expect(geometry.buttons.every(Boolean)).toBe(true);
    }
  }
});

test('compact settings keeps speed accessible and retry recovers a real failed source', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await ready(page);
  await page.getByRole('button',{name:'Settings',exact:true}).click();
  await page.getByRole('menuitem',{name:/Speed/}).click();
  await page.getByRole('menuitemradio',{name:'1.5×',exact:true}).click();
  await expect.poll(() => media<number>(page,'playbackRate')).toBe(1.5);
  let fail = true;
  await page.route('**/media/aurora.mp4',route => fail ? route.fulfill({status:404,body:''}) : route.continue());
  await page.reload();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await expect(page.getByRole('alertdialog')).toContainText('The video could not be loaded.');
  fail = false;
  await page.getByRole('button',{name:'Try again',exact:true}).click();
  await expect.poll(() => media<number>(page,'currentTime')).toBeGreaterThan(.2);
  await expect(page.getByRole('alertdialog')).not.toBeVisible();
});
