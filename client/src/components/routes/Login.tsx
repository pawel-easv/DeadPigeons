import { useState } from "react";
import LoginImage from '../../assets/login.png'
import { authApi } from '@utilities/authApi.ts'

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const response = await authApi.login({
                email,
                password
            });


        } catch (err) {
            console.error("Login error:", err);
            alert("Invalid email or password");
        }
    };

    return (
        <div
            className="w-[100vw] h-[100vh] bg-cover bg-center flex items-center justify-center"
            style={{ backgroundImage: `url(${LoginImage})` }}
        >
            <div className="credentials-container flex flex-col mt-25 gap-10">

                <div className="email-field-container flex flex-col justify-center items-center">
                    <label className="label text-black font-semibold">Email</label>
                    <input
                        type="text"
                        className="input h-[5vh] w-[20vw]"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="password-field-container flex flex-col justify-center items-center">
                    <label className="label text-black font-semibold">Password</label>
                    <input
                        type="password"
                        className="input h-[5vh] w-[20vw]"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    className="btn bg-green-600 border-0 text-white"
                    onClick={handleLogin}
                >
                    Login
                </button>

            </div>
        </div>
    );
}
