import {
  BellIcon,
  GlobeAltIcon,
  LockClosedIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    name: "Secure Shipments: ",
    description:
      "Safeguard your cargo with advanced security measures, including tamper-proof seals and real-time monitoring to prevent theft or loss.",
    icon: LockClosedIcon,
  },
  {
    name: "Global Shipping Network: ",
    description:
      "Utilize a vast international network to ship to over 200 countries with reliable, fast, and cost-effective delivery solutions.",
    icon: GlobeAltIcon,
  },
  {
    name: "Optimized Logistics: ",
    description:
      "Our cutting-edge logistics technology ensures optimized delivery routes, reducing costs and transit times for your shipments.",
    icon: Cog6ToothIcon,
  },
  {
    name: "Automated Shipment Scheduling: ",
    description:
      "Easily schedule shipments with automated processes, reducing manual work and ensuring timely pickups and deliveries.",
    icon: ArrowPathIcon,
  },
  {
    name: "Real-Time Delivery Notifications: ",
    description:
      "Stay informed with real-time updates on your shipments, from dispatch to delivery, ensuring full visibility for you and your customers.",
    icon: BellIcon,
  },
  {
    name: "Warehouse Management: ",
    description:
      "Easily manage inventory and shipments with our integrated warehouse solutions, streamlining storage and distribution.",
    icon: BuildingOfficeIcon,
  },
];

export default function Features2() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Comprehensive Shipping Solutions
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Seamless, Secure, and Global
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our innovative shipping platform offers everything you need for
            fast, secure, and cost-effective deliveries, no matter where your
            business operates.
          </p>
        </div>
      </div>
      <div className="relative overflow-hidden pt-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <img
            alt="App screenshot"
            src="/images/logistics.jpeg"
            width={2432}
            height={1442}
            className="mb-[-12%] rounded-xl shadow-2xl ring-1 ring-gray-900/10"
          />
          <div aria-hidden="true" className="relative">
            <div className="absolute -inset-x-20 bottom-0 bg-gradient-to-t from-white pt-[7%]" />
          </div>
        </div>
      </div>
      <div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-20 md:mt-24 lg:px-8">
        <dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 text-gray-600 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
          {features.map((feature) => (
            <div key={feature.name} className="relative pl-9">
              <dt className="inline font-semibold text-gray-900">
                <feature.icon
                  aria-hidden="true"
                  className="absolute left-1 top-1 h-5 w-5 text-primary"
                />
                {feature.name}
              </dt>
              <dd className="inline">{feature.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
