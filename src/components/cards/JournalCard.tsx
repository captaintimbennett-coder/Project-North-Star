import { Eyebrow } from "@/components/layout/Typography";

type JournalCardProps = {
  category: string;
  date: string;
  excerpt: string;
  status: string;
  title: string;
};

export function JournalCard({
  category,
  date,
  excerpt,
  status,
  title,
}: JournalCardProps) {
  return (
    <article className="journal-card">
      <div>
        <Eyebrow>{category}</Eyebrow>
        <span>{date}</span>
      </div>
      <h3>{title}</h3>
      <p>{excerpt}</p>
      <span className="journal-status">{status}</span>
    </article>
  );
}
