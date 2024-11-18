import { useFetcher } from "@remix-run/react";
import { z } from "zod";
import ComboBox from "./combo-box";
import { useState, useEffect } from "react";
import { ServicePoint, ServicePointFormErrors } from "~/types";
import { toast } from "react-toastify";

// Define the Zod schema for form validation
const servicePointSchema = z.object({
  name: z.string().min(2, "Service point name is required"),
  latitude: z
    .string()
    .regex(/^-?([0-8]?[0-9]|90)(\.[0-9]{1,8})?$/, "Invalid latitude format"),
  longitude: z
    .string()
    .regex(
      /^-?([0-9]{1,2}|1[0-7][0-9]|180)(\.[0-9]{1,8})?$/,
      "Invalid longitude format"
    ),
  address: z.string().min(5, "Address is required"),
  branchId: z.string().min(1, "Branch is required"),
});

interface ServicePointFormProps {
  servicePoint?: ServicePoint;
  setOpen: (open: boolean) => void;
  availableBranches: { id: number; name: string }[];
}

export default function ServicePointForm({
  servicePoint,
  setOpen,
  availableBranches,
}: ServicePointFormProps) {
  const fetcher = useFetcher<{
    errors?: ServicePointFormErrors;
    success?: boolean;
  }>();
  const isEditing = Boolean(servicePoint);
  const [hasToastShown, setHasToastShown] = useState(false);

  const isSubmitting =
    fetcher.state === "submitting" || fetcher.state === "loading";

  // Use fetcher data for errors if available, otherwise use local state
  const [errors, setErrors] = useState<ServicePointFormErrors>(
    fetcher.data?.errors || {}
  );

  // Add state to track selected branch
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    servicePoint?.branch?.id.toString() || ""
  );

  // Watch for successful submission and show toast
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && !hasToastShown) {
      if (fetcher.data.success) {
        setHasToastShown(true);
        toast.success(
          isEditing
            ? "Service point updated successfully!"
            : "Service point created successfully!"
        );
        setOpen(false);
      } else if (fetcher.data.errors) {
        setHasToastShown(true);
        toast.error(
          fetcher.data.errors.apiError?.message || "An error occurred"
        );
      }
    }

    // Reset the toast flag when the fetcher state changes
    if (fetcher.state === "submitting") {
      setHasToastShown(false);
    }
  }, [fetcher.state, fetcher.data, isEditing, hasToastShown, setOpen]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    const field = name as keyof typeof servicePointSchema.shape;

    try {
      servicePointSchema.pick({ [field]: true }).parse({ [field]: value });
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[field];
        return newErrors;
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.issues[0];
        setErrors((prevErrors) => ({
          ...prevErrors,
          [field]: {
            message: fieldError.message,
            type: fieldError.code,
          },
        }));
      }
    }
  };

  const handleBranchChange = (selectedValue: string) => {
    // Find the branch object by name
    const selectedBranch = availableBranches.find(
      (branch) => branch.name === selectedValue
    );

    // Get the actual ID from the selected branch
    const branchId = selectedBranch ? selectedBranch.id.toString() : "";

    // Update the selected branch ID state
    setSelectedBranchId(branchId);

    // Validate and update errors
    if (branchId) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors.branch;
        return newErrors;
      });
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        branch: {
          message: "Branch is required",
          type: "custom",
        },
      }));
    }
  };

  const renderField = (
    name: keyof ServicePointFormErrors,
    label: string,
    type: string = "text",
    autoComplete?: string,
    defaultValue?: string
  ) => (
    <div className="sm:col-span-3">
      <label
        htmlFor={name}
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        {label}
      </label>
      <div className="mt-2">
        <input
          id={name}
          name={name}
          type={type}
          autoComplete={autoComplete}
          onChange={handleInputChange}
          defaultValue={defaultValue}
          className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
            errors[name] ? "ring-red-500" : "ring-gray-300"
          } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6`}
        />
      </div>
      {errors[name] && (
        <p className="mt-2 text-sm text-red-600">{errors[name]?.message}</p>
      )}
    </div>
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    // Explicitly set the branchId in formData
    formData.set("branchId", selectedBranchId);

    const formValues = {
      name: formData.get("name") as string,
      latitude: formData.get("latitude") as string,
      longitude: formData.get("longitude") as string,
      address: formData.get("address") as string,
      branchId: selectedBranchId, // Use the selected branch ID from state
    };

    try {
      // Validate all fields before submission
      servicePointSchema.parse(formValues);

      // If validation passes, submit the form
      fetcher.submit(formData, {
        method: isEditing ? "put" : "post",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: ServicePointFormErrors = {};
        error.issues.forEach((issue) => {
          const field = issue.path[0] as keyof ServicePointFormErrors;
          if (field === "branchId") {
            newErrors.branch = {
              message: "Branch is required",
              type: issue.code,
            };
          } else {
            newErrors[field] = {
              message: issue.message,
              type: issue.code,
            };
          }
        });
        setErrors(newErrors);
        toast.error("Please fix the form errors before submitting");
      }
    }
  };

  return (
    <fetcher.Form method={isEditing ? "put" : "post"} onSubmit={handleSubmit}>
      {servicePoint?.id && (
        <input type="hidden" name="id" value={servicePoint.id} />
      )}
      {servicePoint?.documentId && (
        <input
          type="hidden"
          name="documentId"
          value={servicePoint.documentId}
        />
      )}

      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            {isEditing ? "Edit Service Point" : "Service Point Information"}
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            {renderField(
              "name",
              "Service point name",
              "text",
              "organization",
              servicePoint?.name
            )}

            {renderField(
              "latitude",
              "Latitude",
              "text",
              "latitude",
              servicePoint?.latitude
            )}

            {renderField(
              "longitude",
              "Longitude",
              "text",
              "longitude",
              servicePoint?.longitude
            )}

            <div className="sm:col-span-3">
              <ComboBox
                label="Branch"
                items={availableBranches}
                name="branch"
                onChange={handleBranchChange}
                defaultValue={servicePoint?.branch?.name}
                error={errors.branch?.message}
              />
            </div>

            <div className="col-span-full">
              <label
                htmlFor="address"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Address
              </label>
              <div className="mt-2">
                <textarea
                  id="address"
                  name="address"
                  rows={4}
                  autoComplete="street-address"
                  onChange={handleInputChange}
                  defaultValue={servicePoint?.address}
                  className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                    errors.address ? "ring-red-500" : "ring-gray-300"
                  } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6`}
                />
              </div>
              {errors.address && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.address.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="button"
          className="text-sm font-semibold leading-6 text-gray-900"
          onClick={() => setOpen(false)}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : isEditing ? "Update" : "Save"}
        </button>
      </div>
    </fetcher.Form>
  );
}
