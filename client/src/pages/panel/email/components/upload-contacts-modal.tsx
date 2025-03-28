import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { uploadContacts } from "@/features/outreach/api/outreach";
import { Download } from "lucide-react";

interface UploadContactsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function UploadContactsModal({
    open,
    onOpenChange,
}: UploadContactsModalProps) {
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [isUploading, setIsUploading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.name.toLowerCase().endsWith(".csv")) {
                setError("Please upload a CSV file");
                return;
            }
            setSelectedFile(file);
            setError(null);
        }
    };

    const processCSVFile = async () => {
        if (!selectedFile) {
            setError("Please select a file first");
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            await uploadContacts(selectedFile);

            await queryClient.invalidateQueries({ queryKey: ["contacts"] });

            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            onOpenChange(false);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to upload contacts"
            );
        } finally {
            setIsUploading(false);
        }
    };

    const downloadTemplate = () => {
        // Create template CSV content
        const headers = [
            "Contact Name",
            "Email address",
            "Company",
            "Position",
            "Country",
            "Phone Number",
            "LinkedIn",
            "Website",
            "Status",
            "Confidence Score",
            "Liaison",
            "Meeting Method",
        ];

        // Example data row
        const exampleData = [
            "John Doe",
            "john.doe@example.com",
            "Dash Technology",
            "Software Engineer",
            "United States",
            "555-123-4567",
            "https://linkedin.com/in/johndoe",
            "https://example.com",
            "Cold",
            "75",
            "Jane Smith",
            "Virtual",
        ];

        const csvContent = [headers.join(","), exampleData.join(",")].join(
            "\n"
        );

        // Create and download the file
        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "hackcc-contacts-template.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Upload Contacts</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file containing contact information. Make
                        sure your CSV file has the required columns.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h4 className="font-medium">CSV Template:</h4>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={downloadTemplate}
                            className="flex items-center gap-1"
                        >
                            <Download className="h-4 w-4" />
                            Download Template
                        </Button>
                    </div>

                    <div className="bg-muted/50 p-4 border rounded-lg">
                        <h4 className="mb-2 font-medium">
                            Required CSV Columns:
                        </h4>
                        <div className="gap-2 grid grid-cols-2 text-sm">
                            <div>
                                <span className="font-medium text-primary">
                                    Required:
                                </span>
                                <ul className="mt-1 text-muted-foreground list-disc list-inside">
                                    <li>contact_name</li>
                                    <li>email_address</li>
                                </ul>
                            </div>
                            <div>
                                <span className="font-medium text-primary">
                                    Optional:
                                </span>
                                <ul className="mt-1 text-muted-foreground list-disc list-inside">
                                    <li>company</li>
                                    <li>position</li>
                                    <li>country</li>
                                    <li>phone_number</li>
                                    <li>linkedin</li>
                                    <li>website</li>
                                    <li>status</li>
                                    <li>confidence_score</li>
                                    <li>liaison</li>
                                    <li>meeting_method</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="file">Select CSV File</Label>
                        <Input
                            id="file"
                            type="file"
                            accept=".csv"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={processCSVFile}
                            disabled={!selectedFile || isUploading}
                        >
                            {isUploading ? "Uploading..." : "Upload"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
