@echo off
title ShopApp Controller
echo ===================================================
echo   DANG KHOI CHAY SHOP APP (MAY AO VA UNG DUNG)
echo ===================================================

echo [1/3] Don dep file khoa may ao cu...
del /f /s /q "%USERPROFILE%\.android\avd\*.lock" >nul 2>&1

echo [2/3] Khoi dong May Ao Android (Cua so Desktop)...
start "" "%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe" -avd Medium_Phone_API_36.1

echo [3/3] Cho may ao ket noi ADB va nap ShopApp...
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" wait-for-device
echo [OK] May ao da san sang! Dang thiet lap cong Metro va mo ShopApp...
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" reverse tcp:8081 tcp:8081
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" shell am start -n com.shopapp/com.androidtemplate.MainActivity

echo ===================================================
echo [HOAN TAT] ShopApp da duoc mo tren may ao!
echo ===================================================
pause
