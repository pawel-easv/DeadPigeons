import TopMenu from "@components/routes/home/TopMenu.tsx";
import SideMenu from "@components/routes/home/SideMenu.tsx";
import Dashboard from "@components/routes/home/Dashboard.tsx";

export default function Home() {
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
