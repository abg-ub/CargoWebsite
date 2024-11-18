import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { isTokenValidWithStrapi } from "~/api/loaders.server";
import { getSession } from "~/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const jwt = session.get("jwt");
  const url = new URL(request.url);

  if (!jwt || !(await isTokenValidWithStrapi(jwt))) {
    if (url.pathname !== "/admin/login") {
      return redirect("/admin/login");
    }
  } else {
    if (!url.pathname.startsWith("/admin/dashboard")) {
      return redirect("/admin/dashboard");
    }
  }

  return null;
}

export default function Admin() {
  return <Outlet />;
}
