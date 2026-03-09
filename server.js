require('dotenv').config();
const express = require('express');
const multer  = require('multer');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = process.env.KTM_PORT || process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const KAMPUS_LIST = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/kampus.json'), 'utf8'));
const STUDENTS    = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/students.json'), 'utf8'));

function strHash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
  return Math.abs(h);
}
function truncate(str, max) {
  if (!str) return '-';
  return str.length > max ? str.substring(0, max - 2) + '..' : str;
}
function generateNIM(year) {
  return String(year) + String(Math.floor(1000000 + Math.random() * 9000000));
}

// 10 avatar wajah built-in (embedded, tidak butuh file eksternal)
const FACES_ARR = [
  "<svg xmlns='http://www.w3.org/2000/svg' width='110' height='140' viewBox='0 0 110 140'>\n  <rect width='110' height='140' fill='#4f86c6' opacity='0.15'/>\n  <circle cx='55' cy='52' r='28' fill='#4f86c6'/>\n  <circle cx='55' cy='52' r='24' fill='#4f86c6' opacity='0.7'/>\n  <circle cx='46' cy='48' r='4' fill='white' opacity='0.9'/>\n  <circle cx='64' cy='48' r='4' fill='white' opacity='0.9'/>\n  <path d='M43 60 Q55 70 67 60' stroke='white' stroke-width='2.5' fill='none' stroke-linecap='round'/>\n  <ellipse cx='55' cy='105' rx='32' ry='22' fill='#4f86c6' opacity='0.6'/>\n  <text x='55' y='133' font-size='9' text-anchor='middle' fill='#4f86c6' font-family='Arial' opacity='0.8'>MAHASISWA</text>\n</svg>",
  "<svg xmlns='http://www.w3.org/2000/svg' width='110' height='140' viewBox='0 0 110 140'>\n  <rect width='110' height='140' fill='#e07b54' opacity='0.15'/>\n  <circle cx='55' cy='52' r='28' fill='#e07b54'/>\n  <circle cx='55' cy='52' r='24' fill='#e07b54' opacity='0.7'/>\n  <circle cx='46' cy='48' r='4' fill='white' opacity='0.9'/>\n  <circle cx='64' cy='48' r='4' fill='white' opacity='0.9'/>\n  <path d='M43 60 Q55 70 67 60' stroke='white' stroke-width='2.5' fill='none' stroke-linecap='round'/>\n  <ellipse cx='55' cy='105' rx='32' ry='22' fill='#e07b54' opacity='0.6'/>\n  <text x='55' y='133' font-size='9' text-anchor='middle' fill='#e07b54' font-family='Arial' opacity='0.8'>MAHASISWA</text>\n</svg>",
  "<svg xmlns='http://www.w3.org/2000/svg' width='110' height='140' viewBox='0 0 110 140'>\n  <rect width='110' height='140' fill='#5ba55b' opacity='0.15'/>\n  <circle cx='55' cy='52' r='28' fill='#5ba55b'/>\n  <circle cx='55' cy='52' r='24' fill='#5ba55b' opacity='0.7'/>\n  <circle cx='46' cy='48' r='4' fill='white' opacity='0.9'/>\n  <circle cx='64' cy='48' r='4' fill='white' opacity='0.9'/>\n  <path d='M43 60 Q55 70 67 60' stroke='white' stroke-width='2.5' fill='none' stroke-linecap='round'/>\n  <ellipse cx='55' cy='105' rx='32' ry='22' fill='#5ba55b' opacity='0.6'/>\n  <text x='55' y='133' font-size='9' text-anchor='middle' fill='#5ba55b' font-family='Arial' opacity='0.8'>MAHASISWA</text>\n</svg>",
  "<svg xmlns='http://www.w3.org/2000/svg' width='110' height='140' viewBox='0 0 110 140'>\n  <rect width='110' height='140' fill='#9b59b6' opacity='0.15'/>\n  <circle cx='55' cy='52' r='28' fill='#9b59b6'/>\n  <circle cx='55' cy='52' r='24' fill='#9b59b6' opacity='0.7'/>\n  <circle cx='46' cy='48' r='4' fill='white' opacity='0.9'/>\n  <circle cx='64' cy='48' r='4' fill='white' opacity='0.9'/>\n  <path d='M43 60 Q55 70 67 60' stroke='white' stroke-width='2.5' fill='none' stroke-linecap='round'/>\n  <ellipse cx='55' cy='105' rx='32' ry='22' fill='#9b59b6' opacity='0.6'/>\n  <text x='55' y='133' font-size='9' text-anchor='middle' fill='#9b59b6' font-family='Arial' opacity='0.8'>MAHASISWA</text>\n</svg>",
  "<svg xmlns='http://www.w3.org/2000/svg' width='110' height='140' viewBox='0 0 110 140'>\n  <rect width='110' height='140' fill='#e74c3c' opacity='0.15'/>\n  <circle cx='55' cy='52' r='28' fill='#e74c3c'/>\n  <circle cx='55' cy='52' r='24' fill='#e74c3c' opacity='0.7'/>\n  <circle cx='46' cy='48' r='4' fill='white' opacity='0.9'/>\n  <circle cx='64' cy='48' r='4' fill='white' opacity='0.9'/>\n  <path d='M43 60 Q55 70 67 60' stroke='white' stroke-width='2.5' fill='none' stroke-linecap='round'/>\n  <ellipse cx='55' cy='105' rx='32' ry='22' fill='#e74c3c' opacity='0.6'/>\n  <text x='55' y='133' font-size='9' text-anchor='middle' fill='#e74c3c' font-family='Arial' opacity='0.8'>MAHASISWA</text>\n</svg>",
  "<svg xmlns='http://www.w3.org/2000/svg' width='110' height='140' viewBox='0 0 110 140'>\n  <rect width='110' height='140' fill='#1abc9c' opacity='0.15'/>\n  <circle cx='55' cy='52' r='28' fill='#1abc9c'/>\n  <circle cx='55' cy='52' r='24' fill='#1abc9c' opacity='0.7'/>\n  <circle cx='46' cy='48' r='4' fill='white' opacity='0.9'/>\n  <circle cx='64' cy='48' r='4' fill='white' opacity='0.9'/>\n  <path d='M43 60 Q55 70 67 60' stroke='white' stroke-width='2.5' fill='none' stroke-linecap='round'/>\n  <ellipse cx='55' cy='105' rx='32' ry='22' fill='#1abc9c' opacity='0.6'/>\n  <text x='55' y='133' font-size='9' text-anchor='middle' fill='#1abc9c' font-family='Arial' opacity='0.8'>MAHASISWA</text>\n</svg>",
  "<svg xmlns='http://www.w3.org/2000/svg' width='110' height='140' viewBox='0 0 110 140'>\n  <rect width='110' height='140' fill='#f39c12' opacity='0.15'/>\n  <circle cx='55' cy='52' r='28' fill='#f39c12'/>\n  <circle cx='55' cy='52' r='24' fill='#f39c12' opacity='0.7'/>\n  <circle cx='46' cy='48' r='4' fill='white' opacity='0.9'/>\n  <circle cx='64' cy='48' r='4' fill='white' opacity='0.9'/>\n  <path d='M43 60 Q55 70 67 60' stroke='white' stroke-width='2.5' fill='none' stroke-linecap='round'/>\n  <ellipse cx='55' cy='105' rx='32' ry='22' fill='#f39c12' opacity='0.6'/>\n  <text x='55' y='133' font-size='9' text-anchor='middle' fill='#f39c12' font-family='Arial' opacity='0.8'>MAHASISWA</text>\n</svg>",
  "<svg xmlns='http://www.w3.org/2000/svg' width='110' height='140' viewBox='0 0 110 140'>\n  <rect width='110' height='140' fill='#2980b9' opacity='0.15'/>\n  <circle cx='55' cy='52' r='28' fill='#2980b9'/>\n  <circle cx='55' cy='52' r='24' fill='#2980b9' opacity='0.7'/>\n  <circle cx='46' cy='48' r='4' fill='white' opacity='0.9'/>\n  <circle cx='64' cy='48' r='4' fill='white' opacity='0.9'/>\n  <path d='M43 60 Q55 70 67 60' stroke='white' stroke-width='2.5' fill='none' stroke-linecap='round'/>\n  <ellipse cx='55' cy='105' rx='32' ry='22' fill='#2980b9' opacity='0.6'/>\n  <text x='55' y='133' font-size='9' text-anchor='middle' fill='#2980b9' font-family='Arial' opacity='0.8'>MAHASISWA</text>\n</svg>",
  "<svg xmlns='http://www.w3.org/2000/svg' width='110' height='140' viewBox='0 0 110 140'>\n  <rect width='110' height='140' fill='#8e44ad' opacity='0.15'/>\n  <circle cx='55' cy='52' r='28' fill='#8e44ad'/>\n  <circle cx='55' cy='52' r='24' fill='#8e44ad' opacity='0.7'/>\n  <circle cx='46' cy='48' r='4' fill='white' opacity='0.9'/>\n  <circle cx='64' cy='48' r='4' fill='white' opacity='0.9'/>\n  <path d='M43 60 Q55 70 67 60' stroke='white' stroke-width='2.5' fill='none' stroke-linecap='round'/>\n  <ellipse cx='55' cy='105' rx='32' ry='22' fill='#8e44ad' opacity='0.6'/>\n  <text x='55' y='133' font-size='9' text-anchor='middle' fill='#8e44ad' font-family='Arial' opacity='0.8'>MAHASISWA</text>\n</svg>",
  "<svg xmlns='http://www.w3.org/2000/svg' width='110' height='140' viewBox='0 0 110 140'>\n  <rect width='110' height='140' fill='#27ae60' opacity='0.15'/>\n  <circle cx='55' cy='52' r='28' fill='#27ae60'/>\n  <circle cx='55' cy='52' r='24' fill='#27ae60' opacity='0.7'/>\n  <circle cx='46' cy='48' r='4' fill='white' opacity='0.9'/>\n  <circle cx='64' cy='48' r='4' fill='white' opacity='0.9'/>\n  <path d='M43 60 Q55 70 67 60' stroke='white' stroke-width='2.5' fill='none' stroke-linecap='round'/>\n  <ellipse cx='55' cy='105' rx='32' ry='22' fill='#27ae60' opacity='0.6'/>\n  <text x='55' y='133' font-size='9' text-anchor='middle' fill='#27ae60' font-family='Arial' opacity='0.8'>MAHASISWA</text>\n</svg>"
];

