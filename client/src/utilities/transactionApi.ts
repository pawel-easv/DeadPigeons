// transactionApi.ts
import { useAtom } from "jotai";
import { AllTransactionsAtom, PendingTransactionsAtom } from "@core/atoms/atoms.ts";
import type {
    Transaction,
    CreateTransactionDto
} from "@core/generated-client.ts";
import { TransactionsClient } from "@core/generated-client.ts";
import customCatch from "@core/customCatch.ts";
import toast from "react-hot-toast";
import { resolveRefs } from "dotnet-json-refs";

const isProduction = import.meta.env.PROD;
const prod = "https://yourproductionserver.com";
const dev = "http://localhost:5284";
const finalUrl = isProduction ? prod : dev;

class TransactionsClientWithResolvedRefs extends TransactionsClient {
    override async getAllTransactions(includeDeleted?: boolean): Promise<Transaction[]> {
        const result = await super.getAllTransactions(includeDeleted);
        return resolveRefs(result);
    }

    override async getTransactionById(id?: string): Promise<Transaction> {
        const result = await super.getTransactionById(id);
        return resolveRefs(result);
    }

    override async getTransactionsByUserId(userId?: string, includeDeleted?: boolean): Promise<Transaction[]> {
        const result = await super.getTransactionsByUserId(userId, includeDeleted);
        return resolveRefs(result);
    }

    override async getPendingTransactions(): Promise<Transaction[]> {
        const result = await super.getPendingTransactions();
        return resolveRefs(result);
    }

    override async getTransactionByMobilepayReference(reference?: string): Promise<Transaction> {
        const result = await super.getTransactionByMobilepayReference(reference);
        return resolveRefs(result);
    }

    override async createTransaction(dto: CreateTransactionDto): Promise<Transaction> {
        const result = await super.createTransaction(dto);
        return resolveRefs(result);
    }

    override async approveTransaction(transactionId?: string): Promise<Transaction> {
        const result = await super.approveTransaction(transactionId);
        return resolveRefs(result);
    }

    override async rejectTransaction(transactionId?: string): Promise<Transaction> {
        const result = await super.rejectTransaction(transactionId);
        return resolveRefs(result);
    }
}

const transactionClient = new TransactionsClientWithResolvedRefs(finalUrl);

export default function transactionApi() {
    const [transactions, setTransactions] = useAtom(AllTransactionsAtom);
    const [pendingTransactions, setPendingTransactions] = useAtom(PendingTransactionsAtom);

    async function getAllTransactions(includeDeleted: boolean = false): Promise<Transaction[]> {
        try {
            const result = await transactionClient.getAllTransactions(includeDeleted);
            setTransactions(result);
            return result;
        } catch (e: any) {
            customCatch(e);
            return [];
        }
    }

    async function getTransactionById(id: string): Promise<Transaction | null> {
        try {
            return await transactionClient.getTransactionById(id);
        } catch (e: any) {
            customCatch(e);
            return null;
        }
    }

    async function getTransactionsByUserId(userId: string, includeDeleted: boolean = false): Promise<Transaction[]> {
        try {
            const result = await transactionClient.getTransactionsByUserId(userId, includeDeleted);
            return result;
        } catch (e: any) {
            customCatch(e);
            return [];
        }
    }

    async function getPendingTransactions(): Promise<Transaction[]> {
        try {
            const result = await transactionClient.getPendingTransactions();
            setPendingTransactions(result);
            return result;
        } catch (e: any) {
            customCatch(e);
            return [];
        }
    }

    async function getTransactionByMobilepayReference(reference: string): Promise<Transaction | null> {
        try {
            return await transactionClient.getTransactionByMobilepayReference(reference);
        } catch (e: any) {
            customCatch(e);
            return null;
        }
    }

    async function createTransaction(dto: CreateTransactionDto): Promise<Transaction | null> {
        try {
            const result = await transactionClient.createTransaction(dto);
            const updated = [...transactions, result];
            setTransactions(updated);
            toast.success("Transaction created successfully");
            return result;
        } catch (e: any) {
            customCatch(e);
            return null;
        }
    }

    async function approveTransaction(transactionId: string): Promise<Transaction | null> {
        try {
            const result = await transactionClient.approveTransaction(transactionId);

            // Update in transactions list
            const index = transactions.findIndex(t => t.id === transactionId);
            if (index > -1) {
                const updated = [...transactions];
                updated[index] = result;
                setTransactions(updated);
            }

            // Remove from pending transactions
            const updatedPending = pendingTransactions.filter(t => t.id !== transactionId);
            setPendingTransactions(updatedPending);

            toast.success("Transaction approved successfully");
            return result;
        } catch (e: any) {
            customCatch(e);
            return null;
        }
    }

    async function rejectTransaction(transactionId: string): Promise<Transaction | null> {
        try {
            const result = await transactionClient.rejectTransaction(transactionId);

            // Remove from both lists since it's now deleted
            const updatedTransactions = transactions.filter(t => t.id !== transactionId);
            setTransactions(updatedTransactions);

            const updatedPending = pendingTransactions.filter(t => t.id !== transactionId);
            setPendingTransactions(updatedPending);

            toast.success("Transaction rejected successfully");
            return result;
        } catch (e: any) {
            customCatch(e);
            return null;
        }
    }

    async function deleteTransaction(id: string, permanent: boolean = false): Promise<boolean> {
        try {
            const result = await transactionClient.deleteTransaction(id, permanent);

            if (result) {
                if (permanent) {
                    const updated = transactions.filter(t => t.id !== id);
                    setTransactions(updated);
                } else {
                    const index = transactions.findIndex(t => t.id === id);
                    if (index > -1) {
                        const updated = [...transactions];
                        updated[index] = { ...updated[index], deleted: true };
                        setTransactions(updated);
                    }
                }
                toast.success("Transaction deleted successfully");
            }

            return result;
        } catch (e: any) {
            customCatch(e);
            return false;
        }
    }

    async function restoreTransaction(id: string): Promise<boolean> {
        try {
            const result = await transactionClient.restoreTransaction(id);

            if (result) {
                const index = transactions.findIndex(t => t.id === id);
                if (index > -1) {
                    const updated = [...transactions];
                    updated[index] = { ...updated[index], deleted: false };
                    setTransactions(updated);
                }
                toast.success("Transaction restored successfully");
            }

            return result;
        } catch (e: any) {
            customCatch(e);
            return false;
        }
    }

    async function getPendingTransactionsCount(): Promise<number> {
        try {
            return await transactionClient.getPendingTransactionsCount();
        } catch (e: any) {
            customCatch(e);
            return 0;
        }
    }

    async function getUserBalance(userId: string): Promise<number> {
        try {
            return await transactionClient.getUserBalance(userId);
        } catch (e: any) {
            customCatch(e);
            return 0;
        }
    }

    return {
        getAllTransactions,
        getTransactionById,
        getTransactionsByUserId,
        getPendingTransactions,
        getTransactionByMobilepayReference,
        createTransaction,
        approveTransaction,
        rejectTransaction,
        deleteTransaction,
        restoreTransaction,
        getPendingTransactionsCount,
        getUserBalance,
        transactions,
        pendingTransactions
    };
}