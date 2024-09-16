import { Link } from "@remix-run/react";
import { CallToActionProps } from "~/types";

export default function CallToAction({
  title1,
  title2,
  description,
  buttonLinks,
}: CallToActionProps) {
  return (
    <div className="bg-orange-600">
      <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {title1}
            <br />
            {title2}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-orange-100">
            {description}
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link to={buttonLinks[0].href} className="btn-secondary">
              {buttonLinks[0].title}
            </Link>
            <Link
              to={buttonLinks[1].href}
              className="text-sm font-semibold leading-6 text-white"
            >
              {buttonLinks[1].title} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
