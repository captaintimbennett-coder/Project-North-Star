"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import { Button } from "@/components/buttons";
import { modelApplicationContent as content } from "@/data/applications";
import { countryOptions, usStateOptions } from "@/data/location-options";
import { ProfessionalStandardsDisclosure } from "./ProfessionalStandardsDisclosure";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type Errors = Record<string, string>;
type FieldProps = { children: React.ReactNode; description?: string; error?: string; label: string; name: string; required?: boolean };

function Field({ children, description, error, label, name, required }: FieldProps) {
  return <div className="application-field">
    <label htmlFor={name}>{label}{required && <span aria-hidden="true"> *</span>}</label>
    {description && <p id={`${name}-description`}>{description}</p>}
    {children}
    {error && <p className="application-field__error" id={`${name}-error`}>{error}</p>}
  </div>;
}

function by(name: string, description: boolean, error?: string) {
  return [description && `${name}-description`, error && `${name}-error`].filter(Boolean).join(" ") || undefined;
}

function formatFileSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

export function ModelApplicationForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const interestsRef = useRef<HTMLFieldSetElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [marketingSource, setMarketingSource] = useState("");
  const [country, setCountry] = useState("");
  const [travelAvailability, setTravelAvailability] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next: Errors = {};
    const preferredHeroImages = data.getAll("preferredHeroImage").filter((entry): entry is File => entry instanceof File && entry.size > 0);
    const additionalImages = data.getAll("additionalImages").filter((entry): entry is File => entry instanceof File && entry.size > 0);
    const images = [...preferredHeroImages, ...additionalImages];
    if (!data.getAll("creativeInterests").length) next.creativeInterests = "Select at least one type of session.";
    if (preferredHeroImages.length === 0) next.preferredHeroImage = "Upload one preferred hero image for private review.";
    if (preferredHeroImages.length > 1) next.preferredHeroImage = "Upload only one preferred hero image.";
    if (additionalImages.length > 4) next.additionalImages = "Upload no more than four additional portfolio images.";
    if (images.length > 5) next.additionalImages = "Upload no more than five images in total.";
    for (const file of preferredHeroImages) {
      if (!ACCEPTED_IMAGE_TYPES.has(file.type)) next.preferredHeroImage = "The preferred hero image must be a JPG, PNG, or WebP file.";
      if (file.size > MAX_IMAGE_BYTES) next.preferredHeroImage = `The preferred hero image is ${formatFileSize(file.size)}. Please upload an image that is 10MB or smaller.`;
    }
    for (const file of additionalImages) {
      if (!ACCEPTED_IMAGE_TYPES.has(file.type)) next.additionalImages = "Additional portfolio images must be JPG, PNG, or WebP files.";
      if (file.size > MAX_IMAGE_BYTES) next.additionalImages = `One additional portfolio image is ${formatFileSize(file.size)}. Please upload images that are each 10MB or smaller.`;
    }
    if (travelAvailability === "possibly" && !String(data.get("availabilityNotes") || "").trim()) {
      next.availabilityNotes = "Please tell us what would affect your ability to travel.";
    }
    if (marketingSource === "other" && !String(data.get("otherMarketingSource") || "").trim()) next.otherMarketingSource = "Tell us how you heard about Lone Star Retreat.";
    if (Object.keys(next).length) {
      setErrors(next); setFormError("Please review the highlighted fields before submitting.");
      if (next.creativeInterests) interestsRef.current?.focus();
      else formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }
    setErrors({}); setFormError(""); setSubmitting(true);
    try {
      const response = await fetch("/api/applications/model", { method: "POST", body: data });
      const responseText = await response.text();
      let result: { error?: string; errors?: Errors; ok?: boolean } = {};
      try {
        result = responseText ? JSON.parse(responseText) as typeof result : {};
      } catch {
        result = {};
      }
      if (!response.ok || !result.ok) {
        if (response.status === 413) {
          setErrors({ preferredHeroImage: "This upload was rejected before the application could save. The image may need a direct storage upload path for larger files." });
          setFormError("The image upload was rejected before the application could save. Nothing else appears missing from the form.");
          formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
          return;
        }
        const nextErrors = result.errors || {};
        setErrors(nextErrors);
        setFormError(result.error || (Object.keys(nextErrors).length ? "Please review the highlighted fields before submitting." : "We could not save this application. If no field below is highlighted, nothing is missing from your form. Please try again later."));
        formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus(); return;
      }
      router.push("/lone-star-retreat/models/apply/application-received");
    } catch { setFormError("We could not receive your application. If you uploaded images, please confirm each one is 10MB or smaller and try again."); }
    finally { setSubmitting(false); }
  }

  const checkboxGroup = (name: string, items: readonly { label: string; value: string }[], error?: string) =>
    <div className="application-choice-grid">{items.map((item) => <label key={item.value}>
      <input type="checkbox" name={name} value={item.value} /><span>{item.label}</span>
    </label>)}{error && <p className="application-field__error" id={`${name}-error`}>{error}</p>}</div>;

  return <form className="application-form" ref={formRef} onSubmit={submit}>
    <div className="application-honeypot" aria-hidden="true"><label htmlFor="companyWebsite">Company website</label><input id="companyWebsite" name="companyWebsite" tabIndex={-1} autoComplete="off" /></div>
    {formError && <div className="application-form__notice" role="alert"><strong>We need a little more information.</strong><p>{formError}</p></div>}

    <section className="application-form-section" aria-labelledby="model-about-title">
      <div className="application-form-section__heading"><span>01</span><div><p className="ds-eyebrow">Application details</p><h2 id="model-about-title">About you</h2><p>Begin with the details we will use to identify you and stay in touch.</p></div></div>
      <div className="application-form-grid">
        <Field name="stageName" label="Display / stage name" required description="This is the name we will use for public-facing materials unless you approve otherwise." error={errors.stageName}><input className="application-input" id="stageName" name="stageName" autoComplete="nickname" required aria-invalid={!!errors.stageName} aria-describedby={by("stageName", true, errors.stageName)} /></Field>
        <Field name="legalName" label="Legal name" description="Optional. This is used only for private administrative purposes and will never be displayed publicly." error={errors.legalName}><input className="application-input" id="legalName" name="legalName" autoComplete="name" aria-invalid={!!errors.legalName} aria-describedby={by("legalName", true, errors.legalName)} /></Field>
        <Field name="email" label="Email" required error={errors.email}><input className="application-input" id="email" name="email" type="email" autoComplete="email" required aria-invalid={!!errors.email} /></Field>
        <Field name="phone" label="Phone" required error={errors.phone}><input className="application-input" id="phone" name="phone" type="tel" autoComplete="tel" required aria-invalid={!!errors.phone} /></Field>
        <Field name="city" label="City" required error={errors.city}><input className="application-input" id="city" name="city" autoComplete="address-level2" required aria-invalid={!!errors.city} /></Field>
        <Field name="country" label="Country" required error={errors.country} description="Choose the country where you are currently based so retreat planning stays organized.">
          <select className="application-input" id="country" name="country" autoComplete="country-name" required value={country} onChange={e => setCountry(e.target.value)} aria-invalid={!!errors.country} aria-describedby={by("country", true, errors.country)}>
            <option value="">Select country</option>
            {countryOptions.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        </Field>
        <Field name="state" label={country === "United States" ? "State" : "State / region"} required error={errors.state} description={country === "United States" ? "Choose your state so applications can be searched and grouped consistently." : "Enter the state, province, region, or territory where you are based."}>
          {country === "United States" ? (
            <select className="application-input" id="state" name="state" autoComplete="address-level1" required aria-invalid={!!errors.state} aria-describedby={by("state", true, errors.state)}>
              <option value="">Select state</option>
              {usStateOptions.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          ) : (
            <input className="application-input" id="state" name="state" autoComplete="address-level1" required aria-invalid={!!errors.state} aria-describedby={by("state", true, errors.state)} />
          )}
        </Field>
        <Field name="instagramURL" label="Instagram URL" description="Optional. Include the full https:// address." error={errors.instagramURL}><input className="application-input" id="instagramURL" name="instagramURL" type="url" placeholder="https://instagram.com/yourname" aria-invalid={!!errors.instagramURL} aria-describedby={by("instagramURL", true, errors.instagramURL)} /></Field>
        <Field name="websiteURL" label="Website URL" description="Optional. Include the full https:// address." error={errors.websiteURL}><input className="application-input" id="websiteURL" name="websiteURL" type="url" aria-invalid={!!errors.websiteURL} aria-describedby={by("websiteURL", true, errors.websiteURL)} /></Field>
        <Field name="portfolioURL" label="Portfolio URL" description="Optional, if different from your website." error={errors.portfolioURL}><input className="application-input" id="portfolioURL" name="portfolioURL" type="url" aria-invalid={!!errors.portfolioURL} /></Field>
        <Field name="agencyRepresentation" label="Agency representation" description="Optional. Share the agency name and location, if applicable." error={errors.agencyRepresentation}><input className="application-input" id="agencyRepresentation" name="agencyRepresentation" /></Field>
        <Field name="marketingSource" label="How did you hear about Lone Star Retreat?" required error={errors.marketingSource}><select className="application-input" id="marketingSource" name="marketingSource" required value={marketingSource} onChange={e => setMarketingSource(e.target.value)}><option value="">Select one</option>{content.marketingSources.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></Field>
        {marketingSource === "other" && <Field name="otherMarketingSource" label="Tell us where you heard about us" required error={errors.otherMarketingSource}><input className="application-input" id="otherMarketingSource" name="otherMarketingSource" required /></Field>}
      </div>
    </section>

    <section className="application-form-section" aria-labelledby="model-work-title">
      <div className="application-form-section__heading"><span>02</span><div><p className="ds-eyebrow">Creative practice</p><h2 id="model-work-title">Session availability</h2><p>Help us understand your experience, your event-date availability, and the kinds of sessions you are currently available to join.</p></div></div>
      <div className="application-form-grid">
        <Field name="modelingExperienceLevel" label="Modeling experience level" required error={errors.modelingExperienceLevel}><select className="application-input" id="modelingExperienceLevel" name="modelingExperienceLevel" required><option value="">Select one</option>{content.experienceLevels.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></Field>
        <Field name="travelAvailability" label="Travel Commitment" required error={errors.travelAvailability} description="Will you be available to travel to the Dallas/Fort Worth area for Lone Star Retreat, May 14–16, 2027? We ask this so we can accurately plan the retreat and extend invitations only to models who are available during the event dates."><select className="application-input" id="travelAvailability" name="travelAvailability" required value={travelAvailability} onChange={e => setTravelAvailability(e.target.value)} aria-invalid={!!errors.travelAvailability} aria-describedby={by("travelAvailability", true, errors.travelAvailability)}><option value="">Select one</option>{content.travelAvailability.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></Field>
        <Field name="alternateModelList" label="Alternate Model List" required error={errors.alternateModelList} description="If all Featured Model positions are filled, would you like to be considered as an alternate if an opening becomes available? Alternate models may be invited if another model cancels or if additional opportunities become available before the event."><select className="application-input" id="alternateModelList" name="alternateModelList" required aria-invalid={!!errors.alternateModelList} aria-describedby={by("alternateModelList", true, errors.alternateModelList)}><option value="">Select one</option>{content.alternateModelList.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></Field>
        <Field name="homeAirport" label="Home airport" description="Optional." error={errors.homeAirport}><input className="application-input" id="homeAirport" name="homeAirport" /></Field>
        <Field name="availabilityNotes" label={travelAvailability === "possibly" ? "Please explain your travel availability" : "Availability notes"} description={travelAvailability === "possibly" ? "Tell us what would need to line up for you to travel to the Dallas/Fort Worth area for these dates." : "Optional. Share useful city, state, country, or travel context that may help with retreat planning."} error={errors.availabilityNotes}><textarea className="application-input application-textarea" id="availabilityNotes" name="availabilityNotes" rows={4} aria-invalid={!!errors.availabilityNotes} aria-describedby={by("availabilityNotes", true, errors.availabilityNotes)} /></Field>
      </div>
      <fieldset className="application-choice-group" ref={interestsRef} tabIndex={-1} aria-invalid={!!errors.creativeInterests}><legend>Which types of sessions are you available to participate in at Lone Star Retreat? <span aria-hidden="true">*</span></legend><p>Select all that apply. Detailed boundaries and session-specific consent will be discussed later if you are accepted.</p>{checkboxGroup("creativeInterests", content.genres, errors.creativeInterests)}</fieldset>
      <Field name="otherCreativeInterest" label="Other session type" description="Optional. Add context if you selected Other." error={errors.otherCreativeInterest}><input className="application-input" id="otherCreativeInterest" name="otherCreativeInterest" /></Field>
    </section>

    <section className="application-form-section" aria-labelledby="model-materials-title">
      <div className="application-form-section__heading"><span>03</span><div><p className="ds-eyebrow">Private review</p><h2 id="model-materials-title">Featured artist materials</h2><p>Share the imagery and words that best introduce your work. Nothing is published automatically.</p></div></div>
      <div className="application-form-grid application-form-grid--single">
        <Field name="preferredHeroImage" label="Preferred hero image" required description="Upload the image you would prefer us to consider as your featured image. Final image selection remains subject to approval." error={errors.preferredHeroImage}><input className="application-input application-file-input" id="preferredHeroImage" name="preferredHeroImage" type="file" required accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" aria-invalid={!!errors.preferredHeroImage} aria-describedby={by("preferredHeroImage", true, errors.preferredHeroImage)} /></Field>
        <Field name="additionalImages" label="Additional portfolio images" description="Optional. Add up to four more JPG, PNG, or WebP images. Each image must be 10MB or smaller." error={errors.additionalImages}><input className="application-input application-file-input" id="additionalImages" name="additionalImages" type="file" multiple accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" aria-invalid={!!errors.additionalImages} aria-describedby={by("additionalImages", true, errors.additionalImages)} /></Field>
        <Field name="shortBiography" label="Short biography" required description="Introduce your experience and creative point of view in your own voice." error={errors.shortBiography}><textarea className="application-input application-textarea" id="shortBiography" name="shortBiography" rows={6} required aria-invalid={!!errors.shortBiography} /></Field>
        <Field name="artistStatement" label="Artist statement" description="Optional. Share what draws you to the work you create." error={errors.artistStatement}><textarea className="application-input application-textarea" id="artistStatement" name="artistStatement" rows={5} /></Field>
      </div>
    </section>

    <section className="application-form-section" aria-labelledby="model-goals-title">
      <div className="application-form-section__heading"><span>04</span><div><p className="ds-eyebrow">Looking forward</p><h2 id="model-goals-title">What you hope to gain</h2><p>Select every goal that feels meaningful. This helps us understand the experience you are seeking.</p></div></div>
      <fieldset className="application-choice-group"><legend>Your retreat goals</legend><p>Select all that apply.</p>{checkboxGroup("retreatGoals", content.goals)}</fieldset>
      <Field name="otherRetreatGoal" label="Other goal" description="Optional. Add context if you selected Other." error={errors.otherRetreatGoal}><input className="application-input" id="otherRetreatGoal" name="otherRetreatGoal" /></Field>
    </section>

    <section className="application-form-section application-form-section--consent" aria-labelledby="model-consent-title">
      <div className="application-form-section__heading"><span>05</span><div><p className="ds-eyebrow">Confirm & submit</p><h2 id="model-consent-title">Professional Standards</h2><p>Review the culture and commitments that every Lone Star Retreat participant shares.</p></div></div>
      <div className="application-consents">{content.consents.filter(c => c.name !== "codeOfConductConfirmed").map(c => <label key={c.name}><input type="checkbox" name={c.name} required aria-invalid={!!errors[c.name]} /><span>{c.label} <b aria-hidden="true">*</b></span>{errors[c.name] && <small className="application-field__error">{errors[c.name]}</small>}</label>)}</div>
      <ProfessionalStandardsDisclosure error={errors.codeOfConductConfirmed} />
      <div className="application-submit"><p>Your application and images remain private review materials. Submission does not create an account or public profile, and acceptance never publishes your information automatically.</p><Button type="submit" variant="primary" disabled={submitting}>{submitting ? "Submitting…" : content.submitLabel}</Button></div>
    </section>
  </form>;
}
