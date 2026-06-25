import Link from "next/link";
import { ArrowIcon } from "@/components/buttons/ArrowIcon";
import { Eyebrow } from "@/components/layout/Typography";

type ExperienceCardProps = {
  description: string;
  href?: string;
  index: number;
  status: string;
  title: string;
};

export function ExperienceCard({
  description,
  href,
  index,
  status,
  title,
}: ExperienceCardProps) {
  return (
    <article className="experience-row">
      <span className="experience-number">0{index + 1}</span>
      <div>
        <Eyebrow>{status}</Eyebrow>
        <h2>{title}</h2>
      </div>
      <p>{description}</p>
      {href ? (
        <Link href={href} aria-label={`Explore ${title}`}>
          <ArrowIcon />
        </Link>
      ) : (
        <span className="future-mark">Future</span>
      )}
    </article>
  );
}
