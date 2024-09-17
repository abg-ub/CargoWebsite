import { Link } from "@remix-run/react";
import { FooterProps } from "~/types";
import { formatUrl } from "~/utils/utils";

export default function Footer({
  navItems,
  socialLinks,
  copyRight,
  baseUrl,
}: FooterProps) {
  return (
    <footer className="bg-white border-t">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
        <nav
          aria-label="Footer"
          className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12"
        >
          {navItems.map((item, index) => (
            <div key={index} className="pb-6">
              <Link
                to={item.href}
                className="text-sm leading-6 text-gray-600 hover:text-gray-900"
              >
                {item.title}
              </Link>
            </div>
          ))}
        </nav>
        <div className="mt-10 flex justify-center space-x-10">
          {socialLinks.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              className="text-gray-400 hover:text-primary"
              target={item.isExternal ? "_blank" : "_self"}
              rel="noopener noreferrer"
            >
              <span className="sr-only">{item.image.alternativeText}</span>
              <div
                className="h-6 w-6 bg-gray-400 hover:bg-primary"
                style={{
                  mask: `url(${formatUrl(
                    item.image.url,
                    baseUrl
                  )}) no-repeat center / contain`,
                  WebkitMask: `url(${formatUrl(
                    item.image.url,
                    baseUrl
                  )}) no-repeat center / contain`,
                }}
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
        <p className="mt-10 text-center text-xs leading-5 text-gray-500">
          {copyRight}
        </p>
      </div>
    </footer>
  );
}
