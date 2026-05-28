// ─────────────────────────────────────────────────────────────────────────
// Echo — live visualizations: mic level meter + sentiment timeline chart
// ─────────────────────────────────────────────────────────────────────────
const { useRef, useEffect, useState } = React;

// ── Mic level meter: 28 vertical bars driven by a smoothed random walk ──────
function LevelMeter({ active, bars = 28 }) {
  const ref = useRef(null);
  const state = useRef({ levels: new Array(bars).fill(0.06), env: 0.4, t: 0 });

  useEffect(() => {
    let raf;
    const tick = () => {
      const st = state.current;
      st.t += 0.06;
      // slow speech "envelope" — rises and falls like phrases
      const target = active
        ? 0.35 + 0.45 * Math.abs(Math.sin(st.t * 0.9)) + 0.12 * Math.sin(st.t * 4.3)
        : 0.05;
      st.env += (target - st.env) * 0.12;
      const el = ref.current;
      if (el) {
        const kids = el.children;
        const n = kids.length;
        for (let i = 0; i < n; i++) {
          // center-weighted: middle bars taller, like a real spectrum
          const d = 1 - Math.abs(i - (n - 1) / 2) / ((n - 1) / 2);
          const shape = 0.35 + 0.65 * d;
          const jitter = active ? (0.55 + 0.45 * Math.random()) : 0.4;
          const v = Math.max(0.05, Math.min(1, st.env * shape * jitter));
          st.levels[i] += (v - st.levels[i]) * 0.45;
          const h = st.levels[i];
          const bar = kids[i];
          bar.style.height = (h * 100) + '%';
          // hot bars glow toward the accent
          bar.style.background = h > 0.7
            ? '#31E0A0'
            : h > 0.42 ? '#1f9c72' : '#2a2a30';
          bar.style.boxShadow = h > 0.7 ? '0 0 6px rgba(49,224,160,0.55)' : 'none';
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return (
    <div ref={ref} className="flex items-end gap-[3px] h-9 w-full">
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} className="flex-1 rounded-[1px] transition-[height] duration-75"
             style={{ height: '6%', background: '#2a2a30', minWidth: 2 }} />
      ))}
    </div>
  );
}

// ── Sentiment timeline: animated SMOOTH line over a -5..+5 band ──────────────
function SentimentChart({ points }) {
  // points: [{ t (sec), s (-5..5) }] — we render the last N
  const W = 760, H = 188, padL = 30, padR = 14, padT = 14, padB = 22;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const N = 38;
  const data = points.slice(-N);

  const tMin = data.length ? data[0].t : 0;
  const tMax = data.length ? Math.max(data[data.length - 1].t, tMin + 1) : 1;
  const x = (t) => padL + ((t - tMin) / (tMax - tMin)) * innerW;
  const y = (s) => padT + (1 - (s + 5) / 10) * innerH;

  // Catmull-Rom → bezier smoothing
  let path = '', area = '';
  if (data.length) {
    const pts = data.map(d => [x(d.t), y(d.s)]);
    path = `M ${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const c1x = p1[0] + (p2[0] - p0[0]) / 6;
      const c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6;
      const c2y = p2[1] - (p3[1] - p1[1]) / 6;
      path += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
    }
    area = path + ` L ${pts[pts.length - 1][0]},${y(-5)} L ${pts[0][0]},${y(-5)} Z`;
  }
  const last = data[data.length - 1];
  const gridY = [5, 2.5, 0, -2.5, -5];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sentArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#31E0A0" stopOpacity="0.20" />
          <stop offset="55%" stopColor="#31E0A0" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#31E0A0" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* zero baseline + gridlines */}
      {gridY.map(g => (
        <g key={g}>
          <line x1={padL} y1={y(g)} x2={W - padR} y2={y(g)}
                stroke={g === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.045)'}
                strokeWidth="1" strokeDasharray={g === 0 ? '0' : '2 4'} />
          <text x={6} y={y(g) + 3} fill="#4A4A50" fontSize="9"
                className="mono">{g > 0 ? '+' + g : g}</text>
        </g>
      ))}
      {data.length > 1 && <path d={area} fill="url(#sentArea)" />}
      {data.length > 1 && (
        <path d={path} fill="none" stroke="#31E0A0" strokeWidth="1.75"
              strokeLinejoin="round" strokeLinecap="round"
              style={{ filter: 'drop-shadow(0 0 3px rgba(49,224,160,0.35))' }} />
      )}
      {/* prior points as faint dots */}
      {data.map((d, i) => i < data.length - 1 && (
        <circle key={i} cx={x(d.t)} cy={y(d.s)} r="1.6"
                fill={sentColor(d.s)} opacity="0.5" />
      ))}
      {/* newest point: solid dot + pinging ring ("just drawn") */}
      {last && (
        <g>
          <circle cx={x(last.t)} cy={y(last.s)} r="3" fill="none"
                  stroke="#31E0A0" strokeWidth="1.5" className="point-ping" />
          <circle cx={x(last.t)} cy={y(last.s)} r="3" fill="#0A0A0B"
                  stroke="#31E0A0" strokeWidth="1.75" />
        </g>
      )}
    </svg>
  );
}

// ── tiny inline sparkline for the session switcher ──────────────────────────
function Spark({ values, w = 56, h = 16, color = '#76767C' }) {
  const max = 5, min = -5;
  const x = (i) => (i / (values.length - 1)) * w;
  const y = (v) => h - ((v - min) / (max - min)) * h;
  const d = values.map((v, i) => `${i ? 'L' : 'M'} ${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  return (
    <svg width={w} height={h} className="block">
      <path d={d} fill="none" stroke={color} strokeWidth="1.25"
            strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

Object.assign(window, { LevelMeter, SentimentChart, Spark });
