'use client';

import { Button } from '@/components/ui/button';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { FileCheckIcon, XIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface ImportArtistDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function ImportArtistDialog({ open, onOpenChange }: ImportArtistDialogProps) {
    const queryClient = useQueryClient();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePath, setFilePath] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    const resetState = useCallback(() => {
        setSelectedFile(null);
        setFilePath(null);
        setIsUploading(false);
        setIsImporting(false);
    }, []);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            toast.error('Please select a CSV file');
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            toast.error('File size should be less than 5MB');
            return;
        }

        setSelectedFile(file);
    }, []);

    const handleFileUpload = useCallback(async () => {
        if (!selectedFile) {
            toast.error('Please select a file');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setFilePath(response.data.filePath);
            toast.success('File uploaded successfully');
        } catch (error) {
            console.error('Error uploading file:', error);
            // @ts-expect-error type error
            toast.error(error.response?.data?.message || 'Failed to upload file');
            setSelectedFile(null);
        } finally {
            setIsUploading(false);
        }
    }, [selectedFile]);

    const handleImportData = useCallback(async () => {
        if (!filePath) {
            toast.error('No uploaded file found');
            return;
        }

        setIsImporting(true);

        try {
            await api.post('/artist/import', { fileName: filePath });
            toast.success('Artists imported successfully');
            queryClient.invalidateQueries({ queryKey: ['artists'] });
            onOpenChange(false);
            resetState();
        } catch (error) {
            console.error('Error importing file:', error);
            // @ts-expect-error type error
            toast.error(error.response?.data?.message || 'Failed to import artists');
        } finally {
            setIsImporting(false);
        }
    }, [filePath, queryClient, resetState, onOpenChange]);

    const handleClose = useCallback(() => {
        onOpenChange(false);
        resetState();
    }, [onOpenChange, resetState]);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Import Artist Data</DialogTitle>
                    {/* <button
                        onClick={handleClose}
                        className="top-4 right-4 absolute data-[state=open]:bg-accent opacity-70 hover:opacity-100 rounded-sm focus:ring-2 focus:ring-ring ring-offset-background transition-opacity focus:outline-none focus:ring-offset-2 data-[state=open]:text-muted-foreground disabled:pointer-events-none">
                        <XIcon className="w-4 h-4" />
                    </button> */}
                </DialogHeader>

                <div className="space-y-4">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="border-gray-300 px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary w-full focus:outline-none cursor-pointer"
                    />

                    {selectedFile && (
                        <Button variant="secondary" onClick={handleFileUpload} disabled={isUploading} className="w-full">
                            {isUploading ? 'Uploading...' : 'Upload File'}
                        </Button>
                    )}

                    {filePath && (
                        <Button variant="default" onClick={handleImportData} disabled={isImporting} className="w-full">
                            {isImporting ? (
                                'Importing Data...'
                            ) : (
                                <>
                                    <FileCheckIcon className="mr-2 w-4 h-4" />
                                    Import Data from File
                                </>
                            )}
                        </Button>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default ImportArtistDialog;
