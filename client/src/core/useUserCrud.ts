import { useAtom } from "jotai";
import { AllUsersAtom } from "@core/atoms/atoms.ts";
import type {
    User,
    UpdateUserRequest,
    ChangePasswordRequest
} from "./generated-client.ts";
import { UsersClient } from "./generated-client.ts";
import customCatch from "./customCatch.ts";
import toast from "react-hot-toast";

const isProduction = import.meta.env.PROD;

const prod = "https://yourproductionserver.com";
const dev = "http://localhost:5284";

const finalUrl = isProduction ? prod : dev;

const usersApi = new UsersClient(finalUrl);

export default function useUserCrud() {

    const [users, setUsers] = useAtom(AllUsersAtom);

    async function getAllUsers(includeDeleted: boolean = false) {
        try {
            const result = await usersApi.getAllUsers(includeDeleted);
            setUsers(result);
        } catch (e: any) {
            customCatch(e);
        }
    }

    async function getUserById(id: string) {
        try {
            const result = await usersApi.getUserById(id);
            return result;
        } catch (e: any) {
            customCatch(e);
        }
    }

    async function getUserByEmail(email: string) {
        try {
            const result = await usersApi.getUserByEmail(email);
            return result;
        } catch (e: any) {
            customCatch(e);
        }
    }

    async function updateUser(id: string, request: UpdateUserRequest) {
        try {
            const result = await usersApi.updateUser(id, request);
            const index = users.findIndex(u => u.id === id);
            if (index > -1) {
                const duplicate = [...users];
                duplicate[index] = result;
                setUsers(duplicate);
            }
            toast.success("User updated successfully");
            return result;
        } catch (e: any) {
            customCatch(e);
        }
    }

    async function deleteUser(id: string, permanent: boolean = false) {
        try {
            const result = await usersApi.deleteUser(id, permanent);
            if (permanent) {
                const filtered = users.filter(u => u.id !== id);
                setUsers(filtered);
            } else {
                const index = users.findIndex(u => u.id === id);
                if (index > -1) {
                    const duplicate = [...users];
                    duplicate[index] = { ...duplicate[index], deleted: true };
                    setUsers(duplicate);
                }
            }
            toast.success("User deleted successfully");
            return result;
        } catch (e: any) {
            customCatch(e);
        }
    }

    async function restoreUser(id: string) {
        try {
            const result = await usersApi.restoreUser(id);
            const index = users.findIndex(u => u.id === id);
            if (index > -1) {
                const duplicate = [...users];
                duplicate[index] = { ...duplicate[index], deleted: false };
                setUsers(duplicate);
            }
            toast.success("User restored successfully");
            return result;
        } catch (e: any) {
            customCatch(e);
        }
    }

    async function changePassword(id: string, request: ChangePasswordRequest) {
        try {
            const result = await usersApi.changePassword(id, request);
            toast.success("Password changed successfully");
            return result;
        } catch (e: any) {
            customCatch(e);
        }
    }

    return {
        getAllUsers,
        getUserById,
        getUserByEmail,
        updateUser,
        deleteUser,
        restoreUser,
        changePassword,
        users
    };
}