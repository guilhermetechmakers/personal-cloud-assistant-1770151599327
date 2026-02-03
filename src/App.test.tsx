import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders ClawCloud branding on landing", () => {
  render(<App />);
  const brandElement = screen.getByText(/ClawCloud/i);
  expect(brandElement).toBeInTheDocument();
  });
});
