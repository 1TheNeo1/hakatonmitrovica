import { Link, useLocation, Form } from "react-router";
import type { User } from "~/lib/types";

export function Navbar({ user }: { user: User | null }) {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isHome
          ? "bg-transparent"
          : "bg-bg-primary/80 backdrop-blur-lg border-b border-border-subtle"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="text-lg font-bold tracking-tight hover:opacity-80 transition-opacity"
        >
          <span className="animated-gradient-text">MitroStart</span>
        </Link>

        <div className="flex items-center gap-1">
          <NavLink to="/discover" active={location.pathname === "/discover"}>
            Analiziraj ideju
          </NavLink>
          <NavLink to="/evaluate" active={location.pathname === "/evaluate"}>
            Evauliraj ideju
          </NavLink>
          <NavLink to="/edukacija" active={location.pathname.startsWith("/edukacija")}>
            Edukacija
          </NavLink>

          {user ? (
            <>
              <NavLink
                to="/community"
                active={location.pathname.startsWith("/community")}
              >
                Zajednica
              </NavLink>
              <NavLink
                to="/dashboard"
                active={location.pathname === "/dashboard"}
              >
                Kontrolna tabla
              </NavLink>
              <Form method="post" action="/logout" className="inline">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all duration-200 cursor-pointer"
                >
                  Odjavi se
                </button>
              </Form>
            </>
          ) : (
            <NavLink to="/login" active={location.pathname === "/login"}>
              Prijavi se
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-white/10 text-text-primary"
          : "text-text-secondary hover:text-text-primary hover:bg-white/5"
      }`}
    >
      {children}
    </Link>
  );
}
