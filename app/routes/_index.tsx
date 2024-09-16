import { json, type LoaderFunction } from "@remix-run/node";
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

const renderBlock = (block: any) => {
  switch (block.__component) {
    case "layout.hero":
      return <Hero {...block} />;
    case "layout.logo-cloud":
      return <LogoClouds {...block} />;
    case "layout.features":
      return <Features {...block} />;
    case "layout.detailed-features":
      return <DetailedFeatures {...block} />;
    case "layout.call-to-action":
      return <CallToAction {...block} />;
    case "layout.testimonials":
      return <Testimonials {...block} />;
    case "layout.faq":
      return <Faq {...block} />;
    default:
      return null;
  }
};

export const loader: LoaderFunction = async () => {
  const data = await getHomePageData();
  if (!data.blocks) {
    throw Error(
      "Sorry the server is not responding right now. Please try again later."
    );
  }
  return json(data);
};

export default function Index() {
  const data: PageData = useLoaderData<typeof loader>();
  console.log(data);

  return (
    <main>
      {data.blocks.map((block: any, index) => (
        <section key={index}>{renderBlock(block)}</section>
      ))}
    </main>
  );
}
