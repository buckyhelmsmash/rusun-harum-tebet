import * as React from "react";
import { cn } from "@/lib/utils";

export const DetailCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden",
      className,
    )}
    {...props}
  />
));
DetailCard.displayName = "DetailCard";

export interface DetailCardHeaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: React.ReactNode;
  title: React.ReactNode;
  action?: React.ReactNode;
}

export const DetailCardHeader = React.forwardRef<
  HTMLDivElement,
  DetailCardHeaderProps
>(({ className, icon, title, action, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30",
      className,
    )}
    {...props}
  >
    <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
      {icon && <span className="text-blue-600 dark:text-blue-400">{icon}</span>}
      {title}
    </div>
    {action && <div>{action}</div>}
  </div>
));
DetailCardHeader.displayName = "DetailCardHeader";

export const DetailCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6", className)} {...props} />
));
DetailCardContent.displayName = "DetailCardContent";
