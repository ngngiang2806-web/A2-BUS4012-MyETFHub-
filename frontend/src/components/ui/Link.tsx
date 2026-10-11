import type { ReactNode } from "react";

interface LinkProps {
  children: ReactNode;
  onClick: () => void;
}

export default function Link({ children, onClick }: LinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
    >
      {children}
    </button>
  );
}