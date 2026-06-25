import Image from "next/image";
import Link from "next/link";
import { TextLink } from "@/components/buttons/Action";
import { MediaFrame } from "@/components/layout/MediaFrame";
import { Eyebrow } from "@/components/layout/Typography";

type PillarCardProps = {
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  image: string;
};

export function PillarCard(props: PillarCardProps) {
  return (
    <article className="pillar-card">
      <Link href={props.href}>
        <MediaFrame className="pillar-image" interactive>
          <Image
            src={props.image}
            alt=""
            fill
            sizes="(max-width: 820px) 100vw, 33vw"
          />
          <span className="pillar-number">{props.number}</span>
        </MediaFrame>
      </Link>
      <div className="pillar-copy">
        <Eyebrow>{props.eyebrow}</Eyebrow>
        <h3>{props.title}</h3>
        <p>{props.description}</p>
        <TextLink href={props.href}>Discover</TextLink>
      </div>
    </article>
  );
}
