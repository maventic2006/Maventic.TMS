import React from "react";
import { Checkbox } from "../checkbox";

const ThemedCheckbox = ({ 
  checked, 
  onCheckedChange, 
  disabled = false,
  className = "" 
}) => {
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={`h-5 w-5 data-[state=checked]:bg-[#FFA500] data-[state=checked]:border-[#FFA500] border-gray-300 ${className}`}
    />
  );
};

export default ThemedCheckbox;
