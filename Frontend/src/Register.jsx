import "./Auth.css";
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MyContext } from "./MyContext";

function Register() {
    const { setUser, setToken } = useContext(MyContext);
    const navigate = useNavigate();

    const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    password: form.password
                })
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Registration failed.");
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

                <h2 className="auth-title">Create an account</h2>
                <p className="auth-subtitle">Join Brainexa and start chatting</p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="auth-error">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            {error}
                        </div>
                    )}

                    <div className="auth-field">
                        <label>Full Name</label>
                        <div className="auth-input-wrapper">
                            <i className="fa-solid fa-user"></i>
                            <input
                                type="text"
                                name="name"
                                placeholder="John Doe"
                                value={form.name}
                                onChange={handleChange}
                                required
                                autoFocus
                            />
                        </div>
                    </div>

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
                                placeholder="Min. 6 characters"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label>Confirm Password</label>
                        <div className="auth-input-wrapper">
                            <i className="fa-solid fa-lock"></i>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Repeat your password"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <button className="auth-btn" type="submit" disabled={loading}>
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <div className="auth-divider">or</div>

                <p className="auth-switch">
                    Already have an account?{" "}
                    <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
