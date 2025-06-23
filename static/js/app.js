const socket = io();
let allData = [];
let cityCharts = {}; // Her şehir için chart objelerini tutacak

// Weather icons mapping
const weatherIcons = {
    'açık': '☀️',
    'güneşli': '☀️',
    'parçalı bulutlu': '⛅',
    'bulutlu': '☁️',
    'yağmurlu': '🌧️',
    'hafif yağmurlu': '🌦️',
    'kar': '❄️',
    'sis': '🌫️',
    'default': '🌤️'
};

function getWeatherIcon(weather) {
    return weatherIcons[weather.toLowerCase()] || weatherIcons.default;
}

function renderStats(data) {
    const statsGrid = document.getElementById('statsGrid');
    const latestData = getLatestDataForEachCity(data);
    
    if (latestData.length === 0) {
        statsGrid.innerHTML = '<div class="loading">Henüz veri yok</div>';
        return;
    }
    
    statsGrid.innerHTML = '';
    
    latestData.forEach(cityData => {
        const statCard = document.createElement('div');
        statCard.className = 'stat-card';
        statCard.innerHTML = `
            <h3>${cityData.city}</h3>
            <div class="stat-value">
                ${cityData.temperature.toFixed(1)}<span class="stat-unit">°C</span>
            </div>
            <div class="stat-meta">
                <span class="weather-icon">${getWeatherIcon(cityData.weather)}</span>
                ${cityData.weather}
            </div>
            <div class="stat-meta">
                Nem: ${cityData.humidity}% | Rüzgar: ${cityData.wind_speed.toFixed(1)} m/s
            </div>
        `;
        statsGrid.appendChild(statCard);
    });
}

function getLatestDataForEachCity(data) {
    const cities = [...new Set(data.map(item => item.city))];
    return cities.map(city => {
        const cityData = data.filter(item => item.city === city);
        if (cityData.length === 0) return null;
        return cityData.reduce((latest, current) => 
            current.timestamp > latest.timestamp ? current : latest
        );
    }).filter(item => item !== null);
}

function renderCharts(data) {
    if (data.length === 0) {
        return;
    }

    const cities = [...new Set(data.map(item => item.city))];
    const cityChartsContainer = document.getElementById('cityCharts');
    
    // Container'ı temizle
    cityChartsContainer.innerHTML = '';
    
    // Mevcut chart'ları destroy et
    Object.values(cityCharts).forEach(chart => {
        if (chart) chart.destroy();
    });
    cityCharts = {};

    // Her şehir için ayrı grafik oluştur
    cities.forEach(city => {
        // Şehir verilerini filtrele ve sırala
        const cityData = data.filter(item => item.city === city)
                              .sort((a, b) => a.timestamp - b.timestamp)
                              .slice(-20); // Son 20 veri noktası

        if (cityData.length === 0) return;

        // Chart container oluştur
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.innerHTML = `
            <div class="chart-header">
                <div class="chart-title">${city}</div>
                <div class="city-badges">
                    <div class="city-badge">Sıcaklık: ${cityData[cityData.length - 1].temperature.toFixed(1)}°C</div>
                    <div class="city-badge">Nem: ${cityData[cityData.length - 1].humidity}%</div>
                </div>
            </div>
            <div class="canvas-wrapper">
                <canvas id="chart-${city.replace(/[^a-zA-Z0-9]/g, '')}"></canvas>
            </div>
        `;
        
        cityChartsContainer.appendChild(chartContainer);

        // Chart verilerini hazırla
        const labels = cityData.map(item => 
            new Date(item.timestamp * 1000).toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit'
            })
        );
        
        const temperatures = cityData.map(item => item.temperature);
        const humidities = cityData.map(item => item.humidity);

        // Chart oluştur
        const canvas = document.getElementById(`chart-${city.replace(/[^a-zA-Z0-9]/g, '')}`);
        const ctx = canvas.getContext('2d');
        
        cityCharts[city] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Sıcaklık (°C)',
                        data: temperatures,
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#e74c3c',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Nem (%)',
                        data: humidities,
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#3498db',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12,
                                weight: '500'
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#ddd',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                if (context.datasetIndex === 0) {
                                    return `Sıcaklık: ${context.parsed.y.toFixed(1)}°C`;
                                } else {
                                    return `Nem: ${context.parsed.y}%`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxTicksLimit: 8,
                            color: '#7f8c8d'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        grid: {
                            color: '#f0f0f0'
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '°C';
                            },
                            color: '#e74c3c'
                        },
                        title: {
                            display: true,
                            text: 'Sıcaklık (°C)',
                            color: '#e74c3c',
                            font: {
                                weight: '600'
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        min: 0,
                        max: 100,
                        grid: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            },
                            color: '#3498db'
                        },
                        title: {
                            display: true,
                            text: 'Nem (%)',
                            color: '#3498db',
                            font: {
                                weight: '600'
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    });
}

