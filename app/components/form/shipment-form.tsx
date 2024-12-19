import { z } from "zod";
import { useRemixForm } from "remix-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ComboBox from "./combo-box";
import { Form } from "@remix-run/react";
import { Shipment, Package,  Customer, Branch, Address, PackageType } from "~/types";
import { cn } from "~/utils/utils";
import { useState, useEffect } from "react";
import { XMarkIcon, PlusIcon, PencilIcon } from "@heroicons/react/24/outline";
import ModalDialog from "../modal-dialog";
import PackageForm from "./package-form";

export const shipmentSchema = z.object({
  id: z.number().optional(),
  sender: z.string().min(1, "Sender is required"),
  receiver: z.string().min(1, "Receiver is required"),
  packages: z.array(z.any()).min(1, "At least one package is required"),
  originAddress: z.string().min(1, "Origin address is required"),
  destinationAddress: z.string().min(1, "Destination address is required"),
  branch: z.string().min(1, "Branch is required"),
  shippingDate: z.string().min(1, "Shipping date is required"),
  deliveryDate: z.string().optional(),
  shipmentType: z.string().min(1, "Shipment type is required"),
  transferMode: z.string().min(1, "Transfer mode is required"),
  shipmentCost: z.number().min(0),
});

type ShipmentFormData = z.infer<typeof shipmentSchema>;

interface ShipmentFormProps {
  setOpen: (open: boolean) => void;
  item?: Shipment;
  loaderData: {
    shipments: { data: Shipment[] };
    customers: { data: Customer[] };
    packages: { data: Package[] };
    types: { data: PackageType[] };
    branches: { data: Branch[] };
    addresses: { data: Address[] };
  };
}

