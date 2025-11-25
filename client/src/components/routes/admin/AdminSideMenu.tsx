import UserIcon from "../../../assets/user-icon.svg"
import HomeIcon from "../../../assets/home-icon.svg"
import TransactionIcon from "../../../assets/transaction-icon.svg"
import {useNavigate} from "react-router";
import {AdminViewPath} from "@components/App.tsx";


export default function AdminSideMenu() {
    const navigate = useNavigate();

    return (
        <>
            <div className="flex flex-col h-full w-[22vw] bg-dark-beige p-5 gap-5
                border-r border-border-gray">
                <div className="flex flex-row menu-item" onClick={() => navigate(AdminViewPath)}>
                    <img src={HomeIcon} alt = "UserView Icon" className="h-5"/>
                    <span>Dashboard</span>
                </div>
                <div className="flex flex-row menu-item" onClick={() => navigate("users")}>
                    <img src={UserIcon} alt = "Users Icon" className="h-5"/>
                    <span>Users</span>
                </div>
                <div className="flex flex-row menu-item">
                    <img src={TransactionIcon} alt = "Transactions Icon" className="h-5"/>
                    <span>Transactions</span>
                </div>
            </div>
        </>
    )
}