import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { commitSession, getSession } from "~/session.server";
import SignInForm from "~/components/form/sign-in-form";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const identifier = formData.get("email");
    const password = formData.get("password");

    const response = await fetch(`${process.env.STRAPI_URL}/api/auth/local`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return json(
        {
          error: data.error?.message || "Invalid email or password",
        },
        { status: response.status }
      );
    }

    const { jwt } = data;
    const session = await getSession(request.headers.get("Cookie"));
    session.set("jwt", jwt);

    return redirect("/admin/dashboard", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error) {
    return json(
      {
        error: "An error occurred during login. Please try again.",
      },
      { status: 500 }
    );
  }
}

export default function AdminLogin() {
  return <SignInForm />;
}
