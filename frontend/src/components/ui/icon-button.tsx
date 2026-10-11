import type { ReactNode, ButtonHTMLAttributes } from "react";
import { ArrowRight } from "lucide-react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export default function IconButton({ children, className = "", ...props }: IconButtonProps) {
  return (
    <button
      className={`group relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-blue-500 px-6 py-3 text-sm font-semibold text-white cursor-pointer transition-all duration-300 ease-out hover:bg-blue-600 hover:pr-10 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      <span className="relative z-[1]">{children}</span>

      {/* Animated arrow */}
      <ArrowRight
        className="absolute right-3 w-4 h-4 stroke-white fill-none opacity-0 translate-x-[-8px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out"
      />
    </button>
  );
}