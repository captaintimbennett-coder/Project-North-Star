"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import { Button } from "@/components/buttons";
import { photographerApplicationContent as content } from "@/data/applications";
import { ProfessionalStandardsDisclosure } from "./ProfessionalStandardsDisclosure";

type FieldErrors = Record<string, string>;

type FieldShellProps = {
  children: React.ReactNode;
  description?: string;
  error?: string;
  label: string;
  name: string;
  required?: boolean;
};

function FieldShell({ children, description, error, label, name, required }: FieldShellProps) {
  const descriptionId = description ? `${name}-description` : undefined;
  const errorId = error ? `${name}-error` : undefined;

  return (
    <div className="application-field">
      <label htmlFor={name}>
        {label}{required && <span aria-hidden="true"> *</span>}
      </label>
      {description && <p id={descriptionId}>{description}</p>}
      {children}
      {error && <p className="application-field__error" id={errorId}>{error}</p>}
    </div>
  );
}

function describedBy(name: string, description: boolean, error?: string) {
  return [description && `${name}-description`, error && `${name}-error`]
    .filter(Boolean)
    .join(" ") || undefined;
}

export function PhotographerApplicationForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const genresRef = useRef<HTMLFieldSetElement>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [marketingSource, setMarketingSource] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const clientErrors: FieldErrors = {};

    if (formData.getAll("genresInterests").length === 0) {
      clientErrors.genresInterests = "Select at least one genre or creative interest.";
    }

    if (marketingSource === "other" && !String(formData.get("otherMarketingSource") || "").trim()) {
      clientErrors.otherMarketingSource = "Tell us how you heard about Lone Star Retreat.";
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setFormError("Please review the highlighted fields before submitting.");
      if (clientErrors.genresInterests) genresRef.current?.focus();
      return;
    }

    setErrors({});
    setFormError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/applications/photographer", {
        method: "POST",
        body: formData,
      });
      const result = await response.json() as {
        error?: string;
        errors?: FieldErrors;
        ok?: boolean;
      };

      if (!response.ok || !result.ok) {
        const responseErrors = result.errors || {};
        setErrors(responseErrors);
        setFormError(
          result.error ||
            (Object.keys(responseErrors).length
              ? "Please review the highlighted fields before submitting."
              : "We could not receive your application. Please try again."),
        );
        formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
        return;
      }

      router.push("/lone-star-retreat/photographers/apply/application-received");
    } catch {
      setFormError("We could not receive your application. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="application-form" ref={formRef} onSubmit={handleSubmit} noValidate={false}>
      <div className="application-honeypot" aria-hidden="true">
        <label htmlFor="companyWebsite">Company website</label>
        <input id="companyWebsite" name="companyWebsite" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {formError && (
        <div className="application-form__notice" role="alert" tabIndex={-1}>
          <strong>We need a little more information.</strong>
          <p>{formError}</p>
        </div>
      )}

      <section className="application-form-section" aria-labelledby="application-about-title">
        <div className="application-form-section__heading">
          <span>01</span>
          <div>
            <p className="ds-eyebrow">Application details</p>
            <h2 id="application-about-title">About you</h2>
            <p>Start with the information we will use to identify and contact you.</p>
          </div>
        </div>
        <div className="application-form-grid">
          <FieldShell name="legalName" label="Legal name" required error={errors.legalName}>
            <input className="application-input" id="legalName" name="legalName" type="text" autoComplete="name" required aria-invalid={Boolean(errors.legalName)} />
          </FieldShell>
          <FieldShell name="displayName" label="Display name" error={errors.displayName} description="Optional. The name you use professionally, if different from your legal name.">
            <input className="application-input" id="displayName" name="displayName" type="text" autoComplete="nickname" aria-invalid={Boolean(errors.displayName)} aria-describedby={describedBy("displayName", true, errors.displayName)} />
          </FieldShell>
          <FieldShell name="email" label="Email" required error={errors.email}>
            <input className="application-input" id="email" name="email" type="email" autoComplete="email" required aria-invalid={Boolean(errors.email)} />
          </FieldShell>
          <FieldShell name="phone" label="Phone" required error={errors.phone}>
            <input className="application-input" id="phone" name="phone" type="tel" autoComplete="tel" required aria-invalid={Boolean(errors.phone)} />
          </FieldShell>
          <FieldShell name="city" label="City" required error={errors.city}>
            <input className="application-input" id="city" name="city" type="text" autoComplete="address-level2" required aria-invalid={Boolean(errors.city)} />
          </FieldShell>
          <FieldShell name="state" label="State / region" required error={errors.state}>
            <input className="application-input" id="state" name="state" type="text" autoComplete="address-level1" required aria-invalid={Boolean(errors.state)} />
          </FieldShell>
          <FieldShell name="country" label="Country" required error={errors.country}>
            <input className="application-input" id="country" name="country" type="text" autoComplete="country-name" required aria-invalid={Boolean(errors.country)} />
          </FieldShell>
          <FieldShell name="instagramURL" label="Instagram URL" error={errors.instagramURL} description="Optional. Include the full https:// address.">
            <input className="application-input" id="instagramURL" name="instagramURL" type="url" inputMode="url" placeholder="https://instagram.com/yourname" aria-invalid={Boolean(errors.instagramURL)} aria-describedby={describedBy("instagramURL", true, errors.instagramURL)} />
          </FieldShell>
          <FieldShell name="websiteURL" label="Website URL" error={errors.websiteURL} description="Optional. Include the full https:// address.">
            <input className="application-input" id="websiteURL" name="websiteURL" type="url" inputMode="url" placeholder="https://yourwebsite.com" aria-invalid={Boolean(errors.websiteURL)} aria-describedby={describedBy("websiteURL", true, errors.websiteURL)} />
          </FieldShell>
          <FieldShell name="portfolioURL" label="Portfolio URL" error={errors.portfolioURL} description="Optional, if different from your website.">
            <input className="application-input" id="portfolioURL" name="portfolioURL" type="url" inputMode="url" placeholder="https://yourportfolio.com" aria-invalid={Boolean(errors.portfolioURL)} aria-describedby={describedBy("portfolioURL", true, errors.portfolioURL)} />
          </FieldShell>
          <FieldShell name="marketingSource" label="How did you hear about Lone Star Retreat?" required error={errors.marketingSource}>
            <select className="application-input" id="marketingSource" name="marketingSource" required value={marketingSource} onChange={(event) => setMarketingSource(event.target.value)} aria-invalid={Boolean(errors.marketingSource)}>
              <option value="">Select one</option>
              {content.marketingSources.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
            </select>
          </FieldShell>
          {marketingSource === "other" && (
            <FieldShell name="otherMarketingSource" label="Tell us where you heard about us" required error={errors.otherMarketingSource}>
              <input className="application-input" id="otherMarketingSource" name="otherMarketingSource" type="text" required aria-invalid={Boolean(errors.otherMarketingSource)} />
            </FieldShell>
          )}
        </div>
      </section>

      <section className="application-form-section" aria-labelledby="application-photography-title">
        <div className="application-form-section__heading">
          <span>02</span>
          <div>
            <p className="ds-eyebrow">Creative practice</p>
            <h2 id="application-photography-title">Your photography</h2>
            <p>Help us understand your experience, working tools, and creative interests.</p>
          </div>
        </div>
        <div className="application-form-grid application-form-grid--single">
          <FieldShell name="photographyExperienceLevel" label="Photography experience level" required error={errors.photographyExperienceLevel} description="Choose the description that best reflects your current practice.">
            <select className="application-input" id="photographyExperienceLevel" name="photographyExperienceLevel" required aria-invalid={Boolean(errors.photographyExperienceLevel)} aria-describedby={describedBy("photographyExperienceLevel", true, errors.photographyExperienceLevel)}>
              <option value="">Select one</option>
              {content.experienceLevels.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
            </select>
          </FieldShell>
          <FieldShell name="equipmentSummary" label="Equipment summary" error={errors.equipmentSummary} description="Optional. If useful, share a concise overview of the camera system, primary lenses, or lighting you expect to bring.">
            <textarea className="application-input application-textarea" id="equipmentSummary" name="equipmentSummary" rows={5} aria-invalid={Boolean(errors.equipmentSummary)} aria-describedby={describedBy("equipmentSummary", true, errors.equipmentSummary)} />
          </FieldShell>
        </div>
        <fieldset className="application-choice-group" ref={genresRef} tabIndex={-1} aria-describedby={errors.genresInterests ? "genresInterests-error" : "genresInterests-description"} aria-invalid={Boolean(errors.genresInterests)}>
          <legend>Genres / creative interests <span aria-hidden="true">*</span></legend>
          <p id="genresInterests-description">Select every genre that genuinely interests you. Choose at least one.</p>
          <div className="application-choice-grid">
            {content.genres.map((genre) => (
              <label key={genre.value}>
                <input type="checkbox" name="genresInterests" value={genre.value} />
                <span>{genre.label}</span>
              </label>
            ))}
          </div>
          {errors.genresInterests && <p className="application-field__error" id="genresInterests-error">{errors.genresInterests}</p>}
        </fieldset>
        <FieldShell name="otherGenreInterest" label="Other creative interest" error={errors.otherGenreInterest} description="Optional. Add context if you selected Other.">
          <input className="application-input" id="otherGenreInterest" name="otherGenreInterest" type="text" aria-invalid={Boolean(errors.otherGenreInterest)} aria-describedby={describedBy("otherGenreInterest", true, errors.otherGenreInterest)} />
        </FieldShell>
      </section>

      <section className="application-form-section" aria-labelledby="application-goals-title">
        <div className="application-form-section__heading">
          <span>03</span>
          <div>
            <p className="ds-eyebrow">Retreat fit</p>
            <h2 id="application-goals-title">What you hope to create</h2>
            <p>We are interested in your intentions as much as your technical experience.</p>
          </div>
        </div>
        <div className="application-form-grid application-form-grid--single">
          <FieldShell name="whatTheyHopeToCreate" label="What do you hope to create at Lone Star Retreat? (Optional)" error={errors.whatTheyHopeToCreate} description="Optional. Describe the imagery, ideas, or creative direction you would like to explore if you already have something in mind.">
            <textarea className="application-input application-textarea" id="whatTheyHopeToCreate" name="whatTheyHopeToCreate" rows={6} aria-invalid={Boolean(errors.whatTheyHopeToCreate)} aria-describedby={describedBy("whatTheyHopeToCreate", true, errors.whatTheyHopeToCreate)} />
          </FieldShell>
          <FieldShell name="retreatGoals" label="What do you hope to gain from the retreat? (Optional)" error={errors.retreatGoals} description="Optional. Share anything around craft, portfolio, collaboration, community, or professional growth that would help us understand your goals.">
            <textarea className="application-input application-textarea" id="retreatGoals" name="retreatGoals" rows={6} aria-invalid={Boolean(errors.retreatGoals)} aria-describedby={describedBy("retreatGoals", true, errors.retreatGoals)} />
          </FieldShell>
          <FieldShell name="collaborationStyleNotes" label="How do you approach collaboration?" error={errors.collaborationStyleNotes} description="Optional. Share anything that helps us understand how you communicate and work with models and peers.">
            <textarea className="application-input application-textarea" id="collaborationStyleNotes" name="collaborationStyleNotes" rows={5} aria-invalid={Boolean(errors.collaborationStyleNotes)} aria-describedby={describedBy("collaborationStyleNotes", true, errors.collaborationStyleNotes)} />
          </FieldShell>
        </div>
      </section>

      <section className="application-form-section application-form-section--consent" aria-labelledby="application-consent-title">
        <div className="application-form-section__heading">
          <span>04</span>
          <div>
            <p className="ds-eyebrow">Confirm & submit</p>
            <h2 id="application-consent-title">Professional Standards</h2>
            <p>Review the culture and commitments that every Lone Star Retreat participant shares.</p>
          </div>
        </div>
        <div className="application-consents">
          {content.consents.filter((consent) => consent.name !== "codeOfConductConfirmed").map((consent) => (
            <label key={consent.name}>
              <input type="checkbox" name={consent.name} required aria-invalid={Boolean(errors[consent.name])} />
              <span>{consent.label} <b aria-hidden="true">*</b></span>
              {errors[consent.name] && <small className="application-field__error">{errors[consent.name]}</small>}
            </label>
          ))}
        </div>
        <ProfessionalStandardsDisclosure error={errors.codeOfConductConfirmed} />
        <div className="application-submit">
          <p>
            Your application is private. Submission does not create an account or public profile,
            and acceptance does not publish your information automatically.
          </p>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Submitting…" : content.submitLabel}
          </Button>
        </div>
      </section>
    </form>
  );
}
