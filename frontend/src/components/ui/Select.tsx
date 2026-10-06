import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = "", children, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-textsub mb-1">{label}</label>}
      <select
        ref={ref}
        className={`w-full min-h-[44px] px-3 py-2 rounded-lg border ${error ? "border-danger" : "border-borderc"} bg-white text-textmain focus:outline-none focus:ring-2 focus:ring-accent/40 ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  )
);
Select.displayName = "Select";
