import { type InputHTMLAttributes } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

export default function Checkbox({ label, id, ...props }: CheckboxProps) {
  const checkboxId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label htmlFor={checkboxId} className="flex items-center gap-2 cursor-pointer select-none">
      <input
        id={checkboxId}
        type="checkbox"
        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        {...props}
      />
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  );
}