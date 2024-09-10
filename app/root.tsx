import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import stylesheet from "~/tailwind.css?url";
import Header from "~/components/header";
import Footer from "~/components/footer";
import PageNotFound from "~/components/page-not-found";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "icon", href: "/favicon.ico" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <PageNotFound
        errorCode={error.status.toString()}
        title={error.statusText}
        message={error.data.message}
      />
    );
  }

  let errorMessage = "An unexpected error occurred";
  let errorTitle = "Unexpected Error";
  if (error instanceof Error) {
    errorMessage = error.message;
    errorTitle = error.name;
  }

  return <PageNotFound title={errorTitle} message={errorMessage} />;
}
