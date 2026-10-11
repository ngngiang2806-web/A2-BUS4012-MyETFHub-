import type { ReactNode } from "react";

interface FormSectionProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
}

export default function FormSection({ title, subtitle, icon, children }: FormSectionProps) {
  return (
    <section className="bg-ice rounded-xl border border-primary shadow-sm p-6">
      <div className="mb-5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {icon && <span className="text-navy">{icon}</span>}
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        </div>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}