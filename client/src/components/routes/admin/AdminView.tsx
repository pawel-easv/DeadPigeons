import {Outlet} from "react-router";
import TopMenu from "@components/TopMenu.tsx";
import Dashboard from "@components/routes/user/Dashboard.tsx";
import AdminSideMenu from "@components/routes/admin/AdminSideMenu.tsx";
import {useSetAtom} from "jotai";
import {useEffect} from "react";
import {AllUsersAtom} from "@core/atoms/atoms.ts";

export default function AdminView() {
    const setUsers = useSetAtom(AllUsersAtom);

    // useEffect(() => {
    //     let mounted = true;
    //
    //     getAllUsers().then(data => {
    //         if (mounted) setUsers(data);
    //     });
    //
    //     return () => { mounted = false };
    // }, []);

    return(
        <div className="h-screen w-screen flex flex-col bg-light-beige">
            <TopMenu/>
            <div className="flex flex-1">
                <AdminSideMenu />
            </div>
        </div>
    )
}