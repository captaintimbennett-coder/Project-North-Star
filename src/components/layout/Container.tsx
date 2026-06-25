import type { ElementType, HTMLAttributes } from "react";

type ContainerProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
};

export function Container({
  as: Component = "div",
  className = "",
  ...props
}: ContainerProps) {
  return <Component className={`ds-container ${className}`.trim()} {...props} />;
}
