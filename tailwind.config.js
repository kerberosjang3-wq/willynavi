/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        vfd: {
          glow: '#00ff88',
          mid:  '#00cc66',
          dim:  '#004422',
          bg:   '#030a07',
          bezel:'#0d1a0f',
        },
        lamp: {
          'green-on':  '#00ee00',
          'yellow-on': '#ffcc00',
          'red-on':    '#ff2200',
          off:         '#1c1c1c',
          housing:     '#2a2a2a',
        },
        panel: {
          dark:   '#0f0f14',
          medium: '#1a1a24',
          border: '#2e2e3e',
          chrome: '#8a8a9a',
        },
      },
      fontFamily: {
        vfd: ['"Share Tech Mono"', '"Courier New"', 'monospace'],
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        pulse_glow: {
          '0%, 100%': { textShadow: '0 0 8px #00ff88, 0 0 16px #00cc66' },
          '50%': { textShadow: '0 0 20px #00ff88, 0 0 40px #00cc66, 0 0 60px #008844' },
        },
        lamp_pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        flicker: 'flicker 0.6s ease-in-out infinite',
        pulse_glow: 'pulse_glow 2s ease-in-out infinite',
        lamp_pulse: 'lamp_pulse 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
