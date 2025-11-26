import {Outlet} from "react-router";
import TopMenu from "@components/TopMenu.tsx";
import AdminSideMenu from "@components/routes/admin/AdminSideMenu.tsx";
import {useAtom, useSetAtom} from "jotai";
import {useEffect} from "react";
import {AllUsersAtom} from "@core/atoms/atoms.ts";
import userApi from "@utilities/userApi.ts";
import LotteryDashboard from "@components/routes/admin/LotteryDashboard.tsx";

export default function AdminView() {
    const userCrud = userApi();
    const [users, setUsers] = useAtom(AllUsersAtom);

    useEffect(() => {
        userCrud.getAllUsers();
    }, []);

    return(
        <div className="h-screen w-screen flex flex-col bg-light-beige">
            <TopMenu/>
                <div className="flex flex-1 flex-row">
                    <AdminSideMenu />
                    <Outlet/>
                </div>
        </div>
    )
}