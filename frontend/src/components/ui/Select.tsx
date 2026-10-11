import { type SelectHTMLAttributes } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

export default function Select({ label, options, placeholder, error, id, ...props }: SelectProps) {
  const selectId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div>
      <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      <select
        id={selectId}
        className={`w-full px-4 py-3 border rounded-lg outline-none transition bg-white appearance-none
          ${error ? "border-red-400 focus:ring-2 focus:ring-red-300" : "border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}