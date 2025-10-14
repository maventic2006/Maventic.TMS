import React from "react";
import { Switch } from "../switch";

const ThemedSwitch = ({ 
  checked, 
  onCheckedChange, 
  disabled = false,
  className = "" 
}) => {
  return (
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={`data-[state=checked]:bg-[#FFA500] ${className}`}
    />
  );
};

export default ThemedSwitch;
