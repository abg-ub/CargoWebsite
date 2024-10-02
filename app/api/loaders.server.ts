import qs from "qs";
import { flattenStrapiResponse } from "~/utils/utils";
import * as process from "node:process";

const baseUrl = process.env.STRAPI_URL;

async function fetchData(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return flattenStrapiResponse(data);
  } catch (error) {
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