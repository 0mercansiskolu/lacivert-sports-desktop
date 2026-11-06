# Larcivert Sports Browser v0.1.0

Windows (Electron/Chromium) ve Android (Kotlin/WebView) için başlangıç düzeyinde internet tarayıcısı kaynak kodları.

## Windows
Windows 10/11 ve Node.js kurulu bilgisayarda `cd desktop`, `npm install`, `npm start` komutlarını çalıştırın. Windows EXE üretimi: `npm run dist:win`.

## Android
Android Studio ile `android/` klasörünü açın, Android SDK Platform 35 ve JDK 17 kullanın. Gradle senkronizasyonunun ardından Build > Build APK(s) seçeneğini kullanın. Gradle wrapper JAR bu projede bulunmaz.

## Özellikler
Sekmeli web gezintisi, adres ve arama çubuğu, gezinme kontrolleri, yer imleri, Windows geçmiş kaydı ve temel dosya indirmeleri.

## Uyarı
Bu kod MVP'dir, tamamlanmış bir Chrome alternatifi değildir. Henüz derlenmiş EXE/APK sağlanmıyor. Özel mod, gelişmiş güvenlik denetimleri, kapsamlı testler ve otomatik güncelleme tamamlanmadı. Yerel cihazlarda derleme ve test gereklidir.
