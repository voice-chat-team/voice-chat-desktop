import { cn } from "@/shared";
import type { PropsWithChildren, ReactNode } from "react";

type SettingsSectionProps = PropsWithChildren<{
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}>;

export const SettingsSection = ({
  title,
  description,
  action,
  className,
  children,
}: SettingsSectionProps) => {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-white/5 bg-zinc-900/50 p-5",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          {description && (
            <p className="text-sm text-zinc-400">{description}</p>
          )}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
};