export default function ShipmentForm({
  setOpen,
  item,
  loaderData,
}: ShipmentFormProps) {
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [selectedPackages, setSelectedPackages] = useState<Package[]>(
    item?.packages ?? []
  );
  const [editingPackage, setEditingPackage] = useState<Package | undefined>();

  const handleClosePackageModal = (isOpen: boolean) => {
    setPackageModalOpen(isOpen);
    if (!isOpen) {
      setEditingPackage(undefined);
    }
  };

  const calculateTotalCost = (packages: Package[]): number => {
    return packages.reduce((total, pkg) => total + (pkg.packageCost || 0), 0);
  };

  const [totalCost, setTotalCost] = useState(calculateTotalCost(selectedPackages));

  const formatDateForInput = (dateString: string | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA');
  };

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useRemixForm<ShipmentFormData>({
    defaultValues: {
      id: item?.id,
      sender: item?.sender?.documentId ?? "",
      receiver: item?.receiver?.documentId ?? "",
      packages: item?.packages?.map(pkg => ({
        ...pkg,
        packageType: {
          ...pkg.packageType,
          documentId: pkg.packageType?.documentId
        },
        documentId: pkg.documentId
      })) ?? [],
      originAddress: item?.originAddress?.documentId ?? "",
      destinationAddress: item?.destinationAddress?.documentId ?? "",
      branch: item?.branch?.documentId ?? "",
      shippingDate: formatDateForInput(item?.shippingDate) ?? "",
      deliveryDate: formatDateForInput(item?.deliveryDate) ?? "",
      shipmentType: item?.shipmentType ?? "",
      transferMode: item?.transferMode ?? "",
      shipmentCost: item?.shipmentCost ?? 0,
    },
    mode: "onChange",
    resolver: zodResolver(shipmentSchema),
    submitConfig: {
      method: item ? "PUT" : "POST",
      action: "/admin/dashboard/shipment",
    },
  }); 

  const handlePackageCreated = (newPackage: Package) => {
    const tempPackage = {
      ...newPackage,
      id: -(Date.now()),
      documentId: undefined,
      packageType: {
        ...newPackage.packageType,
        documentId: newPackage.packageType?.documentId
      }
    };
    
    const updatedPackages = [...selectedPackages, tempPackage];
    setSelectedPackages(updatedPackages);
    
    register("packages").onChange({
      target: {
        value: updatedPackages,
        name: "packages",
      },
    });
    
    handleClosePackageModal(false);
  };

  const handlePackageUpdated = (updatedPackage: Package) => {
    const updatedPackages = selectedPackages.map(p => {
      if (p.id === updatedPackage.id) {
        if (p.id > 0) {
          return {
            ...updatedPackage,
            documentId: p.documentId,
            packageType: {
              ...updatedPackage.packageType,
              documentId: p.packageType?.documentId
            }
          };
        }
        return {
          ...updatedPackage,
          documentId: undefined,
          packageType: {
            ...updatedPackage.packageType,
            documentId: updatedPackage.packageType?.documentId
          }
        };
      }
      return p;
    });

    setSelectedPackages(updatedPackages);
    
    register("packages").onChange({
      target: {
        value: updatedPackages,
        name: "packages",
      },
    });
    
    handleClosePackageModal(false);
  };

  const handleEditPackage = (pkg: Package) => {
    setEditingPackage({
      ...pkg,
      packageType: {
        ...pkg.packageType,
        documentId: pkg.packageType?.documentId
      },
      documentId: pkg.documentId
    });
    handleClosePackageModal(true);
  };

  const handleRemovePackage = (packageId: number) => {
    const updatedPackages = selectedPackages.filter(p => p.id !== packageId);
    setSelectedPackages(updatedPackages);
    
    register("packages").onChange({
      target: {
        value: updatedPackages,
        name: "packages",
      },
    });
  };

  const renderDateField = (
    name: keyof ShipmentFormData,
    label: string,
  ) => (
    <div className="sm:col-span-2">
      <label
        htmlFor={name}
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        {label}
      </label>
      <div className="mt-2">
        <input
          type="date"
          id={name}
          {...register(name)}
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


  useEffect(() => {
    const newTotalCost = calculateTotalCost(selectedPackages);
    setTotalCost(newTotalCost);
    
    register("shipmentCost").onChange({
      target: {
        value: newTotalCost,
        name: "shipmentCost",
      },
    });
  }, [register, selectedPackages]);

  console.log(loaderData);

  return (
    <Form onSubmit={handleSubmit}>
      {item && <input type="hidden" {...register("id")} />}

      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            {item ? "Edit Shipment" : "Shipment Information"}
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-2">
              <ComboBox
                name="sender"
                label="Sender"
                items={loaderData.customers.data.map((customer) => ({
                  id: customer.id,
                  name: `${customer.firstName} ${customer.lastName}`,
                }))}
                error={errors.sender?.message}
                defaultValue={item?.sender ? `${item.sender.firstName} ${item.sender.lastName}`: undefined}
                onChange={(value) => {
                  const selectedCustomer = loaderData.customers.data.find(
                    (customer) => `${customer.firstName} ${customer.lastName}` === value
                  );
                  register("sender").onChange({
                    target: {
                      value: selectedCustomer?.documentId ?? "",
                      name: "sender",
                    },
                  });
                }}
              />
            </div>

            <div className="sm:col-span-2">
              <ComboBox
                name="receiver"
                label="Receiver"
                items={loaderData.customers.data.map((customer) => ({
                  id: customer.id,
                  name: `${customer.firstName} ${customer.lastName}`,
                }))}
                error={errors.receiver?.message}
                defaultValue={item?.receiver ? `${item.receiver.firstName} ${item.receiver.lastName}`: undefined}
                onChange={(value) => {
                  const selectedCustomer = loaderData.customers.data.find(
                    (customer) => `${customer.firstName} ${customer.lastName}` === value
                  );
                  register("receiver").onChange({
                    target: {
                      value: selectedCustomer?.documentId ?? "",
                      name: "receiver",
                    },
                  });
                }}
              />
            </div>

            <div className="sm:col-span-2">
              <ComboBox
                name="transferMode"
                label="Transfer Mode"
                items={[
                  { id: 1, name: "Air" },
                  { id: 2, name: "Ground" },
                  { id: 3, name: "Sea" },
                ]}
                error={errors.transferMode?.message}
                defaultValue={item?.transferMode}
                onChange={(value) => {
                  register("transferMode").onChange({
                    target: { value, name: "transferMode" },
                  });
                }}
              />
            </div>


            <div className="sm:col-span-3">
              <ComboBox
                name="originAddress"
                label="Origin Address"
                items={loaderData.addresses.data.map((address) => ({
                  id: address.id,
                  name: `${address.zipCode}, ${address.city}, ${address.country}`,
                }))}
                error={errors.originAddress?.message}
                defaultValue={item?.originAddress ? `${item.originAddress.zipCode}, ${item.originAddress.city}, ${item.originAddress.country}` : undefined}
                onChange={(value) => {
                  const selectedAddress = loaderData.addresses.data.find(
                    (addr) => `${addr.zipCode}, ${addr.city}, ${addr.country}` === value
                  );
                  register("originAddress").onChange({
                    target: {
                      value: selectedAddress?.documentId ?? "",
                      name: "originAddress",
                    },
                  });
                }}
              />
            </div>

            <div className="sm:col-span-3">
              <ComboBox
                name="destinationAddress"
                label="Destination Address"
                items={loaderData.addresses.data.map((address) => ({
                  id: address.id,
                  name: `${address.zipCode}, ${address.city}, ${address.country}`,
                }))}
                error={errors.destinationAddress?.message}
                defaultValue={item?.destinationAddress ? `${item.destinationAddress.zipCode}, ${item.destinationAddress.city}, ${item.destinationAddress.country}` : undefined}
                onChange={(value) => {
                  const selectedAddress = loaderData.addresses.data.find(
                    (addr) => `${addr.zipCode}, ${addr.city}, ${addr.country}` === value
                  );
                  register("destinationAddress").onChange({
                    target: {
                      value: selectedAddress?.documentId ?? "",
                      name: "destinationAddress",
                    },
                  });
                }}
              />
            </div>

            <div className="sm:col-span-2">
              <ComboBox
                name="branch"
                label="Branch"
                items={loaderData.branches.data.map((branch) => ({
                  id: branch.id,
                  name: branch.name,
                }))}
                error={errors.branch?.message}
                defaultValue={item?.branch?.name}
                onChange={(value) => {
                  const selectedBranch = loaderData.branches.data.find(
                    (branch) => branch.name === value
                  );
                  register("branch").onChange({
                    target: {
                      value: selectedBranch?.documentId ?? "",
                      name: "branch",
                    },
                  });
                }}
              />
            </div>

            {renderDateField("shippingDate", "Shipping Date")}
            {renderDateField("deliveryDate", "Delivery Date")}

            <div className="sm:col-span-2">
              <ComboBox
                name="shipmentType"
                label="Shipment Type"
                items={[
                  { id: 1, name: "Standard" },
                  { id: 2, name: "Express" },
                  { id: 3, name: "Same Day" },
                ]}
                error={errors.shipmentType?.message}
                defaultValue={item?.shipmentType}
                onChange={(value) => {
                  register("shipmentType").onChange({
                    target: { value, name: "shipmentType" },
                  });
                }}
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="shipmentCost"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Shipment Cost
              </label>
              <div className="mt-2">
                <input
                  type="number"
                  id="shipmentCost"
                  {...register("shipmentCost")}
                  value={totalCost.toFixed(2)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                  readOnly
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Packages
                </label>
                <button
                  type="button"
                  onClick={() => handleClosePackageModal(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <PlusIcon className="h-5 w-5 mr-1" />
                  Add Package
                </button>
              </div>

              {selectedPackages.length > 0 ? (
                <div className="space-y-2">
                  {selectedPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                    >
                      <div>
                        <span className="font-medium">{pkg.content}</span>
                        <span className="text-gray-500 ml-2">({pkg.packageType?.name})</span>
                        <span className="text-gray-500 ml-2">{pkg.netWeight} kg</span>
                        <span className="text-gray-500 ml-2">${pkg.packageCost}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditPackage(pkg)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePackage(pkg.id!)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-4 border-2 border-dashed rounded-md">
                  No packages added
                </div>
              )}
              {errors.packages && (
                <p className="mt-2 text-sm text-red-600">{errors.packages.message}</p>
              )}
            </div>

            {/* Package Creation/Edit Modal */}
            <ModalDialog open={packageModalOpen} setOpen={handleClosePackageModal}>
              <PackageForm
                setOpen={handleClosePackageModal}
                item={editingPackage}
                loaderData={{ packages: loaderData.packages, types: loaderData.types }}
                onPackageCreated={handlePackageCreated}
                onPackageUpdated={handlePackageUpdated}
                isLocalOnly={true}
              />
            </ModalDialog>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="button"
          className="text-sm font-semibold leading-6 text-gray-900"
          onClick={() => setOpen(false)}
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
