/** @type {import('tailwindcss').Config} 
import {join} from 'path'*/
import type { Config } from 'tailwindcss'

export default {
  content: ["./src/**/*.{html,js,tsx,ts,jsx}"],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-to-rd': 'linear-gradient(to bottom right, var(--tw-gradient-stops))',
      }
    },
  },
  variants: {
    extend: {
      textColor: ['group-hover'],
      backgroundColor: ['group-hover'], 

    },
  },
  plugins: [],
  important: true,
}satisfies Config;
