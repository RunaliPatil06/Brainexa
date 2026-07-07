import "./Auth.css";
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MyContext } from "./MyContext";

function Login() {
    const { setUser, setToken } = useContext(MyContext);
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Login failed.");
            } else {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                setToken(data.token);
                setUser(data.user);
                navigate("/");
            }
        } catch (err) {
            setError("Could not connect to server.");
        }

        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                {/* Brand */}
                <div className="auth-brand">
                    <div className="auth-brand-icon">
                        <i className="fa-solid fa-robot"></i>
                    </div>
                    <span className="auth-brand-name">Brainexa</span>
                    <span className="auth-brand-sub">Your AI assistant</span>
                </div>

                <h2 className="auth-title">Welcome back</h2>
                <p className="auth-subtitle">Sign in to continue your conversations</p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="auth-error">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            {error}
                        </div>
                    )}

                    <div className="auth-field">
                        <label>Email</label>
                        <div className="auth-input-wrapper">
                            <i className="fa-solid fa-envelope"></i>
                            <input
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label>Password</label>
                        <div className="auth-input-wrapper">
                            <i className="fa-solid fa-lock"></i>
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <button className="auth-btn" type="submit" disabled={loading}>
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div className="auth-divider">or</div>

                <p className="auth-switch">
                    Don't have an account?{" "}
                    <Link to="/register">Create one</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
