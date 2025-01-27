'use client';
import React, { Suspense, useEffect, useRef } from 'react';
import { useQueryState } from 'nuqs';
import { Input } from './ui/input';

interface SearchInputProps {
    placeholder?: string;
    onChange: (value: string) => void;
}

const SearchInputContainer = ({ placeholder, onChange }: SearchInputProps) => {
    const [searchText, setSearchText] = useQueryState('search', {
        defaultValue: '',
        parse: (value) => value.trim(),
    });

    const [, setPage] = useQueryState('page');
    const isInitialMount = useRef(true);
    const previousSearch = useRef(searchText);

    useEffect(() => {
        // Skip the effect on initial mount
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        // Only reset page and trigger onChange if the search value has actually changed
        if (previousSearch.current !== searchText) {
            // Reset page to 1 only if we're actually changing the search
            if (searchText !== '') {
                setPage(null);
            }
            onChange(searchText);
            previousSearch.current = searchText;
        }
    }, [searchText, onChange, setPage]);

    return (
        <div>
            <Input placeholder={placeholder ?? 'Search'} value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        </div>
    );
};

export default function SearchInput(props: SearchInputProps) {
    return (
        <Suspense
            fallback={
                <div className="flex justify-end items-center px-4 py-5 w-full">
                    <div className="bg-gray-100 rounded-md w-full h-10 animate-pulse" />
                </div>
            }>
            <SearchInputContainer {...props} />
        </Suspense>
    );
}