function prepareChartData(data) {
    const sortedData = data.sort((a, b) => a.timestamp - b.timestamp);
    const uniqueTimestamps = [...new Set(sortedData.map(d => d.timestamp))];
    
    // Son 20 zaman noktasını al
    const recentTimestamps = uniqueTimestamps.slice(-20);
    
    const labels = recentTimestamps.map(ts => 
        new Date(ts * 1000).toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
        })
    );

    const temperatures = {};
    const cities = [...new Set(data.map(d => d.city))];
    
    cities.forEach(city => {
        temperatures[city] = recentTimestamps.map(timestamp => {
            const dataPoint = sortedData.find(d => 
                d.city === city && d.timestamp === timestamp
            );
            return dataPoint ? dataPoint.temperature : null;
        });
    });

    return { labels, temperatures };
}

function getColor(index, alpha = 1) {
    const colors = [
        `rgba(52, 152, 219, ${alpha})`,  // Blue
        `rgba(231, 76, 60, ${alpha})`,   // Red
        `rgba(46, 204, 113, ${alpha})`,  // Green
        `rgba(155, 89, 182, ${alpha})`,  // Purple
        `rgba(241, 196, 15, ${alpha})`   // Yellow
    ];
    return colors[index % colors.length];
}

function updateLastUpdateTime() {
    const now = new Date();
    document.getElementById('lastUpdate').textContent = 
        `Son güncelleme: ${now.toLocaleString('tr-TR')}`;
}

function showError(message) {
    const statsGrid = document.getElementById('statsGrid');
    statsGrid.innerHTML = `<div class="error-message">${message}</div>`;
}

// Initialize dashboard
function initDashboard() {
    console.log('Dashboard başlatılıyor...');
    
    // API'den mevcut verileri al
    fetch('/api/weather')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('API\'den veri alındı:', data.length, 'kayıt');
            allData = data;
            
            if (data.length === 0) {
                showError('Henüz hava durumu verisi bulunmuyor. Producer\'ın çalıştığından emin olun.');
            } else {
                renderStats(allData);
                renderCharts(allData);
            }
            updateLastUpdateTime();
        })
        .catch(error => {
            console.error('API verisi alınırken hata:', error);
            showError('Veriler yüklenirken hata oluştu. Sunucunun çalıştığından emin olun.');
        });
}

// Socket.IO event handlers
socket.on('connect', function() {
    console.log('Socket.IO bağlantısı kuruldu');
});

socket.on('disconnect', function() {
    console.log('Socket.IO bağlantısı kesildi');
});

socket.on('weather_update', function(newData) {
    console.log('Yeni veri alındı:', newData);
    
    allData.push(newData);
    
    // Her şehir için son 50 veriyi tut (performans için)
    const cities = [...new Set(allData.map(d => d.city))];
    cities.forEach(city => {
        const cityData = allData.filter(d => d.city === city);
        if (cityData.length > 50) {
            const sorted = cityData.sort((a, b) => b.timestamp - a.timestamp);
            allData = allData.filter(d => d.city !== city);
            allData.push(...sorted.slice(0, 50));
        }
    });
    
    renderStats(allData);
    renderCharts(allData);
    updateLastUpdateTime();
});

socket.on('connect_error', function(error) {
    console.error('Socket.IO bağlantı hatası:', error);
    showError('Gerçek zamanlı bağlantı kurulamadı. Sayfa yenilemeyi deneyin.');
});

// Socket.IO debug
socket.on('connect', function() {
    console.log('✅ Socket.IO bağlantısı kuruldu');
});

socket.on('disconnect', function() {
    console.log('❌ Socket.IO bağlantısı kesildi');
});

socket.on('weather_update', function(newData) {
    console.log('🎉 YENİ VERİ ALINDI:', newData);
    
    allData.push(newData);
    
    // Her şehir için son 50 veriyi tut (performans için)
    const cities = [...new Set(allData.map(d => d.city))];
    cities.forEach(city => {
        const cityData = allData.filter(d => d.city === city);
        if (cityData.length > 50) {
            const sorted = cityData.sort((a, b) => b.timestamp - a.timestamp);
            allData = allData.filter(d => d.city !== city);
            allData.push(...sorted.slice(0, 50));
        }
    });
    
    console.log('📊 Dashboard güncelleniyor...');
    renderStats(allData);
    renderCharts(allData);
    updateLastUpdateTime();
});

socket.on('test_response', function(data) {
    console.log('✅ Test yanıtı:', data);
});

socket.on('connect_error', function(error) {
    console.error('❌ Socket.IO bağlantı hatası:', error);
    showError('Gerçek zamanlı bağlantı kurulamadı. Sayfa yenilemeyi deneyin.');
});

// Start the dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Dashboard başlatılıyor...');
    initDashboard();
});