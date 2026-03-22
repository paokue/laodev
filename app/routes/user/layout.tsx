import { Outlet } from "react-router";
import { requireUser } from "@/lib/session.server";
import type { Route } from "./+types/layout";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request, ["USER", "ADMIN"]);
  return { user };
}

export default function UserLayout() {
  return <Outlet />;
}
