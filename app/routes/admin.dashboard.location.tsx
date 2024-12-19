import { ActionFunction, json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import Table from "~/components/form/table";
import { getLocations } from "~/api/loaders.server";
import { useState, useEffect } from "react";
import ModalDialog from "~/components/modal-dialog";
import Alert from "~/components/alert";
import { toast } from "react-toastify";
import { LocationData, type Location } from "~/types";
import LocationForm from "~/components/form/location-form";
import {
  deleteLocations,
  saveLocation,
  updateLocation,
} from "~/api/actions.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "10");
  const searchQuery = url.searchParams.get("search") ?? "";

  try {
    // Load both locations and all branches
    const locationsData = await getLocations(
      request,
      page,
      pageSize,
      searchQuery
    );
    return json({
      data: locationsData,
    });
  } catch (error) {
    console.error("Loader error:", error);
    throw new Error("Failed to fetch data");
  }
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  if (request.method.toLowerCase() === "delete") {
    try {
      const ids = JSON.parse(formData.get("ids") as string);
      await deleteLocations(ids, request);
      return json({ success: true });
    } catch (error) {
      return json(
        {
          errors: {
            apiError: {
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to delete locations",
              type: "api_error",
            },
          },
        },
        { status: 500 }
      );
    }
  }

  const rawData = Object.fromEntries(formData);
  const locationData: LocationData = {
    name: rawData.name?.toString().trim() ?? "",
    address: rawData.address?.toString().trim() ?? "",
    latitude: parseFloat(rawData.latitude?.toString() ?? "0"),
    longitude: parseFloat(rawData.longitude?.toString() ?? "0"),
  };

  if (rawData.id) {
    locationData.id = rawData.id.toString();
  }

  if (rawData.documentId) {
    locationData.documentId = rawData.documentId.toString();
  }

  try {
    if (request.method.toLowerCase() === "put") {
      if (!locationData.documentId) {
        throw new Error("Location documentId is required for updates");
      }
      await updateLocation(locationData, request);
    } else {
      await saveLocation(locationData, request);
    }

    return json({ success: true });
  } catch (error) {
    console.error("Action error:", error);
    return json(
      {
        errors: {
          apiError: {
            message:
              error instanceof Error
                ? error.message
                : "An unexpected error occurred",
            type: "api_error",
          },
        },
      },
      { status: 500 }
    );
  }
};

export default function Location() {
  const { data } = useLoaderData<typeof loader>();
  const { data: locationsData, meta } = data;
  const fetcher = useFetcher();

  // State management
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<
    Location | undefined
  >();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<(string | number)[]>([]);
  const [hasToastShown, setHasToastShown] = useState(false);

  // Create a mapped version of locations for display
  const locationsDisplay = locationsData.map((point: Location) => ({
    id: point.id,
    name: point.name,
    latitude: point.latitude,
    longitude: point.longitude,
  }));

  console.log(locationsData)

  const handleEdit = (displayPoint: Location) => {
    const originalPoint = locationsData.find(
      (p: Location) => p.id === displayPoint.id
    );

    if (!originalPoint) {
      console.error("Location not found:", {
        displayPoint,
        allPoints: locationsData,
      });
      toast.error("Unable to edit location: Data not found");
      return;
    }

    setSelectedLocation(originalPoint);
    setModalOpen(true);
  };

  const handleDelete = async (ids: (string | number)[]) => {
    if (isDeleting) return;
    const validIds = ids.filter((id) => id != null);
    if (validIds.length === 0) {
      toast.error("No valid items selected for deletion");
      return;
    }
    setItemsToDelete(validIds);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    setIsDeleting(true);
    setDeleteConfirmOpen(false);

    const formData = new FormData();
    formData.append("ids", JSON.stringify(itemsToDelete));

    fetcher.submit(formData, {
      method: "DELETE",
    });
  };

  // Handle fetcher state changes
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && !hasToastShown) {
      setIsDeleting(false);

      if (fetcher.data.success) {
        setHasToastShown(true);
        toast.success(
          isDeleting
            ? "Locations deleted successfully!"
            : selectedLocation
            ? "Location updated successfully!"
            : "Location created successfully!"
        );

        setModalOpen(false);
        setSelectedLocation(undefined);
        setDeleteConfirmOpen(false);
      } else if (fetcher.data.errors) {
        setHasToastShown(true);
        toast.error(
          fetcher.data.errors.apiError?.message || "An error occurred"
        );
      }
    }

    if (fetcher.state === "submitting") {
      setHasToastShown(false);
    }
  }, [
    fetcher.state,
    fetcher.data,
    selectedLocation,
    isDeleting,
    hasToastShown,
  ]);

  return (
    <>
      <Table
        title="Locations"
        description="List of available locations"
        buttonText="Create Location"
        onButtonClick={() => {
          setSelectedLocation(undefined);
          setModalOpen(true);
        }}
        data={locationsDisplay}
        pageSize={meta.pagination.pageSize}
        currentPage={meta.pagination.page}
        total={meta.pagination.total}
        pageCount={meta.pagination.pageCount}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search name/branch"
      />
      <ModalDialog
        open={modalOpen}
        setOpen={(open) => {
          if (!open) {
            setModalOpen(false);
            setSelectedLocation(undefined);
          }
        }}
      >
        <LocationForm
          setOpen={setModalOpen}
          location={selectedLocation}
        />
      </ModalDialog>
      <Alert
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Locations"
        description="Are you sure you want to delete the selected locations? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
