import { useState } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import {
  CalendarIcon,
  ChartPieIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { Link } from "@remix-run/react";
import { cn } from "~/utils/utils";

const navigation = [
  { name: "Dashboard", href: "#", icon: HomeIcon, current: true },
  {
    name: "Teams",
    icon: UsersIcon,
    current: false,
    children: [
      { name: "Engineering", href: "#", current: false },
      { name: "Human Resources", href: "#", current: false },
      { name: "Customer Success", href: "#", current: false },
    ],
  },
  {
    name: "Projects",
    icon: FolderIcon,
    current: false,
    children: [
      { name: "GraphQL API", href: "#" },
      { name: "iOS App", href: "#" },
      { name: "Android App", href: "#" },
      { name: "New Customer Portal", href: "#" },
    ],
  },
  { name: "Calendar", href: "#", icon: CalendarIcon, current: false },
  { name: "Documents", href: "#", icon: DocumentDuplicateIcon, current: false },
  { name: "Reports", href: "#", icon: ChartPieIcon, current: false },
];

export default function SidebarNav() {
  const [selectedItem, setSelectedItem] = useState(navigation[0].name);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleItemClick = (itemName: string) => {
    setSelectedItem(itemName);
  };

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((item) => item !== itemName)
        : [...prev, itemName]
    );
  };

  const isExpanded = (itemName: string) => expandedItems.includes(itemName);

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
      <div className="flex h-16 shrink-0 items-center">
        <img
          alt="Your Company"
          src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
          className="h-8 w-auto"
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
                    </Link>
                  ) : (
                    <Disclosure as="div" defaultOpen={isExpanded(item.name)}>
                      {({ open }) => (
                        <>
                          <DisclosureButton
                            onClick={() => {
                              handleItemClick(item.name);
                              if (!isExpanded(item.name)) {
                                toggleExpanded(item.name);
                              }
                            }}
                            className={cn(
                              "group flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm font-semibold leading-6",
                              selectedItem === item.name
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
                                open
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
                                  onClick={() => handleItemClick(subItem.name)}
                                  className={cn(
                                    "block rounded-md py-2 pl-9 pr-2 text-sm leading-6",
                                    selectedItem === subItem.name
                                      ? "bg-primary/5 text-primary"
                                      : "text-gray-700 hover:bg-primary/5 hover:text-primary"
                                  )}
                                >
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
          <li className="-mx-6 mt-auto">
            <Link
              to="#"
              className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900 hover:bg-primary/5"
            >
              <img
                alt=""
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                className="h-8 w-8 rounded-full bg-primary/5"
              />
              <span className="sr-only">Your profile</span>
              <span aria-hidden="true">Tom Cook</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
