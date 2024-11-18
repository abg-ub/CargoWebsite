import { getSession } from "~/session.server";
import { BranchData, CustomerData, ServicePointData } from "~/types";

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

export async function saveServicePoint(
  servicePointData: ServicePointData,
  request: Request
) {
  const url = `${baseUrl}/api/service-points`;
  const jwt = await getJwt(request);

  try {
    console.log(
      "Attempting to save service point with data:",
      servicePointData
    );

    // Transform the data to match Strapi's relation format
    const transformedData = {
      name: servicePointData.name,
      address: servicePointData.address,
      latitude: servicePointData.latitude,
      longitude: servicePointData.longitude,
      branch: {
        connect: [parseInt(servicePointData.branchId as string)], // Convert to number and use connect format
      },
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

export async function updateServicePoint(
  servicePointData: ServicePointData,
  request: Request
) {
  const jwt = await getJwt(request);

  try {
    console.log("Updating service point with data:", servicePointData);

    // Use the documentId for the update
    const url = `${baseUrl}/api/service-points/${servicePointData.documentId}`;

    // Transform the data for Strapi
    const transformedData = {
      name: servicePointData.name,
      address: servicePointData.address,
      latitude: servicePointData.latitude,
      longitude: servicePointData.longitude,
      branch: {
        connect: [parseInt(servicePointData.branchId as string)],
      },
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

export async function deleteServicePoints(
  ids: (string | number)[],
  request: Request
) {
  const jwt = await getJwt(request);

  try {
    const servicePointsResponse = await fetch(`${baseUrl}/api/service-points`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (!servicePointsResponse.ok) {
      throw new Error("Failed to fetch service points");
    }

    const servicePoints = await servicePointsResponse.json();
    const documentIds = ids.map((id) => {
      const servicePoint = servicePoints.data.find((sp: any) => sp.id === id);
      if (!servicePoint) {
        throw new Error(`Service point with id ${id} not found`);
      }
      return servicePoint.documentId;
    });

    console.log("Starting deletion process for documentIds:", documentIds);

    const results = await Promise.all(
      documentIds.map(async (documentId) => {
        const url = `${baseUrl}/api/service-points/${documentId}`;
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
