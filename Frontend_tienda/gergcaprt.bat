@echo off
echo Creando estructura de carpetas...

REM Auth
mkdir src\app\features\auth\pages\login
mkdir src\app\features\auth\pages\register
mkdir src\app\features\auth\pages\profile
mkdir src\app\features\auth\services
mkdir src\app\features\auth\models
mkdir src\app\features\auth\guards
type nul > src\app\features\auth\auth.routes.ts

REM Catalog
mkdir src\app\features\catalog\pages\product-list
mkdir src\app\features\catalog\pages\product-detail
mkdir src\app\features\catalog\services
mkdir src\app\features\catalog\models
type nul > src\app\features\catalog\catalog.routes.ts

REM Cart
mkdir src\app\features\cart\pages
mkdir src\app\features\cart\services
type nul > src\app\features\cart\cart.routes.ts

REM Checkout
mkdir src\app\features\checkout\pages
mkdir src\app\features\checkout\services
type nul > src\app\features\checkout\checkout.routes.ts

REM Admin
mkdir src\app\features\admin\pages\dashboard
mkdir src\app\features\admin\pages\products
mkdir src\app\features\admin\pages\orders
mkdir src\app\features\admin\services
type nul > src\app\features\admin\admin.routes.ts

REM Core
mkdir src\app\core\services
mkdir src\app\core\interceptors
mkdir src\app\core\models

REM Shared
mkdir src\app\shared\components\header
mkdir src\app\shared\components\footer

echo ✅ Estructura creada exitosamente!
pause