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

const renderBlock = (block: any) => {
  switch (block.__component) {
    case "layout.hero":
      return <Hero {...block} />;
    case "layout.hero2":
      return <Hero2 {...block} />;
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
    case "layout.content":
      return <Content {...block} />;
    case "layout.content2":
      return <Content2 {...block} />;
    case "layout.team":
      return <Team {...block} />;
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

  return json(data);
};

export default function DynamicPage() {
  const data: PageData[] = useLoaderData<typeof loader>();
  console.log(data);

  return (
    <main>
      {data[0].blocks.map((block: any, index) => (
        <section key={index}>{renderBlock(block)}</section>
      ))}
    </main>
  );
}
