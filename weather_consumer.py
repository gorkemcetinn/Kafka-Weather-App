from kafka import KafkaConsumer
from pymongo import MongoClient
import json

# MongoDB bağlantısı
mongo_client = MongoClient("mongodb://localhost:27017/")
db = mongo_client["weather_db"]
collection = db["weather_data"]

# Kafka consumer ayarları
consumer = KafkaConsumer(
    "weather",
    bootstrap_servers="localhost:9092",
    auto_offset_reset="earliest",
    enable_auto_commit=True,
    group_id="weather-group",
    value_deserializer=lambda v: json.loads(v.decode("utf-8"))
)

print("Kafka'dan hava durumu verileri dinleniyor ve MongoDB'ye kaydediliyor...")

for message in consumer:
    weather_data = message.value
    print("Alındı:", weather_data)
    collection.insert_one(weather_data)
