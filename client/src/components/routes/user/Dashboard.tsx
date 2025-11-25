import {Outlet} from "react-router";
import CurrentLotteryPanel from "@components/routes/user/CurrentLotteryPanel.tsx";

export default function Dashboard() {
    return (
        <div className="h-full w-full bg-darker-beige place-self-end">
            <CurrentLotteryPanel/>
            <div className="flex flex-col p-10">
                <h1>
                    Playing boards:
                </h1>

            </div>
            <Outlet/>
        </div>
    )
}
