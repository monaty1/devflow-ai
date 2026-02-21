import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next-themes
const mockSetTheme = vi.fn();
let mockTheme = "light";
vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: mockTheme,
    setTheme: mockSetTheme,
  }),
}));

// Mock translations
vi.mock("@/hooks/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "theme.lightMode": "Light mode",
        "theme.darkMode": "Dark mode",
        "theme.systemTheme": "System theme",
      };
      return map[key] ?? key;
    },
  }),
}));

// Mock HeroUI Button
vi.mock("@/components/ui", () => ({
  Button: ({
    children,
    onPress,
    isIconOnly,
    ...props
  }: Record<string, unknown>) => (
    <button
      onClick={() => (onPress as () => void)?.()}
      aria-label={props["aria-label"] as string | undefined}
      data-testid="theme-btn"
      data-icon-only={isIconOnly ? "true" : undefined}
    >
      {children as React.ReactNode}
    </button>
  ),
}));

import { ThemeToggle } from "@/components/shared/theme-toggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTheme = "light";
  });

  it("renders compact variant as icon-only button", () => {
    render(<ThemeToggle variant="compact" />);
    const btn = screen.getByTestId("theme-btn");
    expect(btn).toBeInTheDocument();
    expect(btn.getAttribute("data-icon-only")).toBe("true");
  });

  it("renders full variant with theme text", () => {
    render(<ThemeToggle variant="full" />);
    // Full variant shows capitalized theme name
    expect(screen.getByText("light")).toBeInTheDocument();
  });

  it("cycles light → dark on click", async () => {
    mockTheme = "light";
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.click(screen.getByTestId("theme-btn"));
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("cycles dark → system on click", async () => {
    mockTheme = "dark";
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.click(screen.getByTestId("theme-btn"));
    expect(mockSetTheme).toHaveBeenCalledWith("system");
  });

  it("cycles system → light on click", async () => {
    mockTheme = "system";
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.click(screen.getByTestId("theme-btn"));
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("has correct aria-label for light theme", () => {
    mockTheme = "light";
    render(<ThemeToggle />);
    expect(screen.getByLabelText("Light mode")).toBeInTheDocument();
  });

  it("has correct aria-label for dark theme", () => {
    mockTheme = "dark";
    render(<ThemeToggle />);
    expect(screen.getByLabelText("Dark mode")).toBeInTheDocument();
  });

  it("has correct aria-label for system theme", () => {
    mockTheme = "system";
    render(<ThemeToggle />);
    expect(screen.getByLabelText("System theme")).toBeInTheDocument();
  });
});
