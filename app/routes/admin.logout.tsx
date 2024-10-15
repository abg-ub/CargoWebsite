// app/routes/logout.jsx
import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { destroySession, getSession } from "~/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));

  // Destroy the session
  return redirect("/admin", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
};
