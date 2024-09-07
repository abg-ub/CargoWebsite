import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";
import { Link, NavLink } from "@remix-run/react";
import { MenuIcon, XIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { cn } from "~/lib/utils";

export default function Navbar() {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: "Home", to: "/" },
    { name: "Services", to: "/" },
    { name: "Blog", to: "/" },
    { name: "Contact", to: "/" },
    { name: "About", to: "/" },
  ];

  // Close the menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsNavbarOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <header className="relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-50 flex justify-between py-8 items-center">
        {/* Logo and navigation menu */}
        <div className="z-50 flex items-center gap-16">
          <Link to="/">
            <img src="/images/logo.png" alt="logo" className="h-14" />
          </Link>
          <NavigationMenu className="max-lg:hidden">
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.name}>
                  <NavLink
                    to={item.to}
                    className={navigationMenuTriggerStyle()}
                  >
                    {item.name}
                  </NavLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div>
          <Button asChild className="max-lg:hidden">
            <Link to="/">Track Order</Link>
          </Button>
          {/* Menu Icon */}
          <div className="lg:hidden">
            {isNavbarOpen ? (
              <XIcon
                size="30"
                className="relative z-50 cursor-pointer"
                onClick={() => setIsNavbarOpen(false)}
                aria-expanded="true"
                aria-label="Close menu"
              />
            ) : (
              <MenuIcon
                size="30"
                className="relative z-50 cursor-pointer"
                onClick={() => setIsNavbarOpen(true)}
                aria-expanded="false"
                aria-label="Open menu"
              />
            )}
            {/* Backdrop Blur */}
            <div
              className={cn(
                "fixed inset-0 transition-all duration-500 ease-in-out",
                isNavbarOpen
                  ? "backdrop-blur-sm bg-black/30 opacity-100"
                  : "opacity-0 pointer-events-none"
              )}
            ></div>

            {/* Mobile Menu */}
            <div
              ref={menuRef}
              className={cn(
                "absolute inset-x-0 top-0 z-0 origin-top rounded-b-2xl bg-gray-50 px-6 pb-6 pt-32",
                "shadow-2xl shadow-gray-900/20 transform transition-all duration-500 ease-in-out",
                isNavbarOpen
                  ? "translate-y-0 opacity-100"
                  : "-translate-y-8 opacity-0"
              )}
            >
              <div className="flex flex-col gap-y-2">
                {navItems.map((item) => (
                  <Link
                    to={item.to}
                    key={item.name}
                    onClick={() => setIsNavbarOpen(false)}
                    className={navigationMenuTriggerStyle()}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-4">
                <Button asChild>
                  <Link to="/" onClick={() => setIsNavbarOpen(false)}>
                    Track Order
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
