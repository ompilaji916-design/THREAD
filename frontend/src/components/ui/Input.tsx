import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-textsub mb-1">{label}</label>}
      <input
        ref={ref}
        className={`w-full min-h-[44px] px-3 py-2 rounded-lg border ${error ? "border-danger" : "border-borderc"} bg-white text-textmain focus:outline-none focus:ring-2 focus:ring-accent/40 ${className}`}
        {...props}
      />
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";
