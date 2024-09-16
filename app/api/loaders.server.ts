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
    console.error("Fetch error:", error);
    throw error;
  }
}

export async function getGlobalData() {
  const query = qs.stringify({
    populate: {
      defaultSeo: { populate: "*" },
      header: { populate: ["logoLink.image", "navItems", "buttonLink"] },
      footer: { populate: "*" },
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
          "layout.content": { populate: "*" },
          "layout.content2": { populate: "*" },
          "layout.team": { populate: ["teamMembers.image"] },
        },
      },
    },
  });

  const url = `${baseUrl}/api/pages?${query}`;
  console.log(url);
  return await fetchData(url);
}
