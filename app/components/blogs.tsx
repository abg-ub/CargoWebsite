import { Link } from "@remix-run/react"
import { BlogsProps } from "~/types"
import { formatUrl } from "~/utils/utils"

export default function Blogs({ posts, title, description, baseUrl }: BlogsProps) {

    return (
        <div className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className=" px-6 py-12 sm:py-16 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">{title}</h2>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            {description}
                        </p>
                    </div>
                </div>
                <div className="mx-auto mt-16 grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                    {posts.map((post, index) => {
                        console.log(post.publishedAt)
                        const dateString = post.publishedAt;
                        const dateObject = new Date(dateString);
                        const formattedDate = dateObject.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        } as Intl.DateTimeFormatOptions);
                        return (
                            <article
                                key={index}
                                className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-gray-900 px-8 pb-8 pt-80 sm:pt-48 lg:pt-80"
                            >
                                <img alt={post.coverImage.alternativeText} src={formatUrl(post.coverImage.url, baseUrl)} className="absolute inset-0 -z-10 h-full w-full object-cover" />
                                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-gray-900 via-gray-900/40" />
                                <div className="absolute inset-0 -z-10 rounded-2xl ring-1 ring-inset ring-gray-900/10" />

                                <div className="flex flex-wrap items-center gap-y-1 overflow-hidden text-sm leading-6 text-gray-300">
                                    <time dateTime={post.publishedAt} className="mr-8">
                                        {formattedDate}
                                    </time>
                                    <div className="-ml-4 flex items-center gap-x-4">
                                        <svg viewBox="0 0 2 2" className="-ml-0.5 h-0.5 w-0.5 flex-none fill-white/50">
                                            <circle r={1} cx={1} cy={1} />
                                        </svg>
                                        <div className="flex gap-x-2.5">
                                            <img alt={post.author.image.alternativeText} src={formatUrl(post.author.image.url, baseUrl)} className="h-6 w-6 flex-none rounded-full /10" />
                                            {post.author.name}
                                        </div>
                                    </div>
                                </div>
                                <h3 className="mt-3 text-lg font-semibold leading-6 text-white">
                                    <Link to={post.href}>
                                        <span className="absolute inset-0" />
                                        {post.title}
                                    </Link>
                                </h3>
                            </article>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
