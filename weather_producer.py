from kafka import KafkaProducer
import requests
import json
import time

API_KEY = "abe82ab3c8b83ffeed68aeb4d0d574eb"
CITIES = ["Istanbul", "Ankara", "Izmir", "Gaziantep", "Samsun"]  
INTERVAL = 10  # saniye

producer = KafkaProducer(
    bootstrap_servers='localhost:9092',
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

TOPIC = 'weather'

def fetch_weather(city):
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric&lang=tr"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        weather_data = {
            "city": city,
            "temperature": data["main"]["temp"],
            "humidity": data["main"]["humidity"],
            "weather": data["weather"][0]["description"],
            "wind_speed": data["wind"]["speed"],
            "timestamp": data["dt"]
        }
        return weather_data
    else:
        print(f"{city} için API isteği başarısız:", response.text)
        return None

print(f"{len(CITIES)} şehirden hava durumu verileri Kafka'ya gönderiliyor...")

try:
    while True:
        for city in CITIES:
            weather = fetch_weather(city)
            if weather:
                producer.send(TOPIC, value=weather)
                print("Gönderildi:", weather)
            time.sleep(2)  # API'yı spamlememek için biraz bekleyelim
        time.sleep(INTERVAL)
except KeyboardInterrupt:
    print("Durduruldu.")
finally:
    producer.close()
