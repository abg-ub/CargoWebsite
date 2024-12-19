import { z } from "zod";
import { useRemixForm } from "remix-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ComboBox from "./combo-box";
import { Form } from "@remix-run/react";
import { Tracking, Shipment, Location } from "~/types";
import { cn } from "~/utils/utils";

export const trackingSchema = z.object({
  id: z.number().optional(),
  documentId: z.string().optional(),
  shipment: z.string().min(1, "Shipment is required"),
  shipmentStatus: z.string().min(1, "Status is required"),
  location: z.string().min(1, "Location is required"),
});

type TrackingFormData = z.infer<typeof trackingSchema>;

interface TrackingFormProps {
  setOpen: (open: boolean) => void;
  item?: Tracking;
  loaderData: {
    trackings: { data: Tracking[] };
    shipments: { data: Shipment[] };
    locations: { data: Location[] };
  };
}

export default function TrackingForm({
  setOpen,
  item,
  loaderData,
}: TrackingFormProps) {
  const shipments = loaderData.shipments.data;
  const locations = loaderData.locations.data;

  // Add these console logs to debug
  console.log("Item being edited:", item);
  console.log("Available locations:", locations);
  console.log("Item location:", item?.location);
  
  const locationDefaultValue = item?.location ? 
    `${item.location.name} - ${item.location.address}` : "";
  console.log("Location default value:", locationDefaultValue);

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useRemixForm<TrackingFormData>({
    defaultValues: {
      id: item?.id,
      documentId: item?.documentId,
      shipment: item?.shipment?.documentId ?? "",
      shipmentStatus: item?.shipmentStatus ?? "",
      location: item?.location?.documentId ?? "",
    },
    mode: "onChange",
    resolver: zodResolver(trackingSchema),
    submitConfig: {
      method: item ? "PUT" : "POST",
    },
  });

  return (
    <Form onSubmit={handleSubmit}>
      {item && (
        <>
          <input type="hidden" {...register("id")} />
          <input type="hidden" {...register("documentId")} />
        </>
      )}

      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            {item ? "Edit Tracking" : "Tracking Information"}
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <ComboBox
                name="shipment"
                label="Shipment"
                items={shipments.map((shipment) => ({
                  id: shipment.documentId,
                  name: shipment.trackingNumber,
                }))}
                error={errors.shipment?.message}
                defaultValue={item?.shipment?.trackingNumber}
                onChange={(value) => {
                  const selectedShipment = shipments.find(
                    (s) => s.trackingNumber === value
                  );
                  register("shipment").onChange({
                    target: {
                      value: selectedShipment?.documentId ?? "",
                      name: "shipment",
                    },
                  });
                }}
              />
            </div>

            <div className="sm:col-span-3">
              <ComboBox
                name="shipmentStatus"
                label="Status"
                items={[
                  { id: 1, name: "Pending" },
                  { id: 2, name: "In Transit" },
                  { id: 3, name: "Delivered" },
                  { id: 4, name: "Returned" },
                ]}
                error={errors.shipmentStatus?.message}
                defaultValue={item?.shipmentStatus}
                onChange={(value) => {
                  register("shipmentStatus").onChange({
                    target: { value, name: "shipmentStatus" },
                  });
                }}
              />
            </div>

            <div className="sm:col-span-3">
              <ComboBox
                name="location"
                label="Location"
                items={locations.map((location) => ({
                  id: location.documentId,
                  name: `${location.name} - ${location.address}`,
                }))}
                error={errors.location?.message}
                defaultValue={locationDefaultValue}
                onChange={(value) => {
                  console.log("Selected location value:", value);
                  const selectedLocation = locations.find(
                    (loc) => `${loc.name} - ${loc.address}` === value
                  );
                  console.log("Found selected location:", selectedLocation);
                  register("location").onChange({
                    target: {
                      value: selectedLocation?.documentId ?? "",
                      name: "location",
                    },
                  });
                }}
              />
            </div>

          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm font-semibold leading-6 text-gray-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          className={cn(
            "rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50",
            isSubmitting && "animate-pulse cursor-not-allowed"
          )}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : item ? "Update" : "Save"}
        </button>
      </div>
    </Form>
  );
}