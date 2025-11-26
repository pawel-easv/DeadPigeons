import {Outlet, useNavigate} from "react-router";
import TopMenu from "@components/TopMenu.tsx";

export default function Main() {

    const navigate = useNavigate();

    return(
    <div className="flex flex-col min-h-screen overflow-x-hidden">
        <Outlet/>
    </div>
    )
}