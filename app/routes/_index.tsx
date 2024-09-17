import { json, type LoaderFunction, type MetaFunction } from "@remix-run/node";
import Hero from "~/components/hero";
import Features from "~/components/features";
import DetailedFeatures from "~/components/detailed-features";
import CallToAction from "~/components/call-to-action";
import Testimonials from "~/components/testimonials";
import LogoClouds from "~/components/logo-clouds";
import Faq from "~/components/faq";
import { getHomePageData } from "~/api/loaders.server";
import { useLoaderData } from "@remix-run/react";
import { PageData } from "~/types";

const renderBlock = (block: any, baseUrl: string) => {
  switch (block.__component) {
    case "layout.hero":
      return <Hero {...block} baseUrl={baseUrl} />;
    case "layout.logo-cloud":
      return <LogoClouds {...block} baseUrl={baseUrl} />;
    case "layout.features":
      return <Features {...block} baseUrl={baseUrl} />;
    case "layout.detailed-features":
      return <DetailedFeatures {...block} baseUrl={baseUrl} />;
    case "layout.call-to-action":
      return <CallToAction {...block} baseUrl={baseUrl} />;
    case "layout.testimonials":
      return <Testimonials {...block} baseUrl={baseUrl} />;
    case "layout.faq":
      return <Faq {...block} baseUrl={baseUrl} />;
    default:
      return null;
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (data && data.title && data.description) {
    return [
      { title: data.title },
      { name: "description", content: data.description },
    ];
  }

  return [
    { title: "Wakhan Line" },
    { name: "description", content: "Welcome to Wakhan Line" },
  ];
};

export const loader: LoaderFunction = async () => {
  const response = await getHomePageData();
  console.log(response);
  if (!response.blocks) {
    throw Error(
      "Sorry the server is not responding right now. Please try again later."
    );
  }
  return json({
    response: response,
    ENV: {
      STRAPI_URL: process.env.STRAPI_URL,
    },
  });
};

export default function Index() {
  const data: { response: PageData; ENV: { STRAPI_URL: string } } =
    useLoaderData<typeof loader>();

  console.log(data);

  return (
    <main>
      {data.response.blocks.map((block: any, index) => (
        <section key={index}>{renderBlock(block, data.ENV.STRAPI_URL)}</section>
      ))}
    </main>
  );
}
