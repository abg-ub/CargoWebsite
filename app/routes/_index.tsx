import type { MetaFunction } from "@remix-run/node";
import Hero from "~/components/hero";
import Features from "~/components/features";
import Features2 from "~/components/features2";
import CallToAction from "~/components/call-to-action";
import Testimonials from "~/components/testimonials";
import LogoClouds from "~/components/logo-clouds";
import Faq from "~/components/faq";

export const meta: MetaFunction = () => {
  return [
    { title: "Wakhan Line" },
    { name: "description", content: "Welcome to Wakhan Line" },
  ];
};

export default function Index() {
  return (
    <>
      <Hero />
      <LogoClouds />
      <Features />
      <Features2 />
      <CallToAction />
      <Testimonials />
      <Faq />
    </>
  );
}
