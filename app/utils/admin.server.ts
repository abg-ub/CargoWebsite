import {
  deletePackages,
  savePackage,
  deletePackageTypes,
  savePackageType,
  updatePackageType,
  updatePackage,
  deleteShipments,
  saveShipment,
  updateShipment,
  saveTracking,
  updateTracking,
  deleteTrackings,
} from "~/api/actions.server";
import {
  getAddresses,
  getBranches,
  getCustomers,
  getPackages,
  getPackageTypes,
  getShipments,
  getTrackings,
  getLocations,
} from "~/api/loaders.server";

export type ServerHandlers = {
  loader: {
    [key: string]: (
      request: Request,
      page: number,
      pageSize: number,
      search: string
    ) => Promise<any>;
  };
  actions: {
    save: (data: any, request: Request) => Promise<any>;
    update: (data: any, request: Request) => Promise<any>;
    delete: (ids: number[], request: Request) => Promise<any>;
  };
};

export const serverHandlers: Record<string, ServerHandlers> = {
  "package-type": {
    loader: {
      types: getPackageTypes,
    },
    actions: {
      save: savePackageType,
      update: updatePackageType,
      delete: deletePackageTypes,
    },
  },
  package: {
    loader: {
      packages: getPackages,
      types: getPackageTypes,
    },
    actions: {
      save: savePackage,
      update: updatePackage,
      delete: deletePackages,
    },
  },
  shipment: {
    loader: {
      shipments: getShipments,
      packages: getPackages,
      types: getPackageTypes,
      branches: getBranches,
      customers: getCustomers,
      addresses: getAddresses,
    },
    actions: {
      save: saveShipment,
      update: updateShipment,
      delete: deleteShipments,
    },
  },
  tracking: {
    loader: {
      trackings: getTrackings,
      shipments: getShipments,
      locations: getLocations,
    },
    actions: {
      save: saveTracking,
      update: updateTracking,
      delete: deleteTrackings,
    },
  },
};
