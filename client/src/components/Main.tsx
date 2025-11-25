import {Outlet, useNavigate} from "react-router";

export default function Main() {

    const navigate = useNavigate();

    return(
    <div className="flex flex-col min-h-screen h-screen overflow-hidden">
    <Outlet/>

    </div>
    )
}