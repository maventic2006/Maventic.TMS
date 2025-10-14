import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";

const ThemedSelect = ({ 
  value, 
  onValueChange, 
  options = [], 
  placeholder, 
  disabled = false,
  error = false,
  className = "" 
}) => {
  const baseClasses = "w-full px-3 py-2 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA500] focus:border-transparent transition-colors";
  const errorClasses = error ? "border-red-500" : "border-gray-300";
  const disabledClasses = disabled ? "bg-gray-100 cursor-not-allowed" : "";

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger 
        className={`${baseClasses} ${errorClasses} ${disabledClasses} ${className}`}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ThemedSelect;
