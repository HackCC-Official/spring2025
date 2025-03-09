import { render } from "@react-email/render";
import type { ContactDto } from "@/features/outreach/types/contact.dto";
import { SponsorshipEmail } from "@/emails/employers/sponsorship-template";
import { FollowUpEmail } from "@/emails/employers/followup-template";
import * as React from "react";
import type { OutreachTeamDto } from "@/features/outreach/types/outreach-team";
import { Html, Head, Body, Container, Text } from "@react-email/components";

export type EmailTemplateType =
    | "Sponsorship Confirmation"
    | "Follow-Up Email"
    | "Empty";

interface TemplateData {
    sender: OutreachTeamDto;
    emailContent?: string;
}

interface RenderEmailTemplateProps {
    templateType: EmailTemplateType;
    recipients: ContactDto[];
    templateData: TemplateData;
    contactInfo: {
        email: string;
        phone: string;
    };
}

export async function renderEmailTemplate({
    templateType,
    recipients,
    templateData,
}: RenderEmailTemplateProps): Promise<string[]> {
    const renderedEmails: string[] = [];

    for (const recipient of recipients) {
        let emailComponent;

        switch (templateType) {
            case "Sponsorship Confirmation":
                emailComponent = (
                    <SponsorshipEmail
                        companyName={recipient.organization}
                        recipientName={`${recipient.first_name} ${recipient.last_name}`}
                        venue="California Community College"
                        sender={templateData.sender}
                        positionAtHackCC={`${templateData.sender.year} ${templateData.sender.major} Student at ${templateData.sender.school}`}
                        socialLinks={{
                            linkedin: recipient.linkedin_url || "",
                            twitter: "",
                            github: "",
                        }}
                    />
                );
                break;
            case "Follow-Up Email":
                emailComponent = (
                    <FollowUpEmail
                        companyName={recipient.organization}
                        recipientName={`${recipient.first_name} ${recipient.last_name}`}
                        venue="California Community College"
                        sender={templateData.sender}
                        positionAtHackCC={`${templateData.sender.year} ${templateData.sender.major} Student at ${templateData.sender.school}`}
                        location={recipient.city || "your area"}
                        socialLinks={{}}
                    />
                );
                break;
            case "Empty":
                emailComponent = (
                    <Html>
                        <Head />
                        <Body>
                            <Container>
                                <Text>{templateData.emailContent}</Text>
                            </Container>
                        </Body>
                    </Html>
                );
                break;
            default:
                throw new Error(`Unsupported template type: ${templateType}`);
        }

        const html = await render(emailComponent);
        renderedEmails.push(html);
    }

    return renderedEmails;
}
