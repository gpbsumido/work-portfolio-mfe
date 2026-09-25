import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { axe } from "vitest-axe";
import WorkPortfolioContent from "../WorkPortfolioContent";
import { FEATURES, projectFor } from "../_data/catalog";

describe("work-portfolio accessibility", () => {
  it("has no axe violations on the intro state", async () => {
    const { container } = render(<WorkPortfolioContent />);
    expect(await axe(container)).toHaveNoViolations();
  }, 30000);

  it("has no axe violations with a demo selected", async () => {
    const { container } = render(
      <WorkPortfolioContent initialFeature="realtime-metrics" />,
    );
    await screen.findByTestId("signup-count");
    expect(await axe(container)).toHaveNoViolations();
  }, 30000);

  it("announces selection changes through a live region", () => {
    render(<WorkPortfolioContent />);
    fireEvent.click(screen.getByRole("button", { name: "Next feature" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      `Showing ${FEATURES[0].title} from ${projectFor(FEATURES[0]).name}`,
    );
  });
});
