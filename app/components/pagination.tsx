import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { Link } from "@remix-run/react";

interface PaginationProps {
  currentPage?: number;
  pageSize?: number;
  total?: number;
  pageCount?: number;
}

export default function Pagination({
  currentPage = 1,
  pageSize = 10,
  total = 0,
  pageCount = 1,
}: PaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  const getPageNumbers = () => {
    const pages = [];
    const showEllipsis = pageCount > 7;

    if (showEllipsis) {
      if (currentPage <= 4) {
        // Show first 5 pages, ellipsis, and last page
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("ellipsis");
        pages.push(pageCount);
      } else if (currentPage >= pageCount - 3) {
        // Show first page, ellipsis, and last 5 pages
        pages.push(1);
        pages.push("ellipsis");
        for (let i = pageCount - 4; i <= pageCount; i++) pages.push(i);
      } else {
        // Show first page, ellipsis, current-1, current, current+1, ellipsis, last page
        pages.push(1);
        pages.push("ellipsis");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("ellipsis");
        pages.push(pageCount);
      }
    } else {
      // Show all pages if total pages are 7 or less
      for (let i = 1; i <= pageCount; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-10">
      <div className="flex flex-1 justify-between sm:hidden">
        <Link
          to={`?page=${currentPage - 1}&pageSize=${pageSize}`}
          className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${
            currentPage === 1 ? "pointer-events-none opacity-50" : ""
          }`}
        >
          Previous
        </Link>
        <Link
          to={`?page=${currentPage + 1}&pageSize=${pageSize}`}
          className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${
            currentPage === pageCount ? "pointer-events-none opacity-50" : ""
          }`}
        >
          Next
        </Link>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{" "}
            <span className="font-medium">{endItem}</span> of{" "}
            <span className="font-medium">{total}</span> results
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
            <Link
              to={`?page=${currentPage - 1}&pageSize=${pageSize}`}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                currentPage === 1 ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </Link>

            {getPageNumbers().map((pageNum, idx) =>
              pageNum === "ellipsis" ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                >
                  ...
                </span>
              ) : (
                <Link
                  key={pageNum}
                  to={`?page=${pageNum}&pageSize=${pageSize}`}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    currentPage === pageNum
                      ? "z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  }`}
                >
                  {pageNum}
                </Link>
              )
            )}

            <Link
              to={`?page=${currentPage + 1}&pageSize=${pageSize}`}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                currentPage === pageCount
                  ? "pointer-events-none opacity-50"
                  : ""
              }`}
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
