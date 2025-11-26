import { useAtom } from "jotai";
import {
    CurrentUserIdAtom,
    IsAuthenticatedAtom,
} from "@core/atoms/atoms.ts";
import type {
    LoginRequestDto,
    RegisterRequestDto,
} from "@core/generated-client.ts";
import { AuthClient } from "@core/generated-client.ts";
import toast from "react-hot-toast";
import { customFetch } from "@utilities/customFetch.ts";
import customCatch from "@core/customCatch.ts";

const isProduction = import.meta.env.PROD;
const prod = "https://yourproductionserver.com";
const dev = "http://localhost:5284";
const finalUrl = isProduction ? prod : dev;
const client = new AuthClient(finalUrl, customFetch);

export default function authApi() {
    const [currentUser, setCurrentUser] = useAtom(CurrentUserIdAtom);
    const [isAuthenticated, setIsAuthenticated] = useAtom(IsAuthenticatedAtom);

    const setToken = (token: string | null) => {
        if (token) {
            localStorage.setItem("token", token);
        } else {
            localStorage.removeItem("token");
        }
    };

    async function login(dto: LoginRequestDto) {
        try {
            const result = await client.login(dto);

            if (!result?.token) {
                toast.error("Login failed - no token received");
                return null;
            }

            setToken(result.token);
            setIsAuthenticated(true);

            // Don't call whoAmI here - let it be called separately
            // The token needs to be properly set first
            toast.success("Login successful");

            return result;
        } catch (e: any) {
            customCatch(e);
            return null;
        }
    }

    async function register(dto: RegisterRequestDto) {
        try {
            const result = await client.register(dto);

            if (!result?.token) {
                toast.error("Registration failed - no token received");
                return null;
            }

            setToken(result.token);
            setIsAuthenticated(true);
            toast.success("Registration successful");

            return result;
        } catch (e: any) {
            customCatch(e);
            return null;
        }
    }

    async function whoAmI() {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                console.log("No token found in localStorage");
                setIsAuthenticated(false);
                return null;
            }

            console.log("Calling whoAmI with token:", token.substring(0, 20) + "...");

            const result = await client.whoAmI();

            if (result?.id) {
                setCurrentUser(result.id);
                setIsAuthenticated(true);
                return result;
            }

            return null;
        } catch (e: any) {
            console.error("whoAmI error:", e);
            customCatch(e);
            logout();
            return null;
        }
    }

    function logout() {
        setToken(null);
        setCurrentUser(null);
        setIsAuthenticated(false);
        toast.success("Logged out successfully");
    }

    async function checkAuth() {
        const token = localStorage.getItem("token");
        if (token) {
            await whoAmI();
        } else {
            setIsAuthenticated(false);
        }
    }

    return {
        login,
        register,
        whoAmI,
        logout,
        checkAuth,
        currentUser,
        isAuthenticated,
    };
}