import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { CopyButton } from "@/components/shared/copy-button";

// Mock HeroUI Button — maps onPress to onClick
vi.mock("@heroui/react", () => ({
  Button: ({ children, onPress, isDisabled, ...props }: Record<string, unknown>) => (
    <button
      onClick={() => {
        const result = (onPress as () => unknown)();
        if (result instanceof Promise) result.catch(() => {});
      }}
      disabled={isDisabled as boolean}
      aria-label={props["aria-label"] as string | undefined}
      data-testid="copy-btn"
    >
      {children as React.ReactNode}
    </button>
  ),
}));

describe("CopyButton", () => {
  it("renders without label (icon-only)", () => {
    render(<CopyButton text="hello" />);
    expect(screen.getByTestId("copy-btn")).toBeInTheDocument();
  });

  it("renders with label", () => {
    render(<CopyButton text="hello" label="Copy" />);
    expect(screen.getByText("Copy")).toBeInTheDocument();
  });

  it("shows check icon after clicking copy", async () => {
    const user = userEvent.setup();
    render(<CopyButton text="hello" />);

    // Initially shows copy icon (no green)
    expect(screen.getByTestId("copy-btn").innerHTML).not.toContain("text-green-500");

    await user.click(screen.getByTestId("copy-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("copy-btn").innerHTML).toContain("text-green-500");
    });
  });

  it("calls getText when provided", async () => {
    const getText = vi.fn().mockReturnValue("dynamic-value");
    const user = userEvent.setup();
    render(<CopyButton getText={getText} />);

    await user.click(screen.getByTestId("copy-btn"));

    await waitFor(() => {
      expect(getText).toHaveBeenCalled();
    });
  });

  it("does not change icon when text is empty", async () => {
    const user = userEvent.setup();
    render(<CopyButton text="" />);

    await user.click(screen.getByTestId("copy-btn"));

    // Should still show copy icon (not check)
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.getByTestId("copy-btn").innerHTML).not.toContain("text-green-500");
  });

  it("applies custom aria-label", () => {
    render(<CopyButton text="test" ariaLabel="Copy code" />);
    expect(screen.getByLabelText("Copy code")).toBeInTheDocument();
  });

  it("uses default aria-label when no label text", () => {
    render(<CopyButton text="test" />);
    expect(screen.getByLabelText("Copy to clipboard")).toBeInTheDocument();
  });

  it("omits aria-label when visible label is provided", () => {
    render(<CopyButton text="test" label="Copy" />);
    expect(screen.queryByLabelText("Copy to clipboard")).not.toBeInTheDocument();
  });
});
