import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { CurrentGameAtom } from "@core/atoms/atoms.ts";
import gameApi from "@utilities/gameApi.ts";
import { useNavigate } from "react-router";

export default function CurrentLotteryPanel() {
    const api = gameApi();
    const [currentGame] = useAtom(CurrentGameAtom);
    const [timeLeft, setTimeLeft] = useState<string>("");
    const navigate = useNavigate();

    useEffect(() => {
        api.getCurrentGame();
    }, []);

    useEffect(() => {
        if (!currentGame?.createdAt) return;

        const updateTimer = () => {
            if (!currentGame?.createdAt) return "N/A";
            const deadline = new Date(currentGame.createdAt);
            deadline.setDate(deadline.getDate() + (6 - deadline.getDay()));
            deadline.setHours(17, 0, 0, 0);

            deadline.toLocaleString("da-DK", {
                weekday: "long",
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
            });

            const now = new Date();
            const diff = deadline.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft("Ended");
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h ${minutes}m`);
            } else {
                setTimeLeft(`${hours}h ${minutes}m`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 600); // Update every minute

        return () => clearInterval(interval);
    }, [currentGame]);

    const getDateRange = () => {
        if (!currentGame?.createdAt) return "N/A";

        const start = new Date(currentGame.createdAt);
        const end = new Date(start);
        end.setDate(end.getDate() + (6 - start.getDay()));

        const formatDate = (date: Date) => {
            return date.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });
        };

        return `${formatDate(start)} - ${formatDate(end)}`;
    };

    const handleJoin = () => {
        navigate("/home/buy-board"); // Adjust path as needed
    };

    if (!currentGame) {
        return (
            <div className="lottery-panel">
                <div className="lottery-panel-content">
                    <h1 className="lottery-title">Current Lottery</h1>
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="lottery-panel">
            <div className="lottery-panel-content">
                <h1 className="lottery-title">Current Lottery</h1>

                <div className="lottery-info">
                    <div className="lottery-detail">
                        <span className="detail-label">Week</span>
                        <span className="detail-value">Week {currentGame.week}, {currentGame.year}</span>
                    </div>

                    <div className="lottery-detail">
                        <span className="detail-label">Period</span>
                        <span className="detail-value">{getDateRange()}</span>
                    </div>

                    <div className="lottery-detail">
                        <span className="detail-label">Time left</span>
                        <span className="detail-value highlight">{timeLeft || "Calculating..."}</span>
                    </div>
                </div>

                {currentGame.active ? (
                    <button onClick={handleJoin} className="btn-join">
                        Join Lottery
                    </button>
                ) : (
                    <div className="status-closed">
                        <span className="status-icon">🔒</span>
                        <span>Lottery Closed</span>
                    </div>
                )}
            </div>
        </div>
    );
}