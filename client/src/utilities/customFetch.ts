import type { ProblemDetails } from "@core/problemdetails.ts";
import toast from "react-hot-toast";

export const customFetch = {
    fetch(url: RequestInfo, init?: RequestInit): Promise<Response> {
        const token = localStorage.getItem('token');
        const headers = new Headers(init?.headers);

        if (token) {
            // Your backend expects just the token, NOT "Bearer {token}"
            headers.set('Authorization', token);
        }

        return fetch(url, {
            ...init,
            headers
        }).then(async (response) => {
            // Handle errors by reading from one clone
            if (!response.ok) {
                const errorClone = response.clone();
                try {
                    const problemDetails = (await errorClone.json()) as ProblemDetails;
                    console.log(problemDetails);
                    toast.error(problemDetails.title || 'An error occurred');
                } catch (e) {
                    // If response is not JSON, show generic error
                    toast.error(`Error: ${response.status} ${response.statusText}`);
                }
            }

            return response;
        });
    }
};