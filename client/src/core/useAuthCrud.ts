import { useAtom } from "jotai";
import { CurrentUserIdAtom, IsAuthenticatedAtom } from "@core/atoms/atoms.ts";
import type {
    JwtResponse,
    JwtClaims,
    LoginRequestDto,
    RegisterRequestDto
} from "./generated-client.ts";
import { AuthClient } from "./generated-client.ts";
import customCatch from "./customCatch.ts";
import toast from "react-hot-toast";

const isProduction = import.meta.env.PROD;

const prod = "https://yourproductionserver.com";
const dev = "http://localhost:5284";

const finalUrl = isProduction ? prod : dev;

const authApi = new AuthClient(finalUrl);

export default function useAuthCrud() {

    const [currentUser, setCurrentUser] = useAtom(CurrentUserIdAtom);
    const [isAuthenticated, setIsAuthenticated] = useAtom(IsAuthenticatedAtom);

    async function login(dto: LoginRequestDto) {
        try {
            const result = await authApi.login(dto);
            localStorage.setItem('token', result.token);
            setIsAuthenticated(true);
            toast.success("Login successful");

            await whoAmI();

            return result;
        } catch (e: any) {
            customCatch(e);
        }
    }

    async function register(dto: RegisterRequestDto) {
        try {
            const result = await authApi.register(dto);
            localStorage.setItem('token', result.token);
            setIsAuthenticated(true);
            toast.success("Registration successful");

            await whoAmI();

            return result;
        } catch (e: any) {
            customCatch(e);
        }
    }

    async function whoAmI() {
        try {
            const result = await authApi.whoAmI();
            setCurrentUser(result.id);
            setIsAuthenticated(true);
            return result;
        } catch (e: any) {
            customCatch(e);
            logout();
        }
    }

    function logout() {
        localStorage.removeItem('token');
        setCurrentUser(null);
        setIsAuthenticated(false);
        toast.success("Logged out successfully");
    }

    async function checkAuth() {
        const token = localStorage.getItem('token');
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
        isAuthenticated
    };
}