import { getSession } from "~/session.server";
import {
  BranchData,
  CustomerData,
  LocationData,
  PackageType,
  Package,
  Shipment,
  Contact,
} from "~/types";

const baseUrl = process.env.STRAPI_URL;

// Customer
export async function saveCustomer(
  customerData: CustomerData,
  request: Request
) {
  const url = `${baseUrl}/api/customers`;
  const session = await getSession(request.headers.get("Cookie"));
  const jwt = session.get("jwt");

  if (!jwt) {
    throw new Error("User not authenticated");
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        data: customerData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      // Handle uniqueness validation errors
      if (errorData?.error?.details?.errors) {
        const errors = errorData.error.details.errors;
        const uniqueError = errors.find((e) => e.message.includes("unique"));
        if (uniqueError) {
          throw new Error(
            `A customer with this ${uniqueError.path[0]} already exists. Please use a different value.`
          );
        }
      }

      // Handle other errors
      throw new Error(
        errorData?.error?.message ||
          "Failed to save customer data. Please try again later."
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving customer:", error);
    throw error;
  }
}

// Add updateCustomer function
export async function updateCustomer(
  customerData: CustomerData,
  request: Request
) {
  console.log("Attempting to update customer with data:", customerData);

  try {
    const jwt = await getJwt(request);
    const customersResponse = await fetch(`${baseUrl}/api/customers`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (!customersResponse.ok) {
      throw new Error("Failed to fetch customers");
    }

    const customers = await customersResponse.json();

    // Find the customer by email
    const matchingCustomer = customers.data.find(
      (c: any) => c.email === customerData.email
    );

    if (!matchingCustomer) {
      throw new Error("Could not find customer to update");
    }

    console.log("Found matching customer:", matchingCustomer);

    const url = `${baseUrl}/api/customers/${matchingCustomer.documentId}`;
    console.log("Update URL:", url);

    // Remove ids from the data payload
    const { id, documentId, ...dataWithoutIds } = customerData;

    // Check if we're actually changing the email
    const emailChanged = dataWithoutIds.email !== matchingCustomer.email;

    // If we're not changing the email, remove it from the update payload
    // This prevents the unique constraint error
    if (!emailChanged) {
      delete dataWithoutIds.email;
    }

    console.log("Sending update with data:", dataWithoutIds);

    const updateResponse = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        data: dataWithoutIds,
      }),
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json().catch(() => null);
      console.error("API Error Response:", errorData);

      // Handle uniqueness validation errors
      if (errorData?.error?.details?.errors) {
        const errors = errorData.error.details.errors;
        const uniqueError = errors.find((e: any) =>
          e.message.includes("unique")
        );
        if (uniqueError) {
          throw new Error(
            `A customer with this ${uniqueError.path[0]} already exists. Please use a different value.`
          );
        }
      }

      throw new Error(
        errorData?.error?.message ||
          `Failed to update customer. Status: ${updateResponse.status}`
      );
    }

    return await updateResponse.json();
  } catch (error) {
    console.error("Error updating customer:", error);
    throw error;
  }
}

// Helper function to get JWT
async function getJwt(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const jwt = session.get("jwt");
  if (!jwt) throw new Error("User not authenticated");
  return jwt;
}

