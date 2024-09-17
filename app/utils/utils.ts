import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Testimony } from "~/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function flattenStrapiResponse(response: any) {
  if (response && response.data) {
    return response.data;
  }
  return response;
}

export const splitTestimonials = (testimonials: Testimony[]) => {
  const leftColumn: Testimony[] = [];
  const rightColumn: Testimony[] = [];

  testimonials.forEach((testimonial, index) => {
    if (index % 2 === 0) {
      leftColumn.push(testimonial);
    } else {
      rightColumn.push(testimonial);
    }
  });

  return [leftColumn, rightColumn];
};

export function formatUrl(url: string, baseUrl: string) {
  if (url.startsWith("https://")) {
    return url;
  } else if (url.startsWith("/")) {
    return `${baseUrl}${url}`;
  } else {
    throw new Error("Invalid URL format");
  }
}
