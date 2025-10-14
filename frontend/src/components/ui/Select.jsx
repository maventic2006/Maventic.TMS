import React, { useState, useRef, useEffect } from "react";
import { clsx } from "clsx";
import { ChevronDown, Check } from "lucide-react";

const Select = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        className={clsx(
          "tms-input appearance-none pr-8 cursor-pointer",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
    </div>
  )
);

Select.displayName = "Select";

const SelectItem = React.forwardRef(
  ({ className, ...props }, ref) => (
    <option
      ref={ref}
      className={clsx("py-2", className)}
      {...props}
    />
  )
);

SelectItem.displayName = "SelectItem";

// StatusSelect component for filters
const StatusSelect = ({ value, onChange, options, placeholder = "Select status", className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className={clsx(
          "inline-flex items-center justify-between w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-w-[140px]",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={clsx(
          "ml-2 h-4 w-4 transition-transform duration-200",
          isOpen && "transform rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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
                  setIsOpen(false);
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
  SelectItem,
  StatusSelect
};
