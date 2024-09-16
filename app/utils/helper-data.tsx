declare global {
  interface Window {
    ENV: {
      STRAPI_URL: string;
    };
  }
}

export const baseUrl =
  typeof window !== "undefined" ? window.ENV.STRAPI_URL : "";
