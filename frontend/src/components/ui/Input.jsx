import React from "react";
import { clsx } from "clsx";

const Input = React.forwardRef(
  ({ className, type = "text", error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={clsx(
            "tms-input",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={clsx(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";

const FormField = ({ label, error, children, required = false }) => {
  return (
    <div className="space-y-2">
      {label && (
        <Label>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

const Textarea = React.forwardRef(({ className, error, ...props }, ref) => {
  return (
    <div className="w-full">
      <textarea
        className={clsx(
          "tms-input min-h-[80px] resize-none",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
});

Textarea.displayName = "Textarea";

export { Input, Label, FormField, Textarea };
