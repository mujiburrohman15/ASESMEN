import type { DiagramId } from '../../types/exam';

interface ScienceDiagramProps {
  id: DiagramId;
}

export function ScienceDiagram({ id }: ScienceDiagramProps) {
  switch (id) {
    case 'pdf-5-pots':
      return <Pdf5PotsSvg />;
    case 'pdf-7-solid-particles':
      return <Pdf7SolidParticlesSvg />;
    case 'pdf-10-density-block':
      return <Pdf10DensityBlockSvg />;
    case 'pdf-21-hazard-symbols':
      return <Pdf21HazardSymbolsSvg />;
    case 'pdf-22-phase-changes':
      return <Pdf22PhaseChangesSvg />;
    case 'pdf-30-plant-growth-chart':
      return <Pdf30PlantGrowthChartSvg />;
    case 'pdf-31-liquid-particles':
      return <Pdf31LiquidParticlesSvg />;
    case 'pdf-32-floating-beakers':
      return <Pdf32FloatingBeakersSvg />;
    case 'pdf-35-measurement-tools':
      return <Pdf35MeasurementToolsSvg />;
    case 'pdf-37-element-compound-mixture':
      return <Pdf37ElementCompoundMixtureSvg />;
    case 'pdf-43-three-states-particles':
      return <Pdf43ThreeStatesParticlesSvg />;
  }
}

function Pdf5PotsSvg() {
  const pots = [
    { x: 105, label: 'Pot 1', condition: 'Tempat terang', stemHeight: 60 },
    { x: 300, label: 'Pot 2', condition: 'Tempat redup', stemHeight: 45 },
    { x: 495, label: 'Pot 3', condition: 'Tempat gelap', stemHeight: 28 },
  ];

  return (
    <svg viewBox="0 0 600 245" className="w-full max-w-2xl mx-auto h-auto" role="img" aria-label="Tiga pot kacang hijau pada tempat terang, redup, dan gelap">
      <rect width="600" height="245" rx="10" fill="#F8FAFC" />
      {pots.map((pot) => {
        const topY = 148 - pot.stemHeight;
        return (
          <g key={pot.label}>
            <text x={pot.x} y="24" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0F172A">{pot.label}</text>
            <text x={pot.x} y="41" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0F172A">{pot.condition}</text>

            <line x1={pot.x} y1="148" x2={pot.x} y2={topY} stroke="#16A34A" strokeWidth="4.5" strokeLinecap="round" />
            <ellipse cx={pot.x - 10} cy={topY + 4} rx="11" ry="6" transform={`rotate(-18 ${pot.x - 10} ${topY + 4})`} fill="#22C55E" />
            <ellipse cx={pot.x + 10} cy={topY + 4} rx="11" ry="6" transform={`rotate(18 ${pot.x + 10} ${topY + 4})`} fill="#22C55E" />

            <polygon points={`${pot.x - 36},148 ${pot.x + 36},148 ${pot.x + 42},184 ${pot.x - 42},184`} fill="#7C3F18" stroke="#5C2D0C" strokeWidth="1.8" />
            <rect x={pot.x - 36} y="143" width="72" height="6" fill="#9A5B25" />

            <text x={pot.x} y="203" textAnchor="middle" fontSize="11" fill="#334155">Tanah 100 g</text>
            <text x={pot.x} y="218" textAnchor="middle" fontSize="11" fill="#334155">Air 20 mL/hari</text>
            <text x={pot.x} y="233" textAnchor="middle" fontSize="11" fill="#334155">3 biji kacang hijau</text>
          </g>
        );
      })}
    </svg>
  );
}

