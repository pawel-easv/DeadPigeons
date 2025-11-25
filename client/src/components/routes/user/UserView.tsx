import TopMenu from "@components/TopMenu.tsx";
import SideMenu from "@components/routes/user/SideMenu.tsx";
import Dashboard from "@components/routes/user/Dashboard.tsx";
import {Outlet} from "react-router";

export default function UserView() {
    return (
        <div className="h-screen w-screen flex flex-col bg-light-beige">
            <TopMenu/>
            <div className="flex flex-1">
                <SideMenu />
                <Dashboard />
            </div>
        </div>
    );
}
