# AI Haberleri

Model çıkışları, araştırma ve Türkiye'den yapay zeka haberlerini kısa Türkçe özetler ve orijinal kaynak linkleriyle listeleyen tek sayfalık site.

- `index.html`: sayfa. `news.json` dosyasını okur.
- `news.json`: son 30 günün haberleri. 08:00–24:00 arası iki saatte bir bulutta çalışan bir Claude görevi tarafından güncellenir.
- `archive/`: 30 günden eski haberler, ay ay.
- `NEWS_UPDATE.md`: o görevin talimatı (kaynaklar, seçim kuralları, format).
- `scripts/validate.mjs`: `news.json` kontrolü. `scripts/xdate.mjs`: X paylaşımının zamanını linkinden hesaplar. `scripts/archive.mjs`: eski haberleri arşive taşır.

Haberlerin içeriği kendi kaynaklarına aittir; bu sayfa yalnızca kısa özet ve link verir.
