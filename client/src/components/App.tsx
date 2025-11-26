import { createBrowserRouter, RouterProvider } from "react-router";
import Main from "@components/Main";
import { DevTools } from "jotai-devtools";
import { Toaster } from "react-hot-toast";
import Login from "@components/routes/Login";
import UserView from "@components/routes/user/UserView";
import AdminView from "@components/routes/admin/AdminView";
import UsersOverview from "@components/routes/admin/UsersOverview.tsx";
import LotteryDashboard from "@components/routes/admin/LotteryDashboard.tsx";
import Dashboard from "@components/routes/user/Dashboard.tsx";
import BuyBoardPage from "@components/routes/user/BuyBoardPage.tsx";

export const AdminViewPath = "/admin/";
export const AdminDashboardPath = "/admin/dashboard";
export const UserViewPath = "/home/";
export const BuyBoardPath = "/home/buy-board";
export const DashboardPath = "/home/dashboard";

function App() {
    const router = createBrowserRouter([
        {
            path: "",
            element: <Main />,
            children: [
                {
                    index: true,
                    element: <Login />
                },
                {
                    path: UserViewPath,
                    element: <UserView />,
                    children: [
                        {
                            index: true,
                            element: <Dashboard />
                        },
                        {
                            path: "dashboard",
                            element: <Dashboard />
                        },
                        {
                            path: "buy-board",
                            element: <BuyBoardPage />
                        },
                    ]
                },
                {
                    path: AdminViewPath,
                    element: <AdminView />,
                    children: [
                        {
                            index: true,
                            element: <LotteryDashboard />
                        },
                        {
                            path: "users",
                            element: <UsersOverview />
                        },
                        {
                            path: "dashboard",
                            element: <LotteryDashboard />
                        }
                    ]
                }
            ]
        }
    ]);

    return (
        <>
            <RouterProvider router={router} />
            <DevTools />
            <Toaster position="top-center" reverseOrder={false} />
        </>
    );
}

export default App;