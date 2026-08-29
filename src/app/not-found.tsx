import { Link } from "@tanstack/react-router";

export const NotFoundPage = () => (
  <div>
    <p>This is the notFoundComponent configured on root route</p>
    <Link to="/">Start Over</Link>
  </div>
);