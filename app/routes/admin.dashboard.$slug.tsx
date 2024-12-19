import { type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  useLoaderData,
  useNavigation,
  useSubmit,
  useActionData,
  useParams,
} from "@remix-run/react";
import Table from "~/components/form/table";
import ModalDialog from "~/components/modal-dialog";
import Alert from "~/components/alert";
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { PaginationMeta, TableItem } from "~/types";
import { getValidatedFormData } from "remix-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { entityConfigs } from "~/utils/admin";
import { serverHandlers } from "~/utils/admin.server";

type ValidSlugs = keyof typeof entityConfigs & keyof typeof serverHandlers;

type LoaderData = {
  [K in ValidSlugs]: {
    [key: string]: {
      data: any[];
      meta: PaginationMeta;
    };
  };
};

type ActionData = {
  [K in ValidSlugs]: {
    success?: boolean;
    error?: string;
    errors?: Record<string, string>;
    action?: "create" | "update" | "delete";
    validatedData?: any;
  };
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { slug } = params;
  if (!slug || !(slug in entityConfigs)) throw new Error("Invalid slug");
  const validSlug = slug as ValidSlugs;

  const config = entityConfigs[validSlug];
  const handlers = serverHandlers[validSlug];
  if (!config || !handlers) throw new Error("Invalid slug");

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") ?? "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") ?? "10");
    const search = url.searchParams.get("search") ?? "";

    // Execute multiple loaders if they exist
    const results = await Promise.all(
      Object.entries(handlers.loader).map(async ([key, loaderFn]) => {
        const result = await loaderFn(request, page, pageSize, search);
        return [key, result];
      })
    );

    // Combine results into a single object
    const combinedData = Object.fromEntries(results);
    return json(combinedData);
  } catch (error) {
    console.error("Loader error:", error);
    if (error instanceof Response) throw error;
    throw new Response("Failed to load data", { status: 500 });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  console.log("Action called");
  const { slug } = params;
  if (!slug || !(slug in entityConfigs)) throw new Error("Invalid slug");
  const validSlug = slug as ValidSlugs;

  const config = entityConfigs[validSlug];
  const handlers = serverHandlers[validSlug];
  if (!config || !handlers) throw new Error("Invalid slug");

  try {
    // Handle DELETE before form validation
    if (request.method === "DELETE") {
      const formData = await request.formData();
      const idsString = formData.get("ids");
      if (!idsString || typeof idsString !== "string") {
        throw new Error("Invalid or missing ids");
      }
      const ids = JSON.parse(idsString) as number[];
      const result = await handlers.actions.delete(ids, request);
      return json<ActionData[ValidSlugs]>({
        ...result,
        action: "delete",
      });
    }

    // Form validation for other methods
    const validatedForm = await getValidatedFormData(
      request,
      zodResolver(config.FormComponent.schema)
    );

    if (validatedForm.errors) {
      return json(
        {
          errors: validatedForm.errors,
          defaultValues: validatedForm.receivedValues,
        },
        { status: 400 }
      );
    }

    switch (request.method) {
      case "POST": {
        console.log(validatedForm.data);
        const result = await handlers.actions.save(validatedForm.data, request);
        return json<ActionData[ValidSlugs]>({
          ...result,
          action: "create",
          validatedData: validatedForm.data,
        });
      }
      case "PUT": {
        if (!validatedForm.data.id)
          throw new Error("ID is required for updates");
        const result = await handlers.actions.update(
          validatedForm.data,
          request
        );
        return json<ActionData[ValidSlugs]>({
          ...result,
          action: "update",
          validatedData: validatedForm.data,
        });
      }
      default:
        return json({ error: "Method not allowed" }, { status: 405 });
    }
  } catch (error) {
    console.error("Action error:", error);
    return json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
};

function getOptimisticData<T extends { id?: number }>(
  currentData: T[],
  formData?: FormData,
  method?: string
): T[] {
  console.log("getOptimisticData called");
  if (!formData) return currentData;

  try {
    switch (method) {
      case "DELETE": {
        const idsToDelete = JSON.parse(
          formData.get("ids") as string
        ) as number[];
        return currentData.filter(
          (item) => item.id != null && !idsToDelete.includes(item.id)
        );
      }
      case "POST": {
        // Convert FormData to object and remove quotes from string values
        const formEntries = Object.fromEntries(formData.entries());
        const unquotedEntries = Object.fromEntries(
          Object.entries(formEntries).map(([key, value]) => [
            key,
            typeof value === "string" ? value.replace(/^"|"$/g, "") : value,
          ])
        );
        return [...currentData, { ...unquotedEntries, id: -1 } as unknown as T];
      }
      case "PUT": {
        const formEntries = Object.fromEntries(formData.entries());
        const unquotedEntries = Object.fromEntries(
          Object.entries(formEntries).map(([key, value]) => [
            key,
            typeof value === "string" ? value.replace(/^"|"$/g, "") : value,
          ])
        );
        const id = Number(formEntries.id);
        return currentData.map((item) =>
          item.id === id ? ({ ...item, ...unquotedEntries } as T) : item
        );
      }
      default:
        return currentData;
    }
  } catch (error) {
    console.error("Optimistic update error:", error);
    return currentData;
  }
}

export default function AdminDashboardEntity() {
  const { slug } = useParams();
  const config = entityConfigs[slug as keyof typeof entityConfigs];
  const loaderData = useLoaderData<LoaderData[keyof LoaderData]>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const actionData = useActionData<ActionData[keyof ActionData]>();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TableItem>();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<(string | number)[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const primaryLoaderKey = config.FormComponent.requiredLoaders[0];
  const { data, meta } = loaderData[primaryLoaderKey];

  const optimisticData = useMemo(
    () => getOptimisticData(data, navigation.formData, navigation.formMethod),
    [navigation.formData, navigation.formMethod, data]
  );

  const tableData = useMemo(
    () => optimisticData.map((item) => config.mapTableData(item)),
    [optimisticData, config]
  );

  const handleEdit = (item: TableItem) => {
    const originalItem = data.find(
      (dataItem: TableItem) => dataItem.id === item.id
    );
    if (!originalItem) {
      console.error(`${config.title.slice(0, -1)} not found`);
      return;
    }
    setSelectedItem(originalItem);
    setModalOpen(true);
  };

  const handleDelete = (ids: (string | number)[]) => {
    console.log(isDeleting);
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

    submit(formData, {
      method: "DELETE",
    });
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setTimeout(() => setSelectedItem(undefined), 0);
  };

  // Effects
  useEffect(() => {
    if (navigation.state === "submitting") {
      handleCloseModal();
    }
  }, [navigation.state]);

  useEffect(() => {
    if (actionData) {
      if (actionData.error) {
        toast.error(actionData.error);
        setIsDeleting(false);
      } else if (actionData.errors) {
        toast.error("Please check the form for errors");
        setIsDeleting(false);
      } else if (actionData.action === "delete" && actionData.success) {
        toast.success(`${config.title.slice(0, -1)} deleted successfully`);
        setIsDeleting(false);
      } else if (actionData.action === "update") {
        toast.success(`${config.title.slice(0, -1)} updated successfully`);
      } else if (actionData.action === "create") {
        toast.success(`${config.title.slice(0, -1)} created successfully`);
      }
    }
  }, [actionData, config.title]);

  console.log(loaderData);
  return (
    <>
      <Table
        title={config.title}
        description={config.description}
        buttonText={config.buttonText}
        onButtonClick={() => setModalOpen(true)}
        data={tableData}
        pageSize={meta.pagination.pageSize}
        currentPage={meta.pagination.page}
        total={meta.pagination.total}
        pageCount={meta.pagination.pageCount}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <ModalDialog open={modalOpen} setOpen={handleCloseModal}>
        <config.FormComponent.component
          setOpen={handleCloseModal}
          item={selectedItem}
          loaderData={loaderData}
        />
      </ModalDialog>
      <Alert
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={`Delete ${config.title}`}
        description="Are you sure you want to delete the selected items? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        disabled={isDeleting}
      />
    </>
  );
}
