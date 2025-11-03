/**
 * TMS Application Theme Configuration
 * 
 * This file defines the complete design system for the TMS application.
 * All components MUST use these theme values - NO hardcoded colors allowed.
 * 
 * Organization:
 * - General Pages Theme (default for most pages)
 * - List Pages Theme (for list/table views)
 * - Tab Pages Theme (for tabbed interfaces)
 * - Component-specific themes
 * 
 * @author TMS Dev Team
 * @version 1.0.0
 */

// ============================================
// GENERAL PAGES THEME (DEFAULT)
// ============================================
export const generalPagesTheme = {
  // Color Palette
  colors: {
    // Background Colors
    primary: {
      background: "#F5F7FA",
      text: "#0D1A33",
    },
    
    card: {
      background: "#FFFFFF",
      border: "#E5E7EB",
      shadow: "0px 2px 6px rgba(0, 0, 0, 0.05)",
    },
    
    // Text Colors
    text: {
      primary: "#0D1A33",
      secondary: "#4A5568",
      disabled: "#9CA3AF",
    },
    
    // Header Colors
    header: {
      background: "#0D1A33",
      text: "#FFFFFF",
    },
    
    // Input Field Colors
    input: {
      background: "#FFFFFF",
      border: {
        default: "#E5E7EB",
        focus: "#3B82F6",
        error: "#DC2626",
      },
      text: "#0D1A33",
      placeholder: "#9CA3AF",
    },
    
    // Status Colors (Pills & Buttons)
    status: {
      pending: {
        background: "#FDE68A",
        text: "#92400E",
        border: "#FDE68A",
      },
      approve: {
        background: "#10B981",
        text: "#FFFFFF",
        border: "#10B981",
      },
      reject: {
        background: "transparent",
        text: "#DC2626",
        border: "#DC2626",
      },
      success: {
        background: "#D1FAE5",
        text: "#10B981",
        border: "#10B981",
      },
      warning: {
        background: "#FEF3C7",
        text: "#F59E0B",
        border: "#F59E0B",
      },
      error: {
        background: "#FEE2E2",
        text: "#DC2626",
        border: "#DC2626",
      },
      info: {
        background: "#DBEAFE",
        text: "#3B82F6",
        border: "#3B82F6",
      },
    },
    
    // Special Field Colors
    fields: {
      requested: {
        background: "#EFF6FF",
        border: "#BFDBFE",
        text: "#2563EB",
      },
      approved: {
        background: "#ECFDF5",
        border: "#A7F3D0",
        text: "#059669",
      },
    },
    
    // Button Colors
    button: {
      primary: {
        background: "#10B981",
        hover: "#059669",
        text: "#FFFFFF",
        border: "#10B981",
      },
      secondary: {
        background: "transparent",
        hover: "#F5F7FA",
        text: "#0D1A33",
        border: "#E5E7EB",
      },
      danger: {
        background: "transparent",
        hover: "#FEE2E2",
        text: "#DC2626",
        border: "#DC2626",
      },
    },
  },
  
  // Typography
  typography: {
    fontFamily: "Poppins, Inter, system-ui, sans-serif",
    fontSize: {
      mainTitle: "24px",
      mainTitleMobile: "20px",
      subtitle: "14px",
      sectionLabel: "12px",
      value: "14px",
      commentTimestamp: "12px",
      input: "14px",
      button: "14px",
      pill: "12px",
    },
    fontWeight: {
      regular: "400",
      medium: "500",
      semiBold: "600",
      bold: "700",
      extraBold: "800",
    },
    lineHeight: "1.5",
  },
  
  // Layout & Spacing
  layout: {
    header: {
      padding: "24px",
    },
    card: {
      borderRadius: "12px",
      padding: "24px",
      gap: "24px",
    },
    section: {
      gap: "24px",
    },
    grid: {
      columnGap: "24px",
      rowGap: "24px",
    },
  },
  
  // UI Elements
  ui: {
    input: {
      borderRadius: "8px",
      padding: "10px 14px",
      height: "40px",
    },
    button: {
      borderRadius: "8px",
      padding: "10px 16px",
      height: "40px",
    },
    pill: {
      borderRadius: "9999px",
      padding: "4px 12px",
    },
    commentBubble: {
      borderRadius: "12px",
      padding: "12px 16px",
      avatar: {
        background: "#0D1A33",
        text: "#FFFFFF",
      },
    },
    textarea: {
      borderRadius: "8px",
      padding: "12px 16px",
    },
  },
};

// ============================================
// LIST PAGES THEME
// ============================================
export const listPagesTheme = {
  colors: {
    primary: {
      background: "#F5F7FA",
      text: "#0D1A33",
    },
    
    card: {
      background: "#FFFFFF",
      border: "#E5E7EB",
      shadow: "0px 2px 6px rgba(0, 0, 0, 0.05)",
    },
    
    text: {
      primary: "#0D1A33",
      secondary: "#4A5568",
      disabled: "#9CA3AF",
    },
    
    header: {
      background: "#FFFFFF",
      text: "#0D1A33",
      border: "#E5E7EB",
    },
    
    table: {
      header: {
        background: "#F9FAFB",
        text: "#0D1A33",
        border: "#E5E7EB",
      },
      row: {
        background: "#FFFFFF",
        hover: "#F9FAFB",
        border: "#E5E7EB",
        text: "#0D1A33",
      },
      alternateRow: {
        background: "#FAFBFC",
      },
    },
    
    filter: {
      background: "#FFFFFF",
      border: "#E5E7EB",
      text: "#0D1A33",
    },
    
    search: {
      background: "#FFFFFF",
      border: "#E5E7EB",
      icon: "#9CA3AF",
    },
    
    pagination: {
      background: "#FFFFFF",
      border: "#E5E7EB",
      active: "#3B82F6",
      activeText: "#FFFFFF",
      text: "#0D1A33",
    },
    
    status: {
      active: {
        background: "#D1FAE5",
        text: "#10B981",
        border: "#10B981",
      },
      inactive: {
        background: "#FEE2E2",
        text: "#DC2626",
        border: "#DC2626",
      },
      pending: {
        background: "#FEF3C7",
        text: "#F59E0B",
        border: "#F59E0B",
      },
    },
    
    button: {
      primary: {
        background: "#10B981",
        hover: "#059669",
        text: "#FFFFFF",
      },
      secondary: {
        background: "transparent",
        hover: "#F5F7FA",
        text: "#0D1A33",
        border: "#E5E7EB",
      },
    },
  },
  
  typography: {
    fontFamily: "Poppins, Inter, system-ui, sans-serif",
    fontSize: {
      title: "24px",
      subtitle: "14px",
      tableHeader: "12px",
      tableCell: "14px",
      filter: "14px",
      pagination: "14px",
    },
    fontWeight: {
      regular: "400",
      medium: "500",
      semiBold: "600",
      bold: "700",
    },
    lineHeight: "1.5",
  },
  
  layout: {
    card: {
      borderRadius: "12px",
      padding: "24px",
    },
    table: {
      cellPadding: "12px 16px",
      headerPadding: "12px 16px",
    },
  },
};

// ============================================
// TAB PAGES THEME
// ============================================
export const tabPagesTheme = {
  colors: {
    primary: {
      background: "#F5F7FA",
      text: "#0D1A33",
    },
    
    card: {
      background: "#FFFFFF",
      border: "#E5E7EB",
      shadow: "0px 2px 6px rgba(0, 0, 0, 0.05)",
    },
    
    text: {
      primary: "#0D1A33",
      secondary: "#4A5568",
      disabled: "#9CA3AF",
    },
    
    tab: {
      container: {
        background: "#1E293B",
        border: "#1E293B",
      },
      active: {
        background: "#FFFFFF",
        text: "#0D1A33",
        border: "#FFFFFF",
      },
      inactive: {
        background: "transparent",
        text: "#F1F5F9",
        border: "transparent",
      },
      hover: {
        background: "#334155",
        text: "#F1F5F9",
      },
      error: {
        indicator: "#DC2626",
      },
    },
    
    content: {
      background: "#FFFFFF",
      border: "#E5E7EB",
    },
    
    button: {
      primary: {
        background: "#10B981",
        hover: "#059669",
        text: "#FFFFFF",
      },
      secondary: {
        background: "transparent",
        hover: "#F5F7FA",
        text: "#0D1A33",
        border: "#E5E7EB",
      },
    },
  },
  
  typography: {
    fontFamily: "Poppins, Inter, system-ui, sans-serif",
    fontSize: {
      title: "24px",
      tabLabel: "14px",
      content: "14px",
    },
    fontWeight: {
      regular: "400",
      medium: "500",
      semiBold: "600",
      bold: "700",
    },
    lineHeight: "1.5",
  },
  
  layout: {
    tab: {
      borderRadius: "12px",
      padding: "12px 24px",
      gap: "8px",
    },
    content: {
      borderRadius: "12px",
      padding: "24px",
    },
  },
};

// ============================================
// COMPONENT-SPECIFIC THEMES
// ============================================

export const componentThemes = {
  // Action Buttons (Create, Save, Cancel, etc.)
  actionButton: {
    primary: {
      background: "#10B981",
      hover: "#059669",
      text: "#FFFFFF",
      border: "#10B981",
      borderRadius: "8px",
      padding: "10px 20px",
      fontSize: "14px",
      fontWeight: "600",
    },
    secondary: {
      background: "transparent",
      hover: "#F5F7FA",
      text: "#0D1A33",
      border: "#E5E7EB",
      borderRadius: "8px",
      padding: "10px 20px",
      fontSize: "14px",
      fontWeight: "600",
    },
    danger: {
      background: "transparent",
      hover: "#FEE2E2",
      text: "#DC2626",
      border: "#DC2626",
      borderRadius: "8px",
      padding: "10px 20px",
      fontSize: "14px",
      fontWeight: "600",
    },
  },
  
  // Tab Buttons
  tabButton: {
    active: {
      background: "#FFFFFF",
      text: "#0D1A33",
      border: "#FFFFFF",
      borderRadius: "12px",
      padding: "12px 24px",
      fontSize: "14px",
      fontWeight: "600",
    },
    inactive: {
      background: "transparent",
      text: "#F1F5F9",
      border: "transparent",
      borderRadius: "12px",
      padding: "12px 24px",
      fontSize: "14px",
      fontWeight: "500",
    },
    hover: {
      background: "#334155",
      text: "#F1F5F9",
    },
    container: {
      background: "#1E293B",
      borderRadius: "12px",
      padding: "4px",
      gap: "8px",
    },
  },
  
  // Transport Mode Cards
  transportModeCard: {
    active: {
      background: "#ECFDF5",
      border: "#10B981",
      iconColor: "#10B981",
      textColor: "#059669",
      checkBackground: "#10B981",
      checkColor: "#FFFFFF",
    },
    inactive: {
      background: "#F9FAFB",
      border: "#E5E7EB",
      iconColor: "#9CA3AF",
      textColor: "#6B7280",
      checkBackground: "#FFFFFF",
      checkColor: "#D1D5DB",
    },
    hover: {
      border: "#10B981",
      shadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
    },
    borderRadius: "12px",
    padding: "16px",
  },
  
  // Status Pills
  statusPill: {
    active: {
      background: "#D1FAE5",
      text: "#10B981",
      border: "#10B981",
    },
    inactive: {
      background: "#FEE2E2",
      text: "#DC2626",
      border: "#DC2626",
    },
    pending: {
      background: "#FEF3C7",
      text: "#F59E0B",
      border: "#F59E0B",
    },
    approved: {
      background: "#D1FAE5",
      text: "#10B981",
      border: "#10B981",
    },
    rejected: {
      background: "#FEE2E2",
      text: "#DC2626",
      border: "#DC2626",
    },
    borderRadius: "9999px",
    padding: "4px 12px",
    fontSize: "12px",
    fontWeight: "600",
  },
  
  // Form Inputs
  formInput: {
    background: "#FFFFFF",
    border: {
      default: "#E5E7EB",
      focus: "#3B82F6",
      error: "#DC2626",
      success: "#10B981",
    },
    text: "#0D1A33",
    placeholder: "#9CA3AF",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "14px",
  },
  
  // Collapsible Sections
  collapsibleSection: {
    header: {
      background: "linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)",
      hover: "linear-gradient(135deg, #DCFCE7 0%, #D1FAE5 100%)",
      text: "#0D1A33",
      border: "#D1FAE5",
    },
    content: {
      background: "#FFFFFF",
      border: "#E5E7EB",
    },
    borderRadius: "12px",
    padding: "16px",
  },
};

