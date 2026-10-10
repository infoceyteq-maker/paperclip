import type { SVGProps } from "react";
import { cn } from "../lib/utils";
import { GIMMS_WAVE_OUTER_PATH } from "./gimms-paths";

export function AnimatedPaperclipIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 900 340"
      className={cn("paperclip-thinking-icon", className)}
      aria-hidden="true"
      {...props}
    >
      <path
        className="paperclip-thinking-icon-path"
        d={GIMMS_WAVE_OUTER_PATH}
        fill="none"
        stroke="currentColor"
        strokeWidth="48"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Full-page loading state: a large, centered, gray animated GIMMS wave. */
export function PaperclipLoading({ className }: { className?: string }) {
  return (
    <div
      role="status"
      className={cn("flex min-h-dvh w-full items-center justify-center", className)}
    >
      <AnimatedPaperclipIcon className="h-24 w-24 text-muted-foreground" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
