import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Color palette from https://atlassian.design/foundations/color-new/color-palette-new/
        'DarkNeutral-100': '#101214',
        'DarkNeutral0': '#161A1D',
        'DarkNeutral100': '#1D2125',
        'DarkNeutral200': '#22272B',
        'DarkNeutral250': '#282E33',
        'DarkNeutral300': '#2C333A',
        'DarkNeutral350': '#38414A',
        'DarkNeutral400': '#454F59',
        'DarkNeutral500': '#596773',
        'DarkNeutral600': '#738496',
        'DarkNeutral700': '#8C9BAB',
        'DarkNeutral800': '#9FADBC',
        'DarkNeutral900': '#B6C2CF',
        'DarkNeutral1000': '#C7D1DB',
        'DarkNeutral1100': '#DEE4EA',
        'Purple300': '#B8ACF6',
        'Magenta600': '#CD519D',
        'Teal600': '#2898BD',
        'Red600': '#E2483D',
        'Lime600': '#6A9A23',
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config