function getAvatarDataUri(seed) {
  const idx = strHash(seed || 'student') % FACES_ARR.length;
  return 'data:image/svg+xml;base64,' + Buffer.from(FACES_ARR[idx]).toString('base64');
}

function generateBarcode(nim, x, y) {
  let bars = '', xPos = x;
  for (let i = 0; i < nim.length * 8; i++) {
    const code = nim.charCodeAt(i % nim.length);
    const bit  = (code >> (i % 8)) & 1;
    const w    = bit ? 3 : 2;
    const h    = 35 + (i % 3) * 4;
    if (i % 5 !== 4) bars += `<rect x="${xPos}" y="${y}" width="${w}" height="${h}" fill="#e0e0ff"/>`;
    xPos += w + 1;
    if (xPos > x + 330) break;
  }
  bars += `<text x="${x+165}" y="${y+52}" font-family="Courier New,monospace" font-size="10" fill="rgba(255,255,255,0.7)" text-anchor="middle" letter-spacing="2">${nim}</text>`;
  return bars;
}

function generateKTMSvg({ university, name, nim, faculty, major, jenjang, year }, photoUri) {
  const validYear = (parseInt(year) || new Date().getFullYear()) + 4;
  const rows = [
    { label: 'Nama Mahasiswa', value: truncate(name    || '-', 38) },
    { label: 'NIM',            value: nim     || '-' },
    { label: 'Fakultas',       value: truncate(faculty || '-', 38) },
    { label: 'Program Studi',  value: truncate(major   || '-', 38) },
    { label: 'Jenjang',        value: jenjang || 'S1' },
    { label: 'Angkatan',       value: String(year || new Date().getFullYear()) },
    { label: 'Berlaku s/d',    value: String(validYear) },
  ];

  let rowsSvg = '';
  rows.forEach(({ label, value }, i) => {
    const y = 198 + i * 44;
    rowsSvg += `
      <text x="310" y="${y}" font-family="Arial,sans-serif" font-size="11.5" fill="#78909c">${label}</text>
      <text x="460" y="${y}" font-family="Arial,sans-serif" font-size="11.5" fill="#78909c">:</text>
      <text x="472" y="${y}" font-family="Arial,sans-serif" font-size="13" fill="${i<2?'#1a237e':'#2c3e50'}" font-weight="${i<2?'bold':'normal'}">${value}</text>
      ${i < rows.length-1 ? `<line x1="300" y1="${y+13}" x2="975" y2="${y+13}" stroke="#ecf0f1" stroke-width="1"/>` : ''}`;
  });

  let dots = '';
  for (let xi=0;xi<21;xi++) for (let yi=0;yi<14;yi++)
    dots += `<circle cx="${30+xi*50}" cy="${25+yi*50}" r="1.2" fill="#c5cae9" opacity="0.35"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1011 638" width="1011" height="638">
  <defs>
    <linearGradient id="hdrG" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#1a237e"/>
      <stop offset="100%" style="stop-color:#3949ab"/>
    </linearGradient>
    <linearGradient id="sideG" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#1a237e"/>
      <stop offset="100%" style="stop-color:#0d1561"/>
    </linearGradient>
    <linearGradient id="footG" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#0d1561"/>
      <stop offset="100%" style="stop-color:#283593"/>
    </linearGradient>
    <clipPath id="pc"><rect x="60" y="126" width="170" height="214" rx="8"/></clipPath>
    <filter id="sh"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.15"/></filter>
  </defs>
  <rect width="1011" height="638" rx="18" fill="#f5f7ff"/>
  ${dots}
  <rect width="1011" height="92" rx="18" fill="url(#hdrG)"/>
  <rect y="74" width="1011" height="18" fill="url(#hdrG)"/>
  <rect y="92" width="1011" height="5" fill="#fbc02d"/>
  <circle cx="57" cy="46" r="34" fill="none" stroke="#fbc02d" stroke-width="2"/>
  <circle cx="57" cy="46" r="26" fill="none" stroke="rgba(251,192,45,0.4)" stroke-width="1"/>
  <circle cx="57" cy="46" r="14" fill="rgba(251,192,45,0.12)"/>
  <text x="57" y="38" font-family="serif" font-size="11" fill="#fbc02d" text-anchor="middle">*</text>
  <text x="57" y="51" font-family="Arial" font-size="8" fill="#fbc02d" text-anchor="middle" font-weight="bold">KTM</text>
  <text x="512" y="34" font-family="Arial,sans-serif" font-size="17" fill="#fbc02d" text-anchor="middle" font-weight="bold" letter-spacing="5">KARTU TANDA MAHASISWA</text>
  <text x="512" y="57" font-family="Arial,sans-serif" font-size="11" fill="rgba(255,255,255,0.75)" text-anchor="middle" letter-spacing="3">STUDENT IDENTITY CARD</text>
  <line x1="200" y1="68" x2="820" y2="68" stroke="rgba(251,192,45,0.35)" stroke-width="0.8"/>
  <rect x="940" y="20" width="54" height="18" rx="2" fill="#cc0000"/>
  <rect x="940" y="38" width="54" height="18" rx="2" fill="white"/>
  <rect x="0" y="97" width="290" height="541" fill="url(#sideG)"/>
  <circle cx="145" cy="530" r="130" fill="none" stroke="rgba(251,192,45,0.05)" stroke-width="40"/>
  <rect x="57" y="127" width="174" height="216" rx="10" fill="rgba(0,0,0,0.25)"/>
  <rect x="58" y="124" width="174" height="216" rx="10" fill="none" stroke="#fbc02d" stroke-width="2.5"/>
  <image href="${photoUri}" x="60" y="126" width="170" height="212" clip-path="url(#pc)" preserveAspectRatio="xMidYMid slice"/>
  <rect x="58" y="124" width="16" height="3" fill="#fbc02d"/><rect x="58" y="124" width="3" height="16" fill="#fbc02d"/>
  <rect x="216" y="124" width="16" height="3" fill="#fbc02d"/><rect x="229" y="124" width="3" height="16" fill="#fbc02d"/>
  <rect x="58" y="337" width="16" height="3" fill="#fbc02d"/><rect x="58" y="325" width="3" height="16" fill="#fbc02d"/>
  <rect x="216" y="337" width="16" height="3" fill="#fbc02d"/><rect x="229" y="325" width="3" height="16" fill="#fbc02d"/>
  <rect x="58" y="355" width="174" height="32" rx="8" fill="rgba(251,192,45,0.15)"/>
  <rect x="58" y="355" width="174" height="32" rx="8" fill="none" stroke="rgba(251,192,45,0.45)" stroke-width="1"/>
  <text x="145" y="376" font-family="Courier New,monospace" font-size="13" fill="#fbc02d" text-anchor="middle" letter-spacing="2" font-weight="bold">${nim||'-'}</text>
  <text x="145" y="430" font-family="Arial" font-size="8.5" fill="rgba(255,255,255,0.22)" text-anchor="middle">KEMENTERIAN PENDIDIKAN,</text>
  <text x="145" y="444" font-family="Arial" font-size="8.5" fill="rgba(255,255,255,0.22)" text-anchor="middle">KEBUDAYAAN, RISET DAN</text>
  <text x="145" y="458" font-family="Arial" font-size="8.5" fill="rgba(255,255,255,0.22)" text-anchor="middle">TEKNOLOGI REPUBLIK INDONESIA</text>
  <rect x="290" y="97" width="721" height="541" fill="white"/>
  <text x="640" y="148" font-family="Arial,sans-serif" font-size="20" fill="#1a237e" text-anchor="middle" font-weight="bold">${truncate(university||'UNIVERSITAS',42)}</text>
  <rect x="300" y="160" width="681" height="3" fill="#ecf0f1"/>
  <rect x="300" y="160" width="200" height="3" fill="#1a237e"/>
  <rect x="500" y="160" width="60" height="3" fill="#fbc02d"/>
  ${rowsSvg}
  <rect x="822" y="483" width="88" height="32" rx="8" fill="#27ae60" filter="url(#sh)"/>
  <text x="866" y="504" font-family="Arial" font-size="14" fill="white" text-anchor="middle" font-weight="bold" letter-spacing="1">AKTIF</text>
  <rect x="0" y="570" width="1011" height="68" rx="18" fill="url(#footG)"/>
  <rect y="570" width="1011" height="18" fill="url(#footG)"/>
  <rect y="570" width="1011" height="4" fill="#fbc02d"/>
  ${generateBarcode(nim||'0000000000',308,578)}
  <line x1="770" y1="608" x2="960" y2="608" stroke="rgba(255,255,255,0.45)" stroke-width="0.8"/>
  <text x="865" y="625" font-family="Arial" font-size="9" fill="rgba(255,255,255,0.55)" text-anchor="middle">Tanda Tangan Pejabat Berwenang</text>
  <rect width="1011" height="638" rx="18" fill="none" stroke="#c5cae9" stroke-width="1.5"/>
</svg>`;
}

app.post('/generate', upload.single('photo'), (req, res) => {
  try {
    const { university, name, nim, faculty, major, jenjang, year } = req.body;
    const photoUri = req.file
      ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
      : getAvatarDataUri(name || String(Date.now()));
    res.json({ svg: generateKTMSvg({ university, name, nim, faculty, major, jenjang, year }, photoUri) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/kampus-list', (req, res) => res.json(KAMPUS_LIST));

app.get('/random-student', (req, res) => {
  const s = STUDENTS[Math.floor(Math.random() * STUDENTS.length)];
  const uni = KAMPUS_LIST[Math.floor(Math.random() * KAMPUS_LIST.length)];
  res.json({ name: s.name, nim: generateNIM(new Date().getFullYear()), faculty: s.faculty, major: s.major, university: uni });
});

app.get('/health', (req, res) => res.json({ status: 'ok', kampus: KAMPUS_LIST.length, uptime: process.uptime() }));

app.listen(PORT, () => {
  console.log(`KTM Server port ${PORT} - ${KAMPUS_LIST.length} kampus`);
});
