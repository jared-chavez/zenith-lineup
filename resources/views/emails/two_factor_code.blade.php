<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Código de verificación 2FA - Zenith Lineup</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { background: #f7fafc; font-family: 'Figtree', Arial, sans-serif; color: #222; margin: 0; padding: 0; }
    .container { max-width: 420px; margin: 40px auto; background: #fff; border-radius: 1.2rem; box-shadow: 0 4px 24px 0 rgba(34,197,94,0.13); padding: 2.5rem 2rem; }
    .logo { display: flex; justify-content: center; margin-bottom: 1.5rem; }
    .title { font-size: 1.5rem; font-weight: bold; color: #16a34a; text-align: center; margin-bottom: 0.5rem; }
    .subtitle { color: #64748b; text-align: center; margin-bottom: 1.5rem; }
    .code-block { background: #f0fdf4; color: #16a34a; font-weight: bold; font-size: 1.6rem; border-radius: 0.6rem; padding: 1.2rem 1.2rem; text-align: center; letter-spacing: 4px; margin: 1.2rem 0; }
    .info { font-size: 0.98rem; color: #475569; margin-bottom: 1.2rem; }
    .footer { text-align: center; color: #a0aec0; font-size: 0.9rem; margin-top: 2rem; }
    .small { font-size: 0.92rem; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <!-- Bonsai SVG logo -->
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="36" cy="12" r="8" fill="#FACC15"/><ellipse cx="20" cy="32" rx="14" ry="10" fill="#22c55e"/><rect x="18" y="32" width="4" height="10" rx="2" fill="#14532d"/><ellipse cx="24" cy="22" rx="10" ry="7" fill="#4ade80"/><ellipse cx="30" cy="18" rx="6" ry="4" fill="#bbf7d0"/></svg>
    </div>
    <div class="title">Código de verificación</div>
    <div class="subtitle">Hola <b>{{ $name }}</b> ({{ $email }})</div>
    <div class="info">
      Usa el siguiente código para completar tu inicio de sesión seguro en Zenith Lineup:
    </div>
    <div class="code-block">{{ $code }}</div>
    <div class="info small">
      Solicitud desde IP: <b>{{ $ip }}</b><br>
      URL: <b>{{ $url }}</b>
    </div>
    <div class="footer">
      © {{ date('Y') }} Zenith Lineup<br>
      <span class="small">Si no reconoces esta actividad, cambia tu contraseña y contacta soporte.</span>
    </div>
  </div>
</body>
</html> 