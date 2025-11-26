import { useEffect, useState } from "react";
import userApi from "@utilities/userApi.ts";
import RegisterUserForm from "@components/routes/admin/RegisterUserForm.tsx";
import { useAtom } from "jotai";
import { AllUsersAtom } from "@core/atoms/atoms.ts";

export default function UsersOverview() {
    const { deleteUser, restoreUser, getAllUsers } = userApi();
    const [users] = useAtom(AllUsersAtom);
    const [includeDeleted, setIncludeDeleted] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        getAllUsers(includeDeleted);
    }, [includeDeleted]);

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user?")) {
            return;
        }
        await deleteUser(userId, false);
    };

    const handleRestore = async (userId: string) => {
        await restoreUser(userId);
    };

    return (
        <div className="container flex flex-row">
            <div className="container mx-auto p-6 bg-red">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-4">Users Overview</h1>

                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Search by email, first name, or last name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={includeDeleted}
                                onChange={(e) => setIncludeDeleted(e.target.checked)}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium">Show deleted users</span>
                        </label>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created At
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className={user.deleted ? "bg-red-50" : ""}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {user.firstName} {user.lastName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {user.role}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.deleted ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                        Deleted
                                                    </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        Active
                                                    </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                {user.deleted ? (
                                                    <button
                                                        onClick={() => handleRestore(user.id)}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        Restore
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                    Total users: {filteredUsers.length}
                </div>
            </div>
            <div className="mb-6">
                <RegisterUserForm />
            </div>
        </div>
    );
}