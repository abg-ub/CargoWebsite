import { Link } from "@remix-run/react";

export default function CallToAction() {
  return (
    <div className="bg-orange-600">
      <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Optimize Your Shipping Operations.
            <br />
            Start using our logistics solutions today.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-orange-100">
            Streamline your shipments, track deliveries in real-time, and ensure
            your packages reach their destination efficiently with our
            all-in-one platform designed for logistics and shipping management.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link to="#" className="btn-secondary">
              Contact us
            </Link>
            <Link
              to="/contact"
              className="text-sm font-semibold leading-6 text-white"
            >
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
