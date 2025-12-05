import { useState } from "react";
import toast from "react-hot-toast";
import transactionApi from "@utilities/transactionApi.ts";
import authApi from "@utilities/authApi.ts";
import type { CreateTransactionDto } from "@core/generated-client.ts";

interface AddBalanceModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function AddBalanceModal({ onClose, onSuccess }: AddBalanceModalProps) {
    const api = transactionApi();
    const auth = authApi();
    const [amount, setAmount] = useState("");
    const [mobilepayRef, setMobilepayRef] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || parseFloat(amount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        if (!mobilepayRef.trim()) {
            toast.error("Please enter your MobilePay reference number");
            return;
        }

        setLoading(true);
        try {
            const user = await auth.whoAmI();
            if (!user) {
                toast.error("User not found");
                return;
            }

            const dto: CreateTransactionDto = {
                userId: user.id,
                amount: parseFloat(amount),
                mobilepayReference: mobilepayRef.trim(),
                boardId: undefined
            };

            const result = await api.createTransaction(dto);
            if (result) {
                toast.success("Transaction submitted! Waiting for admin approval.");
                onSuccess();
                onClose();
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content-small" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Add Balance</h2>
                    <button onClick={onClose} className="modal-close">×</button>
                </div>

                <form onSubmit={handleSubmit} className="balance-form">
                    <div className="form-info">
                        <p>Transfer money via MobilePay and enter the details below.</p>
                        <p className="form-note">Your balance will be available once approved by an admin.</p>
                    </div>

                    <div className="form-group">
                        <label htmlFor="amount" className="form-label">Amount (DKK)</label>
                        <input
                            id="amount"
                            type="number"
                            min="1"
                            step="1"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="reference" className="form-label">MobilePay Reference</label>
                        <input
                            id="reference"
                            type="text"
                            value={mobilepayRef}
                            onChange={(e) => setMobilepayRef(e.target.value)}
                            placeholder="Enter transaction reference"
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="modal-actions">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-success mr-20"
                        >
                            {loading ? "Submitting..." : "Submit Transaction"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}