import * as React from "react";
import {
    Body,
    Container,
    Column,
    Head,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Text,
} from "@react-email/components";
import { OutreachTeamDto } from "../features/outreach/types/outreach-team";

interface EmptyEmailProps {
    recipientName: string;
    emailContent: string;
    sender: OutreachTeamDto;
    organizationLogo?: string;
    socialLinks?: {
        [key: string]: string;
    };
}

export const EmptyEmail = ({
    recipientName,
    emailContent,
    sender,
    socialLinks = {},
}: EmptyEmailProps) => {
    const formattedYearAndMajor = `${sender.year} ${sender.major}`;

    return (
        <Html>
            <Head />
            <Preview>Message from HackCC</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Img
                            src={`https://minio.hackcc.net/public-bucket/logo.svg`}
                            width={120}
                            height={45}
                            alt="HackCC Logo"
                            style={logo}
                        />
                    </Section>

                    <Section style={content}>
                        <Text style={paragraph}>Hi {recipientName},</Text>

                        <div
                            style={paragraph}
                            dangerouslySetInnerHTML={{ __html: emailContent }}
                        />

                        <Text style={paragraph}>Best regards,</Text>

                        {/* Signature */}
                        <Section style={signatureContainer}>
                            <Row>
                                <Column>
                                    <Text style={signatureName}>
                                        {sender.name}{" "}
                                        {sender.position &&
                                            `- ${sender.position}`}
                                    </Text>
                                    <Text style={signaturePosition}>
                                        {formattedYearAndMajor}
                                    </Text>
                                </Column>
                                <Column>
                                    <Text style={signatureSchool}>
                                        {sender.school}
                                    </Text>
                                </Column>
                            </Row>

                            {/* Social Media Links */}
                            {Object.keys(socialLinks).length > 0 && (
                                <Row style={socialLinksContainer}>
                                    {Object.entries(socialLinks).map(
                                        ([platform, url]) => (
                                            <Column
                                                key={platform}
                                                style={socialLinkColumn}
                                            >
                                                <Link
                                                    href={url}
                                                    style={socialLink}
                                                >
                                                    {platform}
                                                </Link>
                                            </Column>
                                        )
                                    )}
                                </Row>
                            )}
                        </Section>
                    </Section>

                    {/* Footer */}
                    <Section style={footer}>
                        <Text style={footerText}>
                            HackCC • California Community Colleges • 2025
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default EmptyEmail;

// Styles
const main = {
    backgroundColor: "#f9fafb",
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    padding: "20px 0",
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    maxWidth: "600px",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
};

const header = {
    backgroundColor: "#1e40af", // Deep blue header
    padding: "20px 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
};

const logo = {
    margin: "0",
};

const content = {
    padding: "30px",
};

const paragraph = {
    fontSize: "16px",
    lineHeight: "1.5",
    color: "#374151",
    margin: "16px 0",
};

const signatureContainer = {
    marginTop: "30px",
    borderTop: "1px solid #e5e7eb",
    paddingTop: "20px",
};

const signatureName = {
    fontSize: "18px",
    fontWeight: "600",
    color: "#111827",
    margin: "0 0 4px",
};

const signaturePosition = {
    fontSize: "14px",
    color: "#4b5563",
    margin: "0 0 8px",
};

const signatureSchool = {
    fontSize: "14px",
    color: "#4b5563",
    margin: "0",
    textAlign: "right" as const,
};

const socialLinksContainer = {
    marginTop: "12px",
};

const socialLinkColumn = {
    paddingRight: "12px",
};

const socialLink = {
    fontSize: "14px",
    color: "#2563eb",
    textDecoration: "none",
};

const footer = {
    backgroundColor: "#f3f4f6",
    padding: "16px 30px",
    textAlign: "center" as const,
};

const footerText = {
    fontSize: "12px",
    color: "#6b7280",
    margin: "0",
};
