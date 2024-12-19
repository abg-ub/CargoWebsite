import { useState, useEffect } from "react";
import {
  json,
  type ActionFunction,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import Table from "~/components/form/table";
import ModalDialog from "~/components/modal-dialog";
import BranchForm from "~/components/form/branch-form";
import { Branch, BranchData } from "~/types";
import { toast } from "react-toastify";
import Alert from "~/components/alert";
import { getBranches } from "~/api/loaders.server";
import { deleteBranches, saveBranch, updateBranch } from "~/api/actions.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // Get URL parameters
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "10");
  const searchQuery = url.searchParams.get("search") ?? "";

  try {
    const data = await getBranches(request, page, pageSize, searchQuery);
    return json({ data });
  } catch (error) {
    throw new Error("Failed to fetch branches");
  }
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  if (request.method.toLowerCase() === "delete") {
    try {
      const ids = JSON.parse(formData.get("ids") as string);
      await deleteBranches(ids, request);
      return json({ success: true });
    } catch (error) {
      return json(
        {
          errors: {
            apiError: {
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to delete branches",
              type: "api_error",
            },
          },
        },
        { status: 500 }
      );
    }
  }

  const rawData = Object.fromEntries(formData);
  const branchData: BranchData = {
    name: rawData.name?.toString().trim() ?? "",
    email: rawData.email?.toString().trim() ?? "",
    phone: rawData.phone?.toString().trim() ?? "",
    country: rawData.country?.toString().trim() ?? "",
    city: rawData.city?.toString().trim() ?? "",
    address: rawData.address?.toString().trim() ?? "",
  };

  if (rawData.id) {
    branchData.id = rawData.id.toString();
  }

  try {
    if (request.method.toLowerCase() === "put") {
      if (!branchData.id) {
        throw new Error("Branch ID is required for updates");
      }
      await updateBranch(branchData, request);
    } else {
      await saveBranch(branchData, request);
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

export default function AdminDashboardBranch() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | undefined>();
  const { data } = useLoaderData<typeof loader>();
  const { data: branchesData, meta } = data;
  const fetcher = useFetcher();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<(string | number)[]>([]);
  const [hasToastShown, setHasToastShown] = useState(false);

  // Create a mapped version of branches for display
  const branchesDisplay = branchesData.map((branch: Branch) => ({
    id: branch.id,
    branch: branch.name,
    email: branch.email,
    location: `${branch.city}, ${branch.country}`,
  }));

  const handleEdit = (displayBranch: Branch) => {
    const originalBranch = branchesData.find(
      (b: Branch) => b.id === displayBranch.id
    );
    if (!originalBranch) {
      toast.error("Branch not found");
      return;
    }
    setSelectedBranch(originalBranch);
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

  // Handle fetcher states
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && !hasToastShown) {
      setIsDeleting(false);

      if (fetcher.data.success) {
        setHasToastShown(true); // Set flag to prevent duplicate toasts
        toast.success(
          isDeleting
            ? "Branches deleted successfully!"
            : selectedBranch
            ? "Branch updated successfully!"
            : "Branch created successfully!"
        );

        setModalOpen(false);
        setSelectedBranch(undefined);
        setDeleteConfirmOpen(false);
      } else if (fetcher.data.errors) {
        setHasToastShown(true); // Set flag for error toasts too
        toast.error(
          fetcher.data.errors.apiError?.message || "An error occurred"
        );
      }
    }

    // Reset the toast flag when the fetcher state changes
    if (fetcher.state === "submitting") {
      setHasToastShown(false);
    }
  }, [fetcher.state, fetcher.data, selectedBranch, isDeleting, hasToastShown]);

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBranch(undefined);
  };

  return (
    <>
      <Table
        title="Branches"
        description="A list of all branches in your account."
        buttonText="Add branch"
        onButtonClick={() => setModalOpen(true)}
        data={branchesDisplay}
        pageSize={meta.pagination.pageSize}
        currentPage={meta.pagination.page}
        total={meta.pagination.total}
        pageCount={meta.pagination.pageCount}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search name/location"
      />
      <ModalDialog
        open={modalOpen}
        setOpen={(open) => {
          if (!open) {
            handleCloseModal();
          }
        }}
      >
        <BranchForm setOpen={handleCloseModal} branch={selectedBranch} />
      </ModalDialog>
      <Alert
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Branches"
        description="Are you sure you want to delete the selected branches? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