// Add this function to get customers by ID
export async function getCustomerById(id: string | number, request: Request) {
  const url = `${baseUrl}/api/customers/${id}`;
  const session = await getSession(request.headers.get("Cookie"));
  const jwt = session.get("jwt");

  if (!jwt) {
    throw new Error("User not authenticated");
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  if (!response.ok) {
    console.error("Failed to fetch customer:", await response.json());
    throw new Error("Failed to fetch customer");
  }

  return await response.json();
}

export async function deleteCustomers(
  ids: (string | number)[],
  request: Request
) {
  const jwt = await getJwt(request);

  try {
    // First, fetch all customers to get their documentIds
    const customersResponse = await fetch(`${baseUrl}/api/customers`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (!customersResponse.ok) {
      throw new Error("Failed to fetch customers");
    }

    const customers = await customersResponse.json();

    // Map the ids to documentIds
    const documentIds = ids.map((id) => {
      const customer = customers.data.find((c: any) => c.id === id);
      if (!customer) {
        throw new Error(`Customer with id ${id} not found`);
      }
      return customer.documentId;
    });

    console.log("Starting deletion process for documentIds:", documentIds);

    // Delete each customer using documentId
    const results = await Promise.all(
      documentIds.map(async (documentId) => {
        console.log(
          `Sending DELETE request for customer documentId ${documentId}`
        );
        const url = `${baseUrl}/api/customers/${documentId}`;
        console.log("Delete URL:", url);

        const response = await fetch(url, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });

        console.log(`Response status for ${documentId}:`, response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error(`Failed to delete customer ${documentId}:`, errorData);
          throw new Error(
            errorData?.error?.message ||
              `Failed to delete customer ${documentId}`
          );
        }

        const responseData = await response.json().catch(() => null);
        console.log(`Delete response for ${documentId}:`, responseData);
        return response;
      })
    );

    // Check if all deletions were successful
    const allSuccessful = results.every((response) => response.ok);

    if (!allSuccessful) {
      throw new Error("Some deletions failed");
    }

    console.log("All deletions completed successfully");
    return { success: true };
  } catch (error) {
    console.error("Error deleting customers:", error);
    throw error;
  }
}

// Add these new functions

export async function saveBranch(branchData: BranchData, request: Request) {
  const url = `${baseUrl}/api/branches`;
  const jwt = await getJwt(request);

  try {
    console.log("Attempting to save branch with data:", branchData);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        data: branchData,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("API Error Response:", responseData);

      // Handle validation errors
      if (responseData.error?.details?.errors) {
        const errors = responseData.error.details.errors;
        const errorMessages = errors.map((e: any) => e.message).join(", ");
        throw new Error(`Validation errors: ${errorMessages}`);
      }

      throw new Error(
        responseData.error?.message ||
          `Failed to save branch. Status: ${response.status}`
      );
    }

    return responseData;
  } catch (error) {
    console.error("Error details:", error);
    throw error;
  }
}

export async function updateBranch(branchData: BranchData, request: Request) {
  const jwt = await getJwt(request);

  try {
    console.log("Attempting to update branch with data:", branchData);

    // First, fetch all branches to get the documentId
    const branchesResponse = await fetch(`${baseUrl}/api/branches`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (!branchesResponse.ok) {
      throw new Error("Failed to fetch branches");
    }

    const branches = await branchesResponse.json();

    // Find the branch by id
    const matchingBranch = branches.data.find(
      (b: any) => b.id === parseInt(branchData.id as string)
    );

    if (!matchingBranch) {
      throw new Error("Could not find branch to update");
    }

    console.log("Found matching branch:", matchingBranch);

    // Use the documentId for the update
    const url = `${baseUrl}/api/branches/${matchingBranch.documentId}`;
    console.log("Update URL:", url);

    // Remove ids from the data payload
    const { id, documentId, ...updateData } = branchData;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        data: updateData,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("API Error Response:", responseData);

      // Handle validation errors
      if (responseData.error?.details?.errors) {
        const errors = responseData.error.details.errors;
        const errorMessages = errors
          .map((e: any) => {
            const field = e.path.join(".");
            return `${field}: ${e.message}`;
          })
          .join("; ");
        throw new Error(`Validation failed: ${errorMessages}`);
      }

      throw new Error(
        responseData.error?.message ||
          `Failed to update branch. Status: ${response.status}`
      );
    }

    return responseData;
  } catch (error) {
    console.error("Error updating branch:", error);
    throw error;
  }
}

export async function deleteBranches(
  ids: (string | number)[],
  request: Request
) {
  const jwt = await getJwt(request);

  try {
    // First, fetch all branches to get their documentIds
    const branchesResponse = await fetch(`${baseUrl}/api/branches`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (!branchesResponse.ok) {
      throw new Error("Failed to fetch branches");
    }

    const branches = await branchesResponse.json();

    // Map the ids to documentIds
    const documentIds = ids.map((id) => {
      const branch = branches.data.find((b: any) => b.id === id);
      if (!branch) {
        throw new Error(`Branch with id ${id} not found`);
      }
      return branch.documentId;
    });

    console.log("Starting deletion process for documentIds:", documentIds);

    // Delete each branch using documentId
    const results = await Promise.all(
      documentIds.map(async (documentId) => {
        console.log(
          `Sending DELETE request for branch documentId ${documentId}`
        );
        const url = `${baseUrl}/api/branches/${documentId}`;
        console.log("Delete URL:", url);

        const response = await fetch(url, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error(`Failed to delete branch ${documentId}:`, errorData);
          throw new Error(
            errorData?.error?.message || `Failed to delete branch ${documentId}`
          );
        }

        return response;
      })
    );

    // Check if all deletions were successful
    const allSuccessful = results.every((response) => response.ok);

    if (!allSuccessful) {
      throw new Error("Some deletions failed");
    }

    console.log("All deletions completed successfully");
    return { success: true };
  } catch (error) {
    console.error("Error deleting branches:", error);
    throw error;
  }
}

export async function saveLocation(
  locationData: LocationData,
  request: Request
) {
  const url = `${baseUrl}/api/locations`;
  const jwt = await getJwt(request);

  try {
    console.log(
      "Attempting to save service point with data:",
      locationData
    );

    // Transform the data to match Strapi's relation format
    const transformedData = {
      name: locationData.name,
      address: locationData.address,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
    };

    console.log("Sending transformed data:", transformedData);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        data: transformedData,
      }),
    });

    const responseData = await response.json();
    console.log("API Response:", responseData);

    if (!response.ok) {
      console.error("API Error Response:", responseData);

      if (responseData.error?.details?.errors) {
        const errors = responseData.error.details.errors;
        const errorMessages = errors.map((e: any) => e.message).join(", ");
        throw new Error(`Validation errors: ${errorMessages}`);
      }

      throw new Error(
        responseData.error?.message ||
          `Failed to save service point. Status: ${response.status}`
      );
    }

    return responseData;
  } catch (error) {
    console.error("Error details:", error);
    throw error;
  }
}

export async function updateLocation(
  locationData: LocationData,
  request: Request
) {
  const jwt = await getJwt(request);

  try {
    console.log("Updating service point with data:", locationData);

    // Use the documentId for the update
    const url = `${baseUrl}/api/locations/${locationData.documentId}`;

    // Transform the data for Strapi
    const transformedData = {
      name: locationData.name,
      address: locationData.address,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
    };

    console.log("Sending update request to:", url);
    console.log("With transformed data:", transformedData);

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        data: transformedData,
      }),
    });

    const responseData = await response.json();
    console.log("Update response:", responseData);

    if (!response.ok) {
      console.error("API Error Response:", responseData);
      throw new Error(
        responseData.error?.message ||
          `Failed to update service point. Status: ${response.status}`
      );
    }

    return responseData;
  } catch (error) {
    console.error("Error updating service point:", error);
    throw error;
  }
}

export async function deleteLocations(
  ids: (string | number)[],
  request: Request
) {
  const jwt = await getJwt(request);

  try {
    const locationsResponse = await fetch(`${baseUrl}/api/locations`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (!locationsResponse.ok) {
      throw new Error("Failed to fetch service points");
    }

    const locations = await locationsResponse.json();
    const documentIds = ids.map((id) => {
      const location = locations.data.find((sp: any) => sp.id === id);
      if (!location) {
        throw new Error(`Service point with id ${id} not found`);
      }
      return location.documentId;
    });

    console.log("Starting deletion process for documentIds:", documentIds);

    const results = await Promise.all(
      documentIds.map(async (documentId) => {
        const url = `${baseUrl}/api/locations/${documentId}`;
        const response = await fetch(url, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error(
            `Failed to delete service point ${documentId}:`,
            errorData
          );
          throw new Error(
            errorData?.error?.message ||
              `Failed to delete service point ${documentId}`
          );
        }

        return response;
      })
    );

    const allSuccessful = results.every((response) => response.ok);
    if (!allSuccessful) {
      throw new Error("Some deletions failed");
    }

    console.log("All deletions completed successfully");
    return { success: true };
  } catch (error) {
    console.error("Error deleting service points:", error);
    throw error;
  }
}

// Add these new functions for Package Types
export async function savePackageType(
  packageType: PackageType,
  request: Request
): Promise<{ data: PackageType }> {
  const jwt = await getJwt(request);
  const url = `${baseUrl}/api/package-types`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ data: packageType }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Improved error handling with specific error messages
      if (response.status === 400) {
        throw new Error(data.error?.message || "Invalid package type data");
      }
      if (response.status === 401) {
        throw new Error("Authentication required");
      }
      if (response.status === 403) {
        throw new Error("You don't have permission to create package types");
      }
      if (response.status === 409) {
        throw new Error("A package type with this name already exists");
      }
      throw new Error(data.error?.message || "Failed to save package type");
    }

    return data;
  } catch (error) {
    console.error("Error saving package type:", error);
    if (error instanceof TypeError) {
      throw new Error("Network error occurred while saving package type");
    }
    throw error;
  }
}

