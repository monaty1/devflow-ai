import type { Metadata } from "next";
import { getToolBySlug } from "@/config/tools-data";

const SITE_URL = "https://devflowai.dev";

export function generateToolMetadata(slug: string): Metadata {
  const tool = getToolBySlug(slug);

  if (!tool) {
    return {
      title: "Tool Not Found",
    };
  }

  return {
    title: tool.name,
    description: tool.longDescription,
    alternates: {
      canonical: `${SITE_URL}/tools/${tool.slug}`,
    },
    openGraph: {
      title: `${tool.name} | DevFlowAI`,
      description: tool.longDescription,
      url: `${SITE_URL}/tools/${tool.slug}`,
    },
  };
}
