import type { MetaFunction } from "@remix-run/node";
import Hero from "~/components/hero";
import Features from "~/components/features";
import Features2 from "~/components/features2";

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
      <Features />
      <Features2 />
    </>
  );
}
