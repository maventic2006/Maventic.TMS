import React, {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
} from "react";
import { clsx } from "clsx";
import { ChevronDown, Check } from "lucide-react";

// Global context for managing dropdown state across all Select components
const GlobalDropdownContext = createContext();

// Global dropdown provider to manage which dropdown is open
const GlobalDropdownProvider = ({ children }) => {
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const openDropdown = (id) => {
    setOpenDropdownId(id);
  };

  const closeDropdown = () => {
    setOpenDropdownId(null);
  };

  const isDropdownOpen = (id) => {
    return openDropdownId === id;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close dropdown if clicked outside any dropdown
      const isInsideDropdown = event.target.closest(
        "[data-dropdown-container]"
      );
      if (!isInsideDropdown) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
    const { isOpen, setIsOpen, disabled } = useContext(SelectContext);

    return (
      <button
        ref={ref}
        type="button"
        className={clsx(
          "flex h-9 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFA500] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
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

// Select Content
const SelectContent = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    const { isOpen } = useContext(SelectContext);
    const contentRef = useRef(null);
    const [position, setPosition] = useState({ top: "100%", bottom: "auto" });

    useEffect(() => {
      if (isOpen && contentRef.current) {
        const rect = contentRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.top;
        const spaceAbove = rect.top;

        // If there's not enough space below and more space above, open upward
        if (spaceBelow < 200 && spaceAbove > spaceBelow) {
          setPosition({ bottom: "100%", top: "auto" });
        } else {
          setPosition({ top: "100%", bottom: "auto" });
        }
      }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
      <div
        ref={(node) => {
          if (ref) {
            if (typeof ref === "function") ref(node);
            else ref.current = node;
          }
          contentRef.current = node;
        }}
        className={clsx(
          "absolute z-[9999] mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm",
          className
        )}
        style={position}
        {...props}
      >
        {children}
      </div>
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
          "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100",
          isSelected && "bg-gray-100",
          className
        )}
        onClick={() => handleValueChange(value)}
        {...props}
      >
        {children}
        {isSelected && <Check className="ml-auto h-4 w-4" />}
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
}) => {
  const globalDropdownContext = useContext(GlobalDropdownContext);
  const dropdownId = useRef(Math.random().toString(36).substr(2, 9)).current;
  const dropdownRef = useRef(null);
  const contentRef = useRef(null);
  const [position, setPosition] = useState({ top: "100%", bottom: "auto" });

  const isOpen = globalDropdownContext?.isDropdownOpen(dropdownId) || false;

  const setIsOpen = (open) => {
    if (!globalDropdownContext) return;

    if (open) {
      globalDropdownContext.openDropdown(dropdownId);
    } else {
      globalDropdownContext.closeDropdown();
    }
  };

  useEffect(() => {
    if (isOpen && contentRef.current) {
      const rect = contentRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.top;
      const spaceAbove = rect.top;

      // If there's not enough space below and more space above, open upward
      if (spaceBelow < 200 && spaceAbove > spaceBelow) {
        setPosition({ bottom: "100%", top: "auto" });
      } else {
        setPosition({ top: "100%", bottom: "auto" });
      }
    }
  }, [isOpen]);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className="relative" ref={dropdownRef} data-dropdown-container>
      <button
        type="button"
        className={clsx(
          "inline-flex items-center justify-between w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-w-[140px]",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-500"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={clsx(
            "ml-2 h-4 w-4 transition-transform duration-200",
            isOpen && "transform rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          ref={contentRef}
          className="absolute z-[9999] mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          style={position}
        >
          <div className="py-1 max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={clsx(
                  "block w-full px-4 py-2 text-left text-sm hover:bg-gray-100",
                  value === option.value
                    ? "bg-blue-50 text-blue-900 font-medium"
                    : "text-gray-700"
                )}
                onClick={() => {
                  onChange(option.value);
                  globalDropdownContext?.closeDropdown();
                }}
              >
                <div className="flex items-center justify-between">
                  <span>{option.label}</span>
                  {value === option.value && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
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
  GlobalDropdownProvider,
};
