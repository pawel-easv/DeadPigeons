import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { CurrentGameAtom, CurrentUserIdAtom, UserBalanceAtom } from "@core/atoms/atoms.ts";
import toast from "react-hot-toast";
import boardApi from "@utilities/boardApi.ts";
import userApi from "@utilities/userApi.ts";
import gameApi from "@utilities/gameApi.ts";
import authApi from "@utilities/authApi.ts";
import type { CreateBoardDto } from "@core/generated-client.ts";

const BOARD_PRICES = {
    5: 20,
    6: 40,
    7: 80,
    8: 160
};

export default function BuyBoardPage() {
    const api = boardApi();
    const userApiInstance = userApi();
    const gameApiInstance = gameApi();
    const auth = authApi();
    const [currentGame] = useAtom(CurrentGameAtom);
    const [currentUserId] = useAtom(CurrentUserIdAtom);
    const [userBalance, setUserBalance] = useAtom(UserBalanceAtom);
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const [repeatWeeks, setRepeatWeeks] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        gameApiInstance.getCurrentGame();
        loadUserBalance();
    }, [currentUserId]);

    const loadUserBalance = async () => {
        if (!currentUserId) {
            // Try to get current user if not set
            await auth.whoAmI();
            return;
        }

        try {
            const balance = await userApiInstance.getBalanceById(currentUserId);
            if (balance !== undefined) {
                setUserBalance(balance);
            }
        } catch (error) {
            console.error("Failed to load user balance:", error);
        }
    };

    const handleNumberClick = (num: number) => {
        if (selectedNumbers.includes(num)) {
            setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
        } else if (selectedNumbers.length < 8) {
            setSelectedNumbers([...selectedNumbers, num]);
        } else {
            toast.error("You can only select up to 8 numbers");
        }
    };

    const getCurrentPrice = () => {
        const count = selectedNumbers.length;
        if (count < 5 || count > 8) return 0;
        return BOARD_PRICES[count as keyof typeof BOARD_PRICES];
    };

    const getTotalCost = () => {
        return getCurrentPrice() * repeatWeeks;
    };

    const isValidSelection = () => {
        return selectedNumbers.length >= 5 && selectedNumbers.length <= 8;
    };

    const canAfford = () => {
        return userBalance >= getTotalCost();
    };

    const handlePurchase = async () => {
        if (!isValidSelection()) {
            toast.error("Please select between 5 and 8 numbers");
            return;
        }

        if (!canAfford()) {
            toast.error("Insufficient balance. Please add funds to your account.");
            return;
        }

        if (!currentGame?.id) {
            toast.error("No active game found");
            return;
        }

        if (!currentUserId) {
            toast.error("User not authenticated");
            return;
        }

        if (!confirm(`Purchase board with numbers ${selectedNumbers.sort((a, b) => a - b).join(", ")} for ${getTotalCost()} DKK (${repeatWeeks} week${repeatWeeks > 1 ? 's' : ''})?`)) {
            return;
        }

        setIsLoading(true);

        try {
            const dto: CreateBoardDto = {
                userId: currentUserId,
                gameId: currentGame.id,
                numbers: selectedNumbers.sort((a, b) => a - b),
                price: getCurrentPrice(),
                repeating: repeatWeeks > 1
            };

            await api.createBoard(dto);

            // Reload balance after purchase
            await loadUserBalance();

            // Refresh boards list
            await api.getMyBoards();

            // Reset form
            setSelectedNumbers([]);
            setRepeatWeeks(1);

            toast.success(`Board purchased successfully for ${repeatWeeks} week${repeatWeeks > 1 ? 's' : ''}!`);
        } catch (error) {
            // Error is handled in boardApi
        } finally {
            setIsLoading(false);
        }
    };

    const getDeadline = () => {
        if (!currentGame?.createdAt) return "N/A";

        const deadline = new Date(currentGame.createdAt);
        deadline.setDate(deadline.getDate() + (6 - deadline.getDay()));
        deadline.setHours(17, 0, 0, 0);

        return deadline.toLocaleString("da-DK", {
            weekday: "long",
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (!currentGame) {
        return (
            <div className="flex-1 p-6 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <p className="text-gray-500">Loading game information...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentGame.active) {
        return (
            <div className="flex-1 p-6 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <div className="text-6xl mb-4">🔒</div>
                        <h2 className="text-2xl font-bold mb-2 text-gray-800">Lottery Closed</h2>
                        <p className="text-gray-600">The current lottery is not accepting new entries. Please check back when the next game starts.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Check if deadline has passed (Saturday 5 PM)
    if (!currentGame?.createdAt) return "N/A";
    const deadline = new Date(currentGame.createdAt);
    deadline.setDate(deadline.getDate() + (6 - deadline.getDay()));
    deadline.setHours(17, 0, 0, 0);
    const isPastDeadline = new Date() > deadline;

    if (isPastDeadline) {
        return (
            <div className="flex-1 p-6 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <div className="text-6xl mb-4">⏰</div>
                        <h2 className="text-2xl font-bold mb-2 text-gray-800">Entry Deadline Passed</h2>
                        <p className="text-gray-600">The deadline for this week's lottery has passed. Please wait for the winning numbers to be drawn.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-6 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Buy Lottery Board</h1>

                {/* Game Info */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <div className="text-sm text-gray-600">Current Game</div>
                            <div className="text-lg font-semibold">Week {currentGame.week}, {currentGame.year}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">Entry Deadline</div>
                            <div className="text-lg font-semibold">{getDeadline()}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">Your Balance</div>
                            <div className="text-lg font-semibold">{userBalance} DKK</div>
                        </div>
                    </div>
                </div>

                {/* Number Selection */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Select Your Numbers</h2>
                    <p className="text-gray-600 mb-6">Choose between 5 and 8 numbers from 1 to 16</p>

                    {/* Selected Numbers Display */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-2">
                            Selected Numbers ({selectedNumbers.length}/8):
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {selectedNumbers.length === 0 ? (
                                <span className="text-gray-400">No numbers selected yet</span>
                            ) : (
                                selectedNumbers.sort((a, b) => a - b).map((num) => (
                                    <span
                                        key={num}
                                        className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                                    >
                    {num}
                  </span>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Number Grid */}
                    <div className="grid grid-cols-4 gap-3 mb-6">
                        {Array.from({ length: 16 }, (_, i) => i + 1).map((num) => (
                            <button
                                key={num}
                                onClick={() => handleNumberClick(num)}
                                className={`h-14 rounded-lg font-bold text-lg transition-colors ${
                                    selectedNumbers.includes(num)
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                }`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>

                    {/* Pricing Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold mb-2 text-blue-900">Pricing</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div>5 numbers: <span className="font-bold">20 DKK</span></div>
                            <div>6 numbers: <span className="font-bold">40 DKK</span></div>
                            <div>7 numbers: <span className="font-bold">80 DKK</span></div>
                            <div>8 numbers: <span className="font-bold">160 DKK</span></div>
                        </div>
                    </div>
                </div>

                {/* Repeat Options */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Repeat Board</h2>
                    <p className="text-gray-600 mb-4">Play the same numbers for multiple weeks</p>

                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700">Number of weeks:</label>
                        <input
                            type="number"
                            min="1"
                            max="52"
                            value={repeatWeeks}
                            onChange={(e) => setRepeatWeeks(Math.max(1, Math.min(52, parseInt(e.target.value) || 1)))}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="text-sm text-gray-600">weeks</span>
                    </div>
                </div>

                {/* Summary & Purchase */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Purchase Summary</h2>

                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Numbers selected:</span>
                            <span className="font-semibold">{selectedNumbers.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Price per week:</span>
                            <span className="font-semibold">{getCurrentPrice()} DKK</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Number of weeks:</span>
                            <span className="font-semibold">{repeatWeeks}</span>
                        </div>
                        <div className="border-t pt-3 flex justify-between text-lg">
                            <span className="font-bold text-gray-800">Total Cost:</span>
                            <span className="font-bold text-blue-600">{getTotalCost()} DKK</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Your balance after purchase:</span>
                            <span className={`font-semibold ${canAfford() ? 'text-green-600' : 'text-red-600'}`}>
                {userBalance - getTotalCost()} DKK
              </span>
                        </div>
                    </div>

                    {!canAfford() && isValidSelection() && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-red-800 text-sm">
                                ⚠️ Insufficient balance. You need {getTotalCost() - userBalance} DKK more to complete this purchase.
                            </p>
                        </div>
                    )}

                    <button
                        onClick={handlePurchase}
                        disabled={!isValidSelection() || !canAfford() || isLoading}
                        className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? "Processing..." : "Purchase Board"}
                    </button>

                    {!isValidSelection() && selectedNumbers.length > 0 && (
                        <p className="text-sm text-gray-500 text-center mt-3">
                            {selectedNumbers.length < 5
                                ? `Select ${5 - selectedNumbers.length} more number${5 - selectedNumbers.length > 1 ? 's' : ''}`
                                : "Maximum 8 numbers allowed"}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}