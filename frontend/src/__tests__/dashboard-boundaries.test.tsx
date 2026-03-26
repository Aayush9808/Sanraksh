import { render, screen } from "@testing-library/react";
import DashboardLoading from "../app/dashboard/loading";
import DashboardError from "../app/dashboard/error";

describe("Dashboard Loading", () => {
  it("renders loading spinner", () => {
    render(<DashboardLoading />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });
});

describe("Dashboard Error", () => {
  it("renders error message and retry button", () => {
    const mockReset = jest.fn();
    const error = new Error("Test failure");

    render(<DashboardError error={error} reset={mockReset} />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Test failure")).toBeInTheDocument();
    expect(screen.getByText("Try Again")).toBeInTheDocument();
  });

  it("calls reset on retry click", () => {
    const mockReset = jest.fn();
    const error = new Error("Fail");

    render(<DashboardError error={error} reset={mockReset} />);
    screen.getByText("Try Again").click();

    expect(mockReset).toHaveBeenCalledTimes(1);
  });
});
