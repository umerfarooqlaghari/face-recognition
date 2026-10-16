import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

interface MobileOsmMapPickerProps {
  lat: number;
  lng: number;
  radius?: number;
  onChange: (lat: number, lng: number) => void;
  height?: number;
}

export const MobileOsmMapPicker: React.FC<MobileOsmMapPickerProps> = ({
  lat,
  lng,
  radius = 200,
  onChange,
  height = 220,
}) => {
  const webViewRef = useRef<WebView>(null);
  const initialLat = Number.isFinite(lat) && lat !== 0 ? lat : 37.7749;
  const initialLng = Number.isFinite(lng) && lng !== 0 ? lng : -122.4194;
  const initialRadius = Number.isFinite(radius) && radius > 0 ? radius : 200;

  // Sync external lat/lng/radius changes to the map
  useEffect(() => {
    if (Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0) {
      const script = `
        if (window.updateCenter) {
          window.updateCenter(${lat}, ${lng}, ${radius || 200});
        }
        true;
      `;
      webViewRef.current?.injectJavaScript(script);
    }
  }, [lat, lng, radius]);

  const mapHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body, #map {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: #f8fafc;
      overflow: hidden;
    }
    .custom-pin {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      border: 2px solid #ffffff;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 10px rgba(2, 132, 199, 0.45);
    }
    .custom-pin svg {
      transform: rotate(45deg);
      width: 18px;
      height: 18px;
      fill: #ffffff;
    }
    .leaflet-control-attribution {
      font-size: 9px !important;
      background: rgba(255, 255, 255, 0.8) !important;
      padding: 1px 4px !important;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var currentLat = ${initialLat};
    var currentLng = ${initialLng};
    var currentRadius = ${initialRadius};

    var map = L.map('map', {
      center: [currentLat, currentLng],
      zoom: 15,
      zoomControl: false,
      attributionControl: true
    });

    // OpenStreetMap official tiles
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    var pinIcon = L.divIcon({
      className: 'custom-pin-wrapper',
      html: '<div class="custom-pin"><svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>',
      iconSize: [34, 34],
      iconAnchor: [17, 34]
    });

    var marker = L.marker([currentLat, currentLng], {
      icon: pinIcon,
      draggable: true
    }).addTo(map);

    var circle = L.circle([currentLat, currentLng], {
      radius: currentRadius,
      color: '#0284c7',
      fillColor: '#38bdf8',
      fillOpacity: 0.22,
      weight: 2,
      dashArray: '4, 6'
    }).addTo(map);

    function sendCoordinates(lat, lng) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'PINPOINT_CHANGE',
          lat: parseFloat(lat.toFixed(6)),
          lng: parseFloat(lng.toFixed(6))
        }));
      }
    }

    marker.on('dragend', function(e) {
      var pos = e.target.getLatLng();
      circle.setLatLng(pos);
      sendCoordinates(pos.lat, pos.lng);
    });

    map.on('click', function(e) {
      marker.setLatLng(e.latlng);
      circle.setLatLng(e.latlng);
      sendCoordinates(e.latlng.lat, e.latlng.lng);
    });

    window.updateCenter = function(newLat, newLng, newRadius) {
      if (!isNaN(newLat) && !isNaN(newLng)) {
        var newPos = [newLat, newLng];
        marker.setLatLng(newPos);
        circle.setLatLng(newPos);
        if (newRadius && !isNaN(newRadius)) {
          circle.setRadius(newRadius);
        }
        map.setView(newPos, map.getZoom());
      }
    };
  </script>
</body>
</html>
`;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data && data.type === 'PINPOINT_CHANGE') {
        onChange(data.lat, data.lng);
      }
    } catch {
      // Ignore unparseable messages
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>OpenStreetMap</Text>
        </View>
        <Text style={styles.instruction}>Tap map or drag pin to position</Text>
      </View>

      <View style={[styles.mapWrapper, { height }]}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: mapHtml }}
          style={styles.webView}
          onMessage={handleMessage}
          scrollEnabled={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={Platform.OS === 'android'}
        />
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.coordsText}>
          {Number.isFinite(lat) && lat !== 0 ? `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}` : 'Coordinates not set'}
        </Text>
        <Text style={styles.radiusText}>{radius || 200}m radius</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tag: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284c7',
  },
  instruction: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  mapWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
  },
  webView: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  coordsText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#0284c7',
    fontWeight: '600',
  },
  radiusText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
  },
});
