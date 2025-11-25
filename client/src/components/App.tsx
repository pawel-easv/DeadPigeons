import {createBrowserRouter, RouterProvider} from "react-router";
import Main from "@components/Main.tsx";
import {DevTools} from "jotai-devtools";
import {Toaster} from "react-hot-toast";
import Login from "@components/routes/Login.tsx";
import Home from "@components/routes/home/Home.tsx";

function App() {
    return (
        <>
            <RouterProvider router={createBrowserRouter([
                {
                    path: '',
                    element: <Main/>,
                    children: [
                        {
                            path: '',
                            element: <Login/>
                        },
                        {
                            path: '/home',
                            element: <Home/>
                        }
                    ]
                }
            ])}/>
            <DevTools/>
            <Toaster
                position="top-center"
                reverseOrder={false}
            />
        </>
    )
}

export default App
