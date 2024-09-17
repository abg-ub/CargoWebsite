import { Link } from "@remix-run/react";
import { ContentProps } from "~/types";
import { formatUrl } from "~/utils/utils";

export default function Content({
  title1,
  title2,
  paragraph1,
  paragraph2,
  paragraph3,
  paragraph4,
  buttonLink,
  image,
  baseUrl,
}: ContentProps) {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
          <p className="text-base font-semibold leading-7 text-primary">
            {title1}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {title2}
          </h1>
          <div className="mt-10 grid max-w-xl grid-cols-1 gap-8 text-base leading-7 text-gray-700 lg:max-w-none lg:grid-cols-2">
            <div>
              <p>{paragraph1}</p>
              <p className="mt-8">{paragraph2}</p>
            </div>
            <div>
              <p>{paragraph3}</p>
              <p className="mt-8">{paragraph4}</p>
            </div>
          </div>
          {buttonLink && (
            <div className="mt-10 flex">
              <Link to={buttonLink.href} className="btn-primary">
                {buttonLink.title}
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className="relative overflow-hidden pt-16 lg:pt-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <img
            className="mb-[-12%] rounded-xl shadow-2xl ring-1 ring-gray-900/10"
            src={formatUrl(image.url, baseUrl)}
            alt={image.alternativeText}
          />
          <div className="relative" aria-hidden="true">
            <div className="absolute -inset-x-20 bottom-0 bg-gradient-to-t from-white pt-[7%]" />
          </div>
        </div>
      </div>
    </div>
  );
}
