// 'use client';
// import { Suspense, useEffect, useMemo } from 'react';

// import { useQueryState } from 'nuqs';

// import {
//     Pagination,
//     PaginationContent,
//     PaginationEllipsis,
//     PaginationItem,
//     PaginationLink,
//     PaginationNext,
//     PaginationPrevious,
// } from './ui/pagination';

// interface PaginationProps {
//     totalPages: number;
//     position?: 'start' | 'center' | 'end';
//     onPageChange: (page: number) => void;
// }

// function PaginationComp({ totalPages, position = 'end', onPageChange }: PaginationProps) {
//     const [currentPage, setCurrentPage] = useQueryState('page', {
//         defaultValue: 1,
//         parse: (value) => parseInt(value, 10) || 1,
//         serialize: (value) => value.toString(),
//     });

//     useEffect(() => {
//         // Notify parent of the page change
//         onPageChange(currentPage);
//     }, [currentPage, onPageChange]);

//     useEffect(() => {
//         if (currentPage > totalPages) {
//             onPageChange(1);
//         }
//     }, [totalPages, currentPage]);

//     // Generate page numbers array with ellipsis
//     const pages = useMemo(() => {
//         const items: (number | 'ellipsis')[] = [1];

//         if (currentPage > 3) items.push('ellipsis');

//         for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
//             items.push(i);
//         }

//         if (currentPage < totalPages - 2) items.push('ellipsis');
//         if (totalPages > 1) items.push(totalPages);

//         return items;
//     }, [currentPage, totalPages]);

//     const handlePageChange = (page: number) => {
//         if (page === currentPage || page < 1 || page > totalPages) return;
//         setCurrentPage(page);
//     };

//     return (
//         <div className="flex justify-end items-center px-4 py-5 w-full select-none">
//             <Pagination position={position}>
//                 <PaginationContent>
//                     <PaginationItem>
//                         <PaginationPrevious
//                             className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
//                             onClick={() => handlePageChange(currentPage - 1)}
//                         />
//                     </PaginationItem>

//                     {pages.map((page, index) => (
//                         <PaginationItem key={`${page}-${index}`}>
//                             {page === 'ellipsis' ? (
//                                 <PaginationEllipsis />
//                             ) : (
//                                 <PaginationLink className="cursor-pointer" isActive={page === currentPage} onClick={() => handlePageChange(page)}>
//                                     {page}
//                                 </PaginationLink>
//                             )}
//                         </PaginationItem>
//                     ))}

//                     <PaginationItem>
//                         <PaginationNext
//                             className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
//                             onClick={() => handlePageChange(currentPage + 1)}
//                         />
//                     </PaginationItem>
//                 </PaginationContent>
//             </Pagination>
//         </div>
//     );
// }

// export function PaginationComponent(props: PaginationProps) {
//     return (
//         <Suspense
//             fallback={
//                 <div className="flex justify-end items-center px-4 py-5 w-full">
//                     <div className="bg-gray-100 rounded-md w-full h-10 animate-pulse" />
//                 </div>
//             }>
//             <PaginationComp {...props} />
//         </Suspense>
//     );
// }

'use client';
import { Suspense, useEffect, useMemo, useRef } from 'react';
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

function PaginationComp({ totalPages, position = 'end', onPageChange }: PaginationProps) {
    const [currentPage, setCurrentPage] = useQueryState('page', {
        defaultValue: '1',
        parse: (value) => value,
        serialize: (value) => value,
    });

    // Convert to number only when needed
    const currentPageNum = parseInt(currentPage, 10);

    // Use ref to track if this is the initial mount
    const isInitialMount = useRef(true);

    useEffect(() => {
        // Skip the effect on initial mount
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        // Only notify parent if it's a valid page number
        if (!isNaN(currentPageNum) && currentPageNum >= 1 && currentPageNum <= totalPages) {
            onPageChange(currentPageNum);
        }
    }, [currentPageNum, totalPages, onPageChange]);

    // Generate page numbers array with ellipsis
    const pages = useMemo(() => {
        const items: (number | 'ellipsis')[] = [1];

        if (currentPageNum > 3) items.push('ellipsis');

        for (let i = Math.max(2, currentPageNum - 1); i <= Math.min(totalPages - 1, currentPageNum + 1); i++) {
            items.push(i);
        }

        if (currentPageNum < totalPages - 2) items.push('ellipsis');
        if (totalPages > 1) items.push(totalPages);

        return items;
    }, [currentPageNum, totalPages]);

    const handlePageChange = (page: number) => {
        if (page === currentPageNum || page < 1 || page > totalPages) return;
        setCurrentPage(page.toString());
    };

    return (
        <div className="flex justify-end items-center px-4 py-5 w-full select-none">
            <Pagination position={position}>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            className={currentPageNum === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            onClick={() => handlePageChange(currentPageNum - 1)}
                        />
                    </PaginationItem>

                    {pages.map((page, index) => (
                        <PaginationItem key={`${page}-${index}`}>
                            {page === 'ellipsis' ? (
                                <PaginationEllipsis />
                            ) : (
                                <PaginationLink className="cursor-pointer" isActive={page === currentPageNum} onClick={() => handlePageChange(page)}>
                                    {page}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}

                    <PaginationItem>
                        <PaginationNext
                            className={currentPageNum === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            onClick={() => handlePageChange(currentPageNum + 1)}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}

export function PaginationComponent(props: PaginationProps) {
    return (
        <Suspense
            fallback={
                <div className="flex justify-end items-center px-4 py-5 w-full">
                    <div className="bg-gray-100 rounded-md w-full h-10 animate-pulse" />
                </div>
            }>
            <PaginationComp {...props} />
        </Suspense>
    );
}
