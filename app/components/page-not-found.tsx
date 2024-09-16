import { Link } from "@remix-run/react";

type PageNotFoundProps = {
  errorCode?: string;
  title?: string;
  message?: string;
};

export default function PageNotFound({
  errorCode = "404",
  title = "Page not found",
  message = "Sorry, we couldn’t find the page you’re looking for.",
}: PageNotFoundProps) {
  return (
    <main className="relative isolate grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <svg
        aria-hidden="true"
        className="absolute inset-0 -z-10 h-full w-full stroke-primary/5"
      >
        <defs>
          <pattern
            id="hexagon-pattern"
            width={840} // Increase the size to match the larger hexagons
            height={1470} // Increase to match the larger hexagons
            patternUnits="userSpaceOnUse"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="840" // Double the size to make hexagons bigger
              height="1470" // Double the size
              viewBox="0 0 28 49" // The viewBox stays the same, so the SVG scales up
            >
              <path
                fill="none"
                d="M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z"
              />
            </svg>
          </pattern>
        </defs>

        <rect
          fill="url(#hexagon-pattern)"
          width="100%"
          height="100%"
          strokeWidth={0}
        />
      </svg>

      <div className="text-center">
        <p className="text-base font-semibold text-primary">{errorCode}</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          {title}
        </h1>
        <p className="mt-6 text-base leading-7 text-gray-600">{message}</p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link to="/" className="btn-primary">
            Go back home
          </Link>
          <Link to="/contact" className="text-sm font-semibold text-gray-900">
            Contact support <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
