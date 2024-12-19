import { z } from "zod";
import { useRemixForm } from "remix-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ComboBox from "./combo-box";
import { Form } from "@remix-run/react";
import { Package,  PackageType } from "~/types";
import { cn } from "~/utils/utils";
import { useEffect } from "react";

export const packageSchema = z.object({
  id: z.number().optional(),
  packageType: z.string().min(1, "Package type is required"),
  netWeight: z.coerce
    .number()
    .min(0.01, "Net weight must be greater than 0")
    .max(1000000, "Net weight is too large"),
  content: z.string().min(5, "Content description is required"),
  value: z.coerce
    .number()
    .min(0, "Value cannot be negative")
    .max(1000000, "Value is too large"),
  packageStatus: z.string().min(1, "Package status is required"),
  pricePerKg: z.coerce
    .number()
    .min(0, "Price per kg cannot be negative")
    .max(100000, "Price per kg is too large"),
  packageCost: z.coerce
    .number()
    .min(0, "Cost cannot be negative")
    .max(1000000, "Cost is too large"),
});

type PackageFormData = z.infer<typeof packageSchema>;

interface PackageFormProps {
  setOpen: (open: boolean) => void;
  item?: Package;
  loaderData: {
    packages: { data: Package[] };
    types: { data: PackageType[] };
  };
  onPackageCreated?: (newPackage: Package) => void;
  onPackageUpdated?: (updatedPackage: Package) => void;
  isLocalOnly?: boolean;
}

export default function PackageForm({
  setOpen,
  item,
  loaderData,
  onPackageCreated,
  onPackageUpdated,
  isLocalOnly = false,
}: PackageFormProps) {
  const packageTypes = loaderData.types.data;

  const {
    handleSubmit,
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useRemixForm<PackageFormData>({
    defaultValues: {
      id: item?.id,
      packageType: item?.packageType?.id?.toString() ?? "",
      netWeight: item?.netWeight ?? 0,
      content: item?.content ?? "",
      value: item?.value ?? 0,
      packageStatus: item?.packageStatus ?? "",
      pricePerKg: item?.pricePerKg ?? 0,
      packageCost: item?.packageCost ?? 0,
    },
    mode: "onChange",
    resolver: zodResolver(packageSchema),
    submitHandlers: isLocalOnly ? {
      onValid: (data) => {
        const selectedType = packageTypes.find(
          (type) => type.id?.toString() === data.packageType
        );

        const packageData: Package = {
          id: item?.id ?? Math.floor(Math.random() * -1000000),
          packageType: selectedType ?? null,
          netWeight: data.netWeight,
          content: data.content,
          value: data.value,
          packageStatus: data.packageStatus,
          pricePerKg: data.pricePerKg,
          packageCost: data.packageCost,
        };

        if (item) {
          onPackageUpdated?.(packageData);
        } else {
          onPackageCreated?.(packageData);
        }
        setOpen(false);
      }
    } : undefined,
    submitConfig: !isLocalOnly ? {
      method: item ? "PUT" : "POST",
      action: "/admin/dashboard/package",
      navigate: false,
    } : undefined,
  });

  const pricePerKg = watch("pricePerKg");
  const selectedPackageTypeId = watch("packageType");

  useEffect(() => {
    const selectedType = packageTypes.find(
      (type) => type.id?.toString() === selectedPackageTypeId
    );

    if (selectedType && pricePerKg) {
      const calculatedCost = selectedType.maxWeight * pricePerKg;
      setValue("packageCost", calculatedCost);
    }
  }, [pricePerKg, selectedPackageTypeId, packageTypes, setValue]);

  const renderNumberField = (name: keyof PackageFormData, label: string) => (
    <div className="sm:col-span-2">
      <label
        htmlFor={name}
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        {label}
      </label>
      <div className="mt-2">
        <input
          id={name}
          type="number"
          step="0.01"
          {...register(name, { valueAsNumber: true })}
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

  return (
    <Form onSubmit={handleSubmit}>
      {item && <input id="id" type="hidden" {...register("id")} />}

      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            {item ? "Edit Package" : "Package Information"}
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-2">
              <ComboBox
                name="packageType"
                label="Package Type"
                items={packageTypes.map((packageType) => ({
                  id: packageType.id,
                  name: packageType.name,
                }))}
                error={errors.packageType?.message}
                defaultValue={item?.packageType?.name}
                onChange={(value) => {
                  const selectedType = packageTypes.find(
                    (type) => type.name === value
                  );
                  register("packageType").onChange({
                    target: {
                      value: selectedType?.id?.toString() ?? "",
                      name: "packageType",
                    },
                  });
                }}
              />
            </div>

            {renderNumberField("netWeight", "Net Weight (kg)")}

            {renderNumberField("value", "Value")}

            <div className="sm:col-span-2">
              <ComboBox
                name="packageStatus"
                label="Package Status"
                items={[
                  { id: 1, name: "Pending" },
                  { id: 2, name: "In Transit" },
                  { id: 3, name: "Delivered" },
                  { id: 4, name: "Returned" },
                ]}
                error={errors.packageStatus?.message}
                defaultValue={item?.packageStatus}
                onChange={(value) => {
                  register("packageStatus").onChange({
                    target: { value, name: "packageStatus" },
                  });
                }}
              />
            </div>

            {renderNumberField("pricePerKg", "Price per kg")}
            <div className="sm:col-span-2">
              <label
                htmlFor="packageCost"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Package Cost
              </label>
              <div className="mt-2">
                <input
                  id="packageCost"
                  type="number"
                  step="0.01"
                  readOnly
                  {...register("packageCost", { valueAsNumber: true })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-gray-50"
                />
              </div>
              {errors.packageCost && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.packageCost?.message}
                </p>
              )}
            </div>

            <div className="col-span-full">
              <label
                htmlFor="content"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Content Description
              </label>
              <div className="mt-2">
                <textarea
                  id="content"
                  {...register("content")}
                  rows={3}
                  className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                    errors.content ? "ring-red-500" : "ring-gray-300"
                  } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6`}
                />
              </div>
              {errors.content && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.content.message}
                </p>
              )}
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
          type={isLocalOnly ? "button" : "submit"}
          onClick={isLocalOnly ? () => {
            handleSubmit();
          } : undefined}
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
