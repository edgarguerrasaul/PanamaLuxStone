# Panama LuxeStone - preparar y arrancar el sitio en localhost en un solo paso.
#
# Uso (desde la carpeta ecommerce, en PowerShell):
#   powershell -ExecutionPolicy Bypass -File setup-local.ps1
# o, si ya permitiste scripts locales:
#   .\setup-local.ps1
#
# Es seguro correrlo mas de una vez: no duplica variables en .env ni
# reinstala nada que ya este listo.

$ErrorActionPreference = "Stop"

Write-Host "== Panama LuxeStone: preparando entorno local ==" -ForegroundColor Cyan

# 1) Crear .env si no existe
if (-not (Test-Path ".env")) {
    Write-Host "No existe .env, lo creo a partir de .env.example..."
    Copy-Item ".env.example" ".env"
}

$envText = Get-Content ".env" -Raw

# 2) Agregar variables nuevas que .env todavia no tenga (SESSION_SECRET,
#    ADMIN_EMAIL, ADMIN_PASSWORD_HASH vacio) sin tocar lo que ya tienes.
if ($envText -notmatch "SESSION_SECRET=") {
    Add-Content ".env" "`nSESSION_SECRET=`"732901c6e6c0f950b77be8b27f643269f969d95aa39811eed3c26cdd4c83a589`""
    Write-Host "Agregado SESSION_SECRET a .env"
}

if ($envText -notmatch "ADMIN_EMAIL=") {
    Add-Content ".env" "`nADMIN_EMAIL=`"admin@panamaluxestone.com`""
    Write-Host "Agregado ADMIN_EMAIL a .env (cambialo por el correo que quieras usar)"
}

if ($envText -notmatch "ADMIN_PASSWORD_HASH=") {
    Add-Content ".env" "`nADMIN_PASSWORD_HASH=`"`""
}

# 3) Instalar dependencias si hace falta
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias (npm install)..."
    npm install
}

# 4) Aplicar el schema nuevo y cargar el catalogo + zonas de acarreo
Write-Host "Actualizando la base de datos local..."
npm run db:push
npm run db:seed

# 5) Avisar si falta configurar la contrasena del panel /admin
$envText = Get-Content ".env" -Raw
if ($envText -match 'ADMIN_PASSWORD_HASH=""' -or $envText -match "ADMIN_PASSWORD_HASH=''") {
    Write-Host ""
    Write-Host "AVISO: todavia no configuraste tu contrasena del panel /admin." -ForegroundColor Yellow
    Write-Host "Cuando quieras activarlo, corre esto en OTRA terminal (con el" -ForegroundColor Yellow
    Write-Host "servidor corriendo) y pega la linea que te imprime en tu .env:" -ForegroundColor Yellow
    Write-Host '  node scripts/hash-password.mjs "tu-contrasena-segura"' -ForegroundColor Yellow
    Write-Host "Luego reinicia 'npm run dev' para que tome el cambio." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Listo. Abriendo el sitio..." -ForegroundColor Cyan
Write-Host "  Sitio:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Admin:  http://localhost:3000/admin/login" -ForegroundColor Cyan
Write-Host ""

npm run dev
