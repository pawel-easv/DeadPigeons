// UserView.tsx - FIXED: Use Outlet instead of hardcoded component
import TopMenu from "@components/TopMenu.tsx";
import SideMenu from "@components/routes/user/SideMenu.tsx";
import { Outlet } from "react-router";

export default function UserView() {
    return (
        <div className="h-screen w-screen flex flex-col bg-light-beige">
            <TopMenu />
            <div className="flex flex-1 overflow-hidden">
                <SideMenu />
                <div className="flex-1 overflow-y-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}