import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";

import {
  json,
  type LinksFunction,
  type LoaderFunction,
  type MetaFunction,
} from "@remix-run/node";
import stylesheet from "~/tailwind.css?url";
import Header from "~/components/header";
import Footer from "~/components/footer";
import PageNotFound from "~/components/page-not-found";
import { getGlobalData } from "~/api/loaders.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "icon", href: "/favicon.ico" },
];

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (data && data.siteName && data.siteDescription) {
    return [
      { title: data.siteName },
      { name: "description", content: data.siteDescription },
    ];
  }

  // Fallback meta tags if data is not available
  return [
    { title: "Wakhan Line" },
    { name: "description", content: "Welcome to Wakhan Line" },
  ];
};

export const loader: LoaderFunction = async () => {
  const globalData = await getGlobalData();
  return json(globalData);
};

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
  const data = useLoaderData<typeof loader>();
  return (
    <>
      <Header {...data.header} />
      <Outlet />
      <Footer {...data.footer} />
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
    console.log(error.name);
  }

  return <PageNotFound title={errorTitle} message={errorMessage} />;
}
