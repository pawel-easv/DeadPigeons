import { createBrowserRouter, RouterProvider } from "react-router";
import Main from "@components/Main";
import { DevTools } from "jotai-devtools";
import { Toaster } from "react-hot-toast";
import Login from "@components/routes/Login";
import UserView from "@components/routes/user/UserView";
import AdminView from "@components/routes/admin/AdminView";
import UsersOverview from "@components/routes/admin/UsersOverview.tsx";

export const AdminViewPath = "/admin/"


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
                    path: "user",
                    element: <UserView />
                },
                {
                    path: AdminViewPath,
                    element: <AdminView />,
                    children: [
                        {
                            path: "users",
                            element: <UsersOverview />
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
