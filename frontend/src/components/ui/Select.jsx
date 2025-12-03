import React, {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
} from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";
import { ChevronDown, Check, Search, X } from "lucide-react";

// Global context for managing dropdown state across all Select components
const GlobalDropdownContext = createContext();

// Global dropdown provider to manage which dropdown is open
// const GlobalDropdownProvider = ({ children }) => {
//   const [openDropdownId, setOpenDropdownId] = useState(null);

//   const openDropdown = (id) => {
//     setOpenDropdownId(id);
//   };

//   const closeDropdown = () => {
//     setOpenDropdownId(null);
//   };

//   const isDropdownOpen = (id) => {
//     return openDropdownId === id;
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       // Close dropdown if clicked outside any dropdown
//       const isInsideDropdown = event.target.closest(
//         "[data-dropdown-container]"
//       );
//       if (!isInsideDropdown) {
//         closeDropdown();
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   return (
//     <GlobalDropdownContext.Provider
//       value={{ openDropdown, closeDropdown, isDropdownOpen }}
//     >
//       {children}
//     </GlobalDropdownContext.Provider>
//   );
// };

const GlobalDropdownProvider = ({ children }) => {
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const openDropdown = (id) => setOpenDropdownId(id);
  const closeDropdown = () => setOpenDropdownId(null);
  const isDropdownOpen = (id) => openDropdownId === id;

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     const insideDropdown = event.target.closest("[data-dropdown-container]");
  //     const insideTrigger = event.target.closest("[data-dropdown-trigger]");

  //     // If NOT inside trigger AND NOT inside dropdown → close it
  //     if (!insideDropdown && !insideTrigger) {
  //       closeDropdown();
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, []);

  useEffect(() => {
    const handleClick = (e) => {
      const isTrigger = e.target.closest("[data-dropdown-trigger]");
      const isContainer = e.target.closest("[data-dropdown-container]");

      // Do NOT close if click is inside portal container
      if (isContainer) return;

      // Do NOT close if clicking on trigger (toggle handles this)
      if (isTrigger) return;

      closeDropdown();
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <GlobalDropdownContext.Provider
      value={{ openDropdown, closeDropdown, isDropdownOpen }}
    >
      {children}
    </GlobalDropdownContext.Provider>
  );
};

// Context for Select component
const SelectContext = createContext();

// Main Select component (shadcn/ui style)
const Select = ({ children, value, onValueChange, disabled, ...props }) => {
  const globalDropdownContext = useContext(GlobalDropdownContext);
  const dropdownId = useRef(Math.random().toString(36).substr(2, 9)).current;
  const triggerRef = useRef(null);
  const [selectedValue, setSelectedValue] = useState(value || "");

  const isOpen = globalDropdownContext?.isDropdownOpen(dropdownId) || false;

  const setIsOpen = (open) => {
    if (!globalDropdownContext) return;

    if (open && !disabled) {
      globalDropdownContext.openDropdown(dropdownId);
    } else {
      globalDropdownContext.closeDropdown();
    }
  };

  const handleValueChange = (newValue) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
    globalDropdownContext?.closeDropdown();
  };

  // Update selected value when prop changes
  useEffect(() => {
    setSelectedValue(value || "");
  }, [value]);

  return (
    <SelectContext.Provider
      value={{
        isOpen,
        setIsOpen,
        selectedValue,
        handleValueChange,
        disabled,
        dropdownId,
        triggerRef,
      }}
    >
      <div className="relative" data-dropdown-container>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

Select.displayName = "Select";

// Select Trigger
const SelectTrigger = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    const { isOpen, setIsOpen, disabled, triggerRef } =
      useContext(SelectContext);

    return (
      <button
        ref={(node) => {
          triggerRef.current = node;
          if (ref) {
            if (typeof ref === "function") ref(node);
            else ref.current = node;
          }
        }}
        type="button"
        className={clsx(
          "group flex h-12 w-full items-center justify-between rounded-xl border border-gray-200/60 bg-white/70 backdrop-blur-sm px-4 py-3 text-sm font-medium shadow-lg transition-all duration-300 hover:bg-white/90 hover:border-gray-300/80 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6]/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 hover:scale-[1.02] active:scale-[0.98]",
          isOpen &&
            "ring-2 ring-[#14B8A6]/30 border-[#14B8A6]/60 bg-white/95 shadow-xl scale-[1.02]",
          className
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        {...props}
      >
        {children}
        <ChevronDown
          className={clsx(
            "h-5 w-5 text-gray-400 group-hover:text-[#14B8A6] transition-all duration-300",
            isOpen && "rotate-180 text-[#14B8A6] scale-110"
          )}
        />
      </button>
    );
  }
);

SelectTrigger.displayName = "SelectTrigger";

// Select Value
const SelectValue = ({ placeholder, ...props }) => {
  const { selectedValue } = useContext(SelectContext);

  return <span className="block truncate">{selectedValue || placeholder}</span>;
};

SelectValue.displayName = "SelectValue";

// Portal component for dropdown content
// const DropdownPortal = ({ isOpen, triggerRef, children, className }) => {
//   const [position, setPosition] = useState({});
//   const contentRef = useRef(null);

//   useEffect(() => {
//     if (isOpen && triggerRef.current && contentRef.current) {
//       const triggerRect = triggerRef.current.getBoundingClientRect();
//       const contentRect = contentRef.current.getBoundingClientRect();
//       const viewportHeight = window.innerHeight;
//       const viewportWidth = window.innerWidth;
//       const scrollY = window.scrollY;
//       const scrollX = window.scrollX;

//       const spaceBelow = viewportHeight - triggerRect.bottom;
//       const spaceAbove = triggerRect.top;
//       const maxHeight = 240; // max-h-60 = 240px

//       let top, left, width;

//       // Position horizontally
//       left = triggerRect.left + scrollX;
//       width = triggerRect.width;

//       // Ensure dropdown doesn't go outside viewport horizontally
//       if (left + width > viewportWidth) {
//         left = viewportWidth - width - 16; // 16px padding from edge
//       }
//       if (left < 16) {
//         left = 16;
//         width = Math.min(width, viewportWidth - 32);
//       }

//       // Position vertically
//       if (spaceBelow >= maxHeight || spaceBelow > spaceAbove) {
//         // Open downward
//         top = triggerRect.bottom + scrollY + 4;
//       } else {
//         // Open upward
//         top = triggerRect.top + scrollY - maxHeight - 4;
//       }

//       setPosition({
//         position: "absolute",
//         top: `${top}px`,
//         left: `${left}px`,
//         width: `${width}px`,
//         zIndex: 99999,
//       });
//     }
//   }, [isOpen, triggerRef]);

//   if (!isOpen) return null;

//   return createPortal(
//     <div
//       ref={contentRef}
//       data-dropdown-container
//       className={clsx(
//         "max-h-72 overflow-y-auto overflow-x-hidden rounded-2xl border border-gray-200/60 bg-white/80 backdrop-blur-lg py-2 text-sm shadow-2xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-300",
//         className
//       )}
//       style={position}
//     >
//       {/* Modern glassmorphism background overlay */}
//       <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/70 to-white/90 backdrop-blur-lg rounded-2xl"></div>

//       <div className="relative p-2 space-y-1">{children}</div>
//     </div>,
//     document.body
//   );
// };

const DropdownPortal = ({
  isOpen,
  triggerRef,
  children,
  className,
  portalRef,
}) => {
  const [position, setPosition] = useState({});
  const contentRef = useRef(null);

  useEffect(() => {
    if (isOpen && triggerRef.current && contentRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      const maxHeight = 240;
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;

      let top, left, width;

      left = triggerRect.left + scrollX;
      width = triggerRect.width;

      if (left + width > viewportWidth) {
        left = viewportWidth - width - 16;
      }
      if (left < 16) {
        left = 16;
        width = Math.min(width, viewportWidth - 32);
      }

      if (spaceBelow >= maxHeight || spaceBelow > spaceAbove) {
        top = triggerRect.bottom + scrollY + 4;
      } else {
        top = triggerRect.top + scrollY - maxHeight - 4;
      }

      setPosition({
        position: "absolute",
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        zIndex: 99999,
      });
    }
  }, [isOpen, triggerRef]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={(node) => {
        contentRef.current = node;
        if (portalRef) {
          portalRef.current = node;
        }
      }}
      data-dropdown-container="true"
      className={clsx(
        "max-h-72 overflow-y-auto overflow-x-hidden rounded-2xl border border-gray-200/60 bg-white/80 backdrop-blur-lg py-2 text-sm shadow-2xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-300",
        className
      )}
      style={position}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/70 to-white/90 backdrop-blur-lg rounded-2xl"></div>

      <div className="relative p-2 space-y-1">{children}</div>
    </div>,
    document.body
  );
};

// Select Content
const SelectContent = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    const { isOpen, triggerRef } = useContext(SelectContext);

    return (
      <DropdownPortal
        isOpen={isOpen}
        triggerRef={triggerRef}
        className={className}
        {...props}
      >
        {children}
      </DropdownPortal>
    );
  }
);

SelectContent.displayName = "SelectContent";

// Select Item
const SelectItem = React.forwardRef(
  ({ className, children, value, ...props }, ref) => {
    const { handleValueChange, selectedValue } = useContext(SelectContext);
    const isSelected = selectedValue === value;

    return (
      <div
        ref={ref}
        className={clsx(
          "group relative flex cursor-pointer select-none items-center rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 hover:bg-gradient-to-r hover:from-[#14B8A6]/10 hover:to-[#0891B2]/10 focus:bg-gradient-to-r focus:from-[#14B8A6]/10 focus:to-[#0891B2]/10 active:scale-[0.98]",
          isSelected &&
            "bg-gradient-to-r from-[#14B8A6]/15 to-[#0891B2]/15 text-[#0D1A33] font-semibold shadow-sm",
          className
        )}
        onClick={() => handleValueChange(value)}
        {...props}
      >
        <span className="flex-1 truncate leading-relaxed">{children}</span>
        {isSelected && (
          <div className="ml-3 flex-shrink-0 w-5 h-5 bg-gradient-to-br from-[#14B8A6] to-[#0891B2] rounded-full flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}

        {/* Hover glow effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#14B8A6]/5 to-[#0891B2]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
      </div>
    );
  }
);

SelectItem.displayName = "SelectItem";

// StatusSelect component for filters
const StatusSelect = ({
  value,
  onChange,
  options,
  placeholder = "Select status",
  className,
  searchable = false,
}) => {
  const globalDropdownContext = useContext(GlobalDropdownContext);
  const dropdownId = useRef(Math.random().toString(36).substr(2, 9)).current;
  const triggerRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");

  const isOpen = globalDropdownContext?.isDropdownOpen(dropdownId) || false;

  const setIsOpen = (open) => {
    if (!globalDropdownContext) return;

    if (open) {
      globalDropdownContext.openDropdown(dropdownId);
      setSearchTerm("");
    } else {
      globalDropdownContext.closeDropdown();
      setSearchTerm("");
    }
  };

  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions =
    searchable && searchTerm
      ? options.filter((option) =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    globalDropdownContext?.closeDropdown();
    setSearchTerm("");
  };

  return (
    <div className="relative" data-dropdown-container>
      <button
        ref={triggerRef}
        type="button"
        className={clsx(
          "inline-flex items-center justify-between w-full rounded-lg border border-gray-200/80 shadow-sm px-3 py-2.5 bg-white/90 backdrop-blur-sm text-sm font-medium transition-all duration-200 hover:bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 min-w-[140px]",
          isOpen && "ring-2 ring-blue-500/20 border-blue-400 bg-white",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          className={clsx(
            "truncate",
            selectedOption ? "text-gray-900" : "text-gray-500"
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={clsx(
            "ml-2 h-4 w-4 transition-transform duration-200 flex-shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <DropdownPortal isOpen={isOpen} triggerRef={triggerRef}>
        {searchable && (
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

        <div className="max-h-48 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-4 text-sm text-gray-500 text-center">
              {searchTerm ? "No options found" : "No options available"}
            </div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={clsx(
                  "block w-full px-3 py-2.5 text-left text-sm transition-colors duration-150 hover:bg-blue-50/80 focus:bg-blue-50/80 active:bg-blue-100/80 rounded-md",
                  value === option.value
                    ? "bg-blue-50/60 text-blue-700 font-medium"
                    : "text-gray-700"
                )}
                onClick={() => handleSelect(option.value)}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{option.label}</span>
                  {value === option.value && (
                    <Check className="ml-2 h-4 w-4 text-blue-600 flex-shrink-0" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </DropdownPortal>
    </div>
  );
};

// Modern CustomSelect component for forms
const CustomSelect = ({
  value,
  onChange,
  onValueChange,
  options = [],
  placeholder = "Select an option",
  className,
  error,
  disabled,
  searchable = false,
  clearable = false,
  required = false,
  getOptionLabel,
  getOptionValue,
}) => {
  const globalDropdownContext = useContext(GlobalDropdownContext);
  const dropdownId = useRef(Math.random().toString(36).substr(2, 9)).current;
  const triggerRef = useRef(null);
  const searchInputRef = useRef(null); // 🔥 NEW REF
  const [searchTerm, setSearchTerm] = useState("");

  const isOpen = globalDropdownContext?.isDropdownOpen(dropdownId) || false;

  const setIsOpen = (open) => {
    if (!globalDropdownContext) return;

    if (open && !disabled) {
      globalDropdownContext.openDropdown(dropdownId);
      setSearchTerm("");
    } else {
      globalDropdownContext.closeDropdown();
      setSearchTerm("");
    }
  };

  // 🔥 AUTO-FOCUS SEARCH FIELD WHEN DROPDOWN OPENS
  useEffect(() => {
    if (isOpen && searchable) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 10);
    }
  }, [isOpen, searchable]);

  const extractLabel = (option) => {
    if (!option) return "";
    if (getOptionLabel) return getOptionLabel(option);
    if (typeof option === "object") return option.label || option.name || "";
    return String(option);
  };

  const extractValue = (option) => {
    if (!option) return "";
    if (getOptionValue) return getOptionValue(option);
    if (typeof option === "object")
      return option.value || option.id || option.code || option.isoCode || "";
    return option;
  };

  const selectedOption = options.find(
    (option) => extractValue(option) === value
  );

  const filteredOptions =
    searchable && searchTerm
      ? options.filter((option) =>
          extractLabel(option).toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;

  const handleSelect = (optionValue) => {
    if (onValueChange) onValueChange(optionValue);
    else if (onChange) onChange(optionValue);

    globalDropdownContext?.closeDropdown();
    setSearchTerm("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onValueChange) onValueChange("");
    else if (onChange) onChange("");
  };

  const getDisplayValue = () => {
    if (!value) return placeholder;
    if (selectedOption) return extractLabel(selectedOption);
    return value;
  };

  return (
    <div className="relative w-full" data-dropdown-container>
      <button
        ref={triggerRef}
        type="button"
        className={clsx(
          "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 border-gray-300",
          disabled
            ? "bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200"
            : error
            ? "border-red-300 bg-white hover:border-red-400 focus:border-red-500 focus:ring-red-500/20"
            : isOpen
            ? "border-blue-400 bg-white ring-2 ring-blue-500/20"
            : "border-gray-200/80 bg-white/90 backdrop-blur-sm hover:bg-white hover:border-gray-300 focus:border-blue-400 focus:ring-blue-500/20",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span
          className={clsx(
            "truncate text-left flex-1",
            value ? "text-gray-900" : "text-gray-500"
          )}
        >
          {getDisplayValue()}
        </span>

        <div className="flex items-center gap-1 ml-2">
          {clearable && value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          <ChevronDown
            className={clsx(
              "h-4 w-4 text-gray-400 transition-transform duration-200 flex-shrink-0",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </button>

      <DropdownPortal isOpen={isOpen} triggerRef={triggerRef}>
        {searchable && (
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef} // 🔥 AUTO-FOCUS TARGET
                type="text"
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

        <div className="max-h-48 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-4 text-sm text-gray-500 text-center">
              {searchTerm ? "No options found" : "No options available"}
            </div>
          ) : (
            filteredOptions.map((option, index) => {
              const optionValue = extractValue(option);
              const optionLabel = extractLabel(option);
              const isSelected = value === optionValue;

              return (
                <button
                  key={optionValue || index}
                  type="button"
                  className={clsx(
                    "block w-full px-3 py-2.5 text-left text-sm transition-colors duration-150 hover:bg-blue-50/80 focus:bg-blue-50/80 active:bg-blue-100/80 rounded-md",
                    isSelected
                      ? "bg-blue-50/60 text-blue-700 font-medium"
                      : "text-gray-700"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(optionValue);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{optionLabel}</span>
                    {isSelected && (
                      <Check className="ml-2 h-4 w-4 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </DropdownPortal>
    </div>
  );
};

const MultiSelect = ({
  value = [],
  onValueChange,
  options = [],
  placeholder = "Select options",
  className,
  error,
  disabled,
  searchable = false,
  getOptionLabel,
  getOptionValue,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const portalRef = useRef(null);

  // Click-outside detection - includes portal content
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both the trigger and the portal dropdown
      const isOutsideTrigger =
        dropdownRef.current && !dropdownRef.current.contains(event.target);
      const isOutsidePortal =
        portalRef.current && !portalRef.current.contains(event.target);

      if (isOutsideTrigger && isOutsidePortal) {
        setIsDropdownOpen(false);
        setSearchTerm("");
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isDropdownOpen]);

  const extractLabel = (option) => {
    if (!option) return "";
    if (getOptionLabel) return getOptionLabel(option);
    return option?.label || option?.name || option?.toString();
  };

  const extractValue = (option) => {
    if (!option) return "";
    if (getOptionValue) return getOptionValue(option);
    return option?.value || option?.id || option?.name || option.toString();
  };

  const filteredOptions =
    searchable && searchTerm
      ? options.filter((option) =>
          extractLabel(option).toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;

  // MULTI SELECT LOGIC — does NOT close dropdown
  const toggleSelection = (selectedValue) => {
    let updated = [];

    if (value.includes(selectedValue)) {
      updated = value.filter((v) => v !== selectedValue);
    } else {
      updated = [...value, selectedValue];
    }

    onValueChange(updated); // send full array back
  };

  const handleRemoveItem = (itemValue) => {
    const updated = value.filter((v) => v !== itemValue);
    onValueChange(updated);
  };

  // Get label for selected value
  const getSelectedLabel = (val) => {
    const option = options.find((opt) => extractValue(opt) === val);
    return option ? extractLabel(option) : val;
  };

  return (
    <div className="w-full" ref={dropdownRef}>
      {/* TRIGGER - Shows only placeholder or selected count */}
      <div
        ref={triggerRef}
        onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
        className={clsx(
          "w-full min-h-[38px] px-3 py-2 text-sm border rounded-lg cursor-pointer transition-colors",
          error
            ? "border-red-500 focus:border-red-500"
            : "border-[#E5E7EB] hover:border-[#3B82F6]",
          disabled && "opacity-50 cursor-not-allowed bg-gray-50",
          className
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-gray-400">{placeholder}</span>
          <ChevronDown
            className={clsx(
              "w-4 h-4 text-gray-400 transition-transform flex-shrink-0",
              isDropdownOpen && "transform rotate-180"
            )}
          />
        </div>
      </div>

      {/* DROPDOWN MENU - Using Portal */}
      <DropdownPortal
        isOpen={isDropdownOpen}
        triggerRef={triggerRef}
        portalRef={portalRef}
      >
        {/* Search Input */}
        {searchable && (
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* OPTIONS LIST */}
        <div className="overflow-y-auto max-h-48">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500 text-center">
              No options found
            </div>
          ) : (
            filteredOptions.map((option, index) => {
              const optionValue = extractValue(option);
              const optionLabel = extractLabel(option);
              const isSelected = value.includes(optionValue);

              return (
                <div
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelection(optionValue);
                  }}
                  className={clsx(
                    "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors",
                    isSelected
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "hover:bg-gray-50"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  {optionLabel}
                </div>
              );
            })
          )}
        </div>
      </DropdownPortal>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
          ⚠️ {error}
        </p>
      )}

      {/* SELECTED PILLS - Display below everything */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {value.map((val) => (
            <span
              key={val}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium"
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) handleRemoveItem(val);
              }}
            >
              {getSelectedLabel(val)}
              <X className="w-3 h-3 cursor-pointer hover:text-blue-900" />
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  StatusSelect,
  CustomSelect,
  GlobalDropdownProvider,
  MultiSelect,
};
