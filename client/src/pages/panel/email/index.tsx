"use client";

import * as React from "react";
import PanelLayout from "../layout";
import type { Mail } from "@/types/mail";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Building2, Users, CircleUser } from "lucide-react";
import HackersMail from "./components/hackers-mail";
import AccountSwitcher from "./components/account-switcher";
import { Separator } from "@/components/ui/separator";
import MailComponent from "./components/mail";
import { useContacts } from "@/hooks/use-contacts";
import { useOutreachTeam } from "@/hooks/use-outreach-team";
import type { OutreachTeamDto } from "@/features/outreach/types/outreach-team";
import { LogoIcon } from "@/components/logo-icon";

const mails: Mail[] = [];

const HACKER_SAMPLE_DATA: Mail[] = [
    {
        id: "h1",
        from: "outreach@hackcc.dev",
        to: [
            {
                email: "alice@university.edu",
                name: "Alice Johnson",
            },
        ],
        subject: "Registration Confirmation",
        html: "Thank you for registering for HackCC! We're excited to have you join us...",
        date: new Date().toISOString(),
        read: true,
        labels: ["registered"],
    },
    {
        id: "h2",
        from: "outreach@hackcc.dev",
        to: [
            {
                email: "bob@college.edu",
                name: "Bob Wilson",
            },
        ],
        subject: "Dietary Requirements",
        html: "I wanted to inform you about my dietary restrictions for the event...",
        date: new Date(Date.now() - 172800000).toISOString(),
        read: false,
        labels: ["dietary"],
    },
];

export default function EmailPage() {
    const [defaultLayout] = React.useState(() => {
        if (typeof window !== "undefined") {
            const layout = localStorage.getItem(
                "react-resizable-panels:layout:mail"
            );
            return layout ? JSON.parse(layout) : [20, 32, 48];
        }
        return [20, 32, 48];
    });

    const { data: contactsResponse, isLoading: isLoadingContacts } =
        useContacts();
    const { data: outreachTeamResponse, isLoading: isLoadingOutreachTeam } =
        useOutreachTeam();
    const contactsArray = contactsResponse?.data || [];

    console.log("Outreach Team Response:", outreachTeamResponse);

    // Transform outreach team data into account format
    const allAccounts = React.useMemo(() => {
        const outreachTeamArray = outreachTeamResponse?.data?.data || [];
        return outreachTeamArray.map((member: OutreachTeamDto) => ({
            label: member.name,
            email: member.email,
            icon: <CircleUser />,
        }));
    }, [outreachTeamResponse]);

    // Handle selected account persistence
    const [selectedAccount, setSelectedAccount] = React.useState<string>(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("selectedOutreachAccount") || "";
        }
        return "";
    });

    const handleAccountChange = React.useCallback((email: string) => {
        setSelectedAccount(email);
        localStorage.setItem("selectedOutreachAccount", email);
    }, []);

    if (isLoadingContacts || isLoadingOutreachTeam) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4 bg-background">
                <div className="animate-spin">
                    <LogoIcon className="w-16 h-16" />
                </div>
                <p className="text-lg text-muted-foreground">
                    Crunching the latest data
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            <Tabs
                defaultValue="company"
                className="flex flex-col h-full min-h-0"
            >
                <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex items-center px-4 h-14 gap-4 max-w-[1400px] mx-auto w-full">
                        <AccountSwitcher
                            isCollapsed={false}
                            accounts={allAccounts}
                            onAccountChange={handleAccountChange}
                            defaultEmail={selectedAccount}
                        />
                        <Separator orientation="vertical" className="h-6" />
                        <nav className="flex-1">
                            <TabsList className="inline-flex h-9 items-center justify-start rounded-lg bg-muted p-1">
                                <TabsTrigger
                                    value="company"
                                    className="gap-2 px-3"
                                >
                                    <Building2 className="h-4 w-4" />
                                    <span>Company Mail</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="hackers"
                                    className="gap-2 px-3"
                                >
                                    <Users className="h-4 w-4" />
                                    <span>Hackers List</span>
                                </TabsTrigger>
                            </TabsList>
                        </nav>
                    </div>
                </header>

                <main className="flex-1 min-h-0 overflow-hidden">
                    <TabsContent
                        value="company"
                        className="h-full m-0 outline-none"
                    >
                        <MailComponent
                            accounts={allAccounts}
                            mails={mails}
                            contacts={contactsArray}
                            defaultLayout={defaultLayout}
                            defaultCollapsed={false}
                            navCollapsedSize={4}
                        />
                    </TabsContent>
                    <TabsContent
                        value="hackers"
                        className="h-full m-0 outline-none"
                    >
                        <HackersMail mails={HACKER_SAMPLE_DATA} />
                    </TabsContent>
                </main>
            </Tabs>
        </div>
    );
}

EmailPage.getLayout = (page: React.ReactElement) => (
    <PanelLayout>{page}</PanelLayout>
);
