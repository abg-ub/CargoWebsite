import { z } from "zod";
import { PackageType } from "~/types";
import { useRemixForm } from "remix-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@remix-run/react";
import { cn } from "~/utils/utils";

export const packageTypeSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, "Package type name is required"),
  maxWeight: z.coerce.number().min(1, "Maximum weight is required"),
});

interface PackageTypeFormProps {
  item?: PackageType;
  setOpen: (open: boolean) => void;
}

export default function PackageTypeForm({
  item,
  setOpen,
}: PackageTypeFormProps) {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useRemixForm<z.infer<typeof packageTypeSchema>>({
    defaultValues: {
      id: item?.id,
      name: item?.name ?? "",
      maxWeight: item?.maxWeight ?? 0,
    },
    mode: "onChange",
    resolver: zodResolver(packageTypeSchema),
    submitConfig: {
      method: item ? "PUT" : "POST",
    },
  });

  return (
    <Form onSubmit={handleSubmit}>
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            {item ? "Edit Package Type" : "Package Type Information"}
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            {/* Name Field */}
            <div className="sm:col-span-3">
              <label
                htmlFor="name"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Name
              </label>
              <div className="mt-2">
                <input
                  autoComplete="on"
                  id="name"
                  type="text"
                  {...register("name")}
                  className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                    errors.name ? "ring-red-500" : "ring-gray-300"
                  } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6`}
                />
              </div>
              {errors.name && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Max Weight Field */}
            <div className="sm:col-span-3">
              <label
                htmlFor="maxWeight"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Maximum Weight (kg)
              </label>
              <div className="mt-2">
                <input
                  id="maxWeight"
                  autoComplete="off"
                  type="number"
                  {...register("maxWeight")}
                  className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                    errors.maxWeight ? "ring-red-500" : "ring-gray-300"
                  } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6`}
                />
              </div>
              {errors.maxWeight && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.maxWeight.message}
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
