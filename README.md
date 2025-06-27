# ⛅ Kafka Hava Durumu Dashboard

Kafka streaming, MongoDB, Flask ve Socket.IO kullanarak Türkiye'nin büyük şehirleri için gerçek zamanlı hava durumu izleme dashboard'u.


## 🌟 Özellikler

- ⚡ **Apache Kafka ile gerçek zamanlı veri akışı**
- 🌍 **5 büyük Türk şehri** için hava durumu (İstanbul, Ankara, İzmir, Gaziantep, Samsun)
- 📊 **Canlı dashboard** interaktif grafiklerle
- 🔄 **Otomatik güncellenen** sıcaklık ve nem grafikleri
- 📱 **Responsive tasarım** mobil ve masaüstü uyumlu
- 🎨 **Temiz, modern arayüz** her şehir için ayrı grafiklerle

## 🛠️ Teknoloji Stack

- **Backend**: Python, Flask, Socket.IO
- **Streaming**: Apache Kafka
- **Veritabanı**: MongoDB
- **Frontend**: HTML5, CSS3, JavaScript, Chart.js
- **API**: OpenWeatherMap API

## 📋 Gereksinimler

- Python 3.8+
- Apache Kafka
- MongoDB
- OpenWeatherMap API Anahtarı

## 🚀 Kurulum

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/kullaniciadi/kafka-hava-durumu-dashboard.git
cd kafka-hava-durumu-dashboard
```

### 2. Bağımlılıkları Yükleyin
```bash
pip install flask flask-socketio pymongo kafka-python requests
```

### 3. Kafka Kurulumu
```bash
docker-compose -f docker-compose.yaml up -d
```

### 4. MongoDB Kurulumu
```bash
# MongoDB servisini başlatın
mongod
```

### 5. API Anahtarını Yapılandırın
`producer.py` dosyasını açın ve API anahtarını değiştirin:
```python
API_KEY = "buraya_openweathermap_api_anahtariniz"
```

## 🎯 Kullanım

### 1. Flask Uygulamasını Başlatın
```bash
python app.py
```

### 2. Veri Üreticisini Başlatın
```bash
python producer.py
```

### 3. Veri Tüketicisini Başlatın
```bash
python consumer.py
```

### 4. Dashboard'u Açın
Tarayıcınızda `http://localhost:5000` adresine gidin.

## 📊 Mimari

```
OpenWeatherMap API → Producer → Kafka → Consumer → MongoDB
                                                      ↓
                            Flask App ← Socket.IO ← Polling
                                ↓
                         Web Dashboard
```

## 🗂️ Proje Yapısı

```
kafka-hava-durumu-dashboard/
├── app.py                 # Socket.IO ile Flask uygulaması
├── producer.py           # Kafka producer (veri toplayıcı)
├── consumer.py           # Kafka consumer (veri işleyici)
├── templates/
│   └── index.html        # Dashboard HTML şablonu
├── static/
│   ├── css/
│   │   └── style.css     # Dashboard stilleri
│   └── js/
│       └── app.js        # Frontend JavaScript
└── README.md
```

## 🌡️ Dashboard Özellikleri

### Şehir Kartları
- Güncel sıcaklık ve nem oranı
- Emoji ikonlarıyla hava durumu
- Rüzgar hızı bilgisi

### Şehir Bazlı Grafikler
- **Sıcaklık trendleri** (gradyan dolgulu kırmızı çizgi)
- **Nem seviyeleri** (mavi çizgi)
- **Çift Y ekseni** daha iyi veri görselleştirme için
- **Gerçek zamanlı güncellemeler** her 10 saniyede

## ⚙️ Yapılandırma

### Producer Ayarları
```python
CITIES = ["Istanbul", "Ankara", "Izmir", "Gaziantep", "Samsun"]
INTERVAL = 10  # Veri toplama aralığı (saniye)
```

### Consumer Ayarları
```python
TOPIC = 'weather'
GROUP_ID = 'weather-group'
```

## 📈 Veri Akışı

1. **Producer** her 10 saniyede OpenWeatherMap API'den hava durumu verisi alır
2. **Kafka** verileri `weather` topic'i üzerinden akış halinde iletir
3. **Consumer** verileri işler ve MongoDB'ye kaydeder
4. **Flask uygulaması** her 3 saniyede MongoDB'yi yeni veri için kontrol eder
5. **Socket.IO** güncellemeleri bağlı tarayıcılara gönderir
6. **Dashboard** grafikleri ve istatistikleri otomatik günceller

## 🎨 Arayüz Tasarımı

- **Minimalist tasarım** temiz tipografi ile
- **Kart tabanlı düzen** kolay tarama için
- **Responsive grid** ekran boyutuna uyum sağlar
- **Yumuşak animasyonlar** ve hover efektleri
- **Renk kodlu veriler** (sıcaklık kırmızı, nem mavi)

## 🔧 Sorun Giderme

### Yaygın Sorunlar

**Kafka Bağlantı Hatası**
```bash
# Kafka'nın çalışıp çalışmadığını kontrol edin
jps | grep Kafka
```

**MongoDB Bağlantı Hatası**
```bash
# MongoDB durumunu kontrol edin
mongo --eval "db.runCommand('ping')"
```

**API Sınır Aşımı**
- OpenWeatherMap ücretsiz katman: 60 çağrı/dakika
- Gerekirse producer.py'deki `INTERVAL` değerini ayarlayın

**Gerçek Zamanlı Güncellemeler Çalışmıyor**
- Flask uygulamasını yeniden başlatın
- Tarayıcı konsolunda Socket.IO hatalarını kontrol edin
- Tüm servislerin çalıştığını doğrulayın

## 📝 API Referansı

### Hava Durumu Veri Yapısı
```json
{
  "city": "Istanbul",
  "temperature": 25.1,
  "humidity": 60,
  "weather": "açık",
  "wind_speed": 12.3,
  "timestamp": 1719149520
}
```

### Endpoint'ler
- `GET /` - Dashboard sayfası
- `GET /api/weather` - Tüm hava durumu verileri (JSON)

## 🚀 Gelecek Geliştirmeler

- [ ] Hava durumu uyarıları ve bildirimleri
- [ ] Geçmiş veri analizi
- [ ] Daha fazla şehir ve ülke
- [ ] Hava durumu tahmini
- [ ] Veri dışa aktarma özelliği
- [ ] Mobil uygulama

