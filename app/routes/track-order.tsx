import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { getTrackings } from "~/api/loaders.server";
import SearchField from "~/components/search-field";
import ProgressBar from "~/components/progress-bar";
import { Tracking } from "~/types";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const trackingNumber = url.searchParams.get("tracking-number");

  if (!trackingNumber) {
    return json({ trackings: [] });
  }

  const trackingsResponse = await getTrackings(request, 1, 100, trackingNumber);
  return json({ trackings: trackingsResponse.data });
}

function transformTrackingsToSteps(trackings: Tracking[]) {
  const sortedTrackings = [...trackings].sort((a, b) => 
    new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime()
  );

  return sortedTrackings.map((tracking, index) => ({
    id: `0${index + 1}`,
    name: tracking.shipmentStatus,
    status: index === sortedTrackings.length - 1 ? 'current' : 'complete',
    description: tracking.location.address,
    href: '#'
  }));
}

export default function TrackOrder() {
  const fetcher = useFetcher<typeof loader>();
  const steps = transformTrackingsToSteps(fetcher.data?.trackings || []);

  return (
    <main className="h-full pt-14">
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="px-6 py-12 sm:py-16 lg:px-8">
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
          <SearchField fetcher={fetcher} />
          <div className="pt-10">
            {fetcher.data && <ProgressBar steps={steps} />}
          </div>
        </div>
      </div>
    </main>
  );
}