export async function updatePackageType(
  packageType: PackageType,
  request: Request
): Promise<{ data: PackageType }> {
  const jwt = await getJwt(request);

  try {
    console.log("Attempting to update package type with data:", packageType);

    // First, fetch all package types to get the documentId
    const packageTypesResponse = await fetch(`${baseUrl}/api/package-types`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (!packageTypesResponse.ok) {
      throw new Error("Failed to fetch package types");
    }

    const packageTypes = await packageTypesResponse.json();

    // Find the package type by id
    const matchingPackageType = packageTypes.data.find(
      (pt: PackageType) => pt.id === parseInt(packageType.id as unknown as string)
    );

    if (!matchingPackageType) {
      throw new Error("Could not find package type to update");
    }

    const url = `${baseUrl}/api/package-types/${matchingPackageType.documentId}`;

    // Remove ids from the data payload
    const { id, documentId, ...updateData } = packageType;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        data: updateData,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("API Error Response:", responseData);
      throw new Error(
        responseData.error?.message ||
          `Failed to update package type. Status: ${response.status}`
      );
    }

    return responseData;
  } catch (error) {
    console.error("Error updating package type:", error);
    throw error;
  }
}

export async function deletePackageTypes(ids: number[], request: Request) {
  const jwt = await getJwt(request);

  try {
    const packageTypesResponse = await fetch(`${baseUrl}/api/package-types`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (!packageTypesResponse.ok) {
      throw new Error("Failed to fetch package types");
    }

    const packageTypes = await packageTypesResponse.json();
    const documentIds = ids.map((id) => {
      const packageType = packageTypes.data.find(
        (pt: PackageType) => pt.id === id
      );
      if (!packageType) {
        throw new Error(`Package type with id ${id} not found`);
      }
      return packageType.documentId;
    });

    console.log("Starting deletion process for documentIds:", documentIds);

    const results = await Promise.all(
      documentIds.map(async (documentId) => {
        const url = `${baseUrl}/api/package-types/${documentId}`;
        const response = await fetch(url, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.error?.message ||
              `Failed to delete package type ${documentId}`
          );
        }

        return response;
      })
    );

    const allSuccessful = results.every((response) => response.ok);
    if (!allSuccessful) {
      throw new Error("Some deletions failed");
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting package types:", error);
    throw error;
  }
}

// Add these functions for Package management
export async function savePackage(packageData: Package, request: Request) {
  const jwt = await getJwt(request);
  const url = `${baseUrl}/api/packages`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ data: packageData }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error(data.error?.message || "Invalid package data");
      }
      if (response.status === 401) {
        throw new Error("Authentication required");
      }
      if (response.status === 403) {
        throw new Error("You don't have permission to create packages");
      }
      throw new Error(data.error?.message || "Failed to save package");
    }

   return data;
  } catch (error) {
    console.error("Error saving package:", error);
    if (error instanceof TypeError) {
      throw new Error("Network error occurred while saving package");
    }
    throw error;
  }
}

export async function updatePackage(packageData: Package, request: Request) {
  const jwt = await getJwt(request);

  try {
    // First, fetch all packages to get the documentId
    const packagesResponse = await fetch(`${baseUrl}/api/packages`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (!packagesResponse.ok) {
      throw new Error("Failed to fetch packages");
    }

    const packages = await packagesResponse.json();
    const matchingPackage = packages.data.find(
      (p: Package) => p.id === parseInt(packageData.id as unknown as string)
    );

    if (!matchingPackage) {
      throw new Error("Could not find package to update");
    }

    const url = `${baseUrl}/api/packages/${matchingPackage.documentId}`;
    const { id, documentId, ...updateData } = packageData;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        data: updateData,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(
        responseData.error?.message ||
          `Failed to update package. Status: ${response.status}`
      );
    }

    return responseData;
  } catch (error) {
    console.error("Error updating package:", error);
    throw error;
  }
}

