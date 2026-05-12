import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { chapters, getChapterBySlug } from "@/data/chapters";
import ChapterPageClient from "./ChapterPageClient";

export async function generateStaticParams() {
  return chapters.map((c) => ({ slug: c.slug }));
}

export default async function ChapterPage(props: PageProps<"/chapters/[slug]">) {
  const { slug } = await props.params;
  const chapter = getChapterBySlug(slug);
  if (!chapter) notFound();
  return <ChapterPageClient chapter={chapter} />;
}
