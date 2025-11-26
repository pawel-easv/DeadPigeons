import {useAtom} from "jotai";
import {AllUsersAtom} from "@core/atoms/atoms.ts";
import type {ChangePasswordRequest, UpdateUserDto, User} from "@core/generated-client.ts";
import {UsersClient} from "@core/generated-client.ts";
import customCatch from "@core/customCatch.ts";
import toast from "react-hot-toast";
import {resolveRefs} from "dotnet-json-refs";

const isProduction = import.meta.env.PROD;
const prod = "https://yourproductionserver.com";
const dev = "http://localhost:5284";
const finalUrl = isProduction ? prod : dev;

class UsersClientWithResolvedRefs extends UsersClient {
    override async getAllUsers(includeDeleted?: boolean): Promise<User[]> {
        const result = await super.getAllUsers(includeDeleted);
        return resolveRefs(result);
    }

    override async getUserById(id?: string): Promise<User> {
        const result = await super.getUserById(id);
        return resolveRefs(result);
    }

    override async getUserByEmail(email?: string): Promise<User> {
        const result = await super.getUserByEmail(email);
        return resolveRefs(result);
    }

    override async updateUser(id?: string, dto?: UpdateUserDto): Promise<User> {
        const result = await super.updateUser(id, dto!);
        return resolveRefs(result);
    }
}

const userClient = new UsersClientWithResolvedRefs(finalUrl);

export default function userApi() {
    const [users, setUsers] = useAtom(AllUsersAtom);

    async function getAllUsers(includeDeleted: boolean = false): Promise<User[]> {
        try {
            const users = await userClient.getAllUsers(includeDeleted);
            console.log(users);
            setUsers(users);
            return users;
        } catch (e: any) {
            customCatch(e);
            return [];
        }
    }

    async function getUserById(id: string) {
        try {
            return await userClient.getUserById(id);
        } catch (e: any) {
            customCatch(e);
        }
    }

    async function getUserByEmail(email: string) {
        try {
            return await userClient.getUserByEmail(email);
        } catch (e: any) {
            customCatch(e);
        }
    }

    async function updateUser(id: string, dto: UpdateUserDto) {
        try {
            const result = await userClient.updateUser(id, dto);
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
            await userClient.deleteUser(id, permanent);
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
        } catch (e: any) {
            customCatch(e);
        }
    }

    async function restoreUser(id: string) {
        try {
            await userClient.restoreUser(id);
            const index = users.findIndex(u => u.id === id);
            if (index > -1) {
                const duplicate = [...users];
                duplicate[index] = { ...duplicate[index], deleted: false };
                setUsers(duplicate);
            }
            toast.success("User restored successfully");
        } catch (e: any) {
            customCatch(e);
        }
    }
    async function getBalanceById(id: string): Promise<number|undefined> {
        try{
            return await userClient.getBalanceById(id);
        }
        catch (e: any) {
            customCatch(e);
        }
    }

    async function changePassword(id: string, request: ChangePasswordRequest) {
        try {
            await userClient.changePassword(id, request);
            toast.success("Password changed successfully");
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
        getBalanceById,
        users
    };
}