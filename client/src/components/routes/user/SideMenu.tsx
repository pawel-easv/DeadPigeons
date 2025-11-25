import {faHouse} from "@fortawesome/free-regular-svg-icons/faHouse";
import HistoryIcon from "../../../assets/history-icon.svg"
import TicketIcon from "../../../assets/ticket-icon.svg"
import HomeIcon from "../../../assets/home-icon.svg";

export default function SideMenu() {
    return (
        <>
            <div className="flex flex-col h-full w-[22vw] bg-dark-beige p-5 gap-5
                border-r border-border-gray">
                <div className="flex flex-row menu-item">
                    <img src={HomeIcon} alt = "UserView Icon" className="h-5"/>
                    <span>Dashboard</span>
                </div>
                <div className="flex flex-row menu-item">
                    <img src={HistoryIcon} alt = "History Icon" className="h-5"/>
                    <span>History</span>
                </div>
                <div className="flex flex-row menu-item">
                    <img src={TicketIcon} alt = "Ticket Icon" className="h-5"/>
                    <span>My Tickets</span>
                </div>
                <div className = "flex flex-col gap-3 items-center justify-center">
                    <div className="text-xl">
                        <span className={""}>Balance: 0.00 DKK</span>
                    </div>
                    <button className={"btn btn-primary bg-green-600 border-0"}>Add balance</button>
                </div>
            </div>
        </>
    )
}