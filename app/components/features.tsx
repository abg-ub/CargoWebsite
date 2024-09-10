import {
  TruckIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    name: "Real-time Shipment Tracking",
    description:
      "Stay updated with live tracking information for all estimated arrival of your packages with real-time updates.",
    href: "#",
    icon: MapPinIcon,
  },
  {
    name: "Customs Clearance Assistance",
    description:
      "We simplify the customs process by handling all the paperwork and ensuring your shipments comply with international regulations, minimizing delays and ensuring smooth delivery.",
    href: "#",
    icon: ShieldCheckIcon,
  },
  {
    name: "Multi-Carrier Shipping",
    description:
      "Choose from multiple carriers to find the best shipping option for your needs, balancing speed, reliability, and cost-efficiency for every shipment.",
    href: "#",
    icon: TruckIcon,
  },
];

export default function Features() {
  return (
    <div className="relative isolate bg-white py-24 sm:py-32 overflow-hidden rounded-lg">
      <svg
        aria-hidden="true"
        className="absolute inset-0 -z-10 h-full w-full stroke-primary/15 "
      >
        <defs>
          <pattern
            x="50%"
            y={-1}
            id="new-pattern-unique-id"
            width={80}
            height={80}
            patternUnits="userSpaceOnUse"
          >
            <path
              fill="none"
              id="Combined-Shape"
              d="M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z"
            />
          </pattern>
        </defs>
        <rect
          fill="url(#new-pattern-unique-id)"
          width="100%"
          height="100%"
          strokeWidth={0}
        />
      </svg>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Streamline Your Shipping Experience
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Simplify your shipping with real-time tracking, clearance
            assistance, and seamless integration across multiple carriers.
            Experience hassle-free logistics management tailored to your needs.
          </p>
        </div>
        <div className="mt-20 flow-root">
          <dl
            className="isolate -mt-8 grid max-w-sm grid-cols-1 gap-y-8 divide-y
          sm:mx-auto lg:-mx-8 lg:mt-0 lg:max-w-none lg:grid-cols-3 lg:divide-x lg:divide-y-0 xl:-mx-4"
          >
            {features.map((feature) => (
              <div
                key={feature.name}
                className="flex flex-col pt-8 lg:px-8 lg:pt-0 xl:px-14"
              >
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <feature.icon
                      aria-hidden="true"
                      className="h-6 w-6 text-white"
                    />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                  <p className="mt-6">
                    <a
                      href={feature.href}
                      className="text-sm font-semibold leading-6 text-primary"
                    >
                      Learn more <span aria-hidden="true">→</span>
                    </a>
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
