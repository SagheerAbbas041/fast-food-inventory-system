import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User } from "lucide-react";
import api from "../api";
import logo from "./titlelogo.png";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("admin"),
    [password, setPassword] = useState("admin123"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);

  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const r = await api.post("/auth/login", {
        username,
        password,
      });

      localStorage.setItem("token", r.data.token);
      onLogin(r.data.user);
      nav("/");
    } catch (e) {
      setError(
        e.response?.data?.message || "Login failed"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page responsive-login-page">
      <div className="login-card responsive-login-card">
       
<div className="login-logo-container">
  <img
    src={logo}
    alt="Crave Corner Logo"
    className="login-title-logo"
  />
</div>


        <h1>Crave Corner</h1>

        <p>Fast Food Management System</p>

        <form
          onSubmit={submit}
          className="responsive-login-form"
        >
          <label>
            Username

            <div className="input-icon responsive-input-icon">
              <User size={17} />

              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                required
              />
            </div>
          </label>

          <label>
            Password

            <div className="input-icon responsive-input-icon">
              <Lock size={17} />

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
            </div>
          </label>

          {error && (
            <div className="error responsive-login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn primary full responsive-login-button"
            disabled={busy}
          >
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <small className="responsive-login-demo">
          Demo: admin/admin123 · cashier/cashier123 ·
          kitchen/kitchen123
        </small>
      </div>
    </div>
  );
}