export async function deletePackages(ids: number[], request: Request) {
  const jwt = await getJwt(request);

  try {
    const packagesResponse = await fetch(`${baseUrl}/api/packages`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (!packagesResponse.ok) {
      throw new Error("Failed to fetch packages");
    }

    const packages = await packagesResponse.json();
    const documentIds = ids.map((id) => {
      const pkg = packages.data.find((p: Package) => p.id === id);
      if (!pkg) {
        throw new Error(`Package with id ${id} not found`);
      }
      return pkg.documentId;
    });

    const results = await Promise.all(
      documentIds.map(async (documentId) => {
        const url = `${baseUrl}/api/packages/${documentId}`;
        const response = await fetch(url, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.error?.message ||
              `Failed to delete package ${documentId}`
          );
        }

        return response;
      })
    );

    const allSuccessful = results.every((response) => response.ok);
    if (!allSuccessful) {
      throw new Error("Some deletions failed");
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting packages:", error);
    throw error;
  }
}

// Add this function at the top of the file
async function generateTrackingNumber(): Promise<string> {
  const prefix = "TN";
  const timestamp = new Date().toISOString()
    .replace(/[-:]/g, '')  // Remove dashes and colons
    .replace(/[T.]/g, '')  // Remove T and decimal point
    .slice(0, 14);         // Get YYYYMMDDHHmmss
  
  
  return `${prefix}${timestamp}`;
}

export async function saveShipment(shipmentData: Shipment, request: Request) {
  const jwt = await getJwt(request);
  const url = `${baseUrl}/api/shipments`;

  try {
    // Try up to 3 times to create a shipment with a unique tracking number
    let attempts = 0;
    const maxAttempts = 3;
    let savedShipment = null;

    while (attempts < maxAttempts && !savedShipment) {
      try {
        // Generate new tracking number
        const trackingNumber = await generateTrackingNumber();
        
        // First, save all packages with negative IDs (new packages)
        const savedPackageDocumentIds = [];
        for (const pkg of shipmentData.packages) {
          if (typeof pkg === 'object' && pkg.id && pkg.id < 0) {
            const packageData = {
              content: pkg.content,
              netWeight: pkg.netWeight,
              value: pkg.value,
              packageStatus: pkg.packageStatus,
              pricePerKg: pkg.pricePerKg,
              packageCost: pkg.packageCost,
              packageType: {
                connect: [pkg.packageType?.documentId]
              }
            };
            
            const packageResponse = await fetch(`${baseUrl}/api/packages`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwt}`,
              },
              body: JSON.stringify({
                data: packageData
              }),
            });

            if (!packageResponse.ok) {
              const error = await packageResponse.json();
              console.error("Package creation failed:", error);
              throw new Error("Failed to save package");
            }

            const savedPackage = await packageResponse.json();
            savedPackageDocumentIds.push(savedPackage.data.documentId);
          } else {
            savedPackageDocumentIds.push(pkg.documentId);
          }
        }

        // Prepare shipment data
        const shipmentPayload = {
          trackingNumber,
          shippingDate: shipmentData.shippingDate,
          deliveryDate: shipmentData.deliveryDate,
          shipmentType: shipmentData.shipmentType,
          transferMode: shipmentData.transferMode,
          shipmentCost: shipmentData.shipmentCost,
          sender: {
            connect: [shipmentData.sender]
          },
          receiver: {
            connect: [shipmentData.receiver]
          },
          originAddress: {
            connect: [shipmentData.originAddress]
          },
          destinationAddress: {
            connect: [shipmentData.destinationAddress]
          },
          branch: {
            connect: [shipmentData.branch]
          },
          packages: {
            connect: savedPackageDocumentIds
          }
        };

        console.log("Attempting to create shipment with tracking number:", trackingNumber);

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({ data: shipmentPayload }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          // Check if error is due to duplicate tracking number
          if (data.error?.message?.includes('unique') || 
              data.error?.details?.errors?.some((e: any) => e.message.includes('unique'))) {
            console.log("Duplicate tracking number found, retrying...");
            attempts++;
            continue;
          }
          // If it's not a uniqueness error, throw it
          throw new Error(data.error?.message || "Failed to save shipment");
        }

        savedShipment = data;
        break;

      } catch (error) {
        if (attempts >= maxAttempts - 1) {
          throw error;
        }
        attempts++;
      }
    }

    if (!savedShipment) {
      throw new Error("Failed to generate unique tracking number after multiple attempts");
    }

    return savedShipment;

  } catch (error) {
    console.error("Error saving shipment:", error);
    throw error;
  }
}

export async function updateShipment(shipmentData: Shipment, request: Request) {
  const jwt = await getJwt(request);

  try {
    // First, fetch the existing shipment to get current packages
    const shipmentsResponse = await fetch(`${baseUrl}/api/shipments`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (!shipmentsResponse.ok) {
      throw new Error("Failed to fetch shipments");
    }

    const shipments: { data: Shipment[] } = await shipmentsResponse.json();
    const existingShipment = shipments.data.find(
      (s) => s.id === shipmentData.id
    );

    if (!existingShipment) {
      throw new Error("Could not find shipment to update");
    }

    // Get the documentIds of existing packages (with null check)
    const existingPackageIds = existingShipment.packages 
      ? existingShipment.packages.map((pkg: Package) => pkg.documentId).filter(Boolean)
      : [];
    
    // Get the documentIds of packages in the updated data (with null checks)
    const updatedPackageIds = Array.isArray(shipmentData.packages)
      ? shipmentData.packages
          .filter(pkg => pkg && typeof pkg === 'object' && pkg.id && pkg.id > 0)
          .map(pkg => pkg.documentId)
          .filter(Boolean)
      : [];

    // Find packages that need to be deleted
    const packagesToDelete = existingPackageIds.filter(
      (id) => id && !updatedPackageIds.includes(id)
    );

    // Delete removed packages
    if (packagesToDelete.length > 0) {
      console.log("Deleting packages:", packagesToDelete);
      await Promise.all(
        packagesToDelete.map(async (documentId) => {
          if (!documentId) return;
          
          const url = `${baseUrl}/api/packages/${documentId}`;
          try {
            const response = await fetch(url, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${jwt}`,
              },
            });

            if (!response.ok) {
              console.error(`Failed to delete package ${documentId}`);
            }
          } catch (error) {
            console.error(`Error deleting package ${documentId}:`, error);
          }
        })
      );
    }

    // Handle new packages (negative IDs) and update existing ones
    const savedPackageDocumentIds = [];
    if (Array.isArray(shipmentData.packages)) {
      for (const pkg of shipmentData.packages) {
        if (pkg && typeof pkg === 'object') {
          if (pkg.id && pkg.id < 0) {
            // This is a new package
            const packageData = {
              content: pkg.content,
              netWeight: pkg.netWeight,
              value: pkg.value,
              packageStatus: pkg.packageStatus,
              pricePerKg: pkg.pricePerKg,
              packageCost: pkg.packageCost,
              packageType: pkg.packageType?.documentId ? {
                connect: [pkg.packageType.documentId]
              } : undefined
            };
            
            try {
              const packageResponse = await fetch(`${baseUrl}/api/packages`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${jwt}`,
                },
                body: JSON.stringify({
                  data: packageData
                }),
              });

              if (!packageResponse.ok) {
                const error = await packageResponse.json();
                console.error("Package creation failed:", error);
                throw new Error("Failed to save package");
              }

              const savedPackage = await packageResponse.json();
              if (savedPackage.data?.documentId) {
                savedPackageDocumentIds.push(savedPackage.data.documentId);
              }
            } catch (error) {
              console.error("Error creating new package:", error);
              throw error;
            }
          } else if (pkg.id && pkg.id > 0) {
            // This is an existing package that needs to be updated
            try {
              const packageData = {
                content: pkg.content,
                netWeight: pkg.netWeight,
                value: pkg.value,
                packageStatus: pkg.packageStatus,
                pricePerKg: pkg.pricePerKg,
                packageCost: pkg.packageCost,
                packageType: pkg.packageType?.documentId ? {
                  connect: [pkg.packageType.documentId]
                } : undefined
              };

              const updateUrl = `${baseUrl}/api/packages/${pkg.documentId}`;
              const updateResponse = await fetch(updateUrl, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${jwt}`,
                },
                body: JSON.stringify({
                  data: packageData
                }),
              });

              if (!updateResponse.ok) {
                const error = await updateResponse.json();
                console.error(`Failed to update package ${pkg.documentId}:`, error);
                throw new Error(`Failed to update package ${pkg.documentId}`);
              }

              savedPackageDocumentIds.push(pkg.documentId);
            } catch (error) {
              console.error(`Error updating package ${pkg.documentId}:`, error);
              throw error;
            }
          }
        }
      }
    }

    // Prepare shipment update payload
    const shipmentPayload = {
      shippingDate: shipmentData.shippingDate,
      deliveryDate: shipmentData.deliveryDate,
      shipmentType: shipmentData.shipmentType,
      transferMode: shipmentData.transferMode,
      shipmentCost: shipmentData.shipmentCost,
      sender: shipmentData.sender ? {
        connect: [shipmentData.sender]
      } : undefined,
      receiver: shipmentData.receiver ? {
        connect: [shipmentData.receiver]
      } : undefined,
      originAddress: shipmentData.originAddress ? {
        connect: [shipmentData.originAddress]
      } : undefined,
      destinationAddress: shipmentData.destinationAddress ? {
        connect: [shipmentData.destinationAddress]
      } : undefined,
      branch: shipmentData.branch ? {
        connect: [shipmentData.branch]
      } : undefined,
      packages: savedPackageDocumentIds.length > 0 ? {
        set: savedPackageDocumentIds
      } : undefined
    };

    // Update the shipment
    const url = `${baseUrl}/api/shipments/${existingShipment.documentId}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        data: shipmentPayload,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Failed to update shipment:", responseData);
      throw new Error(
        responseData.error?.message ||
          `Failed to update shipment. Status: ${response.status}`
      );
    }

    return responseData;
  } catch (error) {
    console.error("Error updating shipment:", error);
    throw error;
  }
}

export async function deleteShipments(ids: number[], request: Request) {
  const jwt = await getJwt(request);

  try {
    // First, fetch all shipments to get documentIds and package information
    const shipmentsResponse = await fetch(`${baseUrl}/api/shipments`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (!shipmentsResponse.ok) {
      throw new Error("Failed to fetch shipments");
    }

    const shipments: { data: Shipment[] } = await shipmentsResponse.json();
    
    // Get shipments to delete and ensure they exist
    const shipmentsToDelete = shipments.data
      .filter((s) => ids.includes(s.id))
      .filter((s) => s !== null && s !== undefined);

    if (shipmentsToDelete.length === 0) {
      throw new Error("No valid shipments found to delete");
    }
    
    // Collect all packages that need to be deleted
    const packagesToDelete = new Set<string>();
    shipmentsToDelete.forEach((shipment: Shipment) => {
      // Check if shipment and packages exist
      if (shipment && Array.isArray(shipment.packages)) {
        shipment.packages.forEach((pkg: Package) => {
          if (pkg && pkg.documentId) {
            packagesToDelete.add(pkg.documentId);
          }
        });
      }
    });

    // Delete all packages first
    if (packagesToDelete.size > 0) {
      const packageResults = await Promise.all(
        Array.from(packagesToDelete).map(async (documentId) => {
          const url = `${baseUrl}/api/packages/${documentId}`;
          try {
            const response = await fetch(url, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${jwt}`,
              },
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => null);
              console.error(`Failed to delete package ${documentId}:`, errorData);
            }

            return response;
          } catch (error) {
            console.error(`Error deleting package ${documentId}:`, error);
            return null;
          }
        })
      );

      const allPackagesDeleted = packageResults
        .filter(response => response !== null)
        .every(response => response.ok);
        
      if (!allPackagesDeleted) {
        console.warn("Some packages could not be deleted");
      }
    }

    // Then delete the shipments
    const shipmentResults = await Promise.all(
      shipmentsToDelete.map(async (shipment: Shipment) => {
        if (!shipment.documentId) {
          console.error("Missing documentId for shipment:", shipment);
          return null;
        }

        const url = `${baseUrl}/api/shipments/${shipment.documentId}`;
        try {
          const response = await fetch(url, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error(`Failed to delete shipment ${shipment.documentId}:`, errorData);
          }

          return response;
        } catch (error) {
          console.error(`Error deleting shipment ${shipment.documentId}:`, error);
          return null;
        }
      })
    );

    const allSuccessful = shipmentResults
      .filter(response => response !== null)
      .every(response => response?.ok);

    if (!allSuccessful) {
      throw new Error("Some shipment deletions failed");
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting shipments:", error);
    throw error;
  }
}

