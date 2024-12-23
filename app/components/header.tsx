import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Dialog, DialogPanel } from "@headlessui/react";
import { useState } from "react";

import { Link } from "@remix-run/react";
import { HeaderProps } from "~/types";
import { formatUrl } from "~/utils/utils";

export default function Header({
  logoLink,
  navItems,
  buttonLink,
  baseUrl,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <header className="absolute inset-x-0 top-0 z-50 max-w-7xl mx-auto">
      <nav
        aria-label="Global"
        className="flex items-center justify-between p-6 lg:px-8"
      >
        <div className="flex lg:flex-1">
          <Link to={logoLink.href} className="-m-1.5 p-1.5">
            <span className="sr-only">Wakhan Line</span>
            <img
              alt={logoLink.image.alternativeText}
              src={formatUrl(logoLink.image.url, baseUrl)}
              className="h-10 w-auto"
            />
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navItems &&
            navItems.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                {item.title}
              </Link>
            ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <Link to={buttonLink.href} className="btn-primary">
            {buttonLink.title}
          </Link>
        </div>
      </nav>
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="-m-1.5 p-1.5"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Wakhan Line</span>
              <img
                alt={logoLink.image.alternativeText}
                src={formatUrl(logoLink.image.url, baseUrl)}
                className="h-10 w-auto"
              />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navItems &&
                  navItems.map((item) => (
                    <Link
                      key={item.id}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    >
                      {item.title}
                    </Link>
                  ))}
              </div>
              <div className="py-6">
                <Link
                  to={buttonLink.href}
                  className="btn-primary block text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {buttonLink.title}
                </Link>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
