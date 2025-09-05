import { useState } from "react";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const [error, setError] = useState<string>("");
    const [showError, setShowError] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const navigate = useNavigate();
    const { login } = useUser();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await login(formData);
        if (typeof response === "string") {
            setError(response);
            setShowError(true);
        } else {
            setError("");
            setShowError(false);
            navigate("/home");
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