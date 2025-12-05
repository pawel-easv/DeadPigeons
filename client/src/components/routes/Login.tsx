import { useState } from "react";
import LoginImage from '../../assets/login.png'
import authApi from '@utilities/authApi.ts'
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { AdminDashboardPath, UserViewPath } from "@components/App.tsx";

export default function Login() {
    const navigate = useNavigate();
    const auth = authApi();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            toast.error("Please enter email and password");
            return;
        }

        setIsLoading(true);

        try {
            const loginResponse = await auth.login({
                email,
                password
            });

            if (!loginResponse?.token) {
                toast.error("Login failed. Please try again.");
                setIsLoading(false);
                return;
            }

            toast.success("Login successful!");

            const user = await auth.whoAmI();

            if (!user) {
                toast.error("Failed to get user information");
                setIsLoading(false);
                return;
            }

            if (user.role === "Admin") {
                navigate(AdminDashboardPath);
            } else {
                navigate(UserViewPath);
            }

        } catch (err: any) {
            console.error("Login error:", err);

            if (err?.response?.status === 401) {
                toast.error("Invalid email or password");
            } else if (err?.message) {
                toast.error(err.message);
            } else {
                toast.error("Login failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading) {
            handleLogin();
        }
    };

    return (
        <div
            className="w-[100vw] h-[100vh] bg-cover bg-center flex items-center justify-center"
            style={{ backgroundImage: `url(${LoginImage})` }}
        >
            <div className="credentials-container flex flex-col mt-25 gap-10">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
                    Dead Pigeons Login
                </h1>

                <div className="email-field-container flex flex-col justify-center items-center">
                    <label className="label text-black font-semibold">Email</label>
                    <input
                        type="email"
                        className="input h-[5vh] w-[20vw]"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        autoComplete="email"
                        placeholder="your@email.com"
                    />
                </div>

                <div className="password-field-container flex flex-col justify-center items-center">
                    <label className="label text-black font-semibold">Password</label>
                    <input
                        type="password"
                        className="input h-[5vh] w-[20vw]"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        autoComplete="current-password"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    className="btn bg-green-600 border-0 text-white hover:bg-green-700 disabled:bg-gray-400"
                    onClick={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? "Logging in..." : "Login"}
                </button>
            </div>
        </div>
    );
}