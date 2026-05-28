// ─────────────────────────────────────────────────────────────────────────
// Echo — mock data + helpers.  Studio-control-room palette lives here too.
// ─────────────────────────────────────────────────────────────────────────

const ECHO = {
  bg:      '#0A0A0B',
  panel:   '#0F0F11',
  panel2:  '#131316',
  border:  '#1C1C20',
  hair:    'rgba(255,255,255,0.055)',
  text:    '#E6E6E8',
  muted:   '#76767C',
  faint:   '#4A4A50',
  accent:  '#31E0A0',
  accentDim:'rgba(49,224,160,0.12)',
  neg:     '#E2604A',
  negDim:  'rgba(226,96,74,0.14)',
  warn:    '#E0A33A',
};

// map sentiment score (-5..+5) to a color on the warm-red → gray → green scale
function sentColor(s) {
  if (s >= 1.5)  return '#31E0A0';
  if (s >= 0.5)  return '#7FCF9E';
  if (s > -0.5)  return '#76767C';
  if (s > -1.5)  return '#D89A6A';
  return '#E2604A';
}
function sentTint(s) {
  if (s >= 1.5)  return 'rgba(49,224,160,0.10)';
  if (s <= -1.5) return 'rgba(226,96,74,0.10)';
  if (s <= -0.5) return 'rgba(224,163,58,0.07)';
  return 'transparent';
}

// the buzzword phrases the user is watching for
const BUZZWORDS = [
  'low-hanging fruit',
  'bandwidth',
  'circle back',
  'deep dive',
  'move the needle',
  'synergy',
];

// 2–3 min PM standup. t = seconds into session. s = sentiment (-5..+5).
// buzz = phrase matched inline (must appear verbatim in text, lowercased match)
const SCRIPT = [
  { t: 4,   s:  1, text: "Morning. Quick standup, I'll keep it tight." },
  { t: 11,  s:  2, text: "Yesterday I closed out the onboarding flow tickets." },
  { t: 19,  s:  2, text: "We're basically on track for the Thursday cut." },
  { t: 28,  s: -3, text: "One blocker — the transcription worker keeps OOMing under load." },
  { t: 37,  s: -2, text: "I lost most of the afternoon chasing it, honestly." },
  { t: 46,  s:  1, text: "But there's some low-hanging fruit on the memory side.", buzz: ['low-hanging fruit'] },
  { t: 54,  s:  2, text: "If we cap the buffer we claw back maybe forty percent." },
  { t: 63,  s: -1, text: "I don't have the bandwidth to also take the chart refactor.", buzz: ['bandwidth'] },
  { t: 70,  s:  0, text: "Can someone else grab that one?" },
  { t: 79,  s:  3, text: "Design dropped the new meter spec and it looks great." },
  { t: 88,  s: -2, text: "Risk is the API contract still isn't locked." },
  { t: 96,  s:  0, text: "Let's circle back on that right after standup.", buzz: ['circle back'] },
  { t: 105, s:  2, text: "Net net, cautiously optimistic for the demo." },
  { t: 113, s:  1, text: "That's me. Handing off." },
];

// extra lines that stream in "live" once the canned history is loaded
const LIVE_LINES = [
  { s:  2, text: "Quick follow-up — staging is green again." },
  { s:  1, text: "We should deep dive the latency numbers later.", buzz: ['deep dive'] },
  { s:  1, text: "Nothing else blocking on my end right now." },
  { s: -3, text: "Honestly the flaky integration test is driving me up a wall." },
  { s:  2, text: "If this lands it genuinely moves the needle on retention.", buzz: ['move the needle'] },
  { s:  0, text: "Okay. Back to it." },
  { s:  1, text: "Reminder the freeze starts Friday noon." },
  { s: -1, text: "Still waiting on the security review, mild risk." },
];

// past sessions for the switcher — spark is a tiny sentiment sequence
const SESSIONS = [
  { id: 's1', name: 'standup · platform',   date: 'today 09:14',  active: true,
    spark: [1,2,2,-3,-2,1,2,-1,0,3,-2,0,2,1] },
  { id: 's2', name: 'design crit · meter',  date: 'yest 16:02',
    spark: [2,3,1,2,0,-1,2,3,2,1,2,0,1,2] },
  { id: 's3', name: '1:1 · with priya',     date: 'yest 11:30',
    spark: [0,1,-2,-3,-1,0,1,2,1,0,-1,1,2,1] },
  { id: 's4', name: 'incident retro',       date: 'mon 14:45',
    spark: [-2,-3,-4,-2,-1,0,1,-1,0,1,2,1,0,1] },
  { id: 's5', name: 'roadmap sync',         date: 'mon 10:00',
    spark: [1,1,2,2,1,0,1,2,3,2,1,2,1,2] },
];

function fmtClock(totalSec) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function fmtMMSS(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = Math.floor(totalSec % 60);
  return `${m}:${String(s).padStart(2,'0')}`;
}

// split an utterance into spans, flagging buzzword phrases for highlight
function tokenizeBuzz(text, buzz) {
  if (!buzz || !buzz.length) return [{ t: text }];
  let parts = [{ t: text }];
  buzz.forEach(phrase => {
    const next = [];
    parts.forEach(p => {
      if (p.buzz) { next.push(p); return; }
      const lower = p.t.toLowerCase();
      const idx = lower.indexOf(phrase.toLowerCase());
      if (idx === -1) { next.push(p); return; }
      if (idx > 0) next.push({ t: p.t.slice(0, idx) });
      next.push({ t: p.t.slice(idx, idx + phrase.length), buzz: true });
      const rest = p.t.slice(idx + phrase.length);
      if (rest) next.push({ t: rest });
    });
    parts = next;
  });
  return parts;
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

Object.assign(window, {
  ECHO, sentColor, sentTint, BUZZWORDS, SCRIPT, LIVE_LINES, SESSIONS,
  fmtClock, fmtMMSS, tokenizeBuzz, countWords,
});
