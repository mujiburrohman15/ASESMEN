interface InteractiveLineGraphPlotterProps {
  valueJson: string;
  onChange: (nextJson: string) => void;
  readOnly?: boolean;
  showExpectedOverlay?: boolean;
}

const X_VALUES = [0, 5, 10, 15, 20];
const Y_VALUES_MAJOR = [0, 4, 8, 12, 16, 20, 24];
const EXPECTED_POINTS: Record<number, number> = { 0: 10, 5: 14, 10: 18, 15: 22, 20: 20 };

export function parseGraphPoints(valueJson: string): Record<number, number> {
  if (!valueJson) return {};
  try {
    const parsed = JSON.parse(valueJson);
    if (parsed && typeof parsed === 'object') {
      const out: Record<number, number> = {};
      for (const x of X_VALUES) {
        if (typeof parsed[x] === 'number') {
          out[x] = parsed[x];
        }
      }
      return out;
    }
  } catch {
    // ignore
  }
  return {};
}

export function InteractiveLineGraphPlotter({
  valueJson,
  onChange,
  readOnly = false,
  showExpectedOverlay = false,
}: InteractiveLineGraphPlotterProps) {
  const points = parseGraphPoints(valueJson);

  // SVG coordinate mapping: x: 0..20 -> 75..435 (18 px per gram); y: 0..24 -> 240..24 (9 px per cm)
  const toX = (g: number) => 75 + g * 18;
  const toY = (cm: number) => 240 - cm * 9;

  const sortedPlotted = X_VALUES.filter((x) => typeof points[x] === 'number').map((x) => [
    x,
    points[x],
  ] as [number, number]);

  const handleSetPoint = (xVal: number, yVal: number) => {
    if (readOnly) return;
    const next = { ...points, [xVal]: yVal };
    onChange(JSON.stringify(next));
  };

  return (
    <div className="space-y-3">
      {!readOnly && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <span>
            Klik titik pada grafik atau pilih tinggi (cm) di bawah untuk memplot grafik garis.
          </span>
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-red-700 font-semibold hover:underline cursor-pointer"
          >
            Reset Grafik
          </button>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-3">
        <svg viewBox="0 0 490 290" className="w-full max-w-lg mx-auto h-auto" role="img" aria-label="Kotak grafik garis pengaruh jumlah pupuk terhadap tinggi tanaman">
          <rect width="490" height="290" fill="#FFFFFF" />

          {/* Grid horizontal */}
          {Y_VALUES_MAJOR.map((yVal) => {
            const y = toY(yVal);
            return (
              <g key={`gy-${yVal}`}>
                <line x1="75" y1={y} x2="435" y2={y} stroke="#E2E8F0" strokeWidth="1" />
                <text x="66" y={y + 4} textAnchor="end" fontSize="11" fontFamily="IBM Plex Mono, monospace" fill="#334155">
                  {yVal}
                </text>
              </g>
            );
          })}

          {/* Grid vertical */}
          {X_VALUES.map((xVal) => {
            const x = toX(xVal);
            return (
              <g key={`gx-${xVal}`}>
                <line x1={x} y1="24" x2={x} y2="240" stroke="#E2E8F0" strokeWidth="1" />
                <text x={x} y="258" textAnchor="middle" fontSize="11" fontFamily="IBM Plex Mono, monospace" fill="#334155">
                  {xVal}
                </text>
              </g>
            );
          })}

          {/* Frame */}
          <rect x="75" y="24" width="360" height="216" fill="none" stroke="#334155" strokeWidth="1.5" />

          {/* Axis Labels */}
          <text x="24" y="132" textAnchor="middle" fontSize="12" fontWeight="600" fill="#0F172A" transform="rotate(-90 24 132)">
            Tinggi tanaman (cm)
          </text>
          <text x="255" y="280" textAnchor="middle" fontSize="12" fontWeight="600" fill="#0F172A">
            Jumlah pupuk (gram)
          </text>

          {/* Expected overlay when reviewing */}
          {showExpectedOverlay && (
            <g>
              <polyline
                points={X_VALUES.map((x) => `${toX(x)},${toY(EXPECTED_POINTS[x])}`).join(' ')}
                fill="none"
                stroke="#059669"
                strokeWidth="2"
                strokeDasharray="5 4"
              />
              {X_VALUES.map((x) => (
                <circle
                  key={`exp-${x}`}
                  cx={toX(x)}
                  cy={toY(EXPECTED_POINTS[x])}
                  r="4"
                  fill="#059669"
                />
              ))}
            </g>
          )}

          {/* Student plotted line */}
          {sortedPlotted.length > 1 && (
            <polyline
              points={sortedPlotted.map(([x, y]) => `${toX(x)},${toY(y)}`).join(' ')}
              fill="none"
              stroke="#0284C7"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          )}

          {/* Student plotted points */}
          {sortedPlotted.map(([x, y]) => (
            <g key={`pt-${x}`}>
              <circle cx={toX(x)} cy={toY(y)} r="5.5" fill="#0D9488" stroke="#FFFFFF" strokeWidth="1.5" />
              <text
                x={toX(x)}
                y={toY(y) - 10}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fontFamily="IBM Plex Mono, monospace"
                fill="#0F766E"
              >
                ({x},{y})
              </text>
            </g>
          ))}

          {/* Interactive clickable targets every 2 cm along each X column */}
          {!readOnly &&
            X_VALUES.map((xVal) =>
              Array.from({ length: 13 }, (_, idx) => idx * 2).map((yVal) => (
                <circle
                  key={`hit-${xVal}-${yVal}`}
                  cx={toX(xVal)}
                  cy={toY(yVal)}
                  r="7"
                  fill="transparent"
                  className="cursor-pointer hover:fill-sky-400/35"
                  onClick={() => handleSetPoint(xVal, yVal)}
                >
                  <title>{`Pupuk ${xVal} g → Tinggi ${yVal} cm`}</title>
                </circle>
              )),
            )}
        </svg>
      </div>

      {/* Accessible quick-select row for mobile/keyboard users */}
      {!readOnly && (
        <div className="grid grid-cols-5 gap-2">
          {X_VALUES.map((xVal) => (
            <div key={`sel-${xVal}`} className="space-y-1">
              <label htmlFor={`plot-${xVal}`} className="block text-[11px] font-semibold text-slate-600 text-center">
                {xVal} g
              </label>
              <select
                id={`plot-${xVal}`}
                value={typeof points[xVal] === 'number' ? points[xVal] : ''}
                onChange={(e) => {
                  if (e.target.value === '') {
                    const copy = { ...points };
                    delete copy[xVal];
                    onChange(Object.keys(copy).length ? JSON.stringify(copy) : '');
                  } else {
                    handleSetPoint(xVal, Number(e.target.value));
                  }
                }}
                className="w-full h-9 px-1.5 text-xs font-mono rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="">-- cm</option>
                {Array.from({ length: 13 }, (_, idx) => idx * 2).map((cm) => (
                  <option key={cm} value={cm}>
                    {cm} cm
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
