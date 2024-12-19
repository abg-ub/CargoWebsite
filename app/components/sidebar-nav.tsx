import { useState } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import {
  ArrowLeftEndOnRectangleIcon,
  BuildingLibraryIcon,
  ChartPieIcon,
  CubeTransparentIcon,
  HomeIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  TruckIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { NavLink, Form } from "@remix-run/react";
import { cn } from "~/utils/utils";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: HomeIcon,
  },
  {
    name: "Customer",
    href: "/admin/dashboard/customer",
    icon: UsersIcon,
  },
  {
    name: "Branch",
    href: "/admin/dashboard/branch",
    icon: BuildingLibraryIcon,
  },
  {
    name: "Shipment",
    icon: TruckIcon,
    children: [
      { name: "Shipments", href: "/admin/dashboard/shipment", icon: TruckIcon },
      {
        name: "Location",
        href: "/admin/dashboard/location",
        icon: MapPinIcon,
      },
      {
        name: "Packages",
        href: "/admin/dashboard/package",
        icon: CubeTransparentIcon,
      },
      {
        name: "Package Types",
        href: "/admin/dashboard/package-type",
        icon: CubeTransparentIcon,
      },
      {
        name: "Tracking",
        href: "/admin/dashboard/tracking",
        icon: PaperAirplaneIcon,
      },
    ],
  },
  {
    name: "Reports",
    href: "/admin/dashboard/reports",
    icon: ChartPieIcon,
  },
];

interface SidebarNavProps {
  onNavigate?: () => void;
}

export default function SidebarNav({ onNavigate }: SidebarNavProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const handleItemClick = (itemName: string, isParent: boolean = false) => {
    if (isParent) {
      setOpenItems((prev) => 
        prev.includes(itemName)
          ? prev.filter((item) => item !== itemName)
          : [...prev, itemName]
      );
    } else {
      onNavigate?.();
    }
  };

  const isOpen = (itemName: string) => openItems.includes(itemName);

  const NavItem = ({ item, subItem = false }: { item: any, subItem?: boolean }) => (
    <NavLink
      to={item.href}
      end={!subItem}
      onClick={() => handleItemClick(item.name)}
      className={({ isActive, isPending }) => cn(
        "group flex gap-x-3 text-sm leading-6",
        subItem 
          ? "items-center rounded-md py-2 pl-9 pr-2" 
          : "rounded-md p-2 font-semibold",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-gray-700 hover:bg-primary/5 hover:text-primary",
        isPending && "animate-pulse"
      )}
    >
      {({ isActive, isPending }) => (
        <>
          {isPending ? (
            <div className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-[bounce_1s_infinite_0ms]"></span>
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-[bounce_1s_infinite_200ms]"></span>
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-[bounce_1s_infinite_400ms]"></span>
            </div>
          ) : (
            <item.icon
              aria-hidden="true"
              className={cn(
                subItem ? "h-5 w-5" : "h-6 w-6",
                "shrink-0",
                isActive
                  ? subItem ? "text-white" : "text-primary-foreground"
                  : "text-gray-400 group-hover:text-primary"
              )}
            />
          )}
          {item.name}
        </>
      )}
    </NavLink>
  );

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 h-dvh w-72">
      <div className="flex h-16 shrink-0 items-center">
        <img
          alt="Your Company"
          src="/images/logo.png"
          className="h-10 w-auto"
        />
      </div>
      <nav className="flex flex-1 flex-col">
        <ul className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  {!item.children ? (
                    <NavItem item={item} />
                  ) : (
                    <Disclosure as="div" defaultOpen={isOpen(item.name)}>
                      {() => (
                        <>
                          <DisclosureButton
                            onClick={() => handleItemClick(item.name, true)}
                            className={cn(
                              "group flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm font-semibold leading-6",
                              "text-gray-700 hover:bg-primary/5 hover:text-primary"
                            )}
                          >
                            <item.icon
                              className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-primary"
                              aria-hidden="true"
                            />
                            {item.name}
                            <ChevronRightIcon
                              className={cn(
                                "ml-auto h-5 w-5 shrink-0",
                                isOpen(item.name)
                                  ? "rotate-90 text-primary"
                                  : "text-gray-400"
                              )}
                              aria-hidden="true"
                            />
                          </DisclosureButton>
                          <DisclosurePanel as="ul" className="mt-1 px-2">
                            {item.children.map((subItem) => (
                              <li key={subItem.name}>
                                <NavItem item={subItem} subItem />
                              </li>
                            ))}
                          </DisclosurePanel>
                        </>
                      )}
                    </Disclosure>
                  )}
                </li>
              ))}
            </ul>
          </li>
          <li className="-mx-6 mt-auto max-lg:hidden">
            <Form method="post" action="/admin/logout">
              <button
                type="submit"
                className="group hover:bg-primary/5 flex w-full items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900"
              >
                <ArrowLeftEndOnRectangleIcon className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-primary" />
                <span className="group-hover:text-primary">Sign Out</span>
              </button>
            </Form>
          </li>
        </ul>
      </nav>
    </div>
  );
}
