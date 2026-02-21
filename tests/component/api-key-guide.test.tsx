import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock translations
vi.mock("@/hooks/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "guide.ai.title": "AI Setup",
        "guide.ai.subtitle": "Configure AI provider",
        "guide.ai.step1.title": "Choose provider",
        "guide.ai.step1.subtitle": "Pick one",
        "guide.ai.step2.title": "Get your key",
        "guide.ai.step2.subtitle": "Follow instructions",
        "guide.ai.step2.instruction1": "Go to the provider",
        "guide.ai.step2.instruction2": "Create an API key",
        "guide.ai.step2.instruction3": "Copy the key",
        "guide.ai.step2.getKey": "Get API Key",
        "guide.ai.step3.title": "Activate",
        "guide.ai.step3.subtitle": "Paste your key",
        "guide.ai.step3.placeholder": "Paste API key here",
        "guide.ai.step3.activate": "Activate",
        "guide.ai.step3.ready": "Ready!",
        "guide.ai.step3.readyDesc": "No key needed",
        "guide.ai.step3.showKey": "Show key",
        "guide.ai.step3.hideKey": "Hide key",
        "guide.ai.next": "Next",
        "guide.ai.back": "Back",
        "guide.ai.close": "Close",
        "guide.ai.free": "Free",
        "guide.ai.freeTier": "Free tier",
        "guide.ai.paid": "Paid",
        "guide.ai.provider.pollinations": "Pollinations",
        "guide.ai.provider.pollinationsDesc": "Free, no key",
        "guide.ai.provider.gemini": "Gemini",
        "guide.ai.provider.geminiDesc": "Google AI",
        "guide.ai.provider.groq": "Groq",
        "guide.ai.provider.groqDesc": "Fast inference",
        "guide.ai.provider.openrouter": "OpenRouter",
        "guide.ai.provider.openrouterDesc": "Multi-model",
      };
      return map[key] ?? key;
    },
  }),
}));

// Mock AI settings store
const mockSetByokKey = vi.fn();
const mockSetByokProvider = vi.fn();
vi.mock("@/lib/stores/ai-settings-store", () => ({
  useAISettingsStore: () => ({
    setByokKey: mockSetByokKey,
    setByokProvider: mockSetByokProvider,
  }),
}));

// Mock HeroUI InputGroup
vi.mock("@heroui/react", () => {
  function MockInput(props: Record<string, unknown>) {
    return (
      <input
        type={props["type"] as string}
        value={props["value"] as string}
        onChange={props["onChange"] as React.ChangeEventHandler<HTMLInputElement>}
        placeholder={props["placeholder"] as string}
        data-testid="api-key-input"
      />
    );
  }
  function MockSuffix({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  }
  function MockInputGroup({ children, ...props }: Record<string, unknown>) {
    return <div {...(props as object)}>{children as React.ReactNode}</div>;
  }
  MockInputGroup.Input = MockInput;
  MockInputGroup.Suffix = MockSuffix;
  return { InputGroup: MockInputGroup };
});

// Mock Button
vi.mock("@/components/ui", () => ({
  Button: ({
    children,
    onPress,
    isDisabled,
    ...props
  }: Record<string, unknown>) => (
    <button
      onClick={() => !isDisabled && (onPress as () => void)?.()}
      disabled={isDisabled as boolean}
      aria-label={props["aria-label"] as string | undefined}
    >
      {children as React.ReactNode}
    </button>
  ),
}));

// Mock cn utility
vi.mock("@/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

import { ApiKeyGuide } from "@/components/shared/api-key-guide";

describe("ApiKeyGuide", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when open is false", () => {
    const { container } = render(
      <ApiKeyGuide open={false} onClose={onClose} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders modal when open is true", () => {
    render(<ApiKeyGuide open={true} onClose={onClose} />);
    expect(screen.getByText("AI Setup")).toBeInTheDocument();
    expect(screen.getByText("Choose provider")).toBeInTheDocument();
  });

  it("shows all 4 provider options in step 1", () => {
    render(<ApiKeyGuide open={true} onClose={onClose} />);
    expect(screen.getByText("Pollinations")).toBeInTheDocument();
    expect(screen.getByText("Gemini")).toBeInTheDocument();
    expect(screen.getByText("Groq")).toBeInTheDocument();
    expect(screen.getByText("OpenRouter")).toBeInTheDocument();
  });

  it("navigates to confirmation step for Pollinations (skips key step)", async () => {
    const user = userEvent.setup();
    render(<ApiKeyGuide open={true} onClose={onClose} />);

    // Pollinations is default — click Next
    await user.click(screen.getByText("Next"));

    // Should jump to step 3 (Ready! confirmation)
    expect(screen.getByText("Ready!")).toBeInTheDocument();
    expect(screen.getByText("No key needed")).toBeInTheDocument();
  });

  it("shows key input step for Gemini provider", async () => {
    const user = userEvent.setup();
    render(<ApiKeyGuide open={true} onClose={onClose} />);

    // Select Gemini
    await user.click(screen.getByText("Gemini"));
    await user.click(screen.getByText("Next"));

    // Step 2: Get your key
    expect(screen.getByText("Get your key")).toBeInTheDocument();
    expect(screen.getByText("Get API Key")).toBeInTheDocument();

    // Go to step 3
    await user.click(screen.getByText("Next"));
    expect(screen.getByTestId("api-key-input")).toBeInTheDocument();
  });

  it("activates BYOK with key for paid provider", async () => {
    const user = userEvent.setup();
    render(<ApiKeyGuide open={true} onClose={onClose} />);

    // Select Gemini → Next → Next → paste key → Activate
    await user.click(screen.getByText("Gemini"));
    await user.click(screen.getByText("Next"));
    await user.click(screen.getByText("Next"));

    const input = screen.getByTestId("api-key-input");
    await user.type(input, "my-gemini-key");

    // Footer buttons: Back + Activate — get the last button (Activate is in footer)
    const buttons = screen.getAllByText("Activate");
    await user.click(buttons[buttons.length - 1]!);

    expect(mockSetByokKey).toHaveBeenCalledWith("my-gemini-key");
    expect(mockSetByokProvider).toHaveBeenCalledWith("gemini");
    expect(onClose).toHaveBeenCalled();
  });

  it("closes without setting BYOK for Pollinations", async () => {
    const user = userEvent.setup();
    render(<ApiKeyGuide open={true} onClose={onClose} />);

    await user.click(screen.getByText("Next"));
    await user.click(screen.getByText("Close"));

    expect(mockSetByokKey).not.toHaveBeenCalled();
    expect(mockSetByokProvider).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("back button navigates to previous step", async () => {
    const user = userEvent.setup();
    render(<ApiKeyGuide open={true} onClose={onClose} />);

    await user.click(screen.getByText("Gemini"));
    await user.click(screen.getByText("Next"));
    expect(screen.getByText("Get your key")).toBeInTheDocument();

    await user.click(screen.getByText("Back"));
    expect(screen.getByText("Choose provider")).toBeInTheDocument();
  });

  it("closes when backdrop is clicked", async () => {
    const user = userEvent.setup();
    render(<ApiKeyGuide open={true} onClose={onClose} />);

    const backdrop = document.querySelector("[aria-hidden='true']")!;
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });
});
