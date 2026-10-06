import React from "react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function EmptyState({ icon, title, message, ctaLabel, onCta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="text-gray-300 mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-textmain mb-1">{title}</h3>
      <p className="text-textmuted text-sm mb-4 max-w-sm">{message}</p>
      {ctaLabel && onCta && <Button onClick={onCta}>{ctaLabel}</Button>}
    </div>
  );
}
