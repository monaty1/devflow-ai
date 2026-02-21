import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock translations
vi.mock("@/hooks/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "pwa.installTitle": "Install DevFlow AI",
        "pwa.installDescription": "Add to home screen for quick access",
        "pwa.install": "Install",
        "pwa.notNow": "Not now",
        "common.close": "Close",
      };
      return map[key] ?? key;
    },
  }),
}));

// Mock HeroUI Button — maps onPress to onClick
vi.mock("@heroui/react", () => ({
  Button: ({
    children,
    onPress,
    isIconOnly,
    ...props
  }: Record<string, unknown>) => (
    <button
      onClick={() => (onPress as () => void)?.()}
      aria-label={props["aria-label"] as string | undefined}
      data-testid={isIconOnly ? "close-btn" : undefined}
    >
      {children as React.ReactNode}
    </button>
  ),
}));

import { InstallPrompt } from "@/components/shared/install-prompt";

describe("InstallPrompt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Mock service worker
    Object.defineProperty(navigator, "serviceWorker", {
      value: { register: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
  });

  it("does not render when dismissed via localStorage", () => {
    localStorage.setItem("devflow-pwa-dismissed", "true");
    const { container } = render(<InstallPrompt />);
    expect(container.innerHTML).toBe("");
  });

  it("does not render when deferredPrompt is null (initial state)", () => {
    const { container } = render(<InstallPrompt />);
    // No beforeinstallprompt event fired, so nothing renders
    expect(container.innerHTML).toBe("");
  });

  it("renders when beforeinstallprompt event is fired", () => {
    render(<InstallPrompt />);
    // Simulate the beforeinstallprompt event
    act(() => {
      const event = new Event("beforeinstallprompt", { cancelable: true });
      Object.assign(event, {
        prompt: vi.fn().mockResolvedValue(undefined),
        userChoice: Promise.resolve({ outcome: "dismissed" }),
      });
      window.dispatchEvent(event);
    });
    expect(screen.getByText("Install DevFlow AI")).toBeInTheDocument();
  });

  it("dismiss button sets localStorage and hides component", async () => {
    const user = userEvent.setup();
    render(<InstallPrompt />);

    // Fire the install prompt event
    act(() => {
      const event = new Event("beforeinstallprompt", { cancelable: true });
      Object.assign(event, {
        prompt: vi.fn().mockResolvedValue(undefined),
        userChoice: Promise.resolve({ outcome: "dismissed" }),
      });
      window.dispatchEvent(event);
    });

    expect(screen.getByText("Install DevFlow AI")).toBeInTheDocument();

    // Click "Not now" dismiss button
    await user.click(screen.getByText("Not now"));

    expect(localStorage.getItem("devflow-pwa-dismissed")).toBe("true");
    expect(screen.queryByText("Install DevFlow AI")).not.toBeInTheDocument();
  });

  it("attempts service worker registration on mount", () => {
    render(<InstallPrompt />);
    expect(navigator.serviceWorker.register).toHaveBeenCalledWith("/sw.js");
  });

  it("renders without crash (smoke test)", () => {
    expect(() => render(<InstallPrompt />)).not.toThrow();
  });
});
