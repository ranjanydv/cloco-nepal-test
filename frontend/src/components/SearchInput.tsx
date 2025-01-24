import React, { useEffect } from 'react';
import { useQueryState } from 'nuqs';
import { Input } from './ui/input';

interface SearchInputProps {
    placeholder?: string;
    onChange: (value: string) => void;
}

const SearchInput = ({ placeholder, onChange }: SearchInputProps) => {
    const [searchText, setSearchText] = useQueryState('search', {
        defaultValue: '',
        parse: (value) => value.trim(),
    });

    useEffect(() => {
        onChange(searchText);
    }, [searchText, onChange]);

    return (
        <div>
            <Input placeholder={placeholder ?? 'Search'} value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        </div>
    );
};

export default SearchInput;
