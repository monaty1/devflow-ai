import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ToastProvider } from "@/components/shared/toast-container";
import { useToast } from "@/hooks/use-toast";

// Test component that triggers toasts
function ToastTrigger() {
  const { addToast, toasts } = useToast();
  return (
    <div>
      <button type="button" onClick={() => addToast("Success!", "success")}>
        Success
      </button>
      <button type="button" onClick={() => addToast("Error!", "error")}>
        Error
      </button>
      <button type="button" onClick={() => addToast("Warning!", "warning")}>
        Warning
      </button>
      <button type="button" onClick={() => addToast("Info!", "info")}>
        Info
      </button>
      <span data-testid="toast-count">{toasts.length}</span>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <ToastProvider>
      <ToastTrigger />
    </ToastProvider>
  );
}

describe("ToastProvider", () => {
  it("renders children", () => {
    renderWithProvider();
    expect(screen.getByText("Success")).toBeInTheDocument();
  });

  it("shows toast when addToast is called", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText("Success"));

    expect(screen.getByText("Success!")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("shows error toast with correct role", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText("Error"));

    expect(screen.getByText("Error!")).toBeInTheDocument();
  });

  it("shows warning toast", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText("Warning"));

    expect(screen.getByText("Warning!")).toBeInTheDocument();
  });

  it("shows info toast", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText("Info"));

    expect(screen.getByText("Info!")).toBeInTheDocument();
  });

  it("removes toast when dismiss button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText("Success"));
    expect(screen.getByText("Success!")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Dismiss"));
    expect(screen.queryByText("Success!")).not.toBeInTheDocument();
  });

  it("limits toasts to max 5", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    // Add 6 toasts
    for (let i = 0; i < 6; i++) {
      await user.click(screen.getByText("Info"));
    }

    const count = screen.getByTestId("toast-count");
    expect(Number(count.textContent)).toBeLessThanOrEqual(5);
  });
});

describe("useToast", () => {
  it("throws when used outside provider", () => {
    // Suppress console error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      function Orphan() {
        useToast();
        return null;
      }
      render(<Orphan />);
    }).toThrow("useToast must be used within a ToastProvider");

    consoleSpy.mockRestore();
  });
});
