import {
  isRouteErrorResponse,
  Link,
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

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "icon", href: "/favicon.ico" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="max-w-md text-center bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-4xl font-semibold text-red-500">
            {error.status}
          </h1>
          <h2 className="text-xl font-medium text-gray-700 mt-2">
            {error.statusText}
          </h2>
          <p className="text-gray-600 mt-4">
            It seems something went wrong. Please try again or contact support
            if the issue persists.
          </p>
          {error.data?.message && (
            <p className="mt-4 text-red-500 font-bold">{error.data.message}</p>
          )}
          <Link
            to="/"
            className="mt-6 inline-block px-6 py-2 text-white bg-primary rounded-full hover:bg-primary-dark transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  let errorMessage = "An unexpected error occurred";
  if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="max-w-md text-center bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-4xl font-semibold text-red-500">Whoops!</h1>
        <p className="text-gray-600 mt-4">
          Something unexpected happened. We&apos;re working to fix it.
        </p>
        <p className="mt-4 text-red-500 font-bold">{errorMessage}</p>
        <Link
          to="/"
          className="mt-6 inline-block px-6 py-2 text-white bg-primary rounded-full hover:bg-primary-dark transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
