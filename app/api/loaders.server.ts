import qs from "qs";
import { flattenStrapiResponse } from "~/utils/utils";
import * as process from "node:process";
import { getSession } from "~/session.server";

const baseUrl = process.env.STRAPI_URL;

async function fetchData(url: string, request?: Request) {
  const headers: HeadersInit = {};

  try {
    if (request) {
      const session = await getSession(request.headers.get("Cookie"));
      const jwt = session.get("jwt");

      if (!jwt) {
        throw new Error("Authentication required");
      }
      headers.Authorization = `Bearer ${jwt}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return request ? data : flattenStrapiResponse(data);
  } catch (error) {
    // Enhance error message based on error type
    if (error instanceof SyntaxError) {
      throw new Error("Failed to parse API response");
    }
    if (error instanceof TypeError) {
      throw new Error("Network error occurred");
    }
    // Re-throw other errors
    throw error;
  }
}

export async function getGlobalData() {
  const query = qs.stringify({
    populate: {
      header: { populate: ["logoLink.image", "navItems", "buttonLink"] },
      footer: { populate: ["navItems", "socialLinks.image"] },
    },
    
  });
  const url = `${baseUrl}/api/global?${query}`;
  return await fetchData(url);
}

export async function getHomePageData() {
  const query = qs.stringify({
    populate: {
      blocks: {
        on: {
          "layout.hero": { populate: "*" },
          "layout.logo-cloud": { populate: "*" },
          "layout.features": {
            populate: {
              features: { populate: "*" },
            },
          },
          "layout.detailed-features": { populate: ["image", "features.logo"] },
          "layout.call-to-action": { populate: "*" },
          "layout.testimonials": {
            populate: ["testimonies.image", "testimonies.logo"],
          },
          "layout.faq": {
            populate: "*",
          },
        },
      },
    },
  });

  const url = `${baseUrl}/api/home?${query}`;
  return await fetchData(url);
}

export async function getDynamicPageData(slug: string) {
  const query = qs.stringify({
    filters: { slug: { $eq: slug } },
    populate: {
      blocks: {
        on: {
          "layout.hero": { populate: "*" },
          "layout.hero2": { populate: "*" },
          "layout.hero3": { populate: "*" },
          "layout.logo-cloud": { populate: "*" },
          "layout.features": {
            populate: {
              features: { populate: "*" },
            },
          },
          "layout.features2": { populate: ["features.logo"] },
          "layout.features3": { populate: ["features.logo", "image"] },
          "layout.features4": { populate: ["features.logo", "image"] },
          "layout.detailed-features": { populate: ["image", "features.logo"] },
          "layout.call-to-action": { populate: "*" },
          "layout.testimonials": {
            populate: ["testimonies.image", "testimonies.logo"],
          },
          "layout.faq": {
            populate: "*",
          },
          "layout.content": { populate: "*" },
          "layout.content2": { populate: "*" },
          "layout.team": { populate: ["teamMembers.image"] },
          "layout.stats": { populate: "*" },
        },
      },
    },
  });

  const url = `${baseUrl}/api/pages?${query}`;

  return await fetchData(url);
}

export async function getBlogPageData() {
  const query = qs.stringify({
    populate: { posts: { populate: ["author.image", "coverImage"] } },
  });
  const url = `${baseUrl}/api/blog?${query}`;
  return await fetchData(url);
}

export async function getPostByTitle(title: string) {
  const query = qs.stringify({
    filters: { title: { $eq: title } },
    populate: "*",
  });
  const url = `${baseUrl}/api/posts?${query}`;
  return await fetchData(url);
}

export async function getLocations(
  request: Request,
  page = 1,
  pageSize = 10,
  searchQuery = ""
) {
  const query = qs.stringify({
    populate: "*",
    pagination: {
      page,
      pageSize,
    },
    filters: {
      $or: searchQuery
        ? [
            { name: { $containsi: searchQuery } },
            // Add other searchable fields as needed
          ]
        : undefined,
    },
  });

  const url = `${baseUrl}/api/locations?${query}`;
  return await fetchData(url, request);
}

// Admin Panel
export async function getCustomers(
  request: Request,
  page = 1,
  pageSize = 10,
  searchQuery = ""
) {
  const query = qs.stringify({
    populate: "*",
    pagination: {
      page,
      pageSize,
    },
    filters: {
      $or: searchQuery
        ? [
            { firstName: { $containsi: searchQuery } },
            { lastName: { $containsi: searchQuery } },
            { email: { $containsi: searchQuery } },
          ]
        : undefined,
    },
  });

  const url = `${baseUrl}/api/customers?${query}`;
  return await fetchData(url, request);
}

export async function getBranches(
  request: Request,
  page = 1,
  pageSize = 10,
  searchQuery = ""
) {
  const query = qs.stringify({
    populate: "*",
    pagination: {
      page,
      pageSize,
    },
    filters: {
      $or: searchQuery
        ? [
            { name: { $containsi: searchQuery } },
            { country: { $containsi: searchQuery } },
            { city: { $containsi: searchQuery } },
          ]
        : undefined,
    },
  });

  const url = `${baseUrl}/api/branches?${query}`;
  return await fetchData(url, request);
}

// Authentication
export async function isTokenValidWithStrapi(jwt: string) {
  const response = await fetch(`${process.env.STRAPI_URL}/api/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  return response.ok;
}

export async function getPackageTypes(
  request: Request,
  page = 1,
  pageSize = 10,
  searchQuery = ""
) {
  const query = qs.stringify({
    populate: "*",
    pagination: {
      page,
      pageSize,
    },
    filters: {
      $or: searchQuery ? [{ name: { $containsi: searchQuery } }] : undefined,
    },
  });

  const url = `${baseUrl}/api/package-types?${query}`;
  return await fetchData(url, request);
}

export async function getPackages(
  request: Request,
  page = 1,
  pageSize = 10,
  searchQuery = ""
) {
  const query = qs.stringify({
    populate: ["packageType", "shipment"],
    pagination: {
      page,
      pageSize,
    },
    filters: {
      $or: searchQuery
        ? [
            { content: { $containsi: searchQuery } },
            { packageStatus: { $containsi: searchQuery } },
          ]
        : undefined,
    },
  });

  const url = `${baseUrl}/api/packages?${query}`;
  return await fetchData(url, request);
}

export async function getShipments(
  request: Request,
  page = 1,
  pageSize = 10,
  searchQuery = ""
) {
  const query = qs.stringify({
    populate: [
      "packages",
      "packages.packageType",
      "sender",
      "receiver",
      "originAddress",
      "destinationAddress",
      "branch",
    ],
    pagination: {
      page,
      pageSize,
    },
    filters: {
      $or: searchQuery
        ? [{ trackingNumber: { $containsi: searchQuery } }]
        : undefined,
    },
  });

  const url = `${baseUrl}/api/shipments?${query}`;
  return await fetchData(url, request);
}

export async function getAddresses(
  request: Request,
  page = 1,
  pageSize = 10,
  searchQuery = ""
) {
  const query = qs.stringify({
    populate: "*",
    pagination: {
      page,
      pageSize,
    },
    filters: {
      $or: searchQuery
        ? [
            { country: { $containsi: searchQuery } },
            { city: { $containsi: searchQuery } },
            { state: { $containsi: searchQuery } },
          ]
        : undefined,
    },
  });

  const url = `${baseUrl}/api/addresses?${query}`;
  return await fetchData(url, request);
}

export async function getTrackings(
  request: Request,
  page = 1,
  pageSize = 10,
  searchQuery = ""
) {
  const query = qs.stringify({
    populate: [
      "shipment",
      "shipment.packages",
      "shipment.packages.packageType",
      "shipment.sender",
      "shipment.receiver",
      "shipment.originAddress",
      "shipment.destinationAddress",
      "shipment.branch",
      "location",
    ],
    pagination: {
      page,
      pageSize,
    },
    filters: searchQuery ? {
      $or: [
        { shipmentStatus: { $containsi: searchQuery } },
        {
          location: {
            name: { $containsi: searchQuery }
          }
        },
        {
          shipment: {
            trackingNumber: { $containsi: searchQuery }
          }
        }
      ]
    } : undefined,
    sort: ['createdAt:desc'],
  }, {
    encodeValuesOnly: true
  });

  const url = `${baseUrl}/api/trackings?${query}`;
  return await fetchData(url, request);
}