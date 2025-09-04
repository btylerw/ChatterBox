import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function LoginPage() {
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;
    const [error, setError] = useState<string>("");
    const [showError, setShowError] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${SERVER_URL}/auth/login`,
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
            console.log(response.data);
            navigate("/home");
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
        <div className="flex justify-center items-center">
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
                    type="password"
                    name="password"
                    className="p-2 border rounded-md" 
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter Password"
                />
                {showError &&
                    <h1 className="!text-xl text-red-600">{error}</h1>
                }
                <button>Log In</button>
            </form>
        </div>
    )
}