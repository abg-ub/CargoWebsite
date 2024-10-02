import { Features3Props } from "~/types";
import { formatUrl } from "~/utils/utils";


export default function Features3({ title1, title2, description, features, baseUrl, image }: Features3Props) {
    return (
        <div className="overflow-hidden bg-white py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                    <div className="lg:pr-8 lg:pt-4">
                        <div className="lg:max-w-lg">
                            <h2 className="text-base font-semibold leading-7 text-primary">{title1}</h2>
                            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{title2}</p>
                            <p className="mt-6 text-lg leading-8 text-gray-600">
                                {description}
                            </p>
                            <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                                {features.map((feature) => (
                                    <div key={feature.name} className="relative pl-9">
                                        <dt className="inline font-semibold text-gray-900">
                                            <div
                                                style={{
                                                    mask: `url(${formatUrl(
                                                        feature.logo.url,
                                                        baseUrl
                                                    )}) no-repeat center`,
                                                    WebkitMask: `url(${formatUrl(
                                                        feature.logo.url,
                                                        baseUrl
                                                    )}) no-repeat center`,
                                                }}
                                                className="bg-primary absolute left-1 top-1 h-5 w-5"
                                            />
                                            {feature.name}
                                        </dt>{'. '}
                                        <dd className="inline">{feature.description}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>
                    <img
                        alt={image.alternativeText}
                        src={formatUrl(image.url, baseUrl)}
                        width={2432}
                        height={1442}
                        className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
                    />
                </div>
            </div>
        </div>
    )
}
