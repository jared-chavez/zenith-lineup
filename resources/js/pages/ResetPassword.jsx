import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== password_confirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    try {
      await axios.post("/api/password/reset", {
        token,
        password,
        password_confirmation,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Error al restablecer la contraseña.");
    }
  };

  if (success) {
    return (
      <div className="auth-bg-gradient min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 w-full max-w-sm mx-auto mt-20 text-center">
          <h2 className="text-2xl font-bold mb-4">¡Contraseña actualizada!</h2>
          <p>Redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-bg-gradient min-h-screen flex items-center justify-center">
      <div className="glass-card p-8 w-full max-w-sm mx-auto mt-20">
        <h2 className="text-2xl font-bold mb-4">Restablece tu contraseña</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            className="input glass w-full"
            placeholder="Nueva contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            className="input glass w-full"
            placeholder="Confirmar contraseña"
            value={password_confirmation}
            onChange={e => setPasswordConfirmation(e.target.value)}
            required
          />
          {error && <div className="text-red-500">{error}</div>}
          <button className="btn glass w-full" type="submit">
            Guardar nueva contraseña
          </button>
        </form>
      </div>
    </div>
  );
} 