import { Link, useLocation } from "react-router-dom";

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return <span className="text-sm text-shell-text-secondary">Dashboard</span>;
  }

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      <Link to="/" className="text-shell-text-secondary hover:text-shell-text-primary transition-colors">
        Dashboard
      </Link>
      {segments.map((segment, i) => {
        const path = "/" + segments.slice(0, i + 1).join("/");
        const isLast = i === segments.length - 1;
        return (
          <span key={path} className="flex items-center gap-1.5">
            <span className="text-shell-text-tertiary">/</span>
            {isLast ? (
              <span className="text-shell-text-primary">{capitalize(segment)}</span>
            ) : (
              <Link
                to={path}
                className="text-shell-text-secondary hover:text-shell-text-primary transition-colors"
              >
                {capitalize(segment)}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
