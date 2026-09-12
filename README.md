# Lacivert Sports Desktop

Windows 10/11 için Electron tabanlı masaüstü yayın paneli.

## Özellikler
- Siyah-kırmızı profesyonel yayın paneli
- F11 tam ekran
- Kanal adı veya yayın ID'si ile arama
- Ana ve yedek yayın sunucusu arasında geçiş
- Aynı kanal ID'sini iki farklı yayın adresinde kullanma
- Açılışta ilk kanalı otomatik oynatma
- Yayını yenileme ve tam ekran yatay izleme
- Sistem tepsisine küçültme
- Uygulamanın yerel yayın panelini doğrudan açma
- Çarpı düğmesine basıldığında uygulamayı ve tüm yayın sesini tamamen kapatma
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
