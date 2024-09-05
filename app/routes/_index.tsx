import type { MetaFunction } from "@remix-run/node";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "~/components/ui/sheet";

import { Link, NavLink } from "@remix-run/react";

import { MenuIcon } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const navItems = [
    { name: "Home", to: "/" },
    { name: "About", to: "/" },
    { name: "Services", to: "/" },
    { name: "Blog", to: "/" },
    { name: "Contact", to: "/" },
  ];

  return (
    <header className="py-5 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="z-50 flex justify-between items-center">
          <Link to="/">
            <img src="/images/logo.jpeg" alt="logo" className="h-14" />
          </Link>
          <NavigationMenu className="max-sm:hidden">
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.name}>
                  <NavLink to={item.to}>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      {item.name}
                    </NavigationMenuLink>
                  </NavLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          <Sheet>
            <SheetTrigger
              className="sm:hidden"
              asChild
              aria-label="Open navigation menu"
            >
              <MenuIcon size="30" />
            </SheetTrigger>
            <SheetContent className="h-dvh sm:hidden">
              <SheetHeader className="mt-16 flex flex-col gap-6 text-2xl">
                {navItems.map((item) => (
                  <Link key={item.name} to={item.to}>
                    {item.name}
                  </Link>
                ))}
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
