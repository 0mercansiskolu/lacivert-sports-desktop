# Lacivert Sports Desktop

Windows 10/11 için Electron tabanlı masaüstü yayın paneli.

## Özellikler
- Çerçevesiz masaüstü pencere ve özel pencere kontrolleri
- F11 tam ekran
- Kanal arama
- Favoriler (yerel olarak saklanır)
- Son izlenen kanalı hatırlama
- Yayın yenileme
- Her zaman üstte modu
- Sistem tepsisine küçültme
- Kullanıcının kendi yetkili yayın/oynatıcı bağlantılarını ekleyip silmesi
- NSIS kurulum ve portable EXE paketleme ayarları
- contextIsolation + sandbox + preload API güvenlik yapısı

## Geliştirici çalıştırması
```bash
npm install
npm start
```

## Windows EXE üretme
Windows üzerinde:
```bash
npm install
npm run dist
```

Çıktılar `dist/` klasörüne gelir.

> Yalnızca kullanım/yayın hakkına sahip olduğunuz veya yasal olarak erişilebilir yayın kaynaklarını uygulamaya ekleyin.
