# Fizik Tedavi Takip

Mobil-first, backend kullanmayan basit fizik tedavi takip MVP'si.

## Kurulum

```bash
npm install
npm run dev
```

Uygulama varsayilan olarak `http://localhost:3000` adresinde calisir.

## Ozellikler

- Next.js App Router, TypeScript ve Tailwind CSS
- IndexedDB uzerinde Dexie.js ile local veri saklama
- Ilk acilista ornek hareketler ve aktif ornek program
- Hareket ekleme, duzenleme, silme ve fotograf yukleme
- Program olusturma, duzenleme, silme, aktif program secme ve hareket siralama
- Bugun ekraninda set set takip ve otomatik ilerleme yuzdesi
- Gunluk takip kayitlari ve basit gecmis listesi
- Offline kullanima uygun local-first yapi

Veriler yalnizca kullanicinin cihazindaki IndexedDB icinde saklanir; sunucu, auth, API veya database yoktur.
