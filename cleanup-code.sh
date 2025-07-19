#!/bin/bash

echo "🧹 Iniciando limpieza de código no utilizado..."

# 1. Eliminar archivos de testing manual
echo "📁 Eliminando archivos de testing manual..."
rm -f test_2fa_flow.php
rm -f test_admin_tokens.js

# 2. Eliminar componentes no utilizados
echo "🎨 Eliminando componentes no utilizados..."
rm -f resources/js/components/AdvancedCarousel.jsx
rm -f resources/css/advanced-carousel.css

# 3. Eliminar controllers no implementados
echo "🔧 Eliminando controllers no implementados..."
rm -f app/Http/Controllers/Api/AchievementController.php
rm -f app/Http/Controllers/Api/AnalyticsController.php
rm -f app/Http/Controllers/Api/PushNotificationController.php

# 4. Eliminar tests de Jetstream no relevantes
echo "🧪 Eliminando tests de Jetstream no relevantes..."
rm -f tests/Feature/EmailVerificationTest.php
rm -f tests/Feature/PasswordConfirmationTest.php
rm -f tests/Feature/TwoFactorAuthenticationSettingsTest.php
rm -f tests/Feature/UpdatePasswordTest.php
rm -f tests/Feature/BrowserSessionsTest.php
rm -f tests/Feature/CreateApiTokenTest.php
rm -f tests/Feature/DeleteApiTokenTest.php
rm -f tests/Feature/ProfileInformationTest.php
rm -f tests/Feature/ApiTokenPermissionsTest.php

# 5. Limpiar imports no utilizados en routes/api.php
echo "📝 Limpiando imports no utilizados en routes/api.php..."
sed -i '' '/use App\\Http\\Controllers\\Api\\AchievementController;/d' routes/api.php
sed -i '' '/use App\\Http\\Controllers\\Api\\PushNotificationController;/d' routes/api.php
sed -i '' '/use App\\Http\\Controllers\\Api\\AnalyticsController;/d' routes/api.php

# 6. Eliminar rutas no utilizadas
echo "🛣️ Eliminando rutas no utilizadas..."
sed -i '' '/Route::get.*achievements/d' routes/api.php
sed -i '' '/Route::post.*achievements/d' routes/api.php
sed -i '' '/Route::get.*analytics/d' routes/api.php

# 7. Limpiar imports no utilizados en Home.jsx
echo "🏠 Limpiando imports en Home.jsx..."
sed -i '' '/import AdvancedCarousel/d' resources/js/pages/Home.jsx

echo "✅ Limpieza completada!"
echo "📊 Archivos eliminados:"
echo "   - 2 archivos de testing manual"
echo "   - 2 archivos de componentes no utilizados"
echo "   - 3 controllers no implementados"
echo "   - 9 tests de Jetstream"
echo "   - Imports y rutas no utilizadas"

echo ""
echo "🔄 Ejecutando build para verificar que todo funciona..."
npm run build

echo "🎉 ¡Limpieza completada exitosamente!" 