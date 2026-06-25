import type { Metadata } from "next";
import { Button } from "@/components/buttons";
import { InputField, TextAreaField } from "@/components/forms";
import { Container, SectionIntro } from "@/components/layout";
import { contactContent } from "@/data/pages";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <main id="main-content">
      <SectionIntro
        className="editorial-intro contact-intro"
        eyebrow={contactContent.introduction.eyebrow}
        title={contactContent.introduction.title}
      >
        {contactContent.introduction.body}
      </SectionIntro>

      <Container as="section" className="contact-layout">
        <div className="contact-details">
          <p className="ds-caption">{contactContent.detailsLabel}</p>
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
          <p>{contactContent.location}</p>
        </div>
        <form className="contact-form">
          <InputField label="Name" name="name" autoComplete="name" />
          <InputField label="Email" name="email" type="email" autoComplete="email" />
          <InputField label="Subject" name="subject" />
          <TextAreaField label="How can we help?" name="message" />
          <Button>Send inquiry</Button>
          <p className="form-note">{contactContent.formNote}</p>
        </form>
      </Container>
    </main>
  );
}
