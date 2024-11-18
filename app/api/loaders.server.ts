import qs from "qs";
import { flattenStrapiResponse } from "~/utils/utils";
import * as process from "node:process";
import { getSession } from "~/session.server";

const baseUrl = process.env.STRAPI_URL;

async function fetchData(url: string, request?: Request) {
  const headers: HeadersInit = {};

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

export async function getServicePoints(
  request: Request,
  page = 1,
  pageSize = 10,
  searchQuery = ""
) {
  const query = qs.stringify({
    populate: ["branch"],
    pagination: {
      page,
      pageSize,
    },
    filters: {
      $or: searchQuery
        ? [
            { name: { $containsi: searchQuery } },
            { branch: { name: { $containsi: searchQuery } } },
            // Add other searchable fields as needed
          ]
        : undefined,
    },
  });

  const url = `${baseUrl}/api/service-points?${query}`;
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
