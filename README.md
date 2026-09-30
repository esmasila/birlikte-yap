# Birlikte Yap

Kadikoy'de yakinindaki etkinlikleri kesfetmek ve birlikte katilacak kisiler bulmak icin hazirlanan React + TypeScript MVP.

## Calistirma

```bash
npm install
npm run dev
```

Production build kontrolu:

```bash
npm run build
```

## MVP kapsami

- Etkinlik kesfetme, arama ve kategori/konum filtreleri
- Etkinlik detaylarini goruntuleme
- Etkinlige katilma ve katilim sayisini guncelleme
- Yeni etkinlik olusturma
- Paylasim butonu
- Verileri tarayicida `localStorage` ile koruma

Bu ilk surum backend kullanmaz. Bu nedenle kullanicilar arasinda ortak veri icin sonraki asamada Supabase veya benzeri bir backend eklenmelidir.

## Yayinlama

Projeyi GitHub'a push ettikten sonra Vercel veya Netlify'da yeni proje olarak ice aktarilabilir. Build komutu `npm run build`, cikti klasoru `dist` olmalidir.