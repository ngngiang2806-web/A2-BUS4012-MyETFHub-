import { type ButtonHTMLAttributes, type ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
}

const variantClasses: Record<string, string> = {
  primary: "bg-blue-500 hover:bg-blue-600 text-white shadow-sm",
  secondary: "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm",
  ghost: "text-blue-600 hover:text-blue-700 hover:bg-blue-50",
};

export default function Button({
  children,
  variant = "primary",
  fullWidth = true,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium rounded-lg px-6 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}