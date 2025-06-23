from flask import Flask, render_template, jsonify
from flask_socketio import SocketIO
from pymongo import MongoClient
import threading
import time
from datetime import datetime

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

client = MongoClient("mongodb://localhost:27017/")
db = client["weather_db"]
collection = db["weather_data"]

# Son kontrol edilen timestamp
last_checked_timestamp = 0
polling_active = False

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/weather")
def api_weather():
    data = list(collection.find({}, {"_id": 0}))
    return jsonify(data)

def poll_for_new_data():
    """3 saniyede bir yeni veri kontrol et"""
    global last_checked_timestamp, polling_active
    
    print("🔄 Polling başlatılıyor...")
    polling_active = True
    
    # İlk çalıştırmada son timestamp'i al
    try:
        latest_doc = list(collection.find().sort("timestamp", -1).limit(1))
        if latest_doc:
            last_checked_timestamp = latest_doc[0]["timestamp"]
            print(f"📅 Başlangıç timestamp: {last_checked_timestamp} ({datetime.fromtimestamp(last_checked_timestamp)})")
        else:
            last_checked_timestamp = time.time()
            print(f"📅 Veri yok, şu anki zaman: {last_checked_timestamp}")
    except Exception as e:
        print(f"❌ Başlangıç timestamp hatası: {e}")
        last_checked_timestamp = time.time()
    
    while polling_active:
        try:
            print(f"🔍 Polling kontrol - Son timestamp: {last_checked_timestamp}")
            
            # Son kontrol edilen timestamp'ten sonraki verileri al
            new_docs = list(collection.find(
                {"timestamp": {"$gt": last_checked_timestamp}},
                {"_id": 0}
            ).sort("timestamp", 1))
            
            print(f"📊 {len(new_docs)} yeni veri bulundu")
            
            if new_docs:
                for doc in new_docs:
                    print(f"📤 Socket.IO'ya gönderiliyor: {doc['city']} - {doc['temperature']}°C - {datetime.fromtimestamp(doc['timestamp'])}")
                    socketio.emit("weather_update", doc)
                    last_checked_timestamp = doc["timestamp"]
                print(f"✅ {len(new_docs)} veri gönderildi!")
            else:
                print("😴 Yeni veri yok")
            
            time.sleep(3)  # 3 saniye bekle
            
        except Exception as e:
            print(f"❌ Polling hatası: {e}")
            time.sleep(3)

@socketio.on("connect")
def handle_connect():
    global polling_active
    print("🔗 Client bağlandı - Socket.IO çalışıyor!")
    
    # Polling'i sadece bir kez başlat
    if not polling_active:
        threading.Thread(target=poll_for_new_data, daemon=True).start()
        print("🚀 Polling thread başlatıldı!")

@socketio.on("disconnect")
def handle_disconnect():
    print("❌ Client bağlantısı kesildi")

@socketio.on("test_message")
def handle_test(data):
    print(f"🧪 Test mesajı alındı: {data}")
    socketio.emit("test_response", {"message": "Test başarılı!"})

if __name__ == "__main__":
    # Manuel test için
    print("🚀 Flask SocketIO başlatılıyor...")
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
else:
    # Flask CLI için
    with app.app_context():
        if not polling_active:
            threading.Thread(target=poll_for_new_data, daemon=True).start()
            print("🚀 Background polling başlatıldı!")