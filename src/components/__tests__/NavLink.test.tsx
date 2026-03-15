import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { NavLink } from "@/components/NavLink";

const renderWithRouter = (ui: React.ReactElement, { initialEntries = ["/"] } = {}) =>
  render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>);

describe("NavLink", () => {
  it("renders children content", () => {
    renderWithRouter(<NavLink to="/about">About Us</NavLink>);
    expect(screen.getByText("About Us")).toBeInTheDocument();
  });

  it("applies className to rendered link", () => {
    renderWithRouter(
      <NavLink to="/about" className="custom-class">
        About
      </NavLink>
    );
    const link = screen.getByText("About");
    expect(link).toHaveClass("custom-class");
  });

  it("applies activeClassName when route matches", () => {
    renderWithRouter(
      <NavLink to="/" className="base" activeClassName="is-active">
        Home
      </NavLink>,
      { initialEntries: ["/"] }
    );
    const link = screen.getByText("Home");
    expect(link).toHaveClass("is-active");
  });
});
