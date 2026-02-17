interface GitHubStarsServerProps {
  stars: number | null;
}

export function GitHubStarsServer({ stars }: GitHubStarsServerProps) {
  return (
    <span className="block h-9 min-w-[3ch] text-3xl font-bold text-foreground">
      {stars !== null ? stars.toLocaleString() : "\u2014"}
    </span>
  );
}
