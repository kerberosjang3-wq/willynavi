/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // ── 사이버 HUD 팔레트 ─────────────────────────────────────────────
        cyber: {
          bg:         '#080c14',
          surface:    '#0d1623',
          'surface-2':'#111d2e',
          border:     '#1a2d4a',
          'border-hi':'#1e3a5f',
          cyan:       '#00d4ff',
          'cyan-dim': '#003a55',
          'cyan-glow':'#0088bb',
          amber:      '#ff9d00',
          'amber-dim':'#3a2200',
          'amber-glow':'#cc7700',
        },
        gps:  { green: '#00ff88', dim: '#003322' },
        sig: {
          red:    '#ff3333',
          'red-glow':  '#cc0000',
          yellow: '#ffc107',
          'yellow-glow':'#cc9900',
          green:  '#00ee44',
          'green-glow': '#009933',
          off:    '#151f2e',
        },
        vfd: {
          glow: '#00d4ff',
          mid:  '#0099cc',
          dim:  '#00263a',
          bg:   '#060f1a',
        },
      },
      fontFamily: {
        vfd:     ['"Share Tech Mono"', '"Courier New"', 'monospace'],
        display: ['"Orbitron"', '"Share Tech Mono"', 'monospace'],
      },
      keyframes: {
        flicker: {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0.25' },
        },
        glow_pulse: {
          '0%,100%': { textShadow: '0 0 8px #00d4ff, 0 0 16px #0088bb' },
          '50%':     { textShadow: '0 0 20px #00d4ff, 0 0 40px #0099cc, 0 0 60px #006688' },
        },
        amber_pulse: {
          '0%,100%': { textShadow: '0 0 10px #ff9d00, 0 0 20px #cc7700' },
          '50%':     { textShadow: '0 0 24px #ff9d00, 0 0 48px #ff7700' },
        },
        lamp_on: {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0.7' },
        },
        dot_blink: {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%':     { opacity: '0.3', transform: 'scale(0.85)' },
        },
      },
      animation: {
        flicker:     'flicker 0.55s ease-in-out infinite',
        glow_pulse:  'glow_pulse 2.4s ease-in-out infinite',
        amber_pulse: 'amber_pulse 1.8s ease-in-out infinite',
        lamp_on:     'lamp_on 1s ease-in-out infinite',
        dot_blink:   'dot_blink 0.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
