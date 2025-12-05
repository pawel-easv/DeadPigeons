import { useEffect, useState } from "react";
import transactionApi from "@utilities/transactionApi.ts";
import authApi from "@utilities/authApi.ts";
import type { Transaction } from "@core/generated-client.ts";

export default function TransactionHistory() {
    const api = transactionApi();
    const auth = authApi();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const user = await auth.whoAmI();
            if (user) {
                const result = await api.getTransactionsByUserId(user.id, false);
                setTransactions(result);
            }
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(t => {
        if (filter === "approved") return t.approved === true;
        if (filter === "pending") return t.approved === false;
        return true;
    });

    const totalBalance = transactions
        .filter(t => t.approved === true)
        .reduce((sum, t) => sum + t.amount, 0);

    const pendingAmount = transactions
        .filter(t => t.approved === false)
        .reduce((sum, t) => sum + t.amount, 0);

    const getStatusBadge = (transaction: Transaction) => {
        if (transaction.approved) {
            return <span className="status-badge status-approved">Approved</span>;
        }
        return <span className="status-badge status-pending">Pending</span>;
    };

    if (loading) {
        return (
            <div className="transaction-history">
                <div className="loading-state">Loading transactions...</div>
            </div>
        );
    }

    return (
        <div className="transaction-history">
            <div className="history-header">
                <h1 className="history-title">Transaction History</h1>

                <div className="balance-summary">
                    <div className="balance-card balance-approved">
                        <div className="balance-label">Available Balance</div>
                        <div className="balance-amount">{totalBalance} DKK</div>
                    </div>

                    {pendingAmount > 0 && (
                        <div className="balance-card balance-pending">
                            <div className="balance-label">Pending Approval</div>
                            <div className="balance-amount">{pendingAmount} DKK</div>
                        </div>
                    )}
                </div>
            </div>

            <div className="filter-tabs">
                <button
                    className={`filter-tab ${filter === "all" ? "active" : ""}`}
                    onClick={() => setFilter("all")}
                >
                    All ({transactions.length})
                </button>
                <button
                    className={`filter-tab ${filter === "approved" ? "active" : ""}`}
                    onClick={() => setFilter("approved")}
                >
                    Approved ({transactions.filter(t => t.approved).length})
                </button>
                <button
                    className={`filter-tab ${filter === "pending" ? "active" : ""}`}
                    onClick={() => setFilter("pending")}
                >
                    Pending ({transactions.filter(t => !t.approved).length})
                </button>
            </div>

            {filteredTransactions.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">💳</div>
                    <h3>No transactions found</h3>
                    <p>Your transaction history will appear here once you make deposits</p>
                </div>
            ) : (
                <div className="transactions-table-container">
                    <table className="transactions-table">
                        <thead>
                        <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>MobilePay Reference</th>
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredTransactions.map((transaction) => (
                            <tr key={transaction.id} className="transaction-row">
                                <td className="transaction-date">
                                    {new Date(transaction.createdAt || "").toLocaleDateString("da-DK", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    })}
                                </td>
                                <td className="transaction-amount">
                                    <span className="amount-value">+{transaction.amount} DKK</span>
                                </td>
                                <td className="transaction-reference">
                                    <code className="reference-code">{transaction.mobilepayReference}</code>
                                </td>
                                <td className="transaction-status">
                                    {getStatusBadge(transaction)}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}