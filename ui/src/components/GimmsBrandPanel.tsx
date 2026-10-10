import { cn } from "@/lib/utils";

/**
 * Auth right-hand brand panel — the GIMMS badge ("Ceylon" wall sticker from
 * the brand assets) on a light brand wall, independent of the light/dark
 * theme so the badge always reads the way it was designed.
 */
export function GimmsBrandPanel({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "gimms-brand-panel relative flex h-full w-full items-center justify-center overflow-hidden",
        className,
      )}
    >
      <img
        src="/gimms/badge.svg"
        alt="GIMMS"
        className="gimms-badge-float relative w-[64%] max-w-[430px] drop-shadow-xl"
      />
    </div>
  );
}
