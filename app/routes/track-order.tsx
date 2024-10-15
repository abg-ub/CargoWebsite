import SearchField from "~/components/search-field";

export default function TrackOrder() {
  return (
    <main className="h-full pt-14">
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className=" px-6 py-12 sm:py-16 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Track Your Order
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Enter your tracking number to get real-time updates on your
                shipment.
              </p>
            </div>
          </div>
          <SearchField />
        </div>
      </div>
    </main>
  );
}
