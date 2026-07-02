import type { CSSProperties } from "react";

type SignatureMarkProps = {
  className?: string;
  label: string;
  src: string;
};

type SignatureStyle = CSSProperties & {
  "--signature-image": string;
};

export function SignatureMark({ className = "", label, src }: SignatureMarkProps) {
  const style: SignatureStyle = {
    "--signature-image": `url("${src}")`,
  };

  return (
    <span
      className={["north-star-signature-mark", className].filter(Boolean).join(" ")}
      role="img"
      aria-label={label}
      style={style}
    />
  );
}
