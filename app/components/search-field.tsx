export default function SearchField() {
  return (
    <div className="shadow sm:rounded-lg max-w-3xl mx-auto">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Order Tracking
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            Enter your tracking number to see the current status of your order.
          </p>
        </div>
        <form className="mt-5 sm:flex sm:items-center">
          <div className="w-full sm:max-w-xs">
            <label htmlFor="tracking-number" className="sr-only">
              Tracking Number
            </label>
            <input
              id="tracking-number"
              name="tracking-number"
              type="text"
              placeholder="Enter tracking number"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
            />
          </div>
          <button
            type="submit"
            className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:ml-3 sm:mt-0 sm:w-auto"
          >
            Track Order
          </button>
        </form>
      </div>
    </div>
  );
}
