const b64 = (svg) => `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`

const avatarSVG = (role, bg1, bg2, emoji) => b64(`
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
    <radialGradient id="s" cx="50%" cy="38%" r="55%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.25)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" fill="url(#g)"/>
  <rect width="512" height="512" fill="url(#s)"/>
  <circle cx="256" cy="196" r="104" fill="${bg1}"/>
  <text x="256" y="276" font-family="Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif" font-size="120" text-anchor="middle">${emoji}</text>
  <text x="256" y="460" font-family="Verdana, sans-serif" font-size="40" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="3">${role}</text>
</svg>`)

const bannerSVG = (label, bg1, bg2, accent) => b64(`
<svg xmlns="http://www.w3.org/2000/svg" width="832" height="416" viewBox="0 0 832 416">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
  </defs>
  <rect width="832" height="416" fill="url(#g)"/>
  <g opacity="0.16" fill="#ffffff">
    <circle cx="90" cy="80" r="150"/>
    <circle cx="720" cy="340" r="190"/>
    <circle cx="600" cy="40" r="70"/>
    <circle cx="130" cy="360" r="60"/>
  </g>
  <g opacity="0.5">
    <polygon points="0,416 210,190 360,416" fill="#ffffff"/>
    <polygon points="320,416 520,170 700,416" fill="#ffffff"/>
    <polygon points="560,416 700,260 832,416" fill="#ffffff"/>
  </g>
  <rect x="0" y="300" width="832" height="116" fill="url(#g)" opacity="0.55"/>
  <text x="54" y="358" font-family="Georgia, serif" font-size="52" font-style="italic" fill="#ffffff" font-weight="bold">${label}</text>
  <line x1="58" y1="380" x2="330" y2="380" stroke="${accent}" stroke-width="6"/>
</svg>`)

export const AVATARS = [
  avatarSVG('MAGO', '#1e3a8a', '#0f172a', '🔮'),
  avatarSVG('GUERREIRO', '#b91c1c', '#450a0a', '⚔️'),
  avatarSVG('ARQUEIRO', '#16a34a', '#14532d', '🏹'),
  avatarSVG('CURANDEIRA', '#0d9488', '#134e4a', '✨'),
  avatarSVG('CAVALEIRA', '#ea580c', '#7c2d12', '🛡️'),
  avatarSVG('ROGUE', '#7c3aed', '#312e81', '🗡️'),
  avatarSVG('ARTISTA', '#be185d', '#500724', '🎭'),
  avatarSVG('HEROI', '#f59e0b', '#78350f', '⚡')
]

export const BANNERS = [
  bannerSVG('AUREX ANIME', '#0f172a', '#1e3a8a', '#38bdf8'),
  bannerSVG('MARATONA', '#4c1d95', '#0f172a', '#a78bfa'),
  bannerSVG('NEW EPISODES', '#7f1d1d', '#0f172a', '#f87171'),
  bannerSVG('TOP 10', '#134e4a', '#022c22', '#2dd4bf'),
  bannerSVG('VAMOS ASSISTIR', '#312e81', '#020617', '#818cf8'),
  bannerSVG('WATCHLIST', '#854d0e', '#1c1917', '#fbbf24')
]

export const DEFAULT_AVATAR = AVATARS[0]
export const DEFAULT_BANNER = BANNERS[0]

export const PLACEHOLDER = (label) =>
  b64(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" viewBox="0 0 400 560">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#171c30"/><stop offset="100%" stop-color="#0b0e1a"/>
  </linearGradient></defs>
  <rect width="400" height="560" fill="url(#g)"/>
  <text x="200" y="270" font-family="Segoe UI Emoji, sans-serif" font-size="80" text-anchor="middle">🖼️</text>
  <text x="200" y="330" font-family="Verdana, sans-serif" font-size="18" fill="#9aa3c0" text-anchor="middle">${label}</text>
</svg>`)