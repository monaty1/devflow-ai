import { HomeContent } from "@/components/marketing/home-content";

async function getGitHubStars(): Promise<number | null> {
  try {
    const res = await fetch(
      "https://api.github.com/repos/albertoguinda/devflow-ai",
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    const data: { stargazers_count?: number } = await res.json();
    return typeof data.stargazers_count === "number"
      ? data.stargazers_count
      : null;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const stars = await getGitHubStars();

  return <HomeContent stars={stars} />;
}
