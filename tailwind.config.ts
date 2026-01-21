import type { Config } from "tailwindcss";

const config: Config = {
 

  /**
   * Tell Tailwind where to look for class names.
   * - `app/` and `pages/` cover Next.js routing modes
   * - `components/` is where shadcn/ui components typically live
   * - `src/` is included for projects using a src/ folder
   *
   * Keep this list as small as possible (performance + correct builds).
   */
  content: [
    "./app/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],

  theme: {
    /**
     * Container defaults that work well for dashboards/marketing pages.
     * You can remove if you don't use Tailwind's `container` class.
     */
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },

    extend: {
      /**
       * shadcn/ui uses CSS variables for color tokens.
       * These map Tailwind color utilities (bg-primary, text-foreground...)
       * to values defined in `globals.css` (e.g. --primary, --foreground).
       */
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        zone: {
          underweight: "hsl(var(--zone-underweight))",
          healthy: "hsl(var(--zone-healthy))",
          overweight: "hsl(var(--zone-overweight))",
          obese: "hsl(var(--zone-obese))",
          "obese-strong": "hsl(var(--zone-obese-strong))",
        },
      },

      /**
       * Keep radius consistent across the entire design system.
       * `--radius` is defined in your `globals.css`.
       * Example: small radius => --radius: 0.3rem;
       */
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      /**
       * Helpful keyframes used by shadcn components (accordion, collapsibles).
       * If you're using the shadcn accordion/collapsible components, keep these.
       */
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },

      /**
       * Animations referencing the above keyframes.
       */
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },

      boxShadow: {
        "2xs": "var(--shadow-2xs)",
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "2xl": "var(--shadow-2xl)",
      },

      fontFamily: {
        sans: ["var(--font-roboto)", "system-ui", "sans-serif"],
        serif: ["var(--font-libre)", "serif"],
        mono: ["var(--font-roboto-mono)", "monospace"],
      },
    },
  },

  /**
   * Plugins:
   * - tailwindcss-animate (or tw-animate-css depending on your setup) provides
   *   animation utilities used by some shadcn/ui components.
   *
   * If you're using `tw-animate-css`, you typically don't need this plugin.
   * If you're using `tailwindcss-animate`, enable it here.
   */
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("tailwindcss-animate"),
  ],
};

export default config;
