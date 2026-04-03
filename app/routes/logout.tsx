import type { Route } from "./+types/logout";
import { destroyUserSession } from "~/lib/session.server";
import { redirect } from "react-router";

export async function loader() {
  throw redirect("/");
}

export async function action({ request }: Route.ActionArgs) {
  return destroyUserSession(request);
}
