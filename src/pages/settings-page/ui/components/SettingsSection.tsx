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
        "flex flex-col gap-4 rounded-[12px] border border-border-subtle bg-surface-100 p-5",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base leading-[22px] font-semibold text-text-primary">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-text-muted">{description}</p>
          )}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
};
