import type { SVGProps } from "react";
import {
  GIMMS_LOCKUP_VIEWBOX,
  GIMMS_LOCKUP_WAVE_DY,
  GIMMS_WAVE_PATH,
  GIMMS_WORDMARK_PATH,
} from "./gimms-paths";

interface GimmsLockupProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  decorative?: boolean;
  title?: string;
}

/**
 * The GIMMS lockup — "GIMMS" wordmark above the wave mark — generated from the
 * brand asset (`ui/public/gimms/lockup.svg`). Every path fills `currentColor`,
 * so the one geometry follows the theme the way the brand system expects.
 *
 * Size it with a height class (`h-14 w-auto`); width follows the aspect.
 */
export function GimmsLockup({
  decorative = false,
  title = "GIMMS",
  className,
  ...rest
}: GimmsLockupProps) {
  return (
    <svg
      {...rest}
      className={className}
      viewBox={GIMMS_LOCKUP_VIEWBOX}
      fill="currentColor"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : title}
      focusable="false"
    >
      <path d={GIMMS_WORDMARK_PATH} />
      <g transform={`translate(0 ${GIMMS_LOCKUP_WAVE_DY})`}>
        <path d={GIMMS_WAVE_PATH} fillRule="evenodd" />
      </g>
    </svg>
  );
}
