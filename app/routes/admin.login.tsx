import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { commitSession, getSession } from "~/session.server";
import SignInForm from "~/components/sign-in-form";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const identifier = formData.get("email");
  const password = formData.get("password");

  // Send login credentials to Strapi
  const response = await fetch(`${process.env.STRAPI_URL}/api/auth/local`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier,
      password,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    return json({ error: errorData.message }, { status: response.status });
  }

  const { jwt } = await response.json();

  // Get the session and store the JWT
  const session = await getSession(request.headers.get("Cookie"));
  session.set("jwt", jwt);

  return redirect("/admin/dashboard", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function AdminLogin() {
  return <SignInForm />;
}