export async function saveTracking(trackingData: any, request: Request) {
  const jwt = await getJwt(request);
  const url = `${baseUrl}/api/trackings`;

  try {
    console.log("Received tracking data:", trackingData);

    const transformedData = {
      shipmentStatus: trackingData.shipmentStatus,
      shipment: trackingData.shipment ? {
        connect: [trackingData.shipment]
      } : undefined,
      location: trackingData.location ? {
        connect: [trackingData.location]
      } : undefined
    };

    console.log("Transformed data:", transformedData);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        data: transformedData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error Response:", errorData);
      throw new Error(
        errorData.error?.message || "Failed to save tracking"
      );
    }

    const result = await response.json();
    // Return the structure that admin dashboard expects
    return {
      success: true,
      action: "create",
      data: result.data,
      meta: result.meta || {}
    };
  } catch (error) {
    console.error("Error saving tracking:", error);
    return {
      success: false,
      action: "create",
      error: error instanceof Error ? error.message : "Failed to save tracking"
    };
  }
}

export async function updateTracking(trackingData: any, request: Request) {
  const jwt = await getJwt(request);

  try {
    const transformedData = {
      shipmentStatus: trackingData.shipmentStatus,
      shipment: trackingData.shipment ? {
        connect: [trackingData.shipment]
      } : undefined,
      location: trackingData.location ? {
        connect: [trackingData.location]
      } : undefined
    };

    const url = `${baseUrl}/api/trackings/${trackingData.documentId}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        data: transformedData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error Response:", errorData);
      throw new Error(
        errorData.error?.message || `Failed to update tracking`
      );
    }

    const result = await response.json();
    // Return the structure that admin dashboard expects
    return {
      success: true,
      action: "update",
      data: result.data,
      meta: result.meta || {}
    };
  } catch (error) {
    console.error("Error updating tracking:", error);
    return {
      success: false,
      action: "update",
      error: error instanceof Error ? error.message : "Failed to update tracking"
    };
  }
}

export async function deleteTrackings(ids: number[], request: Request) {
  const jwt = await getJwt(request);

  try {
    // First, fetch all trackings to get documentIds
    const trackingsResponse = await fetch(`${baseUrl}/api/trackings`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (!trackingsResponse.ok) {
      throw new Error("Failed to fetch trackings");
    }

    const trackings = await trackingsResponse.json();
    
    // Get trackings to delete and ensure they exist
    const trackingsToDelete = trackings.data
      .filter((t: any) => ids.includes(t.id))
      .filter((t: any) => t !== null && t !== undefined);

    if (trackingsToDelete.length === 0) {
      throw new Error("No valid trackings found to delete");
    }

    // Delete the trackings
    const results = await Promise.all(
      trackingsToDelete.map(async (tracking: any) => {
        if (!tracking.documentId) {
          console.error("Missing documentId for tracking:", tracking);
          return null;
        }

        const url = `${baseUrl}/api/trackings/${tracking.documentId}`;
        try {
          const response = await fetch(url, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error(`Failed to delete tracking ${tracking.documentId}:`, errorData);
          }

          return response;
        } catch (error) {
          console.error(`Error deleting tracking ${tracking.documentId}:`, error);
          return null;
        }
      })
    );

    const allSuccessful = results
      .filter(response => response !== null)
      .every(response => response?.ok);

    if (!allSuccessful) {
      throw new Error("Some tracking deletions failed");
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting trackings:", error);
    throw error;
  }
}

export async function saveContact(contactData: Contact) {
  const url = `${baseUrl}/api/contacts`;

  try {
    console.log("Attempting to save contact with data:", contactData);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: contactData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error Response:", errorData);

      // Handle validation errors
      if (errorData.error?.details?.errors) {
        const errors = errorData.error.details.errors;
        const errorMessages = errors.map((e: any) => e.message).join(", ");
        throw new Error(`Validation errors: ${errorMessages}`);
      }

      throw new Error(
        errorData.error?.message || "Failed to submit contact form"
      );
    }

    const result = await response.json();
    return {
      success: true,
      action: "create",
      data: result.data,
      meta: result.meta || {}
    };
  } catch (error) {
    console.error("Error saving contact:", error);
    return {
      success: false,
      action: "create",
      error: error instanceof Error ? error.message : "Failed to submit contact form"
    };
  }
}
