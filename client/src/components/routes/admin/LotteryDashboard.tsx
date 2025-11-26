import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAtom } from "jotai";
import { CurrentGameAtom, GameStatsAtom } from "@core/atoms/atoms.ts";
import gameApi from "@utilities/gameApi.ts";
import type {SetWinningNumbersDto} from "@core/generated-client.ts";

export default function LotteryDashboard() {
    const api = gameApi();
    const [currentGame] = useAtom(CurrentGameAtom);
    const [gameStats] = useAtom(GameStatsAtom);
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const [showNumberPicker, setShowNumberPicker] = useState(false);

    // Fetch data on mount
    useEffect(() => {
        api.getCurrentGame();
        api.getGameStats();
    }, []);

    const handleNumberClick = (num: number) => {
        if (selectedNumbers.includes(num)) {
            setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
        } else if (selectedNumbers.length < 3) {
            setSelectedNumbers([...selectedNumbers, num]);
        } else {
            toast.error("You can only select 3 numbers");
        }
    };

    const handleSubmitWinningNumbers = async () => {
        if (selectedNumbers.length !== 3) {
            toast.error("Please select exactly 3 numbers");
            return;
        }

        if (!confirm(`Confirm winning numbers: ${selectedNumbers.sort((a, b) => a - b).join(", ")}?`)) {
            return;
        }

        const dto: SetWinningNumbersDto = {
            gameId: currentGame?.id!,
            winningNumbers: selectedNumbers.sort((a, b) => a - b),
        };

        await api.setWinningNumbers(dto);
        await api.getCurrentGame();
        setShowNumberPicker(false);
        setSelectedNumbers([]);
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

    return (
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Lottery Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="statistics-card border-blue-500">
                    <div className="statistics-smaller-text">Total Boards This Week</div>
                    <div className="statistics-bigger-text">{gameStats?.totalBoards ?? 0}</div>
                </div>

                <div className="statistics-card border-green-500">
                    <div className="statistics-smaller-text">Total Revenue</div>
                    <div className="statistics-bigger-text">{gameStats?.totalRevenue ?? 0} DKK</div>
                </div>

                <div className="statistics-card border-orange-500">
                    <div className="statistics-smaller-text">Pending Transactions</div>
                    <div className="statistics-bigger-text">{gameStats?.pendingTransactions ?? 0}</div>
                </div>
            </div>

            {/* Current Game Info */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Current Lottery</h2>

                {currentGame ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-gray-600">Game Week</div>
                                <div className="text-xl font-semibold">Week {currentGame.week}, {currentGame.year}</div>
                            </div>

                            <div>
                                <div className="text-sm text-gray-600">Entry Deadline</div>
                                <div className="text-xl font-semibold">{getDeadline()}</div>
                            </div>

                            <div>
                                <div className="text-sm text-gray-600">Status</div>
                                <div>
                                    {currentGame.active ? (
                                        <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                                            Active - Accepting Entries
                                        </span>
                                    ) : (
                                        <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
                                            Closed
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="text-sm text-gray-600">Winning Numbers</div>
                                <div className="text-xl font-semibold">
                                    {currentGame.winningNumbers && currentGame.winningNumbers.length > 0 ? (
                                        <div className="flex gap-2">
                                            {currentGame.winningNumbers.map((num, idx) => (
                                                <span key={idx} className="bg-cream-red text-white w-10 h-10 m-2 rounded-full flex items-center justify-center font-bold">
                                                    {num}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">Not drawn yet</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Draw Numbers Button */}
                        {(!currentGame.winningNumbers || currentGame.winningNumbers.length === 0) && (
                            <button
                                onClick={() => setShowNumberPicker(true)}
                                className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Draw Winning Numbers
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="text-gray-500">Loading game information...</div>
                )}
            </div>

            {/* Number Picker Modal */}
            {showNumberPicker && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
                        <h3 className="text-2xl font-bold mb-4">Select Winning Numbers</h3>
                        <p className="text-gray-600 mb-6">Select exactly 3 numbers from 1 to 16</p>

                        {/* Selected Numbers Display */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-600 mb-2">Selected Numbers ({selectedNumbers.length}/3):</div>
                            <div className="flex gap-3">
                                {selectedNumbers.length === 0 ? (
                                    <span className="text-gray-400">No numbers selected yet</span>
                                ) : (
                                    selectedNumbers.sort((a, b) => a - b).map(num => (
                                        <span key={num} className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
                                            {num}
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Number Grid */}
                        <div className="grid grid-cols-4 gap-3 mb-6">
                            {Array.from({ length: 16 }, (_, i) => i + 1).map(num => (
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

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleSubmitWinningNumbers}
                                disabled={selectedNumbers.length !== 3}
                                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                Confirm Winning Numbers
                            </button>
                            <button
                                onClick={() => {
                                    setShowNumberPicker(false);
                                    setSelectedNumbers([]);
                                }}
                                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}