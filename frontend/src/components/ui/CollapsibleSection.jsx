import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

/**
 * Reusable Collapsible Section Component
 * @param {Object} props
 * @param {React.ReactNode} props.header - Header content (icon, title, subtitle)
 * @param {React.ReactNode} props.children - Content to be collapsed
 * @param {boolean} props.defaultOpen - Whether section is open by default
 * @param {string} props.gradientFrom - Starting gradient color
 * @param {string} props.gradientTo - Ending gradient color
 * @param {string} props.borderColor - Border color
 */
const CollapsibleSection = ({
  header,
  children,
  defaultOpen = false,
  gradientFrom = "blue-50/50",
  gradientTo = "indigo-50/50",
  borderColor = "blue-100/50",
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={`bg-gradient-to-r from-${gradientFrom} to-${gradientTo} rounded-2xl border border-${borderColor} overflow-hidden`}
    >
      {/* Clickable Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 hover:bg-white/20 transition-all duration-200 cursor-pointer group"
      >
        <div className="flex-1">{header}</div>

        {/* Chevron Icon */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="ml-4 flex-shrink-0"
        >
          <ChevronDown className="w-6 h-6 text-gray-600 group-hover:text-gray-800 transition-colors" />
        </motion.div>
      </button>

      {/* Collapsible Content with Animation */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-4 border-t border-gray-200/30">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollapsibleSection;
