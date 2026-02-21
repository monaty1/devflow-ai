import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CommandPalette } from "@/components/shared/command-palette";

// Shared mock state
const mockState = {
  isOpen: true,
  query: "",
  close: vi.fn(),
  setQuery: vi.fn(),
  executeCommand: vi.fn(),
  filteredCommands: [
    {
      id: "json-formatter",
      type: "tool" as const,
      labelKey: "tool.json-formatter.name",
      descriptionKey: "tool.json-formatter.description",
      icon: "Braces",
      href: "/tools/json-formatter",
    },
    {
      id: "action-theme",
      type: "action" as const,
      labelKey: "cmdPalette.toggleTheme",
      descriptionKey: "cmdPalette.toggleThemeDesc",
      icon: "Sun",
      action: "toggle-theme",
    },
  ],
};

vi.mock("@/hooks/use-command-palette", () => ({
  useCommandPalette: () => mockState,
}));

vi.mock("@/hooks/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "tool.json-formatter.name": "JSON Formatter",
        "tool.json-formatter.description": "Format JSON",
        "cmdPalette.toggleTheme": "Toggle Theme",
        "cmdPalette.toggleThemeDesc": "Switch dark/light mode",
        "cmdPalette.placeholder": "Search tools...",
        "cmdPalette.results": "Results",
        "cmdPalette.noResults": "No results",
        "cmdPalette.tools": "Tools",
        "cmdPalette.actions": "Actions",
        "cmdPalette.navigate": "Navigate",
        "cmdPalette.select": "Select",
      };
      return map[key] ?? key;
    },
    locale: "en",
  }),
}));

// Mock HeroUI Modal and SearchField
vi.mock("@heroui/react", () => {
  const Backdrop = ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
    isOpen ? <div data-testid="modal-backdrop">{children}</div> : null;
  const Container = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const Dialog = ({ children, className }: { children: React.ReactNode; className?: string }) =>
    <div className={className}>{children}</div>;

  const Modal = Object.assign({}, { Backdrop, Container, Dialog });

  const SearchFieldGroup = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const SearchFieldInput = vi.fn().mockImplementation(
    ({ placeholder, ...props }: Record<string, unknown>) => <input placeholder={placeholder as string} {...props} />,
  );
  const SearchFieldSearchIcon = () => <span data-testid="search-icon" />;

  const SearchField = Object.assign(
    ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    { Group: SearchFieldGroup, Input: SearchFieldInput, SearchIcon: SearchFieldSearchIcon },
  );

  return { Modal, SearchField };
});

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Command: () => <span data-testid="icon-command" />,
  ArrowRight: ({ className, ...props }: Record<string, unknown>) => (
    <span data-testid="icon-arrow" className={className as string} {...props} />
  ),
}));

vi.mock("@/config/tool-icon-map", () => ({
  TOOL_ICON_MAP: {
    Braces: () => <span data-testid="icon-braces" />,
    Sun: () => <span data-testid="icon-sun" />,
  } as Record<string, React.FC>,
}));

vi.mock("@/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

describe("CommandPalette", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.isOpen = true;
    mockState.query = "";
    mockState.filteredCommands = [
      {
        id: "json-formatter",
        type: "tool",
        labelKey: "tool.json-formatter.name",
        descriptionKey: "tool.json-formatter.description",
        icon: "Braces",
        href: "/tools/json-formatter",
      },
      {
        id: "action-theme",
        type: "action",
        labelKey: "cmdPalette.toggleTheme",
        descriptionKey: "cmdPalette.toggleThemeDesc",
        icon: "Sun",
        action: "toggle-theme",
      },
    ];
  });

  it("renders when isOpen is true", () => {
    render(<CommandPalette />);
    expect(screen.getByTestId("modal-backdrop")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    mockState.isOpen = false;
    render(<CommandPalette />);
    expect(screen.queryByTestId("modal-backdrop")).not.toBeInTheDocument();
  });

  it("renders tool commands under Tools group", () => {
    render(<CommandPalette />);
    expect(screen.getByText("JSON Formatter")).toBeInTheDocument();
    expect(screen.getByText("Tools")).toBeInTheDocument();
  });

  it("renders action commands under Actions group", () => {
    render(<CommandPalette />);
    expect(screen.getByText("Toggle Theme")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("shows no results message when filteredCommands is empty", () => {
    mockState.filteredCommands = [];
    render(<CommandPalette />);
    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  it("executes command on click", () => {
    render(<CommandPalette />);
    const toolBtn = screen.getByText("JSON Formatter").closest("button");
    expect(toolBtn).toBeInTheDocument();
    fireEvent.click(toolBtn!);
    expect(mockState.executeCommand).toHaveBeenCalledWith(
      expect.objectContaining({ id: "json-formatter" }),
    );
  });

  it("has role=listbox on results container", () => {
    render(<CommandPalette />);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("has role=option on each command button", () => {
    render(<CommandPalette />);
    const options = screen.getAllByRole("option");
    expect(options.length).toBe(2);
  });

  it("first item is selected by default (aria-selected)", () => {
    render(<CommandPalette />);
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("aria-selected", "true");
    expect(options[1]).toHaveAttribute("aria-selected", "false");
  });

  it("tools button has group class for group-hover behavior", () => {
    render(<CommandPalette />);
    const toolBtn = screen.getByText("JSON Formatter").closest("button");
    expect(toolBtn?.className).toContain("group");
  });

  it("renders keyboard hints in footer", () => {
    render(<CommandPalette />);
    expect(screen.getByText("Navigate")).toBeInTheDocument();
    expect(screen.getByText("Select")).toBeInTheDocument();
  });

  it("renders ArrowRight icon with aria-hidden", () => {
    render(<CommandPalette />);
    const arrow = screen.getByTestId("icon-arrow");
    expect(arrow).toHaveAttribute("aria-hidden", "true");
  });
});
