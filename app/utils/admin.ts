import { z } from "zod";
import PackageForm, { packageSchema } from "~/components/form/package-form";
import PackageTypeForm, {
  packageTypeSchema,
} from "~/components/form/package-type-form";
import { Package, PackageType, Shipment, Tracking } from "~/types";
import ShipmentForm, { shipmentSchema } from "~/components/form/shipment-form";
import TrackingForm, { trackingSchema } from "~/components/form/tracking-form";

export type EntityConfig = {
  title: string;
  description: string;
  buttonText: string;
  FormComponent: {
    component: React.ComponentType<any>;
    schema: z.ZodSchema;
    requiredLoaders: string[];
  };
  mapTableData: (item: any) => Record<string, any>;
};

export const entityConfigs: Record<string, EntityConfig> = {
  "package-type": {
    title: "Package Types",
    description: "List of all package types",
    buttonText: "Add Package Type",
    FormComponent: {
      component: PackageTypeForm,
      schema: packageTypeSchema,
      requiredLoaders: ["types"],
    },
    mapTableData: (item: PackageType) => ({
      id: item.id,
      name: item.name,
      "Max Weight": item.maxWeight,
    }),
  },
  package: {
    title: "Packages",
    description: "List of all packages",
    buttonText: "Add Package",
    FormComponent: {
      component: PackageForm,
      schema: packageSchema,
      requiredLoaders: ["packages", "types"],
    },
    mapTableData: (item: Package) => ({
      id: item.id,
      content: item.content,
      "Linked Shipment": item.shipment?.trackingNumber,
      "Package Cost": item.packageCost,
      "Package Type": item.packageType?.name,
    }),
  },
  shipment: {
    title: "Shipments",
    description: "List of all shipments",
    buttonText: "Add Shipment",
    FormComponent: {
      component: ShipmentForm,
      schema: shipmentSchema,
      requiredLoaders: ["shipments", "packages", "branches", "customers", "addresses"],
    },
    mapTableData: (item: Shipment) => {
      const packages = Array.isArray(item.packages) ? item.packages : [];
      
      return {
        id: item.id,
        "Tracking Number": item.trackingNumber,
        "Shipping Cost": packages.reduce((sum, pkg) => sum + (pkg?.packageCost || 0), 0),
        Packages: packages
          .map((p: Package) => p?.packageType?.name)
          .filter(Boolean)
          .join(", "),
      };
    },
  },
  tracking: {
    title: "Trackings",
    description: "List of all tracking records",
    buttonText: "Add Tracking",
    FormComponent: {
      component: TrackingForm,
      schema: trackingSchema,
      requiredLoaders: ["trackings", "shipments", "locations"],
    },
    mapTableData: (item: Tracking) => ({
      id: item.id,
      "Created At": item.createdAt ? new Date(item.createdAt).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }) : 'N/A',
      Shipment: item.shipment?.trackingNumber || 'N/A',
      Location: item.location?.name || 'N/A',
      Status: item.shipmentStatus,
    }),
  },
} as const;
