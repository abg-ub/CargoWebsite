import { useEffect, useRef, useState } from "react";
import { cn } from "~/utils/utils";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useDebouncedCallback } from "use-debounce";
import { TableItem } from "~/types";
import Pagination from "../pagination";

// Add TypeScript interface for the props
interface TableProps<T extends TableItem> {
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
  data: T[];
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  onSearch: (query: string) => void;
  onEdit: (item: T) => void;
  onDelete: (ids: (string | number)[]) => void;
  currentPage: number;
  total: number;
  pageCount: number;
  searchPlaceholder?: string;
}

export default function Table<T extends TableItem>({
  title,
  description,
  buttonText,
  onButtonClick,
  data,
  pageSize,
  onPageSizeChange,
  onSearch,
  onEdit,
  onDelete,
  currentPage,
  total,
  pageCount,
  searchPlaceholder = "Search...",
}: TableProps<T>) {
  const checkbox = useRef<HTMLInputElement>(null);
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [selectedPeople, setSelectedPeople] = useState<typeof data>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc" | null;
  }>({ key: "id", direction: null });
  const [searchQuery, setSearchQuery] = useState("");

  // Debounce the search to avoid too many API calls
  const debouncedSearch = useDebouncedCallback((value: string) => {
    onSearch(value);
  }, 300); // 300ms delay

  // Get columns from the first data item's keys, or use empty array if no data
  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  // Fix the sorting function to handle string and number comparisons properly
  const sortedData = [...data].sort((a, b) => {
    if (sortConfig.direction === null) return 0;
    const aValue = a[sortConfig.key as keyof T];
    const bValue = b[sortConfig.key as keyof T];

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    }

    const aString = String(aValue).toLowerCase();
    const bString = String(bValue).toLowerCase();

    if (sortConfig.direction === "asc") {
      return aString.localeCompare(bString);
    }
    return bString.localeCompare(aString);
  });

  const requestSort = (key: string) => {
    setSortConfig((current) => {
      if (current.key === key) {
        // Toggle between asc and desc only
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }
      // New column, always start with asc
      return {
        key,
        direction: "asc",
      };
    });
  };

  useEffect(() => {
    const isIndeterminate =
      selectedPeople.length > 0 && selectedPeople.length < data.length;
    setChecked(selectedPeople.length === data.length);
    setIndeterminate(isIndeterminate);
    if (checkbox.current) {
      checkbox.current.indeterminate = isIndeterminate;
    }
  }, [selectedPeople, data.length]);

  function toggleAll() {
    setSelectedPeople(checked || indeterminate ? [] : data);
    setChecked(!checked && !indeterminate);
    setIndeterminate(false);
  }

  // Reset selected people when data changes
  useEffect(() => {
    setSelectedPeople([]);
  }, [data]);

  const handleDeleteClick = () => {
    // Add logging to debug selected items
    console.log("Selected people:", selectedPeople);

    // Filter out any null or undefined IDs and get unique IDs
    const validIds = selectedPeople
      .map((person) => person.id)
      .filter((id) => id != null);

    const uniqueIds = Array.from(new Set(validIds));

    console.log("Unique IDs to delete:", uniqueIds);

    if (uniqueIds.length === 0) {
      console.error("No valid IDs selected for deletion");
      return;
    }

    onDelete(uniqueIds);
    setSelectedPeople([]);
  };

  // Update the checkbox change handler
  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    item: T
  ) => {
    if (!item.id) {
      console.error("Item missing ID:", item);
      return;
    }

    setSelectedPeople(
      e.target.checked
        ? [...selectedPeople, item]
        : selectedPeople.filter((p) => p.id !== item.id)
    );
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className=" sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            {title}
          </h1>
          <p className="mt-2 text-sm text-gray-700">{description}</p>
        </div>
        <div className="relative">
          <label
            htmlFor="items"
            className="sm:absolute -top-6 mr-2 text-nowrap sm:block text-xs leading-6 text-gray-500"
          >
            Items per page
          </label>
          <select
            id="items"
            name="items"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="mt-2 sm:mr-2 sm:mt-0 rounded-md border-0 py-1.5 pl-3 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        <div className="relative mt-2 sm:m-0 rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon
              aria-hidden="true"
              className="h-5 w-5 text-gray-400"
            />
          </div>
          <input
            type="search"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              const value = e.target.value;
              setSearchQuery(value);
              debouncedSearch(value);
            }}
            className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
          />
        </div>
        <div className="mt-4 sm:ml-8 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="block rounded-md bg-primary px-3 py-1.5 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={onButtonClick}
          >
            {buttonText}
          </button>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="relative">
              {selectedPeople.length > 0 && (
                <div className="absolute left-14 top-0 flex h-12 items-center space-x-3 bg-white sm:left-12">
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-red-500 shadow-sm ring-1 ring-inset ring-red-500 hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-red-500"
                  >
                    Delete Selected
                  </button>
                </div>
              )}
              {data.length > 0 ? (
                <table className="min-w-full table-fixed divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th scope="col" className="relative px-7 sm:w-12 sm:px-6">
                        <input
                          type="checkbox"
                          className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          ref={checkbox}
                          checked={checked}
                          onChange={toggleAll}
                        />
                      </th>
                      {columns.map((column, index) => (
                        <th
                          key={index}
                          scope="col"
                          className={cn(
                            "min-w-full py-3.5 text-left text-sm font-semibold text-gray-900",
                            index === 0 ? "pr-3" : "px-3"
                          )}
                        >
                          <button
                            onClick={() => requestSort(column)}
                            className="group inline-flex"
                          >
                            {column.charAt(0).toUpperCase() + column.slice(1)}
                            <span
                              className={cn(
                                "ml-2 flex-none rounded",
                                sortConfig.key === column
                                  ? "bg-gray-100 text-gray-900"
                                  : "invisible text-gray-400 group-hover:visible group-focus:visible"
                              )}
                            >
                              <ChevronDownIcon
                                className={cn(
                                  "h-5 w-5",
                                  sortConfig.key === column &&
                                    sortConfig.direction === "desc" &&
                                    "rotate-180"
                                )}
                                aria-hidden="true"
                              />
                            </span>
                          </button>
                        </th>
                      ))}
                      <th
                        scope="col"
                        className="relative py-3.5 pl-3 pr-4 sm:pr-3"
                      >
                        <span className="sr-only">Edit</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {sortedData.map((item, index) => (
                      <tr
                        key={index}
                        className={
                          selectedPeople.includes(item)
                            ? "bg-gray-50"
                            : undefined
                        }
                      >
                        <td className="relative px-7 sm:w-12 sm:px-6">
                          {selectedPeople.includes(item) && (
                            <div className="absolute inset-y-0 left-0 w-0.5 bg-primary" />
                          )}
                          <input
                            type="checkbox"
                            className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            value={item.email}
                            checked={selectedPeople.includes(item)}
                            onChange={(e) => handleCheckboxChange(e, item)}
                          />
                        </td>
                        {columns.map((column, index) => (
                          <td
                            key={index}
                            className={cn(
                              "whitespace-nowrap py-4 text-sm",
                              index === 0
                                ? cn(
                                    "font-medium pr-3",
                                    selectedPeople.includes(item)
                                      ? "text-primary"
                                      : "text-gray-900"
                                  )
                                : "text-gray-500 px-3"
                            )}
                          >
                            {String(item[column as keyof T])}
                          </td>
                        ))}
                        <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                          <button
                            onClick={() => onEdit(item)}
                            className="text-primary hover:text-primary/70"
                          >
                            Edit
                            <span className="sr-only">, {item.firstName}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-sm">
                    {searchQuery ? "No results found" : "No data available"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        total={total}
        pageCount={pageCount}
      />
    </div>
  );
}
