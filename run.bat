@echo off
title MP43 Downloader Server
echo ==================================================
echo   Menjalankan MP43 Downloader...
echo ==================================================

:: Membuka peramban secara otomatis
start "" "http://localhost:5000"

:: Menjalankan server Python
python server.py
pause
