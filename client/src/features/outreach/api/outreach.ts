import { ContactDto, UpdateContactDto } from "../types/contact.dto";
import {
    SendEmailDto,
    SendBatchEmailsDto,
    UpdateEmailDto,
} from "../types/email.dto";
import { outreachClient } from "../../../api/outreach-client";
import axios from "axios";
import {
    AddInterestedUser,
    InterestedUserDto,
} from "../types/interested-users.dto";
import { OutreachTeamDto } from "../types/outreach-team";

interface OutreachTeamApiResponse {
    data: {
        data: OutreachTeamDto[];
        total: number;
    };
    status: number;
    statusText: string;
}

/**
 * Retrieves contacts from the outreach service with pagination support
 * @param page - The page number to retrieve (1-based indexing)
 * @param limit - Number of contacts per page
 * @param search - Optional search term to filter contacts
 * @returns Object containing contacts data and total count
 */
export async function getContacts(
    page = 1,
    limit = 20,
    search = ""
): Promise<{ data: ContactDto[]; total: number }> {
    const params: Record<string, string | number> = {
        page,
        limit,
    };

    if (search) {
        params.search = search;
    }

    const response = await outreachClient.get("/contacts", { params });

    return {
        data: response.data.data || [],
        total: response.data.total || response.data.data?.length || 0,
    };
}

/**
 * Searches contacts by name, email, or company.
 * @param query - The search query string to filter contacts by name, email, or company.
 * @returns An array of contacts matching the search criteria.
 */
export async function searchContacts(query: string): Promise<ContactDto[]> {
    if (!query.trim()) {
        throw new Error("Search query cannot be empty.");
    }

    try {
        const response = await outreachClient.get("/contacts/search", {
            params: { query },
        });

        // The API may return array directly in response.data
        if (Array.isArray(response.data)) {
            return response.data;
        }

        // Or it might use the nested data.data structure
        if (response.data && Array.isArray(response.data.data)) {
            return response.data.data;
        }

        // If neither format is valid, throw an error
        throw new Error("Invalid response format from contacts search API.");
    } catch (error) {
        console.error("Error searching contacts:", error);
        throw error;
    }
}

/**
 * Retrieves a specific contact by ID
 * @param contactId - The unique identifier of the contact
 */
export async function getContactById(contactId: string): Promise<ContactDto> {
    return (
        await outreachClient.request({
            method: "GET",
            url: `/contacts/${contactId}`,
        })
    ).data;
}

/**
 * Creates a new contact
 * @param contactDto - The contact data to create
 */
export async function createContact(
    contactDto: Partial<ContactDto>
): Promise<ContactDto> {
    return (
        await outreachClient.request({
            method: "POST",
            url: "contacts",
            data: contactDto,
        })
    ).data;
}

/**
 * Updates an existing contact
 * @param id - The unique identifier of the contact to update
 * @param contactDto - The partial contact data to update
 */
export async function updateContact(
    id: string,
    contactDto: UpdateContactDto
): Promise<ContactDto> {
    console.log("Updating contact:", { id, data: contactDto });
    try {
        console.log("Making request to:", `/contacts/${id}`);
        console.log("Request configuration:", {
            method: "PATCH",
            baseURL: outreachClient.defaults.baseURL,
            headers: outreachClient.defaults.headers,
        });

        const response = await outreachClient.request({
            method: "PATCH",
            url: `/contacts/${id}`,
            data: contactDto,
            headers: {
                "Content-Type": "application/json",
                accept: "application/json",
            },
        });

        console.log("Update response:", response.data);
        return response.data.data || response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Detailed error information:", {
                error: error.message,
                requestConfig: error.config,
                response: error.response?.data,
            });
        } else {
            console.error("Unexpected error:", error);
        }
        throw error;
    }
}

/**
 * Deletes a contact
 * @param id - The unique identifier of the contact to delete
 */
export async function deleteContact(id: string): Promise<void> {
    await outreachClient.request({
        method: "DELETE",
        url: `/contacts/${id}`,
    });
}

/**
 * Uploads contacts from a CSV file
 * @param file - The CSV file containing contact data
 * @throws Error if the file is not a CSV
 */
export async function uploadContacts(file: File): Promise<ContactDto[]> {
    if (!file.name.toLowerCase().endsWith(".csv")) {
        throw new Error("Only CSV files are accepted");
    }

    const formData = new FormData();
    formData.append("file", file);

    return (
        await outreachClient.request({
            method: "POST",
            url: "/contacts/upload",
            headers: {
                "Content-Type": "multipart/form-data",
            },
            data: formData,
        })
    ).data;
}

/**
 * Sends a single email
 * @param emailDto - The email data to send
 */
export async function sendEmail(emailDto: SendEmailDto): Promise<void> {
    await outreachClient.request({
        method: "POST",
        url: "emails/send",
        data: emailDto,
    });
}

