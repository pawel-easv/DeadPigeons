import { NavLink } from "react-router";
import HistoryIcon from "../../../assets/history-icon.svg";
import TicketIcon from "../../../assets/ticket-icon.svg";
import HomeIcon from "../../../assets/home-icon.svg";
import { useAtom } from "jotai";
import { UserBalanceAtom } from "@core/atoms/atoms.ts";
import { useState } from "react";

export default function SideMenu() {
    const [userBalance] = useAtom(UserBalanceAtom);
    const [showAddBalance, setShowAddBalance] = useState(false);

    const handleAddBalance = () => {
    };

    return (
        <div className="flex flex-col h-full w-[22vw] bg-dark-beige p-5 gap-5 border-r border-border-gray">
            {/* Navigation Links */}
            <NavLink
                to="/home/dashboard"
                className={({ isActive }) =>
                    `flex flex-row menu-item ${isActive ? "menu-item-active" : ""}`
                }
            >
                <img src={HomeIcon} alt="Dashboard Icon" className="h-5" />
                <span>Dashboard</span>
            </NavLink>

            <NavLink
                to="/home/history"
                className={({ isActive }) =>
                    `flex flex-row menu-item ${isActive ? "menu-item-active" : ""}`
                }
            >
                <img src={HistoryIcon} alt="History Icon" className="h-5" />
                <span>History</span>
            </NavLink>

            <NavLink
                to="/home/my-boards"
                className={({ isActive }) =>
                    `flex flex-row menu-item ${isActive ? "menu-item-active" : ""}`
                }
            >
                <img src={TicketIcon} alt="Ticket Icon" className="h-5" />
                <span>My Tickets</span>
            </NavLink>

            <div className="flex-1"></div>

            <div className="flex flex-col gap-3 items-center justify-center mt-auto">
                <div className="text-xl">
                    <span>Balance: {userBalance} DKK</span>
                </div>
                <NavLink
                    to="/home/balance"

                    onClick={handleAddBalance}
                    className="btn btn-primary bg-green-600 border-0 hover:bg-green-700"
                >
                    Add balance
                </NavLink>
            </div>
        </div>
    );
}