import React from "react";

export function Card({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-surface border border-borderc rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