/**
 * Sends multiple emails in batch
 * @param batchDto - The batch of emails to send with format:
 * {
 *   "emails": [
 *     {
 *       "from": "Company <notifications@example.com>",
 *       "to": [
 *         {
 *           "email": "recipient@example.com"
 *         }
 *       ],
 *       "subject": "Email Subject",
 *       "html": "<h1>Hello</h1><p>Email content.</p>"
 *     }
 *   ]
 * }
 * @returns Promise that resolves when emails are sent
 */
export async function sendBatchEmails(
    batchDto: SendBatchEmailsDto
): Promise<void> {
    await outreachClient.request({
        method: "POST",
        url: "emails/send-batch",
        data: batchDto,
    });
}

/**
 * Retrieves all sent emails
 */
export async function getEmails(): Promise<SendEmailDto[]> {
    return (
        await outreachClient.request({
            method: "GET",
            url: "emails",
        })
    ).data;
}

/**
 * Retrieves a specific email by ID
 * @param id - The unique identifier of the email
 */
export async function getEmailById(id: string): Promise<SendEmailDto> {
    return (
        await outreachClient.request({
            method: "GET",
            url: `emails/${id}`,
        })
    ).data;
}

/**
 * Updates an existing email
 * @param updateDto - The email update data including the ID
 */
export async function updateEmail(
    updateDto: UpdateEmailDto
): Promise<SendEmailDto> {
    return (
        await outreachClient.request({
            method: "PUT",
            url: "emails/update",
            data: updateDto,
        })
    ).data;
}

/**
 * Creates a new interested user record
 * @param interestedUserDto - The interested user data containing email
 * @throws {Error} If the request fails or user already exists
 */
export async function createInterestedUser(
    interestedUserDto: AddInterestedUser
): Promise<void> {
    await outreachClient.request({
        method: "POST",
        url: "interested-users",
        data: interestedUserDto,
    });
}

/**
 * Retrieves all interested users from the system
 * @returns Array of interested user records containing email addresses
 * @throws {Error} If the request fails
 */
export async function getInterestedUsers(): Promise<InterestedUserDto[]> {
    return (
        await outreachClient.request({
            method: "GET",
            url: "interested-users",
        })
    ).data;
}

/**
 * Deletes an interested user record by EMAIL
 * @param email - The email of the interested user to delete
 * @throws {Error} If the request fails or user is not found
 */
export async function deleteInterestedUser(email: string): Promise<void> {
    await outreachClient.request({
        method: "DELETE",
        url: `interested-users/${email}`,
    });
}

/**
 * Retrieves all outreach team members
 * @returns Array of outreach team members wrapped in a response object
 * @throws {Error} If the request fails
 */
export async function getOutreachTeam(): Promise<OutreachTeamApiResponse> {
    return await outreachClient.request({
        method: "GET",
        url: "outreach-team?take=100",
    });
}

/**
 * Creates a new outreach team member
 * @param outreachTeamDto - The outreach team member data to create
 */
export async function createOutreachTeamMember(
    outreachTeamDto: OutreachTeamDto
): Promise<void> {
    await outreachClient.request({
        method: "POST",
        url: "outreach-team",
        data: outreachTeamDto,
    });
}

/**
 * Deletes an outreach team member by ID
 * @param id - The unique identifier of the outreach team member to delete
 */
export async function deleteOutreachTeamMember(id: string): Promise<void> {
    await outreachClient.request({
        method: "DELETE",
        url: `outreach-team/${id}`,
    });
}

/**
 * Updates an existing outreach team member
 * @param id - The unique identifier of the outreach team member to update
 * @param outreachTeamDto - The partial outreach team member data to update
 */
export async function updateOutreachTeamMember(
    id: string,
    outreachTeamDto: Partial<OutreachTeamDto>
): Promise<void> {
    await outreachClient.request({
        method: "PATCH",
        url: `outreach-team/${id}`,
        data: outreachTeamDto,
    });
}

/**
 * Retrieves an outreach team member by ID
 * @param id - The unique identifier of the outreach team member to retrieve
 * @returns The outreach team member data
 */
export async function getOutreachTeamMemberById(
    id: string
): Promise<OutreachTeamDto> {
    return (
        await outreachClient.request({
            method: "GET",
            url: `outreach-team/${id}`,
        })
    ).data;
}

/**
 * Retrieves an outreach team member by email
 * @param email - The email address of the outreach team member to retrieve
 * @returns The outreach team member data
 * @throws {Error} If the request fails or member is not found
 */
export async function getOutreachTeamMemberByEmail(
    email: string
): Promise<OutreachTeamDto> {
    if (!email || !email.trim()) {
        throw new Error("Email cannot be empty");
    }

    return (
        await outreachClient.request({
            method: "GET",
            url: `outreach-team/email/${email}`,
        })
    ).data;
}
