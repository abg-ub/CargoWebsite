import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useRouteError,
} from "@remix-run/react";

import { json, type LinksFunction, type LoaderFunction } from "@remix-run/node";
import stylesheet from "~/tailwind.css?url";
import "mapbox-gl/dist/mapbox-gl.css";
import Header from "~/components/header";
import Footer from "~/components/footer";
import PageNotFound from "~/components/page-not-found";
import { getGlobalData } from "~/api/loaders.server";
import * as process from "node:process";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "icon", href: "/favicon.ico" },
];

export const loader: LoaderFunction = async () => {
  const globalData = await getGlobalData();
  return json({
    globalData: globalData,
    ENV: { STRAPI_URL: process.env.STRAPI_URL },
  });
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
  const location = useLocation();
  console.log(data);

  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && (
        <Header {...data.globalData.header} baseUrl={data.ENV.STRAPI_URL} />
      )}
      <Outlet />
      {!isAdminRoute && (
        <Footer {...data.globalData.footer} baseUrl={data.ENV.STRAPI_URL} />
      )}
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
