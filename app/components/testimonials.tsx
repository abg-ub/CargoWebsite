import { TestimonialsProps } from "~/types";

import { cn, formatUrl, splitTestimonials } from "~/utils/utils";

export default function Testimonials({
  title,
  description,
  testimonies,
  baseUrl,
}: TestimonialsProps) {
  const featuredTestimonial = testimonies.find(
    (testimony) => testimony.isFeatured
  );

  const testimonials = testimonies.filter((testimony) => !testimony.isFeatured);
  const testimonialColumns = splitTestimonials(testimonials);

  return (
    <div className="relative isolate bg-white pb-32 pt-24 sm:pt-32">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 transform-gpu overflow-hidden opacity-30 blur-3xl"
      >
        <div
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
          className="ml-[max(50%,38rem)] aspect-[1313/771] w-[82.0625rem] bg-gradient-to-tr from-white to-primary"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 flex transform-gpu overflow-hidden pt-32 opacity-25 blur-3xl sm:pt-40 xl:justify-end"
      >
        <div
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
          className="ml-[-22rem] aspect-[1313/771] w-[82.0625rem] flex-none origin-top-right rotate-[30deg] bg-gradient-to-tr from-white to-primary xl:ml-0 xl:mr-[calc(50%-12rem)]"
        />
      </div>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-lg font-semibold leading-8 tracking-tight text-primary">
            {title}
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {description}
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 grid-rows-1 gap-8 text-sm leading-6 text-gray-900 sm:mt-20 sm:grid-cols-2 xl:mx-0 xl:max-w-none xl:grid-flow-col xl:grid-cols-4">
          {/* Featured Testimonial */}
          {featuredTestimonial && (
            <figure className="rounded-2xl bg-white shadow-lg ring-1 ring-gray-900/5 sm:col-span-2 xl:col-start-2 xl:row-end-1">
              <blockquote className="p-6 text-lg font-semibold leading-7 tracking-tight text-gray-900 sm:p-12 sm:text-xl sm:leading-8">
                <p>{featuredTestimonial.text}</p>
              </blockquote>
              <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-4 border-t border-gray-900/10 px-6 py-4 sm:flex-nowrap">
                <img
                  alt={featuredTestimonial.image.alternativeText}
                  src={formatUrl(featuredTestimonial.image.url, baseUrl)}
                  className="h-10 w-10 flex-none rounded-full bg-gray-50"
                />
                <div className="flex-auto">
                  <div className="font-semibold">
                    {featuredTestimonial.name}
                  </div>
                  <div className="text-gray-600">{`@${featuredTestimonial.handle}`}</div>
                </div>
                <img
                  alt={featuredTestimonial.image.alternativeText}
                  src={formatUrl(featuredTestimonial.logo.url, baseUrl)}
                  className="h-10 w-auto flex-none"
                />
              </figcaption>
            </figure>
          )}

          {/* Testimonials */}
          {testimonialColumns.map((columnGroup, columnGroupIdx) => (
            <div
              key={columnGroupIdx}
              className="space-y-8 xl:contents xl:space-y-0"
            >
              {columnGroup.map((testimonial, columnIdx) => (
                <div
                  key={columnIdx}
                  className={cn(
                    (columnGroupIdx === 0 && columnIdx === 0) ||
                      (columnGroupIdx === testimonialColumns.length - 1 &&
                        columnIdx === columnGroup.length - 1)
                      ? "xl:row-span-2"
                      : "xl:row-start-1",
                    "space-y-8"
                  )}
                >
                  <figure
                    key={testimonial.handle}
                    className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-900/5"
                  >
                    <blockquote className="text-gray-900">
                      <p>{testimonial.text}</p>
                    </blockquote>
                    <figcaption className="mt-6 flex items-center gap-x-4">
                      <img
                        alt={testimonial.image.alternativeText}
                        src={formatUrl(testimonial.image.url, baseUrl)}
                        className="h-10 w-10 rounded-full bg-gray-50"
                      />
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-gray-600">{`@${testimonial.handle}`}</div>
                      </div>
                    </figcaption>
                  </figure>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
