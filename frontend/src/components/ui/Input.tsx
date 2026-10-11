import { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({ label, error, id, ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full px-4 py-3 border rounded-lg outline-none transition
          ${error ? "border-red-400 focus:ring-2 focus:ring-red-300" : "border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"}
          ${props.readOnly || props.disabled ? "bg-slate-50 text-slate-500" : ""} ${props.disabled ? "cursor-not-allowed" : ""}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}