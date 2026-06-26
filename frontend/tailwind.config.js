/** @type {import('tailwindcss').Config} */
//
// tailwind.config.js — Palette Indigo Premium
// ----------------------------------------------------------------------------
// Toutes les couleurs sont exposées sous forme de variables CSS afin de
// pouvoir basculer automatiquement entre le thème clair et le thème sombre
// via la classe `.dark` posée sur <html>.
//
// Les variables CSS sont définies dans `src/index.css` (sections :root et .dark).
// ----------------------------------------------------------------------------
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      // ── Couleurs (Material Design 3 tokens, pilotées par CSS vars) ───────
      colors: {
        // Primary — Indigo
        primary:               'var(--color-primary)',
        'on-primary':          'var(--color-on-primary)',
        'primary-container':   'var(--color-primary-container)',
        'on-primary-container':'var(--color-on-primary-container)',
        'primary-fixed':       'var(--color-primary-fixed)',
        'primary-fixed-dim':   'var(--color-primary-fixed-dim)',
        'on-primary-fixed':    'var(--color-on-primary-fixed)',
        'on-primary-fixed-variant': 'var(--color-on-primary-fixed-variant)',

        // Secondary — Cyan (accent)
        secondary:             'var(--color-secondary)',
        'on-secondary':        'var(--color-on-secondary)',
        'secondary-container': 'var(--color-secondary-container)',
        'on-secondary-container':'var(--color-on-secondary-container)',
        'secondary-fixed':     'var(--color-secondary-fixed)',
        'secondary-fixed-dim': 'var(--color-secondary-fixed-dim)',
        'on-secondary-fixed':  'var(--color-on-secondary-fixed)',
        'on-secondary-fixed-variant': 'var(--color-on-secondary-fixed-variant)',

        // Tertiary — Violet
        tertiary:              'var(--color-tertiary)',
        'on-tertiary':         'var(--color-on-tertiary)',
        'tertiary-container':  'var(--color-tertiary-container)',
        'on-tertiary-container':'var(--color-on-tertiary-container)',
        'tertiary-fixed':      'var(--color-tertiary-fixed)',
        'tertiary-fixed-dim':  'var(--color-tertiary-fixed-dim)',
        'on-tertiary-fixed':   'var(--color-on-tertiary-fixed)',
        'on-tertiary-fixed-variant': 'var(--color-on-tertiary-fixed-variant)',

        // Error
        error:                 'var(--color-error)',
        'on-error':            'var(--color-on-error)',
        'error-container':     'var(--color-error-container)',
        'on-error-container':  'var(--color-on-error-container)',

        // Surface
        surface:               'var(--color-surface)',
        'on-surface':          'var(--color-on-surface)',
        'on-surface-variant':  'var(--color-on-surface-variant)',
        'surface-dim':         'var(--color-surface-dim)',
        'surface-bright':      'var(--color-surface-bright)',
        'surface-container-lowest': 'var(--color-surface-container-lowest)',
        'surface-container-low':    'var(--color-surface-container-low)',
        'surface-container':        'var(--color-surface-container)',
        'surface-container-high':   'var(--color-surface-container-high)',
        'surface-container-highest':'var(--color-surface-container-highest)',
        'surface-variant':     'var(--color-surface-variant)',

        // Outline
        outline:               'var(--color-outline)',
        'outline-variant':     'var(--color-outline-variant)',

        // Inverse
        'inverse-surface':     'var(--color-inverse-surface)',
        'inverse-on-surface':  'var(--color-inverse-on-surface)',
        'inverse-primary':     'var(--color-inverse-primary)',

        // Misc
        scrim:                 'var(--color-scrim)',
        shadow:                'var(--color-shadow)',
      },

      // ── Typographie ──────────────────────────────────────────────────────
      fontFamily: {
        headline: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        label:    ['"Jost"', '"Inter"', 'system-ui', 'sans-serif'],
        body:     ['"Jost"', '"Inter"', 'system-ui', 'sans-serif'],
        display:  ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },

      // font-{family}-{size} combinés : font-headline-lg, font-label-md, etc.
      // On utilise fontSize pour exposer les tailles nommées.
      fontSize: {
        'display-lg':   ['40px', { lineHeight: '1.1',  letterSpacing: '-0.02em' }],
        'display-md':   ['32px', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-sm':   ['24px', { lineHeight: '1.2',  letterSpacing: '-0.01em' }],
        'headline-lg':  ['28px', { lineHeight: '1.2',  letterSpacing: '-0.01em' }],
        'headline-md':  ['22px', { lineHeight: '1.3' }],
        'headline-sm':  ['18px', { lineHeight: '1.35' }],
        'label-lg':     ['16px', { lineHeight: '1.4',  letterSpacing: '0.02em' }],
        'label-md':     ['14px', { lineHeight: '1.4',  letterSpacing: '0.02em' }],
        'label-sm':     ['12px', { lineHeight: '1.4',  letterSpacing: '0.04em' }],
        'body-lg':      ['16px', { lineHeight: '1.6' }],
        'body-md':      ['14px', { lineHeight: '1.55' }],
        'body-sm':      ['12px', { lineHeight: '1.5' }],
      },

      // ── Spacing nommés (sm/md/lg/xl + utilitaires) ───────────────────────
      spacing: {
        sm:   '8px',
        md:   '16px',
        lg:   '24px',
        xl:   '32px',
        gutter:         '20px',
        'margin-desktop':'48px',
      },

      // ── Border radius ────────────────────────────────────────────────────
      borderRadius: {
        '4xl': '32px',
      },

      // ── Box shadows indigo-tintées ───────────────────────────────────────
      boxShadow: {
        'soft-indigo':  '0 4px 24px rgba(79, 70, 229, 0.08)',
        'glow-indigo':  '0 0 32px rgba(99, 102, 241, 0.25)',
        'card-indigo':  '0 18px 50px rgba(30, 27, 75, 0.10)',
      },

      // ── Animations ───────────────────────────────────────────────────────
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float1: {
          '0%, 100%': { transform: 'translate(0,0) rotate(0deg)' },
          '50%':      { transform: 'translate(30px,-40px) rotate(15deg)' },
        },
        float2: {
          '0%, 100%': { transform: 'translate(0,0) rotate(0deg)' },
          '50%':      { transform: 'translate(-40px,30px) rotate(-12deg)' },
        },
        float3: {
          '0%, 100%': { transform: 'translate(0,0) scale(1)' },
          '50%':      { transform: 'translate(20px,20px) scale(1.08)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        fadeInUp:      'fadeInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'float-1':     'float1 14s ease-in-out infinite',
        'float-2':     'float2 18s ease-in-out infinite',
        'float-3':     'float3 22s ease-in-out infinite',
        'gradient':    'gradientShift 12s ease infinite',
      },
    },
  },
  plugins: [],
};
