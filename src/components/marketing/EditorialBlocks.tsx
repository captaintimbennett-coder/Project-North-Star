import { Container } from "@/components/layout/Container";

export type EditorialBlock = {
  label: string;
  title: string;
  body: string;
};

type EditorialBlocksProps = {
  id?: string;
  eyebrow: string;
  title: string;
  introduction: string;
  blocks: readonly EditorialBlock[];
};

export function EditorialBlocks({
  id,
  eyebrow,
  title,
  introduction,
  blocks,
}: EditorialBlocksProps) {
  return (
    <section className="editorial-blocks" id={id}>
      <Container>
        <div className="editorial-blocks__heading">
          <div>
            <p className="ds-eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
          </div>
          <p>{introduction}</p>
        </div>
        <div className="editorial-blocks__grid">
          {blocks.map((block, index) => (
            <article key={block.title}>
              <span>0{index + 1}</span>
              <p className="ds-caption">{block.label}</p>
              <h3>{block.title}</h3>
              <p>{block.body}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
