
'use client';

import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pageNumbers = [];
  const maxPagesToShow = 5;

  let startPage: number, endPage: number;
  if (totalPages <= maxPagesToShow) {
    // less than 5 total pages so show all
    startPage = 1;
    endPage = totalPages;
  } else {
    // more than 5 total pages so calculate start and end pages
    const maxPagesBeforeCurrentPage = Math.floor(maxPagesToShow / 2);
    const maxPagesAfterCurrentPage = Math.ceil(maxPagesToShow / 2) - 1;
    if (currentPage <= maxPagesBeforeCurrentPage) {
      // current page near the start
      startPage = 1;
      endPage = maxPagesToShow;
    } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
      // current page near the end
      startPage = totalPages - maxPagesToShow + 1;
      endPage = totalPages;
    } else {
      // current page somewhere in the middle
      startPage = currentPage - maxPagesBeforeCurrentPage;
      endPage = currentPage + maxPagesAfterCurrentPage;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className='h-9 w-9'
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {startPage > 1 && (
        <>
          <Button variant="outline" size="icon" onClick={() => onPageChange(1)} className='h-9 w-9'>1</Button>
          {startPage > 2 && <span className="text-muted-foreground">...</span>}
        </>
      )}
      {pageNumbers.map(number => (
        <Button
          key={number}
          variant={currentPage === number ? 'default' : 'outline'}
          size="icon"
          onClick={() => onPageChange(number)}
          className='h-9 w-9'
        >
          {number}
        </Button>
      ))}
      {endPage < totalPages && (
         <>
          {endPage < totalPages -1 && <span className="text-muted-foreground">...</span>}
          <Button variant="outline" size="icon" onClick={() => onPageChange(totalPages)} className='h-9 w-9'>{totalPages}</Button>
        </>
      )}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className='h-9 w-9'
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
