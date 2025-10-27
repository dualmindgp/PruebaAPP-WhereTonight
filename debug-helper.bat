@echo off
echo ============================================
echo   WhereTonight - Debug Helper
echo ============================================
echo.

:menu
echo Selecciona una opcion:
echo.
echo 1. Ver logs en tiempo real
echo 2. Ver solo errores
echo 3. Limpiar logs
echo 4. Abrir Chrome DevTools (inspect)
echo 5. Reinstalar app en dispositivo
echo 6. Build y sync rapido
echo 7. Ver dispositivos conectados
echo 8. Abrir Android Studio
echo 9. Salir
echo.
set /p option="Opcion (1-9): "

if "%option%"=="1" goto logs
if "%option%"=="2" goto errors
if "%option%"=="3" goto clear
if "%option%"=="4" goto devtools
if "%option%"=="5" goto reinstall
if "%option%"=="6" goto build
if "%option%"=="7" goto devices
if "%option%"=="8" goto studio
if "%option%"=="9" goto end

echo Opcion invalida
goto menu

:logs
echo.
echo Mostrando logs en tiempo real...
echo Presiona Ctrl+C para detener
echo.
npx cap run android
goto menu

:errors
echo.
echo Mostrando solo ERRORES...
echo Presiona Ctrl+C para detener
echo.
adb logcat *:E
goto menu

:clear
echo.
echo Limpiando logs...
adb logcat -c
echo Logs limpiados!
echo.
pause
goto menu

:devtools
echo.
echo Abriendo Chrome DevTools...
echo.
echo 1. Asegurate de que tu dispositivo este conectado
echo 2. Asegurate de que la app este abierta
echo 3. Ve a chrome://inspect en Chrome
echo.
start chrome chrome://inspect
pause
goto menu

:reinstall
echo.
echo Desinstalando app anterior...
adb uninstall com.wheretonight.app
echo.
echo Haciendo build...
call npm run build
echo.
echo Sincronizando...
call npx cap sync
echo.
echo Instalando en dispositivo...
call npx cap run android
echo.
echo Listo!
pause
goto menu

:build
echo.
echo Haciendo build rapido...
call npm run build
echo.
echo Copiando assets...
call npx cap copy android
echo.
echo Listo! Ahora ejecuta la app desde Android Studio
pause
goto menu

:devices
echo.
echo Dispositivos conectados:
echo.
adb devices
echo.
pause
goto menu

:studio
echo.
echo Abriendo Android Studio...
call npx cap open android
goto end

:end
echo.
echo Adios!
exit
