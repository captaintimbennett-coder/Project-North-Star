type ProfessionalStandardsDisclosureProps = {
  error?: string;
};

const conductItems = [
  "Arriving prepared and on time",
  "Communicating honestly",
  "Respecting schedules",
  "Caring for equipment and locations",
  "Supporting a positive creative environment",
  "Representing Lone Star Retreat with integrity",
];

const zeroToleranceItems = [
  "Harassment",
  "Sexual Harassment",
  "Intimidation",
  "Bullying",
  "Discrimination",
  "Unwanted physical contact",
  "Coercion or pressure",
  "Retaliation after someone establishes a personal boundary",
  "Behavior that intentionally creates an unsafe environment",
];

export function ProfessionalStandardsDisclosure({ error }: ProfessionalStandardsDisclosureProps) {
  return (
    <div className="professional-standards-review">
      <div className="professional-standards-review__introduction">
        <p>
          Lone Star Retreat is built on professionalism, respect, communication, and consent.
        </p>
        <p>
          Before submitting your application, please take a moment to review our Professional
          Standards &amp; Code of Conduct.
        </p>
      </div>

      <details className="professional-standards-disclosure">
        <summary>
          <span>Read the Professional Standards &amp; Code of Conduct</span>
          <span aria-hidden="true">+</span>
        </summary>
        <div className="professional-standards-disclosure__content">
          <header>
            <p className="ds-eyebrow">Lone Star Retreat</p>
            <h3>Professional Standards &amp; Code of Conduct</h3>
            <blockquote>
              We don&apos;t choose participants solely because of the quality of their work.
              <br />We choose them because of the quality of their character.
            </blockquote>
            <p>Lone Star Retreat brings photographers, models, educators, artists, and creatives together in an environment built on professionalism, trust, collaboration, and mutual respect. Every participant contributes to the culture we are building.</p>
          </header>
          <section><h4>Respect Comes First</h4><p>Every participant deserves to feel respected, welcomed, and valued. Treat every person with kindness, patience, professionalism, and courtesy regardless of experience level, background, gender, identity, or artistic style. Great work begins with great relationships.</p></section>
          <section><h4>Consent Is Non-Negotiable</h4><p>Consent is ongoing. It is never assumed. It may be changed or withdrawn at any time. Communicate openly, respect personal boundaries immediately, and create an environment where everyone feels safe saying both “yes” and “no.”</p></section>
          <section><h4>Professional Conduct</h4><p>We expect professionalism from everyone. This includes:</p><ul>{conductItems.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <section><h4>Collaboration Over Competition</h4><p>Share knowledge. Encourage others. Celebrate each other&apos;s success. Leave every person better than you found them.</p></section>
          <section><h4>Safety</h4><p>The physical and emotional safety of every participant always comes before every photograph. No image is more important than a person&apos;s well-being. If something feels wrong, stop. Communicate. Resolve it professionally.</p></section>
          <section><h4>Zero Tolerance</h4><ul>{zeroToleranceItems.map((item) => <li key={item}>{item}</li>)}</ul><p>Violations may result in immediate removal from the event without refund and exclusion from future Lone Star Retreat events.</p></section>
          <section><h4>Social Media &amp; Behind-the-Scenes</h4><p>Respect the privacy of others. Do not publish behind-the-scenes content, photographs, or video featuring another participant without their permission. Professional courtesy extends beyond the event itself.</p></section>
          <section><h4>We Expect Adults</h4><p>We believe in bringing together professionals who value respect, communication, integrity, and collaboration. If you approach every interaction with those principles, you&apos;ll fit in perfectly here.</p></section>
          <section><h4>Our Commitment</h4><p>Creativity is encouraged. Professionalism is expected. Safety is protected. Respect is never optional.</p></section>
          <footer><p>Create with <em>intention.</em><br />Build something worth <em>remembering.</em></p></footer>
        </div>
      </details>

      <div className="application-consents professional-standards-review__confirmation">
        <label>
          <input
            type="checkbox"
            name="codeOfConductConfirmed"
            required
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "codeOfConductConfirmed-error" : undefined}
          />
          <span>
            I have read and agree to follow the Lone Star Retreat Professional Standards &amp;
            Code of Conduct. <b aria-hidden="true">*</b>
          </span>
          {error && <small className="application-field__error" id="codeOfConductConfirmed-error">{error}</small>}
        </label>
      </div>
    </div>
  );
}
