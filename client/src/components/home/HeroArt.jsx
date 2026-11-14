// Layered SVG "3D" artwork: a faceted metallic gold monolith (Bolt-inspired lighting) fragmenting into
// cyan/magenta shards with a wireframe network (JunctionX-inspired). Pure SVG + CSS: light on the GPU.

const shards = [ // x, y, size, rotation, fill, delay(s), duration(s)
  [470, 90, 22, 20, 'url(#gMag)', 0, 7], [520, 150, 14, 60, 'url(#gCyan)', 1, 8], [430, 60, 10, 10, 'url(#gGold)', 2, 6],
  [540, 240, 18, 100, 'url(#gMag)', .5, 9], [95, 170, 16, 40, 'url(#gCyan)', 1.5, 8], [60, 330, 11, 70, 'url(#gGold)', 2.5, 7],
  [505, 470, 20, 30, 'url(#gCyan)', .8, 10], [110, 520, 14, 80, 'url(#gMag)', 1.2, 8], [560, 360, 9, 15, 'url(#gGold)', 3, 6],
  [380, 20, 12, 50, 'url(#gCyan)', 2.2, 9], [45, 440, 20, 90, 'url(#gMag)', .3, 11], [250, 700, 12, 25, 'url(#gGold)', 1.8, 7],
];
const nodes = [[70, 120], [150, 70], [60, 250], [160, 310], [90, 420], [200, 520], [520, 300], [560, 120], [470, 560], [330, 650], [180, 190], [530, 430]];
const links = [[0, 1], [0, 2], [1, 10], [2, 3], [2, 10], [3, 4], [4, 5], [10, 3], [6, 7], [6, 11], [11, 8], [8, 9], [7, 6]];
const tri = (x, y, s) => `${x},${y - s} ${x + s * 0.9},${y + s * 0.6} ${x - s * 0.8},${y + s * 0.7}`;

export default function HeroArt() {
  return (
    <div className="relative h-full w-full" aria-hidden="true">
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="gGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFF3D6" /><stop offset=".45" stopColor="#F5C879" /><stop offset="1" stopColor="#7A4B14" /></linearGradient>
          <linearGradient id="gGoldDeep" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C98F3F" /><stop offset="1" stopColor="#2B1A0C" /></linearGradient>
          <linearGradient id="gNight" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#05040B" /><stop offset=".6" stopColor="#1B1630" /><stop offset="1" stopColor="#3B2E55" /></linearGradient>
          <linearGradient id="gMag" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FF2DAA" /><stop offset="1" stopColor="#400B33" /></linearGradient>
          <linearGradient id="gCyan" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#00E5FF" /><stop offset="1" stopColor="#042530" /></linearGradient>
          <radialGradient id="glowM" cx=".6" cy=".35" r=".6"><stop offset="0" stopColor="#FF2DAA" stopOpacity=".38" /><stop offset="1" stopColor="#FF2DAA" stopOpacity="0" /></radialGradient>
          <radialGradient id="glowC" cx=".3" cy=".7" r=".55"><stop offset="0" stopColor="#00E5FF" stopOpacity=".28" /><stop offset="1" stopColor="#00E5FF" stopOpacity="0" /></radialGradient>
          <radialGradient id="glowG" cx=".5" cy=".4" r=".5"><stop offset="0" stopColor="#F5C879" stopOpacity=".3" /><stop offset="1" stopColor="#F5C879" stopOpacity="0" /></radialGradient>
        </defs>
      </svg>

      {/* back: atmosphere + wireframe network */}
      <div className="px-a absolute inset-0">
        <svg viewBox="0 0 600 720" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
          <rect width="600" height="720" fill="url(#glowM)" />
          <rect width="600" height="720" fill="url(#glowC)" />
          <rect width="600" height="720" fill="url(#glowG)" />
          <g stroke="#00E5FF" strokeOpacity=".35" strokeWidth="1" fill="none">
            {links.map(([a, b]) => <line key={`${a}-${b}`} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} />)}
          </g>
          {nodes.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 5 : 3} fill={i % 2 ? '#FF2DAA' : '#00E5FF'} className="node-pulse" style={{ animationDelay: `${i * 0.35}s` }} />
          ))}
        </svg>
      </div>

      {/* middle: the faceted monolith */}
      <div className="px-b absolute inset-0">
        <svg viewBox="0 0 600 720" className="gem-float h-full w-full" preserveAspectRatio="xMidYMid meet">
          <ellipse cx="310" cy="700" rx="150" ry="14" fill="#000" opacity=".5" />
          <g strokeLinejoin="round" strokeWidth="1.2">
            <polygon points="300,40 170,230 300,330" fill="url(#gGold)" stroke="#FFF3D6" strokeOpacity=".5" />
            <polygon points="300,40 300,330 430,210" fill="url(#gNight)" stroke="#00E5FF" strokeOpacity=".55" />
            <polygon points="170,230 120,420 300,330" fill="url(#gGoldDeep)" stroke="#F5C879" strokeOpacity=".4" />
            <polygon points="430,210 300,330 470,400" fill="url(#gGold)" stroke="#FFF3D6" strokeOpacity=".4" />
            <polygon points="120,420 240,640 300,330" fill="url(#gNight)" stroke="#FF2DAA" strokeOpacity=".6" />
            <polygon points="470,400 300,330 380,620" fill="url(#gGoldDeep)" stroke="#F5C879" strokeOpacity=".4" />
            <polygon points="300,330 240,640 310,690" fill="url(#gGold)" stroke="#FFF3D6" strokeOpacity=".4" />
            <polygon points="300,330 310,690 380,620" fill="url(#gNight)" stroke="#00E5FF" strokeOpacity=".5" />
            {/* specular highlights */}
            <polygon points="300,40 235,135 300,150" fill="#fff" opacity=".28" stroke="none" />
            <polygon points="430,210 360,255 440,260" fill="#fff" opacity=".14" stroke="none" />
            {/* neon rim light along fracture edges */}
            <polyline points="300,40 430,210 470,400" fill="none" stroke="#00E5FF" strokeWidth="2" opacity=".85" />
            <polyline points="170,230 120,420 240,640" fill="none" stroke="#FF2DAA" strokeWidth="2" opacity=".8" />
          </g>
        </svg>
      </div>

      {/* front: floating shards */}
      <div className="px-c absolute inset-0">
        <svg viewBox="0 0 600 720" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
          {shards.map(([x, y, s, r, fill, d, dur], i) => (
            <polygon key={i} points={tri(x, y, s)} fill={fill} stroke="#fff" strokeOpacity=".25" strokeWidth=".8" className="shard" style={{ animationDelay: `${d}s`, animationDuration: `${dur}s`, rotate: `${r}deg` }} />
          ))}
        </svg>
      </div>

      <span className="beam left-[10%] top-[38%] bg-gradient-to-r from-transparent via-neon to-transparent" />
      <span className="beam left-[30%] top-[62%] bg-gradient-to-r from-transparent via-magenta to-transparent" style={{ animationDelay: '2.5s' }} />
    </div>
  );
}
