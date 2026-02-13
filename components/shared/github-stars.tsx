"use client";

import { useEffect, useState } from "react";

export function GitHubStars() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://api.github.com/repos/albertoguinda/devflow-ai")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("fetch failed"))))
      .then((data: { stargazers_count?: number }) => {
        if (typeof data.stargazers_count === "number") {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {
        // Silently fallback — keep null state
      });
  }, []);

  return (
    <span className="block h-9 min-w-[3ch] text-3xl font-bold text-foreground">
      {stars !== null ? stars.toLocaleString() : "—"}
    </span>
  );
}
