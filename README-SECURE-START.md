# CampPal güvenli çalıştırma

## İlk kurulum

Mac Terminal'de proje klasörüne girip çalıştırın:

```bash
chmod +x setup-secure.sh
./setup-secure.sh
```

Script güçlü ve rastgele bir JWT anahtarı üretir, yalnızca yerel bilgisayarınızda kalan `camping-system-backend/.env` dosyasını oluşturur ve Docker servislerini başlatır.

## Sonraki çalıştırmalar

```bash
docker compose up --build -d
```

Durdurmak için:

```bash
docker compose down
```

Veritabanını da tamamen sıfırlamak için yalnızca gerektiğinde:

```bash
docker compose down -v
```

## Bildirim ayarları

E-posta veya SMS kullanacaksanız `camping-system-backend/.env` içine SMTP/Twilio değerlerini ekleyin. Bu dosyayı GitHub'a yüklemeyin ve başka kişilere göndermeyin.

## Önemli

Önceki ZIP içinde bulunan SMTP, Twilio veya JWT bilgileri gerçekse bunları sağlayıcı panellerinden değiştirin. Eski anahtarlar artık güvenli kabul edilmemelidir.

## Yönetici girişi

`SYSTEM_ADMIN` rolündeki hesaplar doğru parola ile doğrudan giriş yapar ve e-posta/SMS doğrulama kodu istemez. Diğer kullanıcı rollerinde OTP doğrulaması devam eder.
