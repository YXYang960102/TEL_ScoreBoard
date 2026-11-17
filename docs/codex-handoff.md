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

## 2026-11-16 — Published: GitHub repo + Pages

Public repo YXYang960102/TEL_ScoreBoard (created in the browser, Jeremy
signed in himself; `gh` is not installed on this Mac), pushed 52ef577,
Pages from main / root: https://yxyang960102.github.io/TEL_ScoreBoard/ .
Checked there: page renders, the service worker is active, cache
tel-scoreboard-1 holds index.html, manifest and both icons, secure context
(mic available). README carries the URL. Not yet tried: installing it on
a real iPhone / Android and using it with the network off.

## 2026-11-16 — Full boxes stay full; bonus boxes take one ball

**User Request (Jeremy):** tapping a full box wrapped to 0 -- it should
stay full, only a long press takes one off; the bonus boxes can only be
scored once.

**Changed:** `maxBalls(half, hole)`: Q W E -> 1 (both halves), grid 3 / 2.
`changeCount` clamps to 0..max (no wrap); a tap on a full box shows a
toast ("已經滿了（長按 −1）" / "加分框只能進 1 顆"). Legend adds 加分框最多 1
顆. sw.js VERSION tel-scoreboard-2 (installed phones update next time
online). README.

**Evidence:** localhost in the browser pane: 1 tapped 5x -> 3 (stays);
long press -> 2, the click after it ignored; W tapped 3x -> 1 with the
toast; second half: 5 tapped 4x -> 2 (red), E -> 1.

## 2026-11-16 — Fix: installed phones stuck on the old version

**Report (Jeremy):** added to the home screen, online for 5-10 min, still
the old behavior (v1) after v2 was pushed.

**Cause:** sw.js v1/v2 cached with cache.addAll(), which may take the files
from the browser HTTP cache (GitHub Pages max-age=600) -> v2 stored the old
index.html; and the fetch handler was cache-first -> never looked again.

**Changed:** sw.js v3: install fetches every file with cache: "reload";
fetch is network-first (cache: "no-store", 3 s timeout, fresh copies put
in the cache) and falls back to the cache offline / without internet
(navigations to index.html). index.html: register with updateViaCache
"none", call reg.update() on every open, reload once on controllerchange
(not during a recording); version label "v3" next to the title; the
service worker also runs on localhost (testing). README: how to update,
and the export-then-reinstall fallback.

**Evidence:** localhost:8092 in the pane: v3 installed (cache holds the
v3 page); a fake newer version on the server (v3-TEST / cache 3t) showed
on the first reload and replaced the cache; server stopped -> reload still
renders from the cache (12 boxes). Phones on v2 pick up v3 once its sw.js
is fetched (the browser checks sw.js itself without the HTTP cache), then
one more open.

## 2026-11-17 — Total score and lines, from the official rules

**User Request (Jeremy):** add the total score and whether there is a line
(連線), with the scoring from the official rules.

**Source:** teltwrobotcombat.rs-event.com.tw download/2026_rule_1112.pdf
(計分方式說明, first and second half) and download/2026_Nine grid.jpg (Q W E
= the three small red-ring holes above the 3x3 = 指定得分格).

**Changed (index.html v4, sw.js tel-scoreboard-4):** `scoreOf(counts, half,
lit, mult)`: grid 2 per ball capped 3 / 2 per box; the lit box (new 指定得分格
selector Q / W / E, auto-set by the first bonus ball, undo restores it) 4 per
ball with the same cap, unlit bonus boxes 0; lines = all 3 boxes with a
ball, h +2 / v +4 / d +8, each once, second half only (shown in the first
half, not scored); second half round-1 multiplier x1.1 / x1.2 selector.
Score panel under the board (total, parts, lines as tags, lined cells
outlined). Saved halves store lit / mult / score; the log card and the
CSV (指定格, 九宮格分, 指定格分, 連線條數, 連線, 連線分, 加乘, 總得分) use
scoreOf, so old records get scores too (lit unknown: any bonus ball counts).

**Open:** the rules allow 3 (first half) / 2 (second half) balls in the lit
box; the UI still caps a bonus box at 1 ball (Jeremy, 2026-11-16) and the
robot's full auto shoots 1. Scoring already uses the rule cap.

**Evidence:** local browser: second half 1,5,9 -> 18 (the rules' team B
example); full grid + lit 1 -> 74, x1.2 -> 88.8; first half 5x3+4+6+E ->
14, line 4-5-6 shown "not scored"; undo restores the lit box; saved
card shows the score.
