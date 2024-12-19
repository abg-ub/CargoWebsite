import { useFetcher } from "@remix-run/react";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Location, LocationFormErrors } from "~/types";
import { toast } from "react-toastify";

// Define the Zod schema for form validation
const locationSchema = z.object({
  name: z.string().min(2, "Location name is required"),
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
});

interface LocationFormProps {
  location?: Location;
  setOpen: (open: boolean) => void;
}

export default function LocationForm({
  location,
  setOpen,
}: LocationFormProps) {
  const fetcher = useFetcher<{
    errors?: LocationFormErrors;
    success?: boolean;
  }>();
  const isEditing = Boolean(location);
  const [hasToastShown, setHasToastShown] = useState(false);

  const isSubmitting =
    fetcher.state === "submitting" || fetcher.state === "loading";

  // Use fetcher data for errors if available, otherwise use local state
  const [errors, setErrors] = useState<LocationFormErrors>(
    fetcher.data?.errors || {}
  );

  // Watch for successful submission and show toast
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && !hasToastShown) {
      if (fetcher.data.success) {
        setHasToastShown(true);
        toast.success(
          isEditing
            ? "Location updated successfully!"
            : "Location created successfully!"
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
    const field = name as keyof typeof locationSchema.shape;

    try {
      locationSchema.pick({ [field]: true }).parse({ [field]: value });
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

  const renderField = (
    name: keyof LocationFormErrors,
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

    const formValues = {
      name: formData.get("name") as string,
      latitude: formData.get("latitude") as string,
      longitude: formData.get("longitude") as string,
      address: formData.get("address") as string,
    };

    try {
      // Validate all fields before submission
      locationSchema.parse(formValues);

      // If validation passes, submit the form
      fetcher.submit(formData, {
        method: isEditing ? "put" : "post",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: LocationFormErrors = {};
        error.issues.forEach((issue) => {
          const field = issue.path[0] as keyof LocationFormErrors;
          newErrors[field] = {
            message: issue.message,
            type: issue.code,
          };
        });
        setErrors(newErrors);
        toast.error("Please fix the form errors before submitting");
      }
    }
  };

  return (
    <fetcher.Form method={isEditing ? "put" : "post"} onSubmit={handleSubmit}>
      {location?.id && (
        <input type="hidden" name="id" value={location.id} />
      )}
      {location?.documentId && (
        <input
          type="hidden"
          name="documentId"
          value={location.documentId}
        />
      )}

      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            {isEditing ? "Edit Location" : "Location Information"}
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            {renderField(
              "name",
              "Location name",
              "text",
              "organization",
              location?.name
            )}

            {renderField(
              "latitude",
              "Latitude",
              "text",
              "latitude",
              location?.latitude?.toString()
            )}

            {renderField(
              "longitude",
              "Longitude",
              "text",
              "longitude",
              location?.longitude?.toString()
            )}

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
                  defaultValue={location?.address}
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
