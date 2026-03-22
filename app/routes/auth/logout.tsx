import { redirect } from "react-router";
import { destroySession } from "@/lib/session.server";
import type { Route } from "./+types/logout";

export async function action({ request }: Route.ActionArgs) {
  const cookie = await destroySession();
  throw redirect("/login", {
    headers: { "Set-Cookie": cookie },
  });
}

// If someone navigates to /logout directly via GET
export async function loader() {
  const cookie = await destroySession();
  throw redirect("/login", {
    headers: { "Set-Cookie": cookie },
  });
}
