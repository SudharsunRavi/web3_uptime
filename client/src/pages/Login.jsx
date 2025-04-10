import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../redux/userSlice";

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const res = await fetch(`${import.meta.env.VITE_BASE}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(formData)
        });
        const data = await res.json();
        //console.log(data);

        if (!data.status) {
            toast.error(data.message, { duration: 3000 });
            return;
        }

        toast.success("Login successful!", { duration: 3000 });
        dispatch(login(data?.data))
        navigate("/");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
            <Toaster/>
            <div className="w-full max-w-sm bg-[#1a1a1a] p-8 rounded-xl shadow-lg">
                <h1 className="text-2xl font-semibold text-center text-[#e5e5e5] mb-6">Login</h1>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Email"
                        id="email"
                        onChange={handleChange}
                        className="w-full p-3 bg-[#0f0f0f] text-[#e5e5e5] placeholder-gray-400 border border-[#2e2e2e] rounded-md focus:outline-none focus:ring-2 focus:ring-[#f5f5f5]"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        id="password"
                        onChange={handleChange}
                        className="w-full p-3 bg-[#0f0f0f] text-[#e5e5e5] placeholder-gray-400 border border-[#2e2e2e] rounded-md focus:outline-none focus:ring-2 focus:ring-[#f5f5f5]"
                    />
                    <button
                        type="submit"
                        className="w-full p-3 font-medium rounded-md bg-[#f5f5f5] hover:text-white hover:border hover:border-white hover:bg-[#1a1a1a] transition"
                    >
                        Login
                    </button>
                </form>

                <p className="text-center text-[#e5e5e5] mt-4">Don't have an account? <a href="/signup" className="text-[#f5f5f5] hover:underline">Sign Up</a></p>
            </div>
        </div>
    );
};

export default Login;
