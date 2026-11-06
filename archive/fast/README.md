# June's Cloud — fast version

A faster remake of https://junebee66.github.io/June-Cloud-Gallery/archive/final/index.html.
It looks and behaves the same: the same 3D graph, layout tabs, rotate switch, info panel, category thumbnail strips and scribble cursor.

## Why the original was slow

`script-patched-with-type-descriptions.js` called `preloadImages()` on all 86 project GIFs, at full size from Wix, **before drawing anything**. Those files add up to **~866 MB**, and some are 24 MB each. Wix won't resize GIFs. The browser then downloaded many of them again for the textures, so a cold load measured **~1,040 MB**. After that the loader stayed up for a fixed 5 more seconds.

Smaller issues:
- `3d-force-image.js` was an unminified 1.9 MB bundle.
- On top of it, `three`, `three-spritetext` and `dat.gui` came unpinned from esm.sh. That meant a second copy of three.js, two unused libraries, and an import that tracks "latest" and could break at any time.

## What changed

| | Before (live) | After (this folder) |
|---|---|---|
| Downloaded before the graph appears | ~1,040 MB (113 Wix image requests) | ~1.4 MB (≈ 440 KB gzipped code/data + 0.93 MB thumbnails) |
| Requests | ~114 | ~96 (85 are 5–20 KB thumbnails) |
| Graph visible | ~40 s on a very fast connection (minutes on normal broadband) | under 1 s on localhost; ~1–2 s on typical broadband |
| Loader hidden | graph + fixed 5 s (~45 s) | once the thumbnails are in, at least 2.2 s so the logo animation completes, never more than 6 s |

- **3D sprites** use `media/thumb/<id>.webp`: a static first frame, max 384 px, ~11 KB each. Three.js textures only ever showed a GIF's first frame anyway, so the graph looks the same.
- **Info panel** first shows the thumbnail, then swaps in `media/anim/<id>.webp`, an animated WebP (max 480 px, avg ~600 KB). This file is **loaded only when you hover or click that project**. If it fails, the panel falls back to the original Wix GIF.
- **Category thumbnail strips** use the thumbnails with `loading="lazy"`.
- **JS**: `vendor.min.js` is one self-hosted, minified ES module containing three r187 and 3d-force-graph 1.76.0 (~399 KB gzipped). It loads as a deferred module with `modulepreload`, and nothing depends on esm.sh at runtime.
- **Data**: `projects.json` is `allProjects_converted.json` with each item's media key added.
- **Small fixes**:
  - The canvas now follows window resizes.
  - `toggleRotationCheckbox` and `animateSpan` were undefined in the Self/Stop Rotate span handlers; they are now defined.
  - The page background is pinned to white.

## Files

`index.html`, `script.js` (the original script with targeted edits, each one commented), `image-node.css` and `cursor.js` (both unchanged), `vendor.min.js`, `projects.json`, `type-node-description.json`, `media/thumb/` (85 files, 0.9 MB), `media/anim/` (85 files, 53 MB).

The media was made from the original Wix files with Pillow. To redo it after adding projects, regenerate a thumb and an anim for each new item's Wix id (the `565ac9_…` part of the `gif` field). Items that have no local file fall back to the Wix original automatically.

## Run locally

```bash
cd june-cloud-gallery-fast && python3 -m http.server 8000
```
Then open http://localhost:8000.

## Publishing to GitHub Pages (not done — needs your OK)

Option A: publish next to the old version as `archive/fast/`, so both stay online:

```bash
git clone https://github.com/junebee66/June-Cloud-Gallery.git && cd June-Cloud-Gallery
mkdir -p archive/fast && cp -R /path/to/june-cloud-gallery-fast/. archive/fast/
git add archive/fast && git commit -m "Add fast version of the cloud gallery" && git push
```
→ https://junebee66.github.io/June-Cloud-Gallery/archive/fast/

Option B: replace `archive/final/` so the existing URL gets fast. Copy these files over the old ones (`index.html`, `script.js`, `vendor.min.js`, `projects.json`, `type-node-description.json`, `media/`). The old `3d-force-image.js` and `script-patched-with-type-descriptions.js` can stay; the new `index.html` no longer loads them.

GitHub Pages gzips the JS/JSON automatically. The 53 MB of `media/anim/` stays well inside GitHub's limits: the largest file is 1.8 MB.
