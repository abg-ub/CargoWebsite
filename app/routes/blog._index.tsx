import { type LoaderFunction } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import { getBlogPageData } from "~/api/loaders.server";
import Blogs from "~/components/blogs";

export const loader: LoaderFunction = async () => {
  const data = await getBlogPageData();
  if (data.length === 0) {
    throw Error(
      "Sorry the server is not responding right now. Please try again later."
    );
  }

  return json({ response: data, ENV: { STRAPI_URL: process.env.STRAPI_URL } });
};

export default function Blog() {
  const data = useLoaderData<typeof loader>();
  console.log(data);
  return <Blogs {...data.response} baseUrl={data.ENV.STRAPI_URL} />;
}
