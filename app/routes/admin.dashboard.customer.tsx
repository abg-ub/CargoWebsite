import { useState, useEffect, useCallback } from "react";
import {
  json,
  type ActionFunction,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigate,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import ModalDialog from "~/components/modal-dialog";
import CustomerForm from "~/components/form/customer-form";
import { Customer, CustomerData, CustomerFormErrors } from "~/types";
import {
  saveCustomer,
  updateCustomer,
  deleteCustomers,
} from "~/api/actions.server";
import { toast } from "react-toastify";
import Table from "~/components/form/table";
import { getCustomers } from "~/api/loaders.server";
import Alert from "~/components/alert";

export async function loader({ request }: LoaderFunctionArgs) {
  // Get URL parameters
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "10");
  const searchQuery = url.searchParams.get("search") ?? "";

  try {
    const data = await getCustomers(request, page, pageSize, searchQuery);
    return json({ data });
  } catch (error) {
    throw new Error("Failed to fetch customers");
  }
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  // Handle DELETE requests
  if (request.method.toLowerCase() === "delete") {
    try {
      const ids = JSON.parse(formData.get("ids") as string);
      const uniqueIds = Array.from(new Set(ids));

      if (uniqueIds.length === 0) {
        throw new Error("No valid IDs provided for deletion");
      }

      await deleteCustomers(uniqueIds, request);
      return json({ success: true });
    } catch (error) {
      console.error("Delete error in action:", error);
      return json(
        {
          errors: {
            apiError: {
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to delete customers",
              type: "api_error",
            },
          },
        },
        { status: 500 }
      );
    }
  }

  const rawData = Object.fromEntries(formData);

  // Transform form data to match CustomerData type
  const customerData: CustomerData = {
    id: rawData.id?.toString(),
    firstName: rawData.firstName?.toString() ?? "",
    lastName: rawData.lastName?.toString() ?? "",
    email: rawData.email?.toString() ?? "",
    phone: rawData.phone?.toString() ?? "",
    country: rawData.country?.toString() ?? "",
    city: rawData.city?.toString() ?? "",
    address: rawData.address?.toString() ?? "",
  };

  const method = request.method.toLowerCase();

  try {
    if (method === "put") {
      if (!customerData.id) {
        throw new Error("Customer ID is required for updates");
      }
      await updateCustomer(customerData, request);
      return json({ success: true });
    } else {
      await saveCustomer(customerData, request);
      return json({ success: true });
    }
  } catch (error) {
    console.error("Caught error:", error);
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

export default function AdminDashboardCustomer() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<
    Customer | undefined
  >();
  const { data } = useLoaderData<typeof loader>();
  const { data: customersData, meta } = data;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const submit = useSubmit();

  // Create a mapped version of customers for display while keeping original data
  const customersDisplay = customersData.map((customer: any) => ({
    id: customer.id,
    name: `${customer.firstName} ${customer.lastName}`,
    country: customer.country,
    email: customer.email,
    phone: customer.phone,
  }));

  const actionData = useActionData<{
    errors?: {
      apiError?: {
        message: string;
        type: string;
      };
    } & CustomerFormErrors;
    success?: boolean;
  }>();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle success state
  useEffect(() => {
    if (actionData?.success && isSubmitting) {
      if (modalOpen) {
        toast.success(
          selectedCustomer
            ? "Customer updated successfully!"
            : "Customer created successfully!"
        );
        setModalOpen(false);
        setSelectedCustomer(undefined);
      }
      setIsSubmitting(false);
      // Force a refresh of the data
      navigate(".", { replace: true });
    }
  }, [
    actionData?.success,
    modalOpen,
    selectedCustomer,
    isSubmitting,
    navigate,
  ]);

  // Handle error state
  useEffect(() => {
    if (actionData?.errors?.apiError && isSubmitting) {
      toast.error(actionData.errors.apiError.message);
      setIsSubmitting(false);
    }
  }, [actionData?.errors, isSubmitting]);

  // Add state for deletion status
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle success/error messages for deletion
  useEffect(() => {
    if (actionData?.success && isDeleting) {
      toast.success("Customers deleted successfully!");
      setIsDeleting(false);
      // Force a refresh of the data
      navigate(".", { replace: true });
    } else if (actionData?.errors && isDeleting) {
      toast.error(
        actionData.errors.apiError?.message || "Failed to delete customers"
      );
      setIsDeleting(false);
    }
  }, [actionData, isDeleting, navigate]);

  const handleSearch = useCallback(
    (query: string) => {
      const params = new URLSearchParams(searchParams);
      if (query) {
        params.set("search", query);
      } else {
        params.delete("search");
      }
      params.set("page", "1"); // Reset to first page when searching
      navigate(`?${params.toString()}`);
    },
    [searchParams, navigate]
  );

  const handlePageSizeChange = (newSize: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("pageSize", newSize.toString());
    params.set("page", "1");
    navigate(`?${params.toString()}`);
  };

  // Modify handleEdit to be more defensive
  const handleEdit = (displayCustomer: any) => {
    const originalCustomer = customersData.find(
      (c: Customer) => c.id === displayCustomer.id
    );
    if (!originalCustomer) {
      console.error("Customer not found");
      return;
    }
    setSelectedCustomer(originalCustomer);
    setTimeout(() => setModalOpen(true), 0);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setTimeout(() => setSelectedCustomer(undefined), 0);
  };

  // Add new state for delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<(string | number)[]>([]);

  const handleDelete = async (ids: (string | number)[]) => {
    // Prevent multiple submissions
    if (isDeleting) return;

    // Validate IDs
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
    setIsSubmitting(true);
    setDeleteConfirmOpen(false);

    const formData = new FormData();
    formData.append("ids", JSON.stringify(itemsToDelete));

    submit(formData, {
      method: "DELETE",
      action: ".",
    });
  };

  return (
    <>
      <Table
        title="Customers"
        description="A list of all the customers in your account."
        buttonText="Add customer"
        searchPlaceholder="Search name/email"
        onButtonClick={() => setModalOpen(true)}
        data={customersDisplay}
        pageSize={meta.pagination.pageSize}
        onPageSizeChange={handlePageSizeChange}
        onSearch={handleSearch}
        onEdit={handleEdit}
        onDelete={handleDelete}
        currentPage={meta.pagination.page}
        total={meta.pagination.total}
        pageCount={meta.pagination.pageCount}
      />
      <ModalDialog open={modalOpen} setOpen={handleCloseModal}>
        <CustomerForm
          setOpen={handleCloseModal}
          customer={selectedCustomer}
          onSubmit={() => setIsSubmitting(true)}
        />
      </ModalDialog>
      <Alert
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Customers"
        description="Are you sure you want to delete the selected customers? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
