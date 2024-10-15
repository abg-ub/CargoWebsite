import { type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { isTokenValidWithStrapi } from "~/api/loaders.server";
import SidebarNav from "~/components/sidebar-nav";
import { getSession } from "~/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const jwt = session.get("jwt");

  if (!jwt || !(await isTokenValidWithStrapi(jwt))) {
    return redirect("/admin/login");
  }

  return null;
}

export default function AdminDashboard() {
  return <SidebarNav />;
}