// ============================================
// THEME SELECTOR UTILITY
// ============================================

/**
 * Get theme configuration based on page type
 * @param {'general' | 'list' | 'tab'} pageType - The type of page
 * @returns {Object} Theme configuration object
 */
export const getPageTheme = (pageType = 'general') => {
  switch (pageType) {
    case 'list':
      return listPagesTheme;
    case 'tab':
      return tabPagesTheme;
    case 'general':
    default:
      return generalPagesTheme;
  }
};

/**
 * Get component-specific theme
 * @param {string} componentName - The name of the component
 * @returns {Object} Component theme configuration
 */
export const getComponentTheme = (componentName) => {
  return componentThemes[componentName] || {};
};

/**
 * Generate Tailwind-compatible class names from theme
 * @param {Object} theme - Theme configuration object
 * @returns {Object} Object with Tailwind class names
 */
export const generateTailwindClasses = (theme) => ({
  // Background colors
  bgPrimary: `bg-[${theme.colors.primary.background}]`,
  bgCard: `bg-[${theme.colors.card.background}]`,
  bgHeader: `bg-[${theme.colors.header.background}]`,
  
  // Text colors
  textPrimary: `text-[${theme.colors.text.primary}]`,
  textSecondary: `text-[${theme.colors.text.secondary}]`,
  textHeader: `text-[${theme.colors.header.text}]`,
  
  // Border colors
  borderCard: `border-[${theme.colors.card.border}]`,
  borderInput: `border-[${theme.colors.input.border.default}]`,
  borderFocus: `focus:border-[${theme.colors.input.border.focus}]`,
  
  // Rounded corners
  roundedCard: `rounded-[${theme.layout.card.borderRadius}]`,
  roundedButton: `rounded-[${theme.ui.button.borderRadius}]`,
  roundedPill: `rounded-[${theme.ui.pill.borderRadius}]`,
  
  // Shadows
  shadowCard: `shadow-[${theme.colors.card.shadow}]`,
  
  // Transitions
  transition: "transition-all duration-200",
});

// ============================================
// CSS VARIABLE EXPORT
// ============================================

/**
 * Convert theme to CSS variables for runtime usage
 * @param {Object} theme - Theme configuration object
 * @returns {string} CSS variable declarations
 */
export const themeToCSSVariables = (theme) => {
  const flattenObject = (obj, prefix = '') => {
    return Object.keys(obj).reduce((acc, key) => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}-${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(acc, flattenObject(value, newKey));
      } else {
        acc[`--${newKey}`] = value;
      }
      
      return acc;
    }, {});
  };
  
  const variables = flattenObject(theme);
  return Object.entries(variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');
};

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
  general: generalPagesTheme,
  list: listPagesTheme,
  tab: tabPagesTheme,
  components: componentThemes,
  getPageTheme,
  getComponentTheme,
  generateTailwindClasses,
  themeToCSSVariables,
};
