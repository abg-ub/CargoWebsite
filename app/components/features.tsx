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
    <div className="bg-primary/5 py-24 sm:py-32 overflow-hidden rounded-lg">
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
            className="isolate -mt-16 grid max-w-sm grid-cols-1 gap-y-16 divide-y
          sm:mx-auto lg:-mx-8 lg:mt-0 lg:max-w-none lg:grid-cols-3 lg:divide-x lg:divide-y-0 xl:-mx-4"
          >
            {features.map((feature) => (
              <div
                key={feature.name}
                className="flex flex-col pt-16 lg:px-8 lg:pt-0 xl:px-14"
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
