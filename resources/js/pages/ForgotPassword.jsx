import React, { useState } from "react";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await axios.post("/api/password/forgot", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Error al enviar el correo.");
    }
  };

  if (sent) {
    return (
      <div className="auth-bg-gradient min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 w-full max-w-sm mx-auto mt-20 text-center">
          <h2 className="text-2xl font-bold mb-4">¡Revisa tu correo!</h2>
          <p>Te hemos enviado un enlace para restablecer tu contraseña.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-bg-gradient min-h-screen flex items-center justify-center">
      <div className="glass-card p-8 w-full max-w-sm mx-auto mt-20">
        <h2 className="text-2xl font-bold mb-4">¿Olvidaste tu contraseña?</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            className="input glass w-full"
            placeholder="Tu correo"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          {error && <div className="text-red-500">{error}</div>}
          <button className="btn glass w-full" type="submit">
            Enviar enlace
          </button>
        </form>
      </div>
    </div>
  );
} 