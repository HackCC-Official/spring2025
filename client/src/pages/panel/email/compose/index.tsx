"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CircleUser, ChevronRight, MinusCircle } from "lucide-react";
import Link from "next/link";
import { useOutreachTeam } from "@/hooks/use-outreach-team";
import type { OutreachTeamDto } from "@/features/outreach/types/outreach-team";
import { sendBatchEmails, sendEmail } from "@/features/outreach/api/outreach";
import type {
    EmailRecipient,
    SendBatchEmailsDto,
} from "@/features/outreach/types/email.dto";
import type { Mail } from "@/types/mail";
import AccountSwitcher from "../components/account-switcher";
import PanelLayout from "../../layout";
import { useInterestedUsers } from "@/hooks/use-interested.user";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { EmptyEmail } from "@/emails/empty-template";
import { render } from "@react-email/render";
import { useContacts } from "@/hooks/use-contacts";
import type { EmailTemplate } from "@/lib/email/types";
import {
    renderEmailTemplate,
    type EmailTemplateType,
} from "@/lib/email/email-renderer";
import { useSearchParams } from "next/navigation";

const STORAGE_KEY = "selectedOutreachAccount";

type RecipientType = "employers" | "registered" | "interested";

// Update EmailTemplate interface to include type
interface ExtendedEmailTemplate extends EmailTemplate {
    type: "employers" | "hackers";
}

// Update recipient interface to include organization and been_contacted
interface Recipient {
    id: string;
    to: EmailRecipient[];
    labels: string[];
    organization?: string;
    been_contacted?: boolean;
}

// Update EMAIL_TEMPLATES type annotation
const EMAIL_TEMPLATES: ExtendedEmailTemplate[] = [
    {
        id: "1",
        name: "Sponsorship Confirmation",
        subject: "Sponsorship Opportunity with HackCC",
        content: "Dear [Name],\n\nI hope this email finds you well...",
        type: "employers",
    },
    {
        id: "2",
        name: "Follow-Up Email",
        subject: "Re: Meet the best students in X town this May",
        content: "Hi [Name],\n\nI hope this email finds you well...",
        type: "employers",
    },
    {
        id: "3",
        name: "FollowUpEmail",
        subject: "Follow Up from HackCC",
        content: "Hi [Name],\n\nThank you for your interest in HackCC...",
        type: "hackers",
    },
];

interface ComposePageProps {
    mails?: Mail[];
}

export default function ComposePage({ mails = [] }: ComposePageProps) {
    const searchParams = useSearchParams();

    // State for recipient selection
    const [selectedRecipients, setSelectedRecipients] = React.useState<
        Set<string>
    >(new Set());
    const [searchQuery, setSearchQuery] = React.useState("");
    const [recipientType, setRecipientType] =
        React.useState<RecipientType>("employers");

    // State for email content
    const [selectedTemplate, setSelectedTemplate] =
        React.useState<ExtendedEmailTemplate | null>(null);
    const [emailSubject, setEmailSubject] = React.useState("");
    const [emailContent, setEmailContent] = React.useState("");
    const [previewHtml, setPreviewHtml] = React.useState("");
    const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

    // State for sender account
    const [senderEmail, setSenderEmail] = React.useState<string>(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem(STORAGE_KEY) || "";
        }
        return "";
    });

    // Fetch necessary data
    const { data: outreachTeamResponse } = useOutreachTeam();
    const { data: interestedUsers, isLoading: isInterestedLoading } =
        useInterestedUsers();
    const { data: contactsResponse } = useContacts();
    const contacts = React.useMemo(
        () => contactsResponse?.data || [],
        [contactsResponse?.data]
    );

    // Transform outreach team data into account format
    const emailAccounts = React.useMemo(() => {
        const outreachTeamArray = outreachTeamResponse?.data?.data || [];
        return outreachTeamArray.map((member: OutreachTeamDto) => ({
            label: member.name,
            email: member.email,
            icon: <CircleUser className="h-4 w-4" />,
        }));
    }, [outreachTeamResponse]);

    // Update recipientLists type annotation
    const recipientLists = React.useMemo(() => {
        const employerContacts = contacts.map((contact) => ({
            id: contact.id.toString(),
            to: [
                {
                    name: `${contact.first_name} ${contact.last_name}`,
                    email: contact.email,
                },
            ],
            organization: contact.organization,
            labels: ["Employer"],
            been_contacted: contact.been_contacted,
        }));

        const registeredHackers = mails.map((hacker) => ({
            id: hacker.id,
            to: hacker.to.map((recipient) => ({
                name: recipient.name || recipient.email.split("@")[0],
                email: recipient.email,
            })),
            labels: [...(hacker.labels || []), "Registered"],
        }));

        const interestedHackers = (interestedUsers || []).map((user) => ({
            id: user.email,
            to: [
                {
                    name: user.email.split("@")[0],
                    email: user.email,
                },
            ],
            labels: ["Interested"],
        }));

        return {
            employers: employerContacts,
            registered: registeredHackers,
            interested: interestedHackers,
        } as Record<RecipientType, Recipient[]>;
    }, [contacts, mails, interestedUsers]);

    // Filter recipients based on type and search query
    const filteredRecipients = React.useMemo(() => {
        const currentList = recipientLists[recipientType];
        return currentList.filter(
            (recipient) =>
                recipient.to?.[0]?.name
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                recipient.to?.[0]?.email
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                recipient.organization
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase())
        );
    }, [recipientLists, recipientType, searchQuery]);

    // Calculate selection states
    const areAllFilteredSelected = React.useMemo(() => {
        return (
            filteredRecipients.length > 0 &&
            filteredRecipients.every((recipient) =>
                selectedRecipients.has(recipient.id)
            )
        );
    }, [filteredRecipients, selectedRecipients]);

    const areSomeFilteredSelected = React.useMemo(() => {
        return (
            filteredRecipients.some((recipient) =>
                selectedRecipients.has(recipient.id)
            ) && !areAllFilteredSelected
        );
    }, [filteredRecipients, selectedRecipients, areAllFilteredSelected]);

    // Handlers
    const handleSelectAll = React.useCallback(
        (checked: boolean) => {
            const newSelected = new Set(selectedRecipients);
            filteredRecipients.forEach((recipient) => {
                if (checked) {
                    newSelected.add(recipient.id);
                } else {
                    newSelected.delete(recipient.id);
                }
            });
            setSelectedRecipients(newSelected);
        },
        [filteredRecipients, selectedRecipients]
    );

    const handleRecipientToggle = (recipientId: string) => {
        const newSelected = new Set(selectedRecipients);
        if (newSelected.has(recipientId)) {
            newSelected.delete(recipientId);
        } else {
            newSelected.add(recipientId);
        }
        setSelectedRecipients(newSelected);
    };

    const handleAccountChange = (email: string) => {
        setSenderEmail(email);
        localStorage.setItem(STORAGE_KEY, email);
    };

    const handlePreview = async () => {
        if (selectedRecipients.size === 0) {
            toast.error("Please select at least one recipient");
            return;
        }

        const selectedTeamMember = outreachTeamResponse?.data?.data.find(
            (member: OutreachTeamDto) => member.email === senderEmail
        );

        if (!selectedTeamMember) {
            toast.error("Please select a sender account");
            return;
        }

        try {
            let previewContent;
            if (recipientType === "employers" && selectedTemplate) {
                // Use email template renderer for employer emails
                const renderedEmails = await renderEmailTemplate({
                    templateType: selectedTemplate.name as EmailTemplateType,
                    recipients: contacts.filter((contact) =>
                        selectedRecipients.has(contact.id.toString())
                    ),
                    templateData: {
                        sender: selectedTeamMember,
                    },
                    contactInfo: {
                        email: senderEmail,
                        phone: "+1234567890",
                    },
                });
                previewContent = renderedEmails[0];
            } else {
                // Use EmptyEmail template for hacker emails
                previewContent = await render(
                    <EmptyEmail
                        recipientName="Preview User"
                        emailContent={emailContent}
                        sender={selectedTeamMember}
                        socialLinks={{
                            HackCC: "https://hackcc.net",
                            LinkedIn: "https://linkedin.com/company/hackcc",
                        }}
                    />
                );
            }

            setPreviewHtml(previewContent);
            setIsPreviewOpen(true);
        } catch (error) {
            console.error("Error generating preview:", error);
            toast.error("Failed to generate preview");
        }
    };

    const handleSendEmails = async () => {
        if (selectedRecipients.size === 0) {
            toast.error("Please select at least one recipient");
            return;
        }

        const selectedTeamMember = outreachTeamResponse?.data?.data.find(
            (member: OutreachTeamDto) => member.email === senderEmail
        );

        if (!selectedTeamMember) {
            toast.error("Could not find selected team member information");
            return;
        }

        try {
            const allRecipients = recipientLists[recipientType];
            const selectedRecipientsData = allRecipients.filter((recipient) =>
                selectedRecipients.has(recipient.id)
            );

            let emailData: SendBatchEmailsDto;

            if (recipientType === "employers") {
                // Handle employer emails
                const renderedEmails = await renderEmailTemplate({
                    templateType: selectedTemplate?.name as EmailTemplateType,
                    recipients: contacts.filter((contact) =>
                        selectedRecipients.has(contact.id.toString())
                    ),
                    templateData: {
                        sender: selectedTeamMember,
                    },
                    contactInfo: {
                        email: senderEmail,
                        phone: "+1234567890",
                    },
                });

                emailData = {
                    emails: selectedRecipientsData.map((recipient, index) => ({
                        from: senderEmail,
                        to: recipient.to.map((to) => ({
                            email: to.email,
                            name: to.name || to.email.split("@")[0],
                        })),
                        subject: emailSubject,
                        html: renderedEmails[index],
                    })),
                };
            } else {
                // Handle hacker emails
                const renderedEmails = await Promise.all(
                    selectedRecipientsData.map(async (recipient) => {
                        const recipientName = recipient.to[0]?.name || "Hacker";
                        return render(
                            <EmptyEmail
                                recipientName={recipientName}
                                emailContent={emailContent}
                                sender={selectedTeamMember}
                                socialLinks={{
                                    HackCC: "https://hackcc.dev",
                                    LinkedIn:
                                        "https://linkedin.com/company/hackcc",
                                }}
                            />
                        );
                    })
                );

                emailData = {
                    emails: selectedRecipientsData.map((recipient, index) => ({
                        from: senderEmail,
                        to: recipient.to.map((to) => ({
                            email: to.email,
                            name: to.name || to.email.split("@")[0],
                        })),
                        subject: emailSubject,
                        html: renderedEmails[index],
                    })),
                };
            }

            // Send emails
            if (selectedRecipientsData.length === 1) {
                await sendEmail(emailData.emails[0]);
            } else {
                await sendBatchEmails(emailData);
            }

            toast.success("Emails sent successfully!");

            // Reset form
            setSelectedRecipients(new Set());
            setSelectedTemplate(null);
            setEmailSubject("");
            setEmailContent("");
            setPreviewHtml("");
        } catch (error) {
            console.error("Error sending emails:", error);
            toast.error("Failed to send emails. Please try again.");
        }
    };

    const handleTemplateChange = (templateId: string) => {
        const template = EMAIL_TEMPLATES.find((t) => t.id === templateId);
        if (template) {
            setSelectedTemplate(template);
            setEmailSubject(template.subject);
            setEmailContent(template.content);
        }
    };

    // Handle auto-selection from URL parameters
    React.useEffect(() => {
        if (!searchParams) return;

        // Handle contact selection
        const contactId = searchParams.get("contactId");
        if (contactId) {
            setSelectedRecipients(new Set([contactId]));
            setRecipientType("employers");
            return;
        }

        // Handle hacker selection
        const recipientType = searchParams.get("recipientType");
        const toEmail = searchParams.get("to");

        if (
            recipientType &&
            (recipientType === "registered" || recipientType === "interested")
        ) {
            setRecipientType(recipientType);

            if (toEmail) {
                if (recipientType === "registered") {
                    const registeredHacker = mails.find(
                        (mail) => mail.to?.[0]?.email === toEmail
                    );
                    if (registeredHacker) {
                        setSelectedRecipients(new Set([registeredHacker.id]));
                    }
                } else if (recipientType === "interested") {
                    const interestedUser = interestedUsers?.find(
                        (user) => user.email === toEmail
                    );
                    if (interestedUser) {
                        setSelectedRecipients(new Set([interestedUser.email]));
                    }
                }
            }
        }
    }, [searchParams, mails, interestedUsers]);

    if (isInterestedLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                Loading...
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 max-w-7xl">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 mb-6 text-sm">
                <Link
                    href="/panel/email"
                    className="text-muted-foreground hover:text-primary transition-colors"
                >
                    Email
                </Link>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Compose</span>
            </div>

            <div className="flex items-center justify-between mb-8">
                <h1 className="font-bold text-3xl">Compose Email</h1>
                <div className="flex items-center gap-4">
                    <AccountSwitcher
                        isCollapsed={false}
                        accounts={emailAccounts}
                        onAccountChange={handleAccountChange}
                        defaultEmail={senderEmail}
                    />
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handlePreview}
                            disabled={selectedRecipients.size === 0}
                        >
                            Preview Email
                        </Button>
                        <Button
                            onClick={handleSendEmails}
                            disabled={selectedRecipients.size === 0}
                        >
                            Send Emails ({selectedRecipients.size})
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column - Recipients */}
                <div className="lg:col-span-5">
                    <Card>
                        <CardHeader className="border-b">
                            <div className="flex items-center justify-between">
                                <CardTitle>
                                    Recipients ({filteredRecipients.length})
                                </CardTitle>
                                <Select
                                    value={recipientType}
                                    onValueChange={(value: RecipientType) => {
                                        setRecipientType(value);
                                        setSelectedRecipients(new Set());
                                        setSelectedTemplate(null);
                                        setEmailSubject("");
                                        setEmailContent("");
                                    }}
                                >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Select recipient type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="employers">
                                            Employers (
                                            {recipientLists.employers.length})
                                        </SelectItem>
                                        <SelectItem value="registered">
                                            Registered Hackers (
                                            {recipientLists.registered.length})
                                        </SelectItem>
                                        <SelectItem value="interested">
                                            Interested Users (
                                            {recipientLists.interested.length})
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <Label
                                        htmlFor="recipient-filter"
                                        className="text-sm font-semibold"
                                    >
                                        Search Recipients
                                    </Label>
                                    <div className="relative mt-1 mb-4">
                                        <Input
                                            id="recipient-filter"
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                            placeholder={
                                                recipientType === "employers"
                                                    ? "Search by name, email, or organization..."
                                                    : "Search by name or email..."
                                            }
                                            className="pl-3 pr-10 py-2 w-full border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        />
                                    </div>
                                </div>

                                <div className="border rounded-lg overflow-hidden shadow-sm bg-card">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50">
                                                <TableHead className="w-12 py-3">
                                                    <div className="flex items-center justify-center">
                                                        <Checkbox
                                                            checked={
                                                                areAllFilteredSelected
                                                            }
                                                            onCheckedChange={
                                                                handleSelectAll
                                                            }
                                                            aria-label="Select all recipients"
                                                        />
                                                        {areSomeFilteredSelected && (
                                                            <MinusCircle className="h-4 w-4 text-muted-foreground absolute" />
                                                        )}
                                                    </div>
                                                </TableHead>
                                                <TableHead className="py-3 font-semibold">
                                                    Name
                                                </TableHead>
                                                <TableHead className="py-3 font-semibold">
                                                    Email
                                                </TableHead>
                                                {recipientType ===
                                                    "employers" && (
                                                    <TableHead className="py-3 font-semibold">
                                                        Organization
                                                    </TableHead>
                                                )}
                                                <TableHead className="w-20 py-3">
                                                    Status
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredRecipients.map(
                                                (recipient) => (
                                                    <TableRow
                                                        key={recipient.id}
                                                        className={
                                                            recipientType ===
                                                                "employers" &&
                                                            recipient.been_contacted
                                                                ? "bg-purple-100 dark:bg-purple-900/20"
                                                                : "hover:bg-muted/50"
                                                        }
                                                    >
                                                        <TableCell>
                                                            <Checkbox
                                                                checked={selectedRecipients.has(
                                                                    recipient.id
                                                                )}
                                                                onCheckedChange={() =>
                                                                    handleRecipientToggle(
                                                                        recipient.id
                                                                    )
                                                                }
                                                            />
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {
                                                                recipient
                                                                    .to?.[0]
                                                                    ?.name
                                                            }
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground">
                                                            {
                                                                recipient
                                                                    .to?.[0]
                                                                    ?.email
                                                            }
                                                        </TableCell>
                                                        {recipientType ===
                                                            "employers" && (
                                                            <TableCell>
                                                                {
                                                                    recipient.organization
                                                                }
                                                            </TableCell>
                                                        )}
                                                        <TableCell>
                                                            {recipient.labels.map(
                                                                (label) => (
                                                                    <Badge
                                                                        key={
                                                                            label
                                                                        }
                                                                        variant="secondary"
                                                                        className="mr-1"
                                                                    >
                                                                        {label}
                                                                    </Badge>
                                                                )
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Email Content */}
                <div className="lg:col-span-7">
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle>Email Content</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                {recipientType === "employers" && (
                                    <div>
                                        <Label htmlFor="template">
                                            Email Template
                                        </Label>
                                        <Select
                                            onValueChange={handleTemplateChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a template" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {EMAIL_TEMPLATES.filter(
                                                    (template) =>
                                                        template.type ===
                                                        "employers"
                                                ).map((template) => (
                                                    <SelectItem
                                                        key={template.id}
                                                        value={template.id}
                                                    >
                                                        {template.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input
                                        id="subject"
                                        value={emailSubject}
                                        onChange={(e) =>
                                            setEmailSubject(e.target.value)
                                        }
                                        placeholder="Enter email subject..."
                                        className="mt-1"
                                    />
                                </div>

                                {recipientType !== "employers" && (
                                    <div>
                                        <Label htmlFor="content">Content</Label>
                                        <Textarea
                                            id="content"
                                            value={emailContent}
                                            onChange={(e) =>
                                                setEmailContent(e.target.value)
                                            }
                                            placeholder="Enter email content..."
                                            className="mt-1 min-h-[300px]"
                                        />
                                    </div>
                                )}

                                <div className="text-sm text-muted-foreground">
                                    Email will be sent using your outreach team
                                    member information.
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preview Dialog */}
                    <Dialog
                        open={isPreviewOpen}
                        onOpenChange={setIsPreviewOpen}
                    >
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Email Preview</DialogTitle>
                            </DialogHeader>
                            <div
                                className="prose dark:prose-invert max-w-none mt-4"
                                dangerouslySetInnerHTML={{
                                    __html: previewHtml,
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}

ComposePage.getLayout = (page: React.ReactElement) => (
    <PanelLayout>{page}</PanelLayout>
);