function Pdf7SolidParticlesSvg() {
  const circles: Array<[number, number]> = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      circles.push([46 + col * 27, 46 + row * 27]);
    }
  }

  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[190px] mx-auto h-auto" role="img" aria-label="Model partikel zat padat tersusun rapat dan teratur">
      <rect x="20" y="20" width="160" height="160" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
      {circles.map(([cx, cy], idx) => (
        <circle key={idx} cx={cx} cy={cy} r="10.5" fill="#2563EB" stroke="#0F172A" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

function Pdf10DensityBlockSvg() {
  return (
    <svg viewBox="0 0 440 200" className="w-full max-w-md mx-auto h-auto" role="img" aria-label="Balok bermassa 400 g dengan panjang 10 cm, lebar 5 cm, dan tinggi 4 cm">
      <rect width="440" height="200" rx="10" fill="#F8FAFC" />

      <polygon points="85,72 265,72 265,148 85,148" fill="#FDE047" stroke="#0F172A" strokeWidth="2.2" />
      <polygon points="85,72 140,34 320,34 265,72" fill="#FEF08A" stroke="#0F172A" strokeWidth="2.2" />
      <polygon points="265,72 320,34 320,110 265,148" fill="#F59E0B" stroke="#0F172A" strokeWidth="2.2" />

      <text x="175" y="116" textAnchor="middle" fontSize="16" fontWeight="700" fontFamily="IBM Plex Mono, monospace" fill="#0F172A">
        m = 400 g
      </text>

      <text x="175" y="172" textAnchor="middle" fontSize="13.5" fontWeight="600" fontFamily="IBM Plex Mono, monospace" fill="#0F172A">
        p = 10 cm
      </text>
      <text x="315" y="142" fontSize="13.5" fontWeight="600" fontFamily="IBM Plex Mono, monospace" fill="#0F172A">
        l = 5 cm
      </text>
      <text x="336" y="78" fontSize="13.5" fontWeight="600" fontFamily="IBM Plex Mono, monospace" fill="#0F172A">
        t = 4 cm
      </text>
    </svg>
  );
}

function Pdf21HazardSymbolsSvg() {
  return (
    <svg viewBox="0 0 600 175" className="w-full max-w-2xl mx-auto h-auto" role="img" aria-label="Empat simbol bahan kimia: Beracun, Mudah Terbakar, Radioaktif, dan Iritasi">
      <rect width="600" height="175" rx="10" fill="#F8FAFC" />
      {/* Simbol 1: Tengkorak (Beracun) */}
      <g transform="translate(80,72)">
        <polygon points="0,-50 50,0 0,50 -50,0" fill="#FFFFFF" stroke="#B91C1C" strokeWidth="6" strokeLinejoin="round" />
        <circle cx="0" cy="-10" r="12" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.2" />
        <rect x="-6" y="-1" width="12" height="7" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
        <circle cx="-4" cy="-11" r="2.5" fill="#0F172A" />
        <circle cx="4" cy="-11" r="2.5" fill="#0F172A" />
        <line x1="-17" y1="22" x2="17" y2="8" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="-17" y1="8" x2="17" y2="22" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
        <text x="0" y="76" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0F172A">Simbol 1</text>
      </g>

      {/* Simbol 2: Mudah Terbakar */}
      <g transform="translate(226,72)">
        <polygon points="0,-50 50,0 0,50 -50,0" fill="#FFFFFF" stroke="#B91C1C" strokeWidth="6" strokeLinejoin="round" />
        <path
          d="M0,-26 C7,-15 16,-9 16,4 C16,15 9,21 0,21 C-9,21 -16,14 -16,4 C-16,-4 -10,-11 -7,-17 C-6,-11 -4,-9 -2,-12 C-3,-18 -1,-22 0,-26 Z"
          fill="#F97316"
          stroke="#0F172A"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <line x1="-17" y1="24" x2="17" y2="24" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
        <text x="0" y="76" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0F172A">Simbol 2</text>
      </g>

      {/* Simbol 3: Radioaktif */}
      <g transform="translate(373,72)">
        <polygon points="0,-50 50,0 0,50 -50,0" fill="#FFFFFF" stroke="#B91C1C" strokeWidth="6" strokeLinejoin="round" />
        <circle cx="0" cy="0" r="4.5" fill="#0F172A" />
        <path d="M-9,-16 A18,18 0 0,1 9,-16 L4,-8 A9,9 0 0,0 -4,-8 Z" fill="#0F172A" />
        <path d="M-9,-16 A18,18 0 0,1 9,-16 L4,-8 A9,9 0 0,0 -4,-8 Z" fill="#0F172A" transform="rotate(120)" />
        <path d="M-9,-16 A18,18 0 0,1 9,-16 L4,-8 A9,9 0 0,0 -4,-8 Z" fill="#0F172A" transform="rotate(240)" />
        <text x="0" y="76" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0F172A">Simbol 3</text>
      </g>

      {/* Simbol 4: Tanda Seru (Iritan / Berbahaya) */}
      <g transform="translate(520,72)">
        <polygon points="0,-50 50,0 0,50 -50,0" fill="#FFFFFF" stroke="#B91C1C" strokeWidth="6" strokeLinejoin="round" />
        <rect x="-4" y="-22" width="8" height="27" rx="3" fill="#0F172A" />
        <circle cx="0" cy="15" r="4.5" fill="#0F172A" />
        <text x="0" y="76" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0F172A">Simbol 4</text>
      </g>
    </svg>
  );
}

function Pdf22PhaseChangesSvg() {
  return (
    <svg viewBox="0 0 600 220" className="w-full max-w-2xl mx-auto h-auto" role="img" aria-label="Skema perubahan wujud zat padat, cair, dan gas dengan nomor proses 1 sampai 6">
      <defs>
        <marker id="pdf22-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#0F172A" />
        </marker>
      </defs>
      <rect width="600" height="220" rx="10" fill="#F8FAFC" />

      <rect x="35" y="88" width="108" height="44" rx="6" fill="#BFDBFE" stroke="#0F172A" strokeWidth="1.8" />
      <text x="89" y="115" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0F172A">PADAT</text>

      <rect x="246" y="88" width="108" height="44" rx="6" fill="#DCFCE7" stroke="#0F172A" strokeWidth="1.8" />
      <text x="300" y="115" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0F172A">CAIR</text>

      <rect x="457" y="88" width="108" height="44" rx="6" fill="#FDE68A" stroke="#0F172A" strokeWidth="1.8" />
      <text x="511" y="115" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0F172A">GAS</text>

      {/* 1: Padat -> Cair */}
      <line x1="147" y1="100" x2="240" y2="100" stroke="#0F172A" strokeWidth="2" markerEnd="url(#pdf22-arrow)" />
      <circle cx="194" cy="83" r="11" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.6" />
      <text x="194" y="87" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0F172A">1</text>

      {/* 4: Cair -> Padat */}
      <line x1="242" y1="120" x2="149" y2="120" stroke="#0F172A" strokeWidth="2" markerEnd="url(#pdf22-arrow)" />
      <circle cx="194" cy="138" r="11" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.6" />
      <text x="194" y="142" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0F172A">4</text>

      {/* 2: Cair -> Gas */}
      <line x1="358" y1="100" x2="451" y2="100" stroke="#0F172A" strokeWidth="2" markerEnd="url(#pdf22-arrow)" />
      <circle cx="405" cy="83" r="11" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.6" />
      <text x="405" y="87" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0F172A">2</text>

      {/* 3: Gas -> Cair */}
      <line x1="453" y1="120" x2="360" y2="120" stroke="#0F172A" strokeWidth="2" markerEnd="url(#pdf22-arrow)" />
      <circle cx="405" cy="138" r="11" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.6" />
      <text x="405" y="142" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0F172A">3</text>

      {/* 5: Padat -> Gas */}
      <path d="M 89,84 Q 300,12 508,82" fill="none" stroke="#0F172A" strokeWidth="2" markerEnd="url(#pdf22-arrow)" />
      <circle cx="300" cy="36" r="12" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.6" />
      <text x="300" y="40" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0F172A">5</text>

      {/* 6: Gas -> Padat */}
      <path d="M 511,136 Q 300,208 92,138" fill="none" stroke="#0F172A" strokeWidth="2" markerEnd="url(#pdf22-arrow)" />
      <circle cx="300" cy="184" r="12" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.6" />
      <text x="300" y="188" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0F172A">6</text>
    </svg>
  );
}

function Pdf30PlantGrowthChartSvg() {
  // X: Hari 0..6 -> x = 90 + day * 70 (90..510)
  // Y: 0..14 cm -> y = 240 - cm * 14 (240..44)
  const terang: Array<[number, number]> = [
    [0, 0], [1, 1], [2, 2.5], [3, 4], [4, 5.5], [5, 7], [6, 8.5],
  ];
  const gelap: Array<[number, number]> = [
    [0, 0], [1, 1.5], [2, 3.5], [3, 6], [4, 8.5], [5, 11], [6, 13.5],
  ];

  const toX = (d: number) => 90 + d * 70;
  const toY = (cm: number) => 240 - cm * 14;

  return (
    <svg viewBox="0 0 560 295" className="w-full max-w-xl mx-auto h-auto" role="img" aria-label="Grafik pertumbuhan kecambah kacang hijau di tempat terang dan tempat gelap">
      <rect width="560" height="295" rx="10" fill="#FFFFFF" />
      <text x="300" y="22" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0F172A">
        Pertumbuhan Kecambah Kacang Hijau
      </text>

      {/* Grid */}
      {[0, 2, 4, 6, 8, 10, 12, 14].map((cm) => {
        const y = toY(cm);
        return (
          <g key={`y-${cm}`}>
            <line x1="80" y1={y} x2="520" y2={y} stroke="#E2E8F0" strokeWidth="1" />
            <text x="72" y={y + 4} textAnchor="end" fontSize="11.5" fontFamily="IBM Plex Mono, monospace" fill="#334155">
              {cm}
            </text>
          </g>
        );
      })}
      {[0, 1, 2, 3, 4, 5, 6].map((day) => {
        const x = toX(day);
        return (
          <g key={`x-${day}`}>
            <line x1={x} y1="36" x2={x} y2="246" stroke="#E2E8F0" strokeWidth="1" />
            <text x={x} y="262" textAnchor="middle" fontSize="11.5" fontFamily="IBM Plex Mono, monospace" fill="#334155">
              {day}
            </text>
          </g>
        );
      })}

      {/* Outer Frame */}
      <rect x="80" y="36" width="440" height="210" fill="none" stroke="#334155" strokeWidth="1.5" />

      <text x="30" y="142" textAnchor="middle" fontSize="12" fontWeight="600" fill="#334155" transform="rotate(-90 30 142)">
        Tinggi kecambah (cm)
      </text>
      <text x="300" y="282" textAnchor="middle" fontSize="12" fontWeight="600" fill="#334155">
        Hari ke-
      </text>

      {/* Lines */}
      <polyline
        points={gelap.map(([d, c]) => `${toX(d)},${toY(c)}`).join(' ')}
        fill="none"
        stroke="#78350F"
        strokeWidth="2.5"
        strokeDasharray="6 4"
      />
      <polyline
        points={terang.map(([d, c]) => `${toX(d)},${toY(c)}`).join(' ')}
        fill="none"
        stroke="#15803D"
        strokeWidth="2.5"
      />

      {gelap.map(([d, c]) => (
        <rect key={`g-${d}`} x={toX(d) - 4} y={toY(c) - 4} width="8" height="8" fill="#78350F" />
      ))}
      {terang.map(([d, c]) => (
        <circle key={`t-${d}`} cx={toX(d)} cy={toY(c)} r="4.5" fill="#15803D" />
      ))}

      {/* Legend */}
      <rect x="92" y="45" width="150" height="46" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
      <line x1="102" y1="60" x2="128" y2="60" stroke="#15803D" strokeWidth="2.5" />
      <circle cx="115" cy="60" r="3.5" fill="#15803D" />
      <text x="136" y="64" fontSize="11.5" fill="#0F172A">Tempat terang</text>

      <line x1="102" y1="78" x2="128" y2="78" stroke="#78350F" strokeWidth="2.2" strokeDasharray="4 3" />
      <rect x="111.5" y="74.5" width="7" height="7" fill="#78350F" />
      <text x="136" y="82" fontSize="11.5" fill="#0F172A">Tempat gelap</text>
    </svg>
  );
}

function Pdf31LiquidParticlesSvg() {
  const pts: Array<[number, number]> = [
    [45, 42], [78, 36], [112, 46], [146, 38],
    [38, 72], [69, 66], [101, 75], [134, 65], [160, 74],
    [52, 102], [86, 98], [119, 106], [150, 99],
    [40, 130], [72, 134], [104, 128], [136, 136], [162, 130],
    [54, 160], [88, 162], [122, 158], [154, 162],
  ];

  return (
    <svg viewBox="0 0 200 195" className="w-full max-w-[190px] mx-auto h-auto" role="img" aria-label="Model partikel zat cair tersusun rapat tetapi tidak teratur">
      <rect x="20" y="18" width="160" height="160" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
      {pts.map(([cx, cy], idx) => (
        <circle key={idx} cx={cx} cy={cy} r="10.5" fill="#2563EB" stroke="#0F172A" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

function Pdf32FloatingBeakersSvg() {
  const items = [
    { x: 105, title: 'Benda 1', y: 54, fill: '#9A7B70', rho: 'ρ benda = 0,6 g/cm³' },
    { x: 300, title: 'Benda 2', y: 148, fill: '#57534E', rho: 'ρ benda = 2,5 g/cm³' },
    { x: 495, title: 'Benda 3', y: 104, fill: '#FCD34D', rho: 'ρ benda = 1,0 g/cm³' },
  ];

  return (
    <svg viewBox="0 0 600 230" className="w-full max-w-2xl mx-auto h-auto" role="img" aria-label="Keadaan Benda 1 mengapung, Benda 2 tenggelam, dan Benda 3 melayang dalam air">
      <rect width="600" height="230" rx="10" fill="#F8FAFC" />
      {items.map((item) => (
        <g key={item.title}>
          <text x={item.x} y="24" textAnchor="middle" fontSize="13.5" fontWeight="700" fill="#0F172A">{item.title}</text>
          <rect x={item.x - 52} y="76" width="104" height="106" fill="#BAE6FD" />
          <polyline
            points={`${item.x - 52},36 ${item.x - 52},182 ${item.x + 52},182 ${item.x + 52},36`}
            fill="none"
            stroke="#0F172A"
            strokeWidth="2.2"
          />
          <rect x={item.x - 21} y={item.y} width="42" height="34" fill={item.fill} stroke="#0F172A" strokeWidth="1.6" />
          <text x={item.x} y="198" textAnchor="middle" fontSize="11" fontWeight="600" fill="#334155">{item.rho}</text>
        </g>
      ))}
      <text x="300" y="220" textAnchor="middle" fontSize="12" fontWeight="600" fill="#0F172A">
        Massa jenis air = 1,0 g/cm³
      </text>
    </svg>
  );
}

function Pdf35MeasurementToolsSvg() {
  // Stopwatch: 37s -> angle = (37 / 60) * 360 deg from top (12 o'clock)
  const swAngleRad = ((37 / 60) * 360 - 90) * (Math.PI / 180);
  const swX = 505 + Math.cos(swAngleRad) * 34;
  const swY = 108 + Math.sin(swAngleRad) * 34;

  // Thermometer: 64°C mapped 0..100 -> y = 185 - T * 1.45
  const thermY = (t: number) => 185 - t * 1.45;
  // Graduated cylinder: 46 mL mapped 0..100 -> y = 185 - mL * 1.45
  const cylY = (ml: number) => 185 - ml * 1.45;

  return (
    <svg viewBox="0 0 600 230" className="w-full max-w-2xl mx-auto h-auto" role="img" aria-label="Empat alat ukur: penggaris 7,7 cm, termometer 64 C, gelas ukur 46 mL, dan stopwatch 37 sekon">
      <rect width="600" height="230" rx="10" fill="#F8FAFC" />

      {/* (1) Penggaris + Pensil = 7,7 cm */}
      <text x="86" y="20" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0F172A">(1)</text>
      <polygon points="18,62 104,62 118,71 104,80 18,80" fill="#DC2626" stroke="#0F172A" strokeWidth="1.5" />
      <polygon points="104,62 118,71 104,80" fill="#FDE68A" stroke="#0F172A" strokeWidth="1.2" />
      <polygon points="114,68.5 118,71 114,73.5" fill="#0F172A" />

      <rect x="12" y="92" width="148" height="44" fill="#FEF3C7" stroke="#0F172A" strokeWidth="1.6" />
      {/* 0 to 10 cm at 13 px per cm, starting x=18 -> 7.7 cm = 18 + 7.7*13 = 118.1 */}
      {Array.from({ length: 101 }, (_, mm) => {
        const x = 18 + mm * 1.3;
        const isCm = mm % 10 === 0;
        const isHalf = mm % 5 === 0 && !isCm;
        return (
          <g key={`r-${mm}`}>
            <line x1={x} y1="92" x2={x} y2={92 + (isCm ? 14 : isHalf ? 10 : 6)} stroke="#0F172A" strokeWidth={isCm ? 1.3 : 0.7} />
            {isCm && (
              <text x={x} y="118" textAnchor="middle" fontSize="9.5" fontFamily="IBM Plex Mono, monospace" fill="#0F172A">
                {mm / 10}
              </text>
            )}
          </g>
        );
      })}
      <text x="148" y="130" textAnchor="end" fontSize="9" fontWeight="600" fill="#0F172A">cm</text>
      <text x="86" y="206" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="#334155">Panjang pensil</text>

      {/* (2) Termometer = 64 °C */}
      <text x="235" y="20" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0F172A">(2)</text>
      <text x="262" y="34" fontSize="10" fontWeight="700" fill="#334155">°C</text>
      <rect x="227" y="34" width="14" height="156" rx="7" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.6" />
      <rect x="231" y={thermY(64)} width="6" height={185 - thermY(64)} fill="#DC2626" />
      <circle cx="234" cy="193" r="8" fill="#DC2626" stroke="#0F172A" strokeWidth="1.5" />
      {Array.from({ length: 51 }, (_, i) => {
        const t = i * 2;
        const y = thermY(t);
        const isTen = t % 10 === 0;
        return (
          <g key={`th-${t}`}>
            <line x1="241" y1={y} x2={isTen ? 253 : 247} y2={y} stroke="#0F172A" strokeWidth={isTen ? 1.2 : 0.7} />
            {isTen && (
              <text x="256" y={y + 3} fontSize="8.5" fontFamily="IBM Plex Mono, monospace" fill="#0F172A">{t}</text>
            )}
          </g>
        );
      })}
      <text x="235" y="216" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="#334155">Suhu air</text>

      {/* (3) Gelas Ukur = 46 mL */}
      <text x="362" y="20" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0F172A">(3)</text>
      <text x="392" y="34" fontSize="10" fontWeight="700" fill="#334155">mL</text>
      <rect x="336" y={cylY(46)} width="44" height={185 - cylY(46)} fill="#7DD3FC" />
      <rect x="336" y="36" width="44" height="150" fill="none" stroke="#0F172A" strokeWidth="1.8" />
      <line x1="336" y1={cylY(46)} x2="380" y2={cylY(46)} stroke="#0284C7" strokeWidth="1.8" />
      {Array.from({ length: 51 }, (_, i) => {
        const ml = i * 2;
        const y = cylY(ml);
        const isTen = ml % 10 === 0;
        return (
          <g key={`cy-${ml}`}>
            <line x1={isTen ? 366 : 372} y1={y} x2="380" y2={y} stroke="#0F172A" strokeWidth={isTen ? 1.2 : 0.7} />
            {isTen && (
              <text x="384" y={y + 3} fontSize="8.5" fontFamily="IBM Plex Mono, monospace" fill="#0F172A">{ml}</text>
            )}
          </g>
        );
      })}
      <text x="362" y="216" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="#334155">Volume air</text>

      {/* (4) Stopwatch = 37 sekon */}
      <text x="505" y="20" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0F172A">(4)</text>
      <rect x="498" y="45" width="14" height="8" rx="2" fill="#64748B" stroke="#0F172A" strokeWidth="1.4" />
      <circle cx="505" cy="108" r="54" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
      {Array.from({ length: 60 }, (_, s) => {
        const rad = ((s / 60) * 360 - 90) * (Math.PI / 180);
        const isFive = s % 5 === 0;
        const rOuter = 50;
        const rInner = isFive ? 43 : 46;
        return (
          <g key={`sw-${s}`}>
            <line
              x1={505 + Math.cos(rad) * rInner}
              y1={108 + Math.sin(rad) * rInner}
              x2={505 + Math.cos(rad) * rOuter}
              y2={108 + Math.sin(rad) * rOuter}
              stroke="#0F172A"
              strokeWidth={isFive ? 1.6 : 0.8}
            />
            {isFive && (
              <text
                x={505 + Math.cos(rad) * 34}
                y={108 + Math.sin(rad) * 34 + 3}
                textAnchor="middle"
                fontSize="8.5"
                fontWeight="700"
                fontFamily="IBM Plex Mono, monospace"
                fill="#0F172A"
              >
                {s === 0 ? 60 : s}
              </text>
            )}
          </g>
        );
      })}
      <text x="505" y="88" textAnchor="middle" fontSize="8" fill="#475569">sekon</text>
      <line x1="505" y1="108" x2={swX} y2={swY} stroke="#DC2626" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="505" cy="108" r="3.5" fill="#0F172A" />
      <text x="505" y="184" textAnchor="middle" fontSize="10" fontWeight="600" fill="#334155">
        Stopwatch (1 putaran = 60 s)
      </text>
    </svg>
  );
}

function Pdf37ElementCompoundMixtureSvg() {
  const red = '#DC2626';
  const blue = '#2563EB';
  const green = '#22C55E';

  return (
    <svg viewBox="0 0 600 170" className="w-full max-w-2xl mx-auto h-auto" role="img" aria-label="Empat gambar model partikel unsur, senyawa, dan campuran">
      <rect width="600" height="170" rx="10" fill="#F8FAFC" />

      {/* (1) Unsur: single red circles */}
      <text x="82" y="22" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0F172A">(1)</text>
      <rect x="20" y="30" width="124" height="122" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.8" />
      {[[42, 50], [116, 48], [62, 82], [110, 80], [64, 108], [122, 114], [42, 134], [88, 130]].map(([cx, cy], i) => (
        <circle key={`1-${i}`} cx={cx} cy={cy} r="7.5" fill={red} stroke="#0F172A" strokeWidth="1.3" />
      ))}

      {/* (2) Senyawa: red+blue pairs */}
      <text x="228" y="22" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0F172A">(2)</text>
      <rect x="166" y="30" width="124" height="122" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.8" />
      {[[192, 52], [254, 52], [220, 88], [190, 128], [256, 128]].map(([cx, cy], i) => (
        <g key={`2-${i}`}>
          <circle cx={cx} cy={cy} r="7.5" fill={red} stroke="#0F172A" strokeWidth="1.3" />
          <circle cx={cx + 13} cy={cy} r="7.5" fill={blue} stroke="#0F172A" strokeWidth="1.3" />
        </g>
      ))}

      {/* (3) Campuran: loose red and blue */}
      <text x="374" y="22" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0F172A">(3)</text>
      <rect x="312" y="30" width="124" height="122" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.8" />
      {[[346, 50], [372, 92], [412, 126], [334, 134]].map(([cx, cy], i) => (
        <circle key={`3r-${i}`} cx={cx} cy={cy} r="7.5" fill={red} stroke="#0F172A" strokeWidth="1.3" />
      ))}
      {[[410, 50], [334, 92], [414, 88], [372, 134]].map(([cx, cy], i) => (
        <circle key={`3b-${i}`} cx={cx} cy={cy} r="7.5" fill={blue} stroke="#0F172A" strokeWidth="1.3" />
      ))}

      {/* (4) Campuran: red+blue pairs + green */}
      <text x="520" y="22" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0F172A">(4)</text>
      <rect x="458" y="30" width="124" height="122" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.8" />
      {[[498, 56], [486, 128], [546, 124]].map(([cx, cy], i) => (
        <g key={`4p-${i}`}>
          <circle cx={cx} cy={cy} r="7.5" fill={red} stroke="#0F172A" strokeWidth="1.3" />
          <circle cx={cx + 13} cy={cy} r="7.5" fill={blue} stroke="#0F172A" strokeWidth="1.3" />
        </g>
      ))}
      {[[558, 52], [474, 88], [520, 92], [562, 88]].map(([cx, cy], i) => (
        <circle key={`4g-${i}`} cx={cx} cy={cy} r="7.5" fill={green} stroke="#0F172A" strokeWidth="1.3" />
      ))}
    </svg>
  );
}

function Pdf43ThreeStatesParticlesSvg() {
  // Zat X: Cair (random packed)
  const liquid: Array<[number, number]> = [
    [45, 52], [72, 46], [102, 54], [130, 48], [156, 56],
    [38, 78], [64, 72], [92, 80], [120, 72], [148, 82],
    [50, 106], [78, 100], [108, 108], [136, 102], [158, 112],
    [40, 134], [68, 138], [96, 130], [124, 138], [154, 134],
    [52, 160], [84, 162], [116, 158], [146, 162],
  ];

  // Zat Y: Padat (regular grid)
  const solid: Array<[number, number]> = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 6; c++) {
      solid.push([232 + c * 26, 58 + r * 28]);
    }
  }

  // Zat Z: Gas (sparse)
  const gas: Array<[number, number]> = [
    [442, 62], [492, 54], [546, 56], [430, 108], [486, 116], [552, 122], [446, 152], [516, 158],
  ];

  return (
    <svg viewBox="0 0 600 195" className="w-full max-w-2xl mx-auto h-auto" role="img" aria-label="Model partikel Zat X cair, Zat Y padat, dan Zat Z gas">
      <rect width="600" height="195" rx="10" fill="#F8FAFC" />

      <text x="98" y="24" textAnchor="middle" fontSize="13.5" fontWeight="700" fill="#0F172A">Zat X</text>
      <rect x="22" y="34" width="152" height="142" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.8" />
      {liquid.map(([cx, cy], i) => (
        <circle key={`x-${i}`} cx={cx} cy={cy} r="8.5" fill="#2563EB" stroke="#0F172A" strokeWidth="1.3" />
      ))}

      <text x="300" y="24" textAnchor="middle" fontSize="13.5" fontWeight="700" fill="#0F172A">Zat Y</text>
      <rect x="216" y="34" width="168" height="142" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.8" />
      {solid.map(([cx, cy], i) => (
        <circle key={`y-${i}`} cx={cx} cy={cy} r="8.5" fill="#2563EB" stroke="#0F172A" strokeWidth="1.3" />
      ))}

      <text x="502" y="24" textAnchor="middle" fontSize="13.5" fontWeight="700" fill="#0F172A">Zat Z</text>
      <rect x="416" y="34" width="164" height="142" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.8" />
      {gas.map(([cx, cy], i) => (
        <circle key={`z-${i}`} cx={cx} cy={cy} r="8.5" fill="#2563EB" stroke="#0F172A" strokeWidth="1.3" />
      ))}
    </svg>
  );
}
