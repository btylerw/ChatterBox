import { useState } from "react";
import axios from "axios";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";

export default function CreateAccount() {
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;
    const { login } = useUser();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [showError, setShowError] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        if (value !== formData.password) {
            setShowError(true);
            setError("Passwords do not match");
        } else {
            setShowError(false);
            setError("");
        }
        setConfirmPassword(value);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // API call to create new user
            const response = await axios.post(`${SERVER_URL}/auth/register`,
                formData,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            if (showError) {
                setShowError(false);
                setError("");
            }
            
            const loginData = {
                username: formData.username,
                password: formData.password,
            };

            // Automatically logs new user in and redirects to home page if successful
            const loginResponse = await login(loginData);
            if (typeof loginResponse === "string") {
                return;
            } else {
                navigate("/home");
            }
            console.log(response.data);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.detail ?? "Unknown Axios Error");
                setShowError(true);
            } else {
                console.error("Unexpected error", err);
            }
        }
    }

    return (
        <div className="flex flex-col gap-4 justify-center items-center">
			<h1>Create New Account</h1>
            <form className="flex flex-col gap-4 w-80" action="submit" onSubmit={handleSubmit}>
                <input 
                    type="text"
                    name="username"
                    className="p-2 border rounded-md"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter Username"
                />
                <input
                    type="email"
                    name="email"
                    className="p-2 border rounded-md"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter Email"
                />
                <input
                    type="password"
                    name="password"
                    className="p-2 border rounded-md"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter Password"
                />
                <input 
                    type="password" 
                    name="confirmPassword"
                    className="p-2 border rounded-md"
                    value={confirmPassword}
                    onChange={handleConfirmChange}
                    placeholder="Confirm Password"
                />
                {showError &&
                    <h1 className="!text-xl text-red-600">{error}</h1>
                }
                <button>Create Account</button>
            </form>
        </div>
    )
}
