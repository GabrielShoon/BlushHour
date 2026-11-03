import { notFound } from "next/navigation";
import { getCatalogue } from "@/lib/catalogue-server";
import { PlaceForm } from "../../place-form";

export default async function EditPlacePage({ params }: { params: Promise<{ slug: string }> }) {
  const place = (await getCatalogue()).placeBySlug[(await params).slug];
  if (!place) notFound();
  return <PlaceForm existing={place} />;
}
