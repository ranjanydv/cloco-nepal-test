'use client';
import { useEffect, useMemo } from 'react';

import { useQueryState } from 'nuqs';

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from './ui/pagination';

interface PaginationProps {
    totalPages: number;
    position?: 'start' | 'center' | 'end';
    onPageChange: (page: number) => void;
}

export function PaginationComponent({ totalPages, position = 'end', onPageChange }: PaginationProps) {
    const [currentPage, setCurrentPage] = useQueryState('page', {
        defaultValue: 1,
        parse: (value) => parseInt(value, 10) || 1,
        serialize: (value) => value.toString(),
    });

    useEffect(() => {
        // Notify parent of the page change
        onPageChange(currentPage);
    }, [currentPage, onPageChange]);

    useEffect(() => {
        if (currentPage > totalPages) {
            onPageChange(1);
        }
    }, [totalPages, currentPage, onPageChange]);

    // Generate page numbers array with ellipsis
    const pages = useMemo(() => {
        const items: (number | 'ellipsis')[] = [1];

        if (currentPage > 3) items.push('ellipsis');

        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            items.push(i);
        }

        if (currentPage < totalPages - 2) items.push('ellipsis');
        if (totalPages > 1) items.push(totalPages);

        return items;
    }, [currentPage, totalPages]);

    const handlePageChange = (page: number) => {
        if (page === currentPage || page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    return (
        <div className="flex justify-end items-center px-4 py-5 w-full select-none">
            <Pagination position={position}>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            onClick={() => handlePageChange(currentPage - 1)}
                        />
                    </PaginationItem>

                    {pages.map((page, index) => (
                        <PaginationItem key={`${page}-${index}`}>
                            {page === 'ellipsis' ? (
                                <PaginationEllipsis />
                            ) : (
                                <PaginationLink className="cursor-pointer" isActive={page === currentPage} onClick={() => handlePageChange(page)}>
                                    {page}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}

                    <PaginationItem>
                        <PaginationNext
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            onClick={() => handlePageChange(currentPage + 1)}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}
