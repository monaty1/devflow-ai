import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatusBadge } from "@/components/shared/status-badge";

describe("StatusBadge", () => {
  it("renders children text", () => {
    render(<StatusBadge variant="success">Passed</StatusBadge>);
    expect(screen.getByText("Passed")).toBeInTheDocument();
  });

  it("applies success variant classes", () => {
    render(<StatusBadge variant="success">OK</StatusBadge>);
    const badge = screen.getByText("OK");
    expect(badge.className).toContain("bg-green-50");
  });

  it("applies error variant classes", () => {
    render(<StatusBadge variant="error">Failed</StatusBadge>);
    const badge = screen.getByText("Failed");
    expect(badge.className).toContain("bg-red-50");
  });

  it("applies warning variant classes", () => {
    render(<StatusBadge variant="warning">Caution</StatusBadge>);
    const badge = screen.getByText("Caution");
    expect(badge.className).toContain("bg-amber-50");
  });

  it("applies info variant classes", () => {
    render(<StatusBadge variant="info">Note</StatusBadge>);
    const badge = screen.getByText("Note");
    expect(badge.className).toContain("bg-blue-50");
  });

  it("applies neutral variant classes", () => {
    render(<StatusBadge variant="neutral">Neutral</StatusBadge>);
    const badge = screen.getByText("Neutral");
    expect(badge.className).toContain("bg-muted");
  });

  it("applies purple variant classes", () => {
    render(<StatusBadge variant="purple">Special</StatusBadge>);
    const badge = screen.getByText("Special");
    expect(badge.className).toContain("bg-purple-50");
  });

  it("defaults to sm size", () => {
    render(<StatusBadge variant="success">Small</StatusBadge>);
    const badge = screen.getByText("Small");
    expect(badge.className).toContain("text-xs");
  });

  it("applies md size", () => {
    render(<StatusBadge variant="success" size="md">Medium</StatusBadge>);
    const badge = screen.getByText("Medium");
    expect(badge.className).toContain("text-sm");
  });

  it("merges custom className", () => {
    render(<StatusBadge variant="success" className="my-custom">Custom</StatusBadge>);
    const badge = screen.getByText("Custom");
    expect(badge.className).toContain("my-custom");
  });

  it("renders as a span element", () => {
    render(<StatusBadge variant="info">Tag</StatusBadge>);
    const badge = screen.getByText("Tag");
    expect(badge.tagName).toBe("SPAN");
  });
});
