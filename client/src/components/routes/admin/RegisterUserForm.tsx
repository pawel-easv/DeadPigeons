import { useState } from "react";
import authApi from "@utilities/authApi.ts";
export default function RegisterUserForm() {
    const { register } = authApi();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register({
                firstName,
                lastName,
                email,
                password
            });
            setEmail("");
            setFirstName("");
            setLastName("");
            setPassword("");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="h-full max-w-md mx-auto p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Register New User</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="px-4 py-2 border rounded-lg focus:outline-none"
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="px-4 py-2 border rounded-lg focus:outline-none"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="px-4 py-2 border rounded-lg focus:outline-none"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-cream-red text-white px-4 py-2 rounded-lg hover:bg-red-400 disabled:opacity-50"
                >
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>
        </div>
    );
}
