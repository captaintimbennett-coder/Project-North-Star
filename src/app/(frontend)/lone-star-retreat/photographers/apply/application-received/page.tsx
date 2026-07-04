import type { Metadata } from "next";
import Image from "next/image";
import { ActionLink } from "@/components/buttons";
import { Container } from "@/components/layout";
import { applicationReceivedContent as content } from "@/data/applications";
import { images } from "@/data/assets";

export const metadata: Metadata = {
  title: "Application Received | Lone Star Retreat",
  description: "Your Lone Star Retreat Photographer Application has been received.",
  robots: { index: false, follow: false },
};

export default function PhotographerApplicationReceivedPage() {
  return (
    <main id="main-content" className="retreat-page application-received-page">
      <section className="application-received">
        <Container>
          <Image src={images.brand.northStarSymbol} alt="" width={64} height={69} priority />
          <p className="ds-eyebrow">{content.eyebrow}</p>
          <h1>{content.title}</h1>
          <span className="retreat-rule" aria-hidden="true" />
          <div>
            {content.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <ActionLink href="/lone-star-retreat" variant="light">
            Return to Lone Star Retreat
          </ActionLink>
        </Container>
      </section>
    </main>
  );
}
