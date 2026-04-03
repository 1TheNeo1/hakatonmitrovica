import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("discover", "routes/discover.tsx"),
  route("evaluate", "routes/evaluate.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("verify", "routes/verify.tsx"),
  route("logout", "routes/logout.tsx"),
  route("apply", "routes/apply.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("edukacija", "routes/edukacija.tsx"),
  route("edukacija/novo", "routes/edukacija-novo.tsx"),
  route("edukacija/:id", "routes/edukacija-detalj.tsx"),
] satisfies RouteConfig;
