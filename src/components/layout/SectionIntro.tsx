import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { Eyebrow, Lead } from "@/components/layout/Typography";

type SectionIntroProps = {
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
};

export function SectionIntro({
  eyebrow,
  title,
  children,
  className = "",
  footer,
}: SectionIntroProps) {
  return (
    <section className={`ds-section-intro ${className}`.trim()}>
      <Container>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="ds-heading-lg">{title}</h1>
        <Lead className="ds-section-intro__lead">{children}</Lead>
        {footer}
      </Container>
    </section>
  );
}
