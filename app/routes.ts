import { type RouteConfig, route, layout } from "@react-router/dev/routes";

export default [
  // Public routes
  route("/", "routes/home.tsx"),
  route("/developers", "routes/developers.tsx"),
  route("/developers/:id", "routes/developers.$id.tsx"),
  route("/book/:id", "routes/book.$id.tsx"),
  route("/messages", "routes/messages.tsx"),

  // Auth
  route("/login", "routes/auth/login.tsx"),
  route("/register/user", "routes/auth/register.user.tsx"),
  route("/register/developer", "routes/auth/register.developer.tsx"),
  route("/register/developer/pending", "routes/auth/register.developer.pending.tsx"),
  route("/forgot-password", "routes/auth/forgot-password.tsx"),
  route("/reset-password", "routes/auth/reset-password.tsx"),
  route("/logout", "routes/auth/logout.tsx"),

  // Posts
  route("/posts", "routes/posts/index.tsx"),
  route("/posts/create", "routes/posts/create.tsx"),
  route("/posts/:id", "routes/posts/detail.tsx"),

  // Knowledge
  route("/knowledge", "routes/knowledge/index.tsx"),
  route("/knowledge/write", "routes/knowledge/write.tsx"),
  route("/knowledge/:id", "routes/knowledge/detail.tsx"),

  // User routes (protected)
  layout("routes/user/layout.tsx", [
    route("/user", "routes/user/dashboard.tsx"),
    route("/user/bookings", "routes/user/bookings.tsx"),
    route("/user/messages", "routes/user/messages.tsx"),
    route("/user/profile", "routes/user/profile.tsx"),
  ]),

  // Developer routes (protected)
  layout("routes/developer/layout.tsx", [
    route("/developer", "routes/developer/dashboard.tsx"),
    route("/developer/bookings", "routes/developer/bookings.tsx"),
    route("/developer/articles", "routes/developer/articles.tsx"),
    route("/developer/messages", "routes/developer/messages.tsx"),
    route("/developer/profile", "routes/developer/profile.tsx"),
    route("/developer/earnings", "routes/developer/earnings.tsx"),
  ]),

  // Admin auth (outside layout — no sidebar)
  route("/admin/login", "routes/admin/login.tsx"),
  route("/admin/logout", "routes/admin/logout.tsx"),

  // Admin routes (with layout — protected by admin session)
  layout("routes/admin/layout.tsx", [
    route("/admin", "routes/admin/dashboard.tsx"),
    route("/admin/developers", "routes/admin/developers/index.tsx"),
    route("/admin/developers/:id", "routes/admin/developers/detail.tsx"),
    route("/admin/users", "routes/admin/users/index.tsx"),
    route("/admin/posts", "routes/admin/posts.tsx"),
    route("/admin/bookings", "routes/admin/bookings.tsx"),
    route("/admin/payments", "routes/admin/payments.tsx"),
    route("/admin/messages", "routes/admin/messages.tsx"),
    route("/admin/settings", "routes/admin/settings.tsx"),
  ]),
] satisfies RouteConfig;
