import type { ReactNode } from "react";
import clsx from "clsx";

type Props = {
  title?: string;
  subtitle?: string;
  className?: string;
  action?: ReactNode;
  children: ReactNode;
};

export function Card({ title, subtitle, className, action, children }: Props) {
  return (
    <section className={clsx("card p-5", className)}>
      {(title || subtitle || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title ? <h3 className="text-lg font-semibold text-white">{title}</h3> : null}
            {subtitle ? <p className="text-sm text-slate-400">{subtitle}</p> : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
