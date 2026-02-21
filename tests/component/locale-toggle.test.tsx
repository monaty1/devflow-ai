import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock locale store
const mockSetLocale = vi.fn();
let mockLocale = "en";
vi.mock("@/lib/stores/locale-store", () => ({
  useLocaleStore: (selector: (s: { locale: string; setLocale: typeof mockSetLocale }) => unknown) =>
    selector({ locale: mockLocale, setLocale: mockSetLocale }),
}));

// Mock translations
vi.mock("@/hooks/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "sidebar.switchLocale": "Switch language",
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
      data-testid="locale-btn"
      data-icon-only={isIconOnly ? "true" : undefined}
    >
      {children as React.ReactNode}
    </button>
  ),
}));

import { LocaleToggle } from "@/components/shared/locale-toggle";

describe("LocaleToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocale = "en";
  });

  it("renders icon variant as icon-only button", () => {
    render(<LocaleToggle variant="icon" />);
    const btn = screen.getByTestId("locale-btn");
    expect(btn.getAttribute("data-icon-only")).toBe("true");
  });

  it("renders full variant with language text", () => {
    mockLocale = "en";
    render(<LocaleToggle variant="full" />);
    expect(screen.getByText("Español")).toBeInTheDocument();
  });

  it("shows 'English' text when locale is es (full variant)", () => {
    mockLocale = "es";
    render(<LocaleToggle variant="full" />);
    expect(screen.getByText("English")).toBeInTheDocument();
  });

  it("calls setLocale('es') when locale is en", async () => {
    mockLocale = "en";
    const user = userEvent.setup();
    render(<LocaleToggle />);
    await user.click(screen.getByTestId("locale-btn"));
    expect(mockSetLocale).toHaveBeenCalledWith("es");
  });

  it("calls setLocale('en') when locale is es", async () => {
    mockLocale = "es";
    const user = userEvent.setup();
    render(<LocaleToggle />);
    await user.click(screen.getByTestId("locale-btn"));
    expect(mockSetLocale).toHaveBeenCalledWith("en");
  });

  it("renders SVG flag inside button", () => {
    render(<LocaleToggle />);
    const btn = screen.getByTestId("locale-btn");
    const svg = btn.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
