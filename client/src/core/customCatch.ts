import toast from "react-hot-toast";
import { ApiException } from "./generated-client.ts";

export default function customCatch(error: any) {
    if (ApiException.isApiException(error)) {
        const apiError = error as ApiException;

        // Handle specific status codes
        switch (apiError.status) {
            case 400:
                toast.error(apiError.message || "Bad request. Please check your input.");
                break;
            case 401:
                toast.error("Unauthorized. Please login again.");
                // Optionally redirect to login
                // window.location.href = '/login';
                break;
            case 403:
                toast.error("Forbidden. You don't have permission to perform this action.");
                break;
            case 404:
                toast.error("Resource not found.");
                break;
            case 409:
                toast.error("Conflict. The resource already exists or there's a duplicate.");
                break;
            case 422:
                toast.error("Validation failed. Please check your input.");
                break;
            case 500:
                toast.error("Internal server error. Please try again later.");
                break;
            default:
                toast.error(apiError.message || "An unexpected error occurred.");
        }

        // Log detailed error for debugging
        console.error("API Error:", {
            status: apiError.status,
            message: apiError.message,
            response: apiError.response,
            headers: apiError.headers
        });
    } else if (error instanceof Error) {
        // Handle regular JavaScript errors
        toast.error(error.message || "An error occurred.");
        console.error("Error:", error);
    } else {
        // Handle unknown error types
        toast.error("An unexpected error occurred.");
        console.error("Unknown error:", error);
    }
}