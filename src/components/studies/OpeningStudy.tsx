import Image from "next/image";
import Link from "next/link";
import { images } from "@/data/assets";
import styles from "./OpeningStudy.module.css";

export type OpeningStudyConcept = "founder" | "vision" | "founderArtistry";

const manifesto = [
  "I create images.",
  "I build experiences that transform.",
  "Guided by purpose.",
  "Driven by excellence.",
  "Built on trust.",
];

const concepts = {
  founder: {
    label: "Concept A — The Founder",
    description: "Identity, trust, and leadership establish the platform.",
  },
  vision: {
    label: "Concept B — The Vision",
    description: "A cinematic meditation on the philosophy behind the work.",
  },
  founderArtistry: {
    label: "Concept C — Founder + Artistry",
    description: "The founder and the work meet in one editorial opening spread.",
  },
} as const;

function Identity() {
  return (
    <div className={styles.identity}>
      <h1>Tim Bennett</h1>
      <p className={styles.roles}>Photographer · Educator · Creator · Mentor</p>
      <div className={styles.manifesto}>
        {manifesto.map((line) => <span key={line}>{line}</span>)}
      </div>
    </div>
  );
}

function NorthStar({ expanded = false }: { expanded?: boolean }) {
  return (
    <div className={styles.northStar}>
      <p>Project North Star</p>
      <span>My Philosophy. My Standard. My North Star.</span>
      {expanded && <em>Direction <b>•</b> Purpose <b>•</b> Legacy</em>}
      <Link href="/project-north-star">Enter the philosophy <b aria-hidden="true">→</b></Link>
    </div>
  );
}

export function OpeningStudy({ concept }: { concept: OpeningStudyConcept }) {
  const study = concepts[concept];

  return (
    <main className={`${styles.study} ${styles[concept]}`} id="main-content">
      <p className={styles.studyLabel}>{study.label}</p>
      <p className={styles.studyDescription}>{study.description}</p>

      {concept === "founder" && (
        <section className={styles.founderStage} aria-label="Founder-centered opening study">
          <div className={styles.founderCopy}>
            <Identity />
            <NorthStar expanded />
          </div>
          <div className={styles.founderPortrait}>
            <Image
              src={images.people.timBennett}
              alt="Editorial portrait of Tim Bennett"
              fill
              priority
              sizes="(max-width: 760px) 100vw, 48vw"
            />
          </div>
          <p className={styles.chapter}>Opening Chapter · 01</p>
        </section>
      )}

      {concept === "vision" && (
        <section className={styles.visionStage} aria-label="Vision-centered opening study">
          <Image
            className={styles.visionArt}
            src={images.hero.studies.glamour}
            alt="Editorial glamour portrait representing Tim Bennett's work"
            fill
            priority
            sizes="100vw"
          />
          <div className={styles.visionShade} />
          <div className={styles.visionPortrait}>
            <Image
              src={images.people.timBennett}
              alt="Editorial portrait of Tim Bennett"
              fill
              priority
              sizes="(max-width: 760px) 32vw, 18vw"
            />
          </div>
          <div className={styles.visionCopy}>
            <Identity />
            <NorthStar />
          </div>
          <p className={styles.chapter}>The Vision · 01</p>
        </section>
      )}

      {concept === "founderArtistry" && (
        <section className={styles.spreadStage} aria-label="Founder and artistry opening study">
          <div className={styles.spreadFounder}>
            <Image
              src={images.people.timBennett}
              alt="Editorial portrait of Tim Bennett"
              fill
              priority
              sizes="(max-width: 760px) 100vw, 42vw"
            />
          </div>
          <div className={styles.spreadArt}>
            <Image
              src={images.hero.studies.glamour}
              alt="Editorial glamour portrait representing Tim Bennett's work"
              fill
              priority
              sizes="(max-width: 760px) 100vw, 58vw"
            />
          </div>
          <div className={styles.spreadShade} />
          <div className={styles.spreadCopy}>
            <Identity />
            <NorthStar />
          </div>
          <p className={styles.chapter}>Founder + Artistry · 01</p>
        </section>
      )}
    </main>
  );
}
