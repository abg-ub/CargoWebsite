import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BlocksRenderer } from "@strapi/blocks-react-renderer";
import { getPostByTitle } from "~/api/loaders.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const { title } = params;

  const data = await getPostByTitle(title as string);

  return json(data);
}

export default function BlogPost() {
  const data = useLoaderData<typeof loader>();
  const blog = data[0];
  console.log(blog);
  return (
    <div className="prose max-w-3xl mx-auto my-36">
      <BlocksRenderer content={blog.content} />
    </div>
  );
}
