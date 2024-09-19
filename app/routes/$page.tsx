import { json, type LoaderFunction } from "@remix-run/node";
import Team from "~/components/team";
import { getDynamicPageData } from "~/api/loaders.server";
import { useLoaderData } from "@remix-run/react";
import Hero from "~/components/hero";
import Hero2 from "~/components/hero2";
import LogoClouds from "~/components/logo-clouds";
import Features from "~/components/features";
import CallToAction from "~/components/call-to-action";
import Testimonials from "~/components/testimonials";
import Faq from "~/components/faq";
import Content from "~/components/content";
import Content2 from "~/components/content2";
import DetailedFeatures from "~/components/detailed-features";
import { PageData } from "~/types";
import * as process from "node:process";
import Hero3 from "~/components/hero3";
import Features2 from "~/components/features2";
import Stats from "~/components/stats";

const renderBlock = (block: any, baseUrl: string) => {
  switch (block.__component) {
    case "layout.hero":
      return <Hero {...block} baseUrl={baseUrl} />;
    case "layout.hero2":
      return <Hero2 {...block} baseUrl={baseUrl} />;
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
    case "layout.content":
      return <Content {...block} baseUrl={baseUrl} />;
    case "layout.content2":
      return <Content2 {...block} baseUrl={baseUrl} />;
    case "layout.team":
      return <Team {...block} baseUrl={baseUrl} />;
    default:
      return null;
  }
};

export const loader: LoaderFunction = async ({ params }) => {
  const data = await getDynamicPageData(params.page ?? "");

  if (data.length === 0) {
    throw Error(
      "Sorry the server is not responding right now. Please try again later."
    );
  }

  return json({ response: data, ENV: { STRAPI_URL: process.env.STRAPI_URL } });
};

export default function DynamicPage() {
  const data: { response: PageData[]; ENV: { STRAPI_URL: string } } =
    useLoaderData<typeof loader>();
  console.log(data);

  return (
    // <main>
    //   {data.response[0].blocks.map((block: any, index) => (
    //     <section key={index}>{renderBlock(block, data.ENV.STRAPI_URL)}</section>
    //   ))}
    // </main>
    <>
      <Hero3 />
      <Stats />
      <Features2 />
    </>
  );
}
