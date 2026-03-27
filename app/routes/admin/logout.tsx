import { redirect } from "react-router"
import { destroyAdminSession } from "@/lib/admin-session.server"
import type { Route } from "./+types/logout"

export async function loader({ request }: Route.LoaderArgs) {
  throw redirect("/admin/login", {
    headers: { "Set-Cookie": await destroyAdminSession() },
  })
}
