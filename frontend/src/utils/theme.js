// Theme utilities following development guidelines

// Universal Colors
export const baseColors = {
  background: "#F5F7FA",
  card: "#FFFFFF",
  textPrimary: "#0D1A33",
  textSecondary: "#4A5568",
  inputBorderDefault: "#E5E7EB",
  inputFocusBorder: "#3B82F6",
  headerBg: "#0D1A33",
  headerText: "#FFFFFF",
  accentOrange: "#FFA500",
  accentTeal: "#14B8A6",
  error: "#DC2626",
  success: "#10B981",
  warning: "#F59E0B",
};

// Universal Typography
export const baseTypography = {
  fontFamily: "Inter, Poppins, system-ui, sans-serif",
  lineHeight: "1.5",
  weights: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  sizes: {
    xs: "12px",
    sm: "14px",
    base: "16px",
    lg: "18px",
    xl: "20px",
    "2xl": "24px",
    "3xl": "28px",
  },
};

// Universal Layout
export const baseLayout = {
  cardRadius: "12px",
  buttonRadius: "8px",
  pillRadius: "9999px",
  cardPadding: "24px",
  cardShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)",
  sectionGap: "24px",
  headerPadding: "24px",
  tabHeight: "48px",
  buttonHeight: "44px",
};

// Status Pills
export const statusPills = {
  active: { bg: "#D1FAE5", text: "#10B981" },
  inactive: { bg: "#FEE2E2", text: "#EF4444" },
  pending: { bg: "#FDE68A", text: "#92400E" },
  approved: { bg: "#D1FAE5", text: "#10B981" },
  rejected: { bg: "#FEE2E2", text: "#EF4444" },
  draft: { bg: "#E5E7EB", text: "#6B7280" },
};

// Transport Mode Colors
export const transportModes = {
  road: {
    bg: "#E0F2FE",
    text: "#0891B2",
    activeBg: "#14B8A6",
    activeText: "#FFFFFF",
    icon: "🚛",
  },
  rail: {
    bg: "#F3E8FF",
    text: "#7C3AED",
    activeBg: "#14B8A6",
    activeText: "#FFFFFF",
    icon: "🚂",
  },
  air: {
    bg: "#DBEAFE",
    text: "#1D4ED8",
    activeBg: "#14B8A6",
    activeText: "#FFFFFF",
    icon: "✈️",
  },
  sea: {
    bg: "#ECFCCB",
    text: "#65A30D",
    activeBg: "#14B8A6",
    activeText: "#FFFFFF",
    icon: "🚢",
  },
};

// Theme Implementation Helper
export const getTheme = (pageType) => {
  const baseTheme = {
    colors: baseColors,
    typography: baseTypography,
    layout: baseLayout,
    statusPills,
    transportModes,
  };

  switch (pageType) {
    case "create":
    case "form":
      return {
        ...baseTheme,
        colors: {
          ...baseColors,
          // Form-specific colors
          requiredText: "#DC2626",
          helpText: "#6B7280",
          tabBarBg: "#0D1A33",
          activeTabBg: "#FFFFFF",
          activeTabText: "#0D1A33",
          inactiveTabText: "#FFFFFF",
          primaryActionBg: "#14B8A6",
          primaryActionText: "#FFFFFF",
          secondaryActionBg: "#FFFFFF",
          secondaryActionText: "#0D1A33",
          clearActionBg: "#FFFFFF",
          clearActionText: "#0D1A33",
        },
      };
    default:
      return baseTheme;
  }
};

// Tailwind CSS class generator
export const generateTailwindClasses = (theme) => ({
  // Background colors
  primaryBg: `bg-[${theme.colors.background}]`,
  cardBg: `bg-[${theme.colors.card}]`,
  headerBg: `bg-[${theme.colors.headerBg}]`,

  // Text colors
  textPrimary: `text-[${theme.colors.textPrimary}]`,
  textSecondary: `text-[${theme.colors.textSecondary}]`,
  textHeader: `text-[${theme.colors.headerText}]`,
  textError: `text-[${theme.colors.error}]`,

  // Button colors
  btnPrimary: `bg-[${theme.colors.accentTeal}] text-white hover:bg-[${theme.colors.accentTeal}]/90`,
  btnSecondary: `bg-[${theme.colors.accentOrange}] text-white hover:bg-[${theme.colors.accentOrange}]/90`,
  btnClear: `bg-white text-[${theme.colors.textPrimary}] border border-gray-300 hover:bg-gray-50`,

  // Layout
  cardShadow: "shadow-[0px_2px_6px_rgba(0,0,0,0.05)]",
  cardRadius: "rounded-xl",
  buttonRadius: "rounded-lg",
  pillRadius: "rounded-full",

  // Transitions
  transition: "transition-all duration-200",

  // Form elements
  inputBorder: `border-[${theme.colors.inputBorderDefault}] focus:border-[${theme.colors.inputFocusBorder}]`,
  inputFocus: `focus:outline-none focus:ring-2 focus:ring-[${theme.colors.inputFocusBorder}]/20`,
});

// Component-specific theme utilities
export const getComponentTheme = (component) => {
  const theme = getTheme("create");

  switch (component) {
    case "transportModeCard":
      return {
        base: "bg-white rounded-lg border-2 border-gray-200 p-3 flex flex-col items-center gap-1 cursor-pointer transition-all duration-200 text-sm",
        active: `border-[${theme.colors.accentTeal}] bg-[${theme.colors.accentTeal}]/5`,
        inactive: "border-gray-200 hover:border-gray-300",
      };

    case "tabButton":
      return {
        base: "px-6 py-3 font-medium text-sm rounded-t-xl transition-all duration-200 flex items-center gap-2",
        active: `bg-white text-[${theme.colors.textPrimary}] border-b-2 border-transparent`,
        inactive: `bg-transparent text-[#9CA3AF] hover:bg-white/10 hover:text-white`,
      };

    case "actionButton":
      return {
        primary: `inline-flex items-center gap-2 px-4 py-2 bg-[${theme.colors.accentTeal}] text-white rounded-lg font-medium hover:bg-[${theme.colors.accentTeal}]/90 transition-colors duration-200`,
        secondary: `inline-flex items-center gap-2 px-4 py-2 bg-[${theme.colors.accentOrange}] text-white rounded-lg font-medium hover:bg-[${theme.colors.accentOrange}]/90 transition-colors duration-200`,
        clear: `inline-flex items-center gap-2 px-4 py-2 bg-white text-[${theme.colors.textPrimary}] border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200`,
      };

    case "statusPill":
      return {
        base: "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
        active: `bg-[${theme.statusPills.active.bg}] text-[${theme.statusPills.active.text}]`,
        inactive: `bg-[${theme.statusPills.inactive.bg}] text-[${theme.statusPills.inactive.text}]`,
      };

    default:
      return {};
  }
};
