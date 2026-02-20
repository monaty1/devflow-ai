import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ToolHeader } from "@/components/shared/tool-header";
import { Wrench } from "lucide-react";

// Mock useTranslation
vi.mock("@/hooks/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "common.tools": "Tools",
        "common.breadcrumb": "Breadcrumb",
      };
      return map[key] ?? key;
    },
    locale: "en",
  }),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: Record<string, unknown>) => (
    <a href={href as string} {...props}>{children as React.ReactNode}</a>
  ),
}));

describe("ToolHeader", () => {
  it("renders title and description (simple variant)", () => {
    render(<ToolHeader title="My Tool" description="A great tool" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("My Tool");
    expect(screen.getByText("A great tool")).toBeInTheDocument();
  });

  it("renders title and description (icon+gradient variant)", () => {
    render(
      <ToolHeader
        title="Icon Tool"
        description="With icon"
        icon={Wrench}
        gradient="from-blue-500 to-purple-600"
      />
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Icon Tool");
    expect(screen.getByText("With icon")).toBeInTheDocument();
  });

  it("does not render breadcrumb by default", () => {
    render(<ToolHeader title="No Crumb" description="Desc" />);
    expect(screen.queryByLabelText("Breadcrumb")).not.toBeInTheDocument();
  });

  it("renders breadcrumb when prop is true", () => {
    render(<ToolHeader title="Crumb Tool" description="Desc" breadcrumb />);
    const nav = screen.getByLabelText("Breadcrumb");
    expect(nav).toBeInTheDocument();
    expect(screen.getByText("Tools")).toBeInTheDocument();
    // Title appears in both breadcrumb span and h1
    expect(screen.getAllByText("Crumb Tool")).toHaveLength(2);
  });

  it("breadcrumb links to /tools", () => {
    render(<ToolHeader title="Link Test" description="Desc" breadcrumb />);
    const link = screen.getByText("Tools");
    expect(link.closest("a")).toHaveAttribute("href", "/tools");
  });

  it("renders actions slot", () => {
    render(
      <ToolHeader
        title="With Actions"
        description="Desc"
        actions={<button type="button">Reset</button>}
      />
    );
    expect(screen.getByText("Reset")).toBeInTheDocument();
  });

  it("renders actions slot with icon+gradient variant", () => {
    render(
      <ToolHeader
        title="Full"
        description="Desc"
        icon={Wrench}
        gradient="from-red-500 to-orange-600"
        actions={<button type="button">Action</button>}
      />
    );
    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Full");
  });

  it("renders breadcrumb with icon+gradient variant", () => {
    render(
      <ToolHeader
        title="Full Crumb"
        description="Desc"
        icon={Wrench}
        gradient="from-green-500 to-teal-600"
        breadcrumb
      />
    );
    expect(screen.getByLabelText("Breadcrumb")).toBeInTheDocument();
    expect(screen.getByText("Tools")).toBeInTheDocument();
  });
});
