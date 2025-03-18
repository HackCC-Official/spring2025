import { render } from "@react-email/render";
import type { ContactDto } from "@/features/outreach/types/contact.dto";
import { SponsorshipEmail } from "@/emails/employers/sponsorship-template";
import { FollowUpEmail } from "@/emails/employers/followup-template";
import { PostCallEmail } from "@/emails/employers/postcall-template";
import { ConfirmationEmail } from "@/emails/employers/confirmation-template";
import { EmptyEmail } from "@/emails/empty-template";
import * as React from "react";
import type { OutreachTeamDto } from "@/features/outreach/types/outreach-team";

export type EmailTemplateType =
    | "Sponsorship Confirmation"
    | "Follow-Up Email"
    | "Post-Call Follow-Up"
    | "Sponsorship Agreement"
    | "Empty";

interface TemplateData {
    subject: string;
    sender: OutreachTeamDto;
    emailContent?: string;
    followupDate?: string;
    followupTime?: string;
    requestedMaterials?: string;
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
                        customEmailBody={templateData.emailContent}
                        subject={templateData.subject}
                    />
                );
                break;
            case "Follow-Up Email":
                emailComponent = (
                    <FollowUpEmail
                        companyName={recipient.organization}
                        subject={templateData.subject}
                        recipientName={`${recipient.first_name} ${recipient.last_name}`}
                        venue="California Community College"
                        sender={templateData.sender}
                        positionAtHackCC={`${templateData.sender.year} ${templateData.sender.major} Student at ${templateData.sender.school}`}
                        location={recipient.city || "your area"}
                        socialLinks={{}}
                        customEmailBody={templateData.emailContent}
                    />
                );
                break;
            case "Post-Call Follow-Up":
                emailComponent = (
                    <PostCallEmail
                        companyName={recipient.organization}
                        subject={templateData.subject}
                        recipientName={`${recipient.first_name} ${recipient.last_name}`}
                        sender={templateData.sender}
                        positionAtHackCC={`${templateData.sender.year} ${templateData.sender.major} Student at ${templateData.sender.school}`}
                        organizationLogo=""
                        followupDate={templateData.followupDate}
                        followupTime={templateData.followupTime}
                        requestedMaterials={templateData.requestedMaterials}
                        socialLinks={{
                            linkedin: recipient.linkedin_url || "",
                            HackCC: "https://hackcc.net",
                        }}
                        customEmailBody={templateData.emailContent}
                    />
                );
                break;
            case "Sponsorship Agreement":
                emailComponent = (
                    <ConfirmationEmail
                        companyName={recipient.organization}
                        recipientName={`${recipient.first_name} ${recipient.last_name}`}
                        sender={templateData.sender}
                        socialLinks={{
                            linkedin: recipient.linkedin_url || "",
                            HackCC: "https://hackcc.net",
                        }}
                        customEmailBody={templateData.emailContent}
                        subject={templateData.subject}
                    />
                );
                break;
            case "Empty":
                emailComponent = (
                    <EmptyEmail
                        recipientName={`${recipient.first_name} ${recipient.last_name}`}
                        emailContent={templateData.emailContent || ""}
                        sender={templateData.sender}
                        companyName={
                            recipient.organization || "your organization"
                        }
                        subject={templateData.subject}
                        socialLinks={{
                            linkedin: recipient.linkedin_url || "",
                            HackCC: "https://hackcc.net",
                        }}
                    />
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
