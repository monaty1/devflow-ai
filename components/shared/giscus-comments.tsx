"use client";

import { useSyncExternalStore } from "react";
import Giscus from "@giscus/react";
import { useTheme } from "next-themes";

interface GiscusCommentsProps {
  term: string;
}

export function GiscusComments({ term }: GiscusCommentsProps) {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) {
    return null;
  }

  return (
    <div className="mt-8 border-t border-border pt-8">
      <Giscus
        id="giscus-comments"
        repo="albertoguinda/devflow-ai"
        repoId="R_kgDOOmAkXw"
        category="Tool Comments"
        categoryId="DIC_kwDOOmAkX84ClhHl"
        mapping="specific"
        term={term}
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        lang="en"
        loading="lazy"
      />
    </div>
  );
}
