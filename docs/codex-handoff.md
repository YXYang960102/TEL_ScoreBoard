# TEL_ScoreBoard handoff

## 2026-11-16 — First version: offline scoring panel for the support crew

**User Request (Jeremy):** a separate project: a scoring panel for helpers
on tablets / phones. First half: white / green / yellow / red = 0-3 balls
per box; second half: white / green / red = 0-2. Voice recording to call
out a missed box, distance and ball color, to tune the robot afterwards.
No internet at the venue: teammates download it; keep records. Answers:
both iOS and Android; deliver both as a plain .html and as an installable
(GitHub Pages) offline app; 9 holes + 3 bonus boxes.

**Added:** `index.html` (everything inline, no external resources):
- Score view: match (場次), half (上/下半場), ball color; board Q W E on
  top, then 3 6 9 / 2 5 8 / 1 4 7 (Dashboard numbering); tap +1, long press
  (480 ms) -1, wrap past the max (3 first half, 2 second); colors per half;
  undo; clear; save half (to history; switching half asks to save).
- Miss mode: tap a box -> sheet (box, ball color, distance chips 2.5-6.5
  m, note, optional voice clip) -> a note; ✕ count on the box.
- Big record button: MediaRecorder clip (webm/opus or mp4/aac, whatever
  the browser has) saved as a voice note (time, match, half, color).
- Log view: saved halves (mini grid), notes with audio players, delete.
- Export JSON (halves, notes, clips as data URLs) / CSV (one row per half,
  one per note; UTF-8 BOM for Excel); import JSON (merge by id). iOS uses
  the share sheet (Web Share with files), else a download link.
- Storage: localStorage (tel-scoreboard-v1) + IndexedDB (clips; in-memory
  fallback); warning banner when storage is blocked; storage.persist().
- `manifest.webmanifest`, `sw.js` (cache-first, VERSION tel-scoreboard-1;
  registered only on https), `icon-192.png` / `icon-512.png` (generated).
- README.md (Chinese): delivery A (file: Android / PC; not iOS, mic may be
  blocked) and B (GitHub Pages once, add to home screen, then offline).

**Evidence:** served on localhost:8091 in the browser pane at 375x812:
layout; taps -> counts / colors (1:3 red, 4:2 yellow, wrap to 0, undo);
miss sheet via real clicks -> note + ✕1; save half, second half (2 = red,
wraps after 2), reload keeps data; CSV / JSON export content, JSON import
round trip; recording with a synthetic mic stream -> 46 KB webm clip in
IndexedDB, audio player in the log. Not tried: a real phone, iOS, a real
microphone, offline install from GitHub Pages (no repo / Pages yet).
