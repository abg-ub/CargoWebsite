import { useRef, useEffect, useState } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import SelectMenu from "~/components/select-menu";
import { getServicePoints } from "~/api/loaders.server";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ServicePoint } from "~/types";

export async function loader() {
  const servicePoints = await getServicePoints();
  return json(servicePoints);
}

export default function ServicePoints() {
  const servicePoints = useLoaderData<typeof loader>();
  console.log(servicePoints);
  const [selectedServicePoint, setSelectedServicePoint] =
    useState<ServicePoint>(servicePoints[0]);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maptilersdk.Map | null>(null);
  const marker = useRef<maptilersdk.Marker | null>(null);
  const zoom = 14;
  maptilersdk.config.apiKey = "9pe595rwkB5R4OTEWioZ";

  useEffect(() => {
    if (map.current || !mapContainer.current) return; // stops map from initializing more than once and ensures container is available
    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      center: [selectedServicePoint.longitude, selectedServicePoint.latitude],
      zoom: zoom,
    });

    marker.current = new maptilersdk.Marker({ color: "#ff6200" })
      .setLngLat([
        selectedServicePoint.longitude,
        selectedServicePoint.latitude,
      ])
      .addTo(map.current);
  }, [selectedServicePoint]);

  useEffect(() => {
    if (map.current && marker.current) {
      map.current.flyTo({
        center: [selectedServicePoint.longitude, selectedServicePoint.latitude],
        zoom: zoom,
        essential: true,
        duration: 1200,
      });
      marker.current.setLngLat([
        selectedServicePoint.longitude,
        selectedServicePoint.latitude,
      ]);
    }
  }, [selectedServicePoint]);

  return (
    <main className="pt-14">
      <div className="py-24 sm:py-32 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="px-6 py-12 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Service Points
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Find convenient locations for pickup and drop-off of your
              shipments
            </p>
            <div className="mt-24">
              <SelectMenu
                servicePoints={servicePoints}
                selectedServicePoint={selectedServicePoint}
                setSelectedServicePoint={setSelectedServicePoint}
              />
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg shadow h-[24rem] md:h-[32rem] lg:h-[40rem]">
          <div ref={mapContainer} className="w-full h-full" />
        </div>
      </div>
    </main>
  );
}
