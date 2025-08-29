"use client";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

interface PaginationProps {
  page: number;
  totalPage: number;
  onPageChange: (page: number) => void;
}

function Pagination({ page, totalPage, onPageChange }: PaginationProps) {  
  const getPageNumbers = () => {
    const pageNumbers: (number | "...")[] = [];

    if (totalPage <= 5) {
      // Show all pages if total pages <= 5
      for (let i = 1; i <= totalPage; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first and last page
      pageNumbers.push(1);

      if (page > 3) {
        // Add ellipsis if there is a gap after the first page
        pageNumbers.push("...");
      }

      // Include current page and its neighbors
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPage - 1, page + 1);
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      if (page < totalPage - 2) {
        // Add ellipsis if there is a gap before the last page
        pageNumbers.push("...");
      }

      pageNumbers.push(totalPage);
    }

    return pageNumbers;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPage) return;

    onPageChange(newPage);
  }

  const pageNumbers = getPageNumbers();

  if (totalPage === 0) {
    return null;
  }

  return (
    <div className="flex justify-center gap-x-4 my-3">
      <button
        disabled={page === 1}
        className="btn btn-primary"
        onClick={() => handlePageChange(page - 1)}
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>
      <div className="join">
        {pageNumbers.map((pageNumber, index) =>
          pageNumber === "..." ? (
            <button
              key={index}
              className="join-item btn btn-disabled"
              disabled
            >
              ...
            </button>
          ) : (
            <button
              key={index}
              className={`join-item btn ${
                pageNumber === page ? "btn-active" : ""
              }`}
              onClick={() => handlePageChange(pageNumber as number)}
            >
              {pageNumber}
            </button>
          )
        )}
      </div>
      <button
        disabled={page === totalPage}
        className="btn btn-primary"
        onClick={() => handlePageChange(page + 1)}
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </div>
  );
}

export default Pagination;
