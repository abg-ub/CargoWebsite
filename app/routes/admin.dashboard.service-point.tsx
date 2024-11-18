import { ActionFunction, json, type LoaderFunctionArgs } from "@remix-run/node";
import {
  useLoaderData,
  useNavigate,
  useSearchParams,
  useFetcher,
} from "@remix-run/react";
import Table from "~/components/form/table";
import { getServicePoints, getBranches } from "~/api/loaders.server";
import { useState, useEffect } from "react";
import ModalDialog from "~/components/modal-dialog";
import Alert from "~/components/alert";
import { toast } from "react-toastify";
import { Branch, ServicePointData, type ServicePoint } from "~/types";
import ServicePointForm from "~/components/form/service-point-form";
import {
  deleteServicePoints,
  saveServicePoint,
  updateServicePoint,
} from "~/api/actions.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "10");
  const searchQuery = url.searchParams.get("search") ?? "";

  try {
    // Load both service points and all branches
    const [servicePointsData, branchesResponse] = await Promise.all([
      getServicePoints(request, page, pageSize, searchQuery),
      getBranches(request, 1, 1000, ""), // Load all branches with a large page size
    ]);

    return json({
      data: servicePointsData,
      branches: branchesResponse.data, // Access the branches data directly
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
      await deleteServicePoints(ids, request);
      return json({ success: true });
    } catch (error) {
      return json(
        {
          errors: {
            apiError: {
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to delete service points",
              type: "api_error",
            },
          },
        },
        { status: 500 }
      );
    }
  }

  const rawData = Object.fromEntries(formData);
  const servicePointData: ServicePointData = {
    name: rawData.name?.toString().trim() ?? "",
    address: rawData.address?.toString().trim() ?? "",
    latitude: parseFloat(rawData.latitude?.toString() ?? "0"),
    longitude: parseFloat(rawData.longitude?.toString() ?? "0"),
    branchId: rawData.branchId?.toString() ?? "",
  };

  if (rawData.id) {
    servicePointData.id = rawData.id.toString();
  }

  if (rawData.documentId) {
    servicePointData.documentId = rawData.documentId.toString();
  }

  try {
    if (request.method.toLowerCase() === "put") {
      if (!servicePointData.documentId) {
        throw new Error("Service Point documentId is required for updates");
      }
      await updateServicePoint(servicePointData, request);
    } else {
      await saveServicePoint(servicePointData, request);
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

export default function ServicePoint() {
  const { data, branches } = useLoaderData<typeof loader>();
  const { data: servicePointsData, meta } = data;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fetcher = useFetcher();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedServicePoint, setSelectedServicePoint] = useState<
    ServicePoint | undefined
  >();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<(string | number)[]>([]);
  const [hasToastShown, setHasToastShown] = useState(false);

  // Transform branches data for the ComboBox
  const branchOptions = branches.map((branch: Branch) => ({
    id: branch.id,
    name: branch.name,
  }));

  // Create a mapped version of service points for display
  const servicePointsDisplay = servicePointsData.map((point: ServicePoint) => ({
    id: point.id,
    name: point.name,
    branch: point.branch?.name ?? "-",
    latitude: point.latitude,
    longitude: point.longitude,
  }));

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }
    params.set("page", "1"); // Reset to first page when searching
    navigate(`?${params.toString()}`);
  };

  const handlePageSizeChange = (newSize: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("pageSize", newSize.toString());
    params.set("page", "1");
    navigate(`?${params.toString()}`);
  };

  const handleEdit = (displayPoint: any) => {
    const originalPoint = servicePointsData.find(
      (p: ServicePoint) => p.id === displayPoint.id
    );

    if (!originalPoint) {
      console.error("Service point not found:", {
        displayPoint,
        allPoints: servicePointsData,
      });
      toast.error("Unable to edit service point: Data not found");
      return;
    }

    console.log("Found service point for editing:", originalPoint);

    setSelectedServicePoint(originalPoint);
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

  const handleSubmit = (formData: FormData) => {
    setHasToastShown(false);
    fetcher.submit(formData, {
      method: selectedServicePoint ? "PUT" : "POST",
    });
  };

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && !hasToastShown) {
      setIsDeleting(false);

      if (fetcher.data.success) {
        setHasToastShown(true);
        toast.success(
          isDeleting
            ? "Service points deleted successfully!"
            : selectedServicePoint
            ? "Service point updated successfully!"
            : "Service point created successfully!"
        );

        setModalOpen(false);
        setSelectedServicePoint(undefined);
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
    selectedServicePoint,
    isDeleting,
    hasToastShown,
  ]);

  return (
    <>
      <Table
        title="Service Points"
        description="List of available service points"
        buttonText="Create Service Point"
        onButtonClick={() => {
          setSelectedServicePoint(undefined);
          setModalOpen(true);
        }}
        data={servicePointsDisplay}
        pageSize={meta.pagination.pageSize}
        onPageSizeChange={handlePageSizeChange}
        onSearch={handleSearch}
        onEdit={handleEdit}
        onDelete={handleDelete}
        currentPage={meta.pagination.page}
        total={meta.pagination.total}
        pageCount={meta.pagination.pageCount}
        searchPlaceholder="Search name/branch"
      />
      <ModalDialog
        open={modalOpen}
        setOpen={(open) => {
          if (!open) {
            setModalOpen(false);
            setSelectedServicePoint(undefined);
          }
        }}
      >
        <ServicePointForm
          setOpen={setModalOpen}
          servicePoint={selectedServicePoint}
          availableBranches={branchOptions}
        />
      </ModalDialog>
      <Alert
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Service Points"
        description="Are you sure you want to delete the selected service points? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
