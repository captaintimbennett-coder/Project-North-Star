import type { ReactNode } from "react";

type MediaFrameProps = {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
};

export function MediaFrame({
  children,
  className = "",
  interactive = false,
}: MediaFrameProps) {
  return (
    <div
      className={`ds-media ${interactive ? "ds-media--interactive" : ""} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
