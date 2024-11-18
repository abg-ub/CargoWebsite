import { useState, useEffect } from "react";
import { useLocation } from "@remix-run/react";
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
  CurrencyDollarIcon,
  HomeIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  TruckIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { Link, Form } from "@remix-run/react";
import { cn } from "~/utils/utils";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: HomeIcon,
    current: true,
  },
  {
    name: "Customer",
    href: "/admin/dashboard/customer",
    icon: UsersIcon,
    current: false,
  },
  {
    name: "Branch",
    href: "/admin/dashboard/branch",
    icon: BuildingLibraryIcon,
    current: false,
  },
  {
    name: "Shipment",
    icon: TruckIcon,
    current: false,
    children: [
      { name: "Shipments", href: "/admin/dashboard/shipment", icon: TruckIcon },
      {
        name: "Rates",
        href: "/admin/dashboard/rate",
        icon: CurrencyDollarIcon,
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
    name: "Service Point",
    href: "/admin/dashboard/service-point",
    icon: MapPinIcon,
    current: false,
  },
  {
    name: "Reports",
    href: "/admin/dashboard/reports",
    icon: ChartPieIcon,
    current: false,
  },
];

interface SidebarNavProps {
  onNavigate?: () => void;
}

export default function SidebarNav({ onNavigate }: SidebarNavProps) {
  const location = useLocation();
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [openItems, setOpenItems] = useState<string[]>([]);

  useEffect(() => {
    // Find matching navigation item
    const currentPath = location.pathname;

    // Check top-level items
    const topLevelMatch = navigation.find((item) => item.href === currentPath);
    if (topLevelMatch) {
      setSelectedItem(topLevelMatch.name);
      return;
    }

    // Check children items
    for (const item of navigation) {
      if (item.children) {
        const childMatch = item.children.find(
          (child) => child.href === currentPath
        );
        if (childMatch) {
          setSelectedItem(childMatch.name);
          setOpenItems((prev) =>
            prev.includes(item.name) ? prev : [...prev, item.name]
          );
          return;
        }
      }
    }

    // If no match found, default to first item
    setSelectedItem(navigation[0].name);
  }, [location.pathname]);

  const handleItemClick = (itemName: string, isParent: boolean = false) => {
    console.log(`Clicked item: ${itemName}, isParent: ${isParent}`);
    console.log("Current openItems:", openItems);

    if (isParent) {
      setOpenItems((prev) => {
        const newOpenItems = prev.includes(itemName)
          ? prev.filter((item) => item !== itemName)
          : [...prev, itemName];
        console.log("New openItems after parent click:", newOpenItems);
        return newOpenItems;
      });
    } else {
      setSelectedItem(itemName);
      // Call onNavigate when a non-parent item is clicked
      onNavigate?.();

      // Find parent item and always ensure it's open
      const parentItem = navigation.find((item) =>
        item.children?.some((child) => child.name === itemName)
      );
      if (parentItem) {
        console.log("Found parent item:", parentItem.name);
        setOpenItems((prev) => {
          const newOpenItems = prev.includes(parentItem.name)
            ? prev
            : [...prev, parentItem.name];
          console.log("New openItems after child click:", newOpenItems);
          return newOpenItems;
        });
      } else {
        // If no parent found, this might be a top-level item
        console.log("No parent found, clearing openItems");
        setOpenItems([]);
      }
    }
  };

  const isOpen = (itemName: string) => openItems.includes(itemName);

  const hasSelectedChild = (item: (typeof navigation)[0]) =>
    item.children?.some((child) => child.name === selectedItem);

  useEffect(() => {
    console.log("openItems after render:", openItems);
  }, [openItems]);

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
                    <Link
                      to={item.href}
                      onClick={() => handleItemClick(item.name)}
                      className={cn(
                        "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6",
                        selectedItem === item.name
                          ? "bg-primary text-primary-foreground"
                          : "text-gray-700 hover:bg-primary/5 hover:text-primary"
                      )}
                    >
                      <item.icon
                        aria-hidden="true"
                        className={cn(
                          "h-6 w-6 shrink-0",
                          selectedItem === item.name
                            ? "text-primary-foreground"
                            : "text-gray-400 group-hover:text-primary"
                        )}
                      />
                      {item.name}
                    </Link>
                  ) : (
                    <Disclosure as="div" defaultOpen={isOpen(item.name)}>
                      {() => (
                        <>
                          <DisclosureButton
                            onClick={() => handleItemClick(item.name, true)}
                            className={cn(
                              "group flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm font-semibold leading-6",
                              selectedItem === item.name ||
                                hasSelectedChild(item)
                                ? "bg-primary/5 text-primary"
                                : "text-gray-700 hover:bg-primary/5 hover:text-primary"
                            )}
                          >
                            <item.icon
                              aria-hidden="true"
                              className={cn(
                                "h-6 w-6 shrink-0",
                                selectedItem === item.name
                                  ? "text-primary"
                                  : "text-gray-400 group-hover:text-primary"
                              )}
                            />
                            {item.name}
                            <ChevronRightIcon
                              aria-hidden="true"
                              className={cn(
                                "ml-auto h-5 w-5 shrink-0",
                                isOpen(item.name)
                                  ? "rotate-90 text-primary"
                                  : "text-gray-400"
                              )}
                            />
                          </DisclosureButton>
                          <DisclosurePanel as="ul" className="mt-1 px-2">
                            {item.children.map((subItem) => (
                              <li key={subItem.name}>
                                <DisclosureButton
                                  as="a"
                                  href={subItem.href}
                                  onClick={() => {
                                    handleItemClick(subItem.name);
                                  }}
                                  className={cn(
                                    "group flex items-center gap-x-3 rounded-md py-2 pl-9 pr-2 text-sm leading-6",
                                    selectedItem === subItem.name
                                      ? "bg-primary text-primary-foreground"
                                      : "text-gray-700 hover:bg-primary/5 hover:text-primary"
                                  )}
                                >
                                  <subItem.icon
                                    aria-hidden="true"
                                    className={cn(
                                      "h-5 w-5 shrink-0",
                                      selectedItem === subItem.name
                                        ? "text-white"
                                        : "text-gray-400 group-hover:text-primary"
                                    )}
                                  />
                                  {subItem.name}
                                </DisclosureButton>
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
                className="group hover:bg-primary/5 flex w-full items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50"
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
