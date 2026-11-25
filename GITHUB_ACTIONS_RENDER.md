# Free Cloud Rendering via GitHub Actions

## Quick Start (2 minutes setup)

### 1. Push to GitHub
```bash
cd /Users/aidan/derinkuyu-short
git init
git add .
git commit -m "Derinkuyu short - ready for render"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/derinkuyu-short.git
git push -u origin main
```

### 2. Enable Actions
- Go to your repo on GitHub
- Click **Actions** tab
- Click **"I understand my workflows, go ahead and enable them"**

### 3. Run Render
- Click **"Render Derinkuyu Short (Video Only)"** workflow
- Click **"Run workflow"** (top right)
- Choose frame range: `0-1859` (full) or `0-100` (test)
- Choose quality: `16` (best) or `20` (faster)
- Click **Run workflow**

### 4. Download Result
- Wait 5-15 minutes (shows green check when done)
- Click the workflow run → **Artifacts** → Download `derinkuyu-video-...zip`
- Unzip → `final.mp4` (2K vertical, h264 CRF 16)

---

## Workflow Files Created

| File | Purpose |
|------|---------|
| `.github/workflows/render.yml` | Full pipeline (video + audio mux) |
| `.github/workflows/render-simple.yml` | Video only, manual trigger with options |

**Use `render-simple.yml`** - it's faster and lets you test with small frame ranges first.

---

## Frame Range Options

| Range | Frames | Duration | Est. Time | Use For |
|-------|--------|----------|-----------|---------|
| `0-100` | 101 | 3.4s | ~2 min | Quick test |
| `0-500` | 501 | 16.7s | ~5 min | Medium test |
| `0-1859` | 1860 | 62s | ~12 min | **Full render** |

---

## Quality (CRF) Options

| CRF | Quality | File Size | Render Speed |
|-----|---------|-----------|--------------|
| `16` | Visually lossless | ~80 MB | Baseline |
| `18` | Excellent | ~60 MB | 10% faster |
| `20` | Very good | ~45 MB | 20% faster |
| `23` | Good | ~30 MB | 30% faster |

**Recommendation**: Test with `0-100` @ CRF `20`, then full `0-1859` @ CRF `16`.

---

## Audio Muxing (Local)

The GitHub Action only renders video. Mux audio locally:

```bash
# After downloading final.mp4
cd /Users/aidan/derinkuyu-short
ffmpeg -y -i final.mp4 -i out/derinkuyu/mix.wav \
  -map 0:v:0 -map 1:a:0 \
  -c:v copy -c:a aac -b:a 192k \
  -shortest final_muxed.mp4
```

---

## Troubleshooting

**Render fails with "out of memory"**:
- Reduce concurrency: add `--concurrency 2` to render command
- Or use `runs-on: ubuntu-latest-4-cores` (if available)

**Black frames in output**:
- This was the local macOS issue - GitHub Actions Ubuntu runners have proper GPU/MESA support
- If still black, check Chrome version: `google-chrome --version` in a debug step

**Timeout (60 min limit)**:
- Split into chunks: render `0-929` then `930-1859`
- Or use self-hosted runner with no timeout

**Artifact too large (>2GB)**:
- Use CRF 20+ for smaller files
- Or enable Git LFS for artifacts

---

## Cost: $0

- **Public repos**: Unlimited free minutes
- **Private repos**: 2,000 minutes/month free (this render ~12 min)
- **Self-hosted**: Unlimited free

---

## Next Steps After Render

1. Download `final.mp4` from Actions artifacts
2. Mux with `out/derinkuyu/mix.wav` using ffmpeg (command above)
3. Run QA: `python3 scripts/short_qa.py final_muxed.mp4 out/derinkuyu/mix.wav`
4. Upload to TikTok/Reels/Shorts (9:16, 2K, <60s ideal - this is 62s)

---

## One-Liner for Future Renders

After first push, just go to: `https://github.com/YOUR_USERNAME/derinkuyu-short/actions/workflows/render-simple.yml`

Click **Run workflow** → **Run workflow** → Done.