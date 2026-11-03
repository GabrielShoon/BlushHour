import { notFound } from "next/navigation";
import { getCatalogue } from "@/lib/catalogue-server";
import { IdeaForm } from "../../idea-form";

export default async function EditIdeaPage({ params }: { params: Promise<{ slug: string }> }) {
  const idea = (await getCatalogue()).ideaBySlug[(await params).slug];
  if (!idea) notFound();
  return <IdeaForm existing={idea} />;
}
