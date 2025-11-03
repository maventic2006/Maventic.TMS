import { generalPagesTheme } from "./src/theme.config.js";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // TMS Theme Integration - All colors from theme.config.js
        primary: {
          background: generalPagesTheme.colors.primary.background,
          text: generalPagesTheme.colors.primary.text,
          accent: generalPagesTheme.colors.input.border.focus,
        },
        card: {
          background: generalPagesTheme.colors.card.background,
          border: generalPagesTheme.colors.card.border,
        },
        text: {
          primary: generalPagesTheme.colors.text.primary,
          secondary: generalPagesTheme.colors.text.secondary,
          disabled: generalPagesTheme.colors.text.disabled,
        },
        header: {
          background: generalPagesTheme.colors.header.background,
          text: generalPagesTheme.colors.header.text,
        },
        tab: {
          background: "#1E293B",
          active: {
            background: "#FFFFFF",
            text: "#0D1A33",
          },
          inactive: {
            text: "#F1F5F9",
          },
        },
        input: {
          background: generalPagesTheme.colors.input.background,
          border: generalPagesTheme.colors.input.border.default,
          focus: generalPagesTheme.colors.input.border.focus,
          error: generalPagesTheme.colors.input.border.error,
          placeholder: generalPagesTheme.colors.input.placeholder,
        },
        status: {
          success: {
            background: generalPagesTheme.colors.status.success.background,
            text: generalPagesTheme.colors.status.success.text,
          },
          warning: {
            background: generalPagesTheme.colors.status.warning.background,
            text: generalPagesTheme.colors.status.warning.text,
          },
          error: {
            background: generalPagesTheme.colors.status.error.background,
            text: generalPagesTheme.colors.status.error.text,
          },
          pending: {
            background: generalPagesTheme.colors.status.pending.background,
            text: generalPagesTheme.colors.status.pending.text,
          },
          approve: {
            background: generalPagesTheme.colors.status.approve.background,
            text: generalPagesTheme.colors.status.approve.text,
          },
          reject: {
            text: generalPagesTheme.colors.status.reject.text,
            border: generalPagesTheme.colors.status.reject.border,
          },
        },
        button: {
          primary: {
            background: generalPagesTheme.colors.button.primary.background,
            hover: generalPagesTheme.colors.button.primary.hover,
            text: generalPagesTheme.colors.button.primary.text,
          },
          secondary: {
            background: generalPagesTheme.colors.button.secondary.background,
            hover: generalPagesTheme.colors.button.secondary.hover,
            text: generalPagesTheme.colors.button.secondary.text,
            border: generalPagesTheme.colors.button.secondary.border,
          },
          danger: {
            background: generalPagesTheme.colors.button.danger.background,
            hover: generalPagesTheme.colors.button.danger.hover,
            text: generalPagesTheme.colors.button.danger.text,
            border: generalPagesTheme.colors.button.danger.border,
          },
        },
        fields: {
          requested: {
            background: generalPagesTheme.colors.fields.requested.background,
            border: generalPagesTheme.colors.fields.requested.border,
            text: generalPagesTheme.colors.fields.requested.text,
          },
          approved: {
            background: generalPagesTheme.colors.fields.approved.background,
            border: generalPagesTheme.colors.fields.approved.border,
            text: generalPagesTheme.colors.fields.approved.text,
          },
        },
      },
      fontFamily: {
        sans: ["Poppins", "Inter", "system-ui", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },
      fontSize: {
        header: ["28px", { lineHeight: "1.2", fontWeight: "700" }],
        subtitle: ["14px", { lineHeight: "1.4", fontWeight: "600" }],
        body: ["14px", { lineHeight: "1.5", fontWeight: "500" }],
        pill: ["12px", { lineHeight: "1.3", fontWeight: "600" }],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
      borderRadius: {
        card: "12px",
        tab: "12px",
        button: "8px",
      },
      boxShadow: {
        card: "0px 4px 16px rgba(0, 0, 0, 0.04)",
        hover: "0px 8px 32px rgba(0, 0, 0, 0.12)",
        glow: "0 0 20px rgba(59, 130, 246, 0.3)",
        "xl-glow":
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 0 50px rgba(59, 130, 246, 0.2)",
      },
      animation: {
        slideDown: "slideDown 0.4s ease-out",
        fadeIn: "fadeIn 0.3s ease-out",
        float: "float 6s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite alternate",
        "bounce-slow": "bounce 3s infinite",
      },
      keyframes: {
        slideDown: {
          "0%": { transform: "translateY(-20px) scale(0.95)", opacity: "0" },
          "100%": { transform: "translateY(0) scale(1)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)" },
          "100%": { boxShadow: "0 0 30px rgba(59, 130, 246, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};
