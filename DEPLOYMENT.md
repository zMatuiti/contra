# Public deployment — 2026-11-11

- Demo: https://aurora-skin-player.vercel.app
- Public source: https://github.com/zMatuiti/contra
- Hosting project: aurora-skin-player, Vercel; Node.js 24, Vite, npm ci, npm run build, dist.
- Application-code revision: d76dea23a1a463b9f4aaab6c56882bcef80c7ee3 (subsequent documentation-only commits may follow).
- GitHub repository visibility verified PUBLIC, default branch main; Vercel Git integration connected.
- Authentication protection disabled for this project; friendly domain attached to the project so future production deployments can update it.

## Verification performed

Anonymous HTTPS request to the friendly domain: 200 OK. Video range request: 206 Partial Content, Content-Length 1024, Content-Range bytes 0-1023/16353149, video/mp4, Access-Control-Allow-Origin *. No cookie, account, password or bypass token was supplied.

**25/25 Playwright tests passed against the public URL**, in fresh Chrome browser contexts. Tests exercise real MP4 playback, controls, keyboard, seeking, actual captions, fullscreen, ended/replay, delayed load, source error/retry, menu speed, ambient sampling/fallback, reduced motion, compact geometry, emulated touch and axe scans. Some failure/contrast scenarios intercept the media request deliberately; the normal playback scenarios stream the actual public MP4. See design/live-test-results.json.

This is anonymous desktop-browser and emulated-touch validation, not a physical phone test. Safari, Firefox and screen-reader interaction remain unverified. No Mux-owned asset or separate real-site integration has been provided, and neither bonus point is claimed. No Contra entry was submitted by this deployment work.

## Media and safety

Application source is Apache 2.0. Film and photograph retain their separate licenses and attribution in NOTICE and the public credits page. Environment files, private-key extensions, hosting-local state, original source media and dependencies are excluded from Git; the staged source scan found no matching secret patterns. No private credential is needed to run the public demo.

## Updates / rollback

Push to main for the connected Git deployment, or run npm run deploy vercel. Preserve the production project and domain association. To roll back a faulty app revision, promote a known Ready deployment in Vercel or revert the source change and let it build. Recheck anonymous playback and range requests after any source/media adapter change.

## Reload fix

The document now loads styles independently of the Video.js module graph, has a critical dark canvas and bounded background SVG, and shows a static responsive poster/status until the official player initializes. The public-origin suite adds two regression scenarios for delayed scripts and repeated reloads; both passed.
