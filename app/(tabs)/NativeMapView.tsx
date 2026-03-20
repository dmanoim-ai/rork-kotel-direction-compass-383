import React, { useRef, useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import Colors from '@/constants/colors';
import { Location } from '@/constants/locations';
import type { Region, MapPressEvent } from 'react-native-maps';

interface NativeMapViewProps {
  userLocation: { latitude: number; longitude: number } | null;
  mapRegion: Region | null;
  targetLocation: Location;
  selectedMapLocation: { latitude: number; longitude: number } | null;
  onMapPress: (event: MapPressEvent) => void;
  onReverseGeocode?: (name: string, lat: number, lng: number) => void;
  onRecenterRequest?: () => void;
  showDistanceLine?: boolean;
  mapStyle?: 'streets' | 'satellite';
  fitBoundsRequest?: number;
  searchCoords?: { latitude: number; longitude: number } | null;
}

export default function NativeMapView({
  userLocation,
  mapRegion,
  targetLocation,
  selectedMapLocation,
  onMapPress,
  onReverseGeocode,
  showDistanceLine = true,
  mapStyle = 'streets',
  fitBoundsRequest,
  searchCoords,
}: NativeMapViewProps) {
  const webViewRef = useRef<WebView>(null);
  const [isReady, setIsReady] = useState(false);

  const lat = mapRegion?.latitude || userLocation?.latitude || 31.7767;
  const lng = mapRegion?.longitude || userLocation?.longitude || 35.2345;

  const latDelta = mapRegion?.latitudeDelta ?? 9;
  const zoom = Math.round(Math.log2(360 / latDelta));

  const handleMessage = useCallback((event: { nativeEvent: { data: string } }) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapClick') {
        onMapPress({
          nativeEvent: {
            coordinate: {
              latitude: data.lat,
              longitude: data.lng,
            },
          },
        } as MapPressEvent);
      }
      if (data.type === 'reverseGeocode' && onReverseGeocode) {
        onReverseGeocode(data.name, data.lat, data.lng);
      }
      if (data.type === 'mapReady') {
        setIsReady(true);
      }
    } catch (e) {
      console.log('WebView message parse error:', e);
    }
  }, [onMapPress, onReverseGeocode]);

  useEffect(() => {
    if (isReady && webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (typeof switchMapStyle === 'function') switchMapStyle('${mapStyle}');
        true;
      `);
    }
  }, [mapStyle, isReady]);

  useEffect(() => {
    if (isReady && webViewRef.current && fitBoundsRequest) {
      const uLat = userLocation?.latitude ?? 'null';
      const uLng = userLocation?.longitude ?? 'null';
      const focusLat = selectedMapLocation?.latitude ?? targetLocation.latitude;
      const focusLng = selectedMapLocation?.longitude ?? targetLocation.longitude;
      webViewRef.current.injectJavaScript(`
        if (typeof fitAllBoundsExplicit === 'function') fitAllBoundsExplicit(${uLat}, ${uLng}, ${focusLat}, ${focusLng});
        true;
      `);
    }
  }, [fitBoundsRequest, isReady, userLocation, targetLocation, selectedMapLocation]);

  useEffect(() => {
    if (isReady && webViewRef.current && searchCoords) {
      webViewRef.current.injectJavaScript(`
        if (typeof flyToLocation === 'function') flyToLocation(${searchCoords.latitude}, ${searchCoords.longitude});
        true;
      `);
    }
  }, [searchCoords, isReady]);

  useEffect(() => {
    if (isReady && webViewRef.current && userLocation) {
      webViewRef.current.injectJavaScript(`
        if (typeof recenterToUser === 'function') recenterToUser(${userLocation.latitude}, ${userLocation.longitude});
        true;
      `);
    }
  }, [userLocation, isReady]);

  useEffect(() => {
    if (isReady && webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (typeof updateTargetCoords === 'function') updateTargetCoords(${targetLocation.latitude}, ${targetLocation.longitude});
        true;
      `);
    }
  }, [targetLocation.latitude, targetLocation.longitude, isReady]);

  const tileUrl = mapStyle === 'satellite'
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const tileAttrib = mapStyle === 'satellite'
    ? '&copy; Esri'
    : '&copy; OpenStreetMap';

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; overflow: hidden; }
        #map { width: 100%; height: 100%; }
        .leaflet-control-attribution { font-size: 8px !important; }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        .user-pulse {
          position: absolute;
          width: 40px; height: 40px;
          border-radius: 50%;
          background: rgba(0, 122, 255, 0.25);
          animation: pulse 2s ease-out infinite;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        .user-dot-wrapper {
          position: relative;
          width: 40px; height: 40px;
        }
        .user-dot {
          position: absolute;
          width: 14px; height: 14px;
          background: #007AFF;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.35);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          z-index: 2;
        }

        @keyframes dropIn {
          0% { transform: translateY(-30px) rotate(-45deg); opacity: 0; }
          60% { transform: translateY(4px) rotate(-45deg); opacity: 1; }
          80% { transform: translateY(-2px) rotate(-45deg); }
          100% { transform: translateY(0) rotate(-45deg); opacity: 1; }
        }
        .marker-drop {
          animation: dropIn 0.5s ease-out forwards;
        }

        .my-loc-btn {
          position: absolute;
          bottom: 20px; right: 10px;
          z-index: 1000;
          width: 36px; height: 36px;
          background: rgba(30,30,30,0.85);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(4px);
        }
        .my-loc-btn:active { background: rgba(50,50,50,0.95); }
        .my-loc-btn svg { width: 18px; height: 18px; }

        .fit-btn {
          position: absolute;
          bottom: 62px; right: 10px;
          z-index: 1000;
          width: 36px; height: 36px;
          background: rgba(30,30,30,0.85);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(4px);
        }
        .fit-btn:active { background: rgba(50,50,50,0.95); }
        .fit-btn svg { width: 18px; height: 18px; }

        .style-toggle {
          position: absolute;
          top: 10px; right: 10px;
          z-index: 1000;
          padding: 6px 10px;
          background: rgba(30,30,30,0.85);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          color: white;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          backdrop-filter: blur(4px);
          letter-spacing: 0.3px;
        }
        .style-toggle:active { background: rgba(50,50,50,0.95); }
      </style>
    </head>
    <body>
      <div id="map"></div>

      <div class="my-loc-btn" onclick="goToMyLocation()">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
        </svg>
      </div>

      <div class="fit-btn" onclick="fitAllBounds()">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
        </svg>
      </div>

      <div class="style-toggle" id="styleBtn" onclick="toggleStyle()">SAT</div>

      <script>
        var currentStyle = 'streets';
        var currentTileLayer = null;
        var userLat = ${userLocation?.latitude ?? 'null'};
        var userLng = ${userLocation?.longitude ?? 'null'};
        var targetLat = ${selectedMapLocation?.latitude ?? targetLocation.latitude};
        var targetLng = ${selectedMapLocation?.longitude ?? targetLocation.longitude};

        var map = L.map('map', {
          zoomControl: false,
          attributionControl: true
        }).setView([${lat}, ${lng}], ${zoom});

        L.control.zoom({ position: 'topleft' }).addTo(map);

        currentTileLayer = L.tileLayer('${tileUrl}', {
          maxZoom: 19,
          attribution: '${tileAttrib}'
        }).addTo(map);

        // Target marker
        var targetIcon = L.divIcon({
          className: 'custom-marker',
          html: '<div class="marker-drop" style="width:26px;height:26px;background:#4A90D9;border-radius:50% 50% 50% 0;border:2.5px solid white;box-shadow:0 3px 8px rgba(0,0,0,0.4);"></div>',
          iconSize: [26, 26],
          iconAnchor: [13, 26]
        });

        // Selected marker
        var selectedIcon = L.divIcon({
          className: 'custom-marker',
          html: '<div class="marker-drop" style="width:26px;height:26px;background:#FF9500;border-radius:50% 50% 50% 0;border:2.5px solid white;box-shadow:0 3px 8px rgba(0,0,0,0.4);"></div>',
          iconSize: [26, 26],
          iconAnchor: [13, 26]
        });

        var targetMarker = L.marker([${targetLocation.latitude}, ${targetLocation.longitude}], {icon: targetIcon})
          .addTo(map)
          .bindPopup('<b>${targetLocation.name.replace(/'/g, "\\'")}</b><br>Current target');

        var selectedMarker = null;
        var distanceLine = null;
        var searchMarker = null;

        ${selectedMapLocation ? `
          selectedMarker = L.marker([${selectedMapLocation.latitude}, ${selectedMapLocation.longitude}], {icon: selectedIcon})
            .addTo(map)
            .bindPopup('Selected location');
          ${showDistanceLine && userLocation ? `
            distanceLine = L.polyline(
              [[${userLocation.latitude}, ${userLocation.longitude}], [${selectedMapLocation.latitude}, ${selectedMapLocation.longitude}]],
              { color: '#FF9500', weight: 3, dashArray: '10, 8', opacity: 0.8 }
            ).addTo(map);
          ` : ''}
        ` : ''}

        // User location with pulsing dot
        var userMarker = null;
        ${userLocation ? `
          var userIcon = L.divIcon({
            className: 'user-marker',
            html: '<div class="user-dot-wrapper"><div class="user-pulse"></div><div class="user-dot"></div></div>',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
          });
          userMarker = L.marker([${userLocation.latitude}, ${userLocation.longitude}], {icon: userIcon, zIndexOffset: 1000})
            .addTo(map)
            .bindPopup('Your location');
        ` : ''}

        // Distance line from user to target
        ${showDistanceLine && userLocation && !selectedMapLocation ? `
          distanceLine = L.polyline(
            [[${userLocation.latitude}, ${userLocation.longitude}], [${targetLocation.latitude}, ${targetLocation.longitude}]],
            { color: '#4A90D9', weight: 3, dashArray: '10, 8', opacity: 0.6 }
          ).addTo(map);
        ` : ''}

        function goToMyLocation() {
          if (userLat !== null && userLng !== null) {
            map.flyTo([userLat, userLng], 13, { duration: 0.8 });
          }
        }

        function recenterToUser(lat, lng) {
          userLat = lat;
          userLng = lng;
          if (userMarker) {
            userMarker.setLatLng([lat, lng]);
          } else {
            var userIcon = L.divIcon({
              className: 'user-marker',
              html: '<div class="user-dot-wrapper"><div class="user-pulse"></div><div class="user-dot"></div></div>',
              iconSize: [40, 40],
              iconAnchor: [20, 20]
            });
            userMarker = L.marker([lat, lng], {icon: userIcon, zIndexOffset: 1000}).addTo(map);
          }
        }

        function fitAllBounds() {
          fitAllBoundsExplicit(userLat, userLng, targetLat, targetLng);
        }

        function fitAllBoundsExplicit(uLat, uLng, tLat, tLng) {
          var points = [];
          if (uLat !== null && uLng !== null) {
            points.push(L.latLng(uLat, uLng));
          }
          if (tLat !== null && tLng !== null) {
            points.push(L.latLng(tLat, tLng));
          }
          if (points.length >= 2) {
            var bounds = L.latLngBounds(points);
            map.invalidateSize();
            map.fitBounds(bounds.pad(0.15), { animate: false, padding: [50, 50], maxZoom: 16 });
          } else if (points.length === 1) {
            map.setView(points[0], 10);
          }
        }

        function updateTargetCoords(lat, lng) {
          targetLat = lat;
          targetLng = lng;
          if (targetMarker) {
            targetMarker.setLatLng([lat, lng]);
          }
        }

        function switchMapStyle(style) {
          if (currentTileLayer) map.removeLayer(currentTileLayer);
          currentStyle = style;
          if (style === 'satellite') {
            currentTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
              maxZoom: 19, attribution: '&copy; Esri'
            }).addTo(map);
            document.getElementById('styleBtn').textContent = 'MAP';
          } else {
            currentTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19, attribution: '&copy; OpenStreetMap'
            }).addTo(map);
            document.getElementById('styleBtn').textContent = 'SAT';
          }
        }

        function toggleStyle() {
          switchMapStyle(currentStyle === 'streets' ? 'satellite' : 'streets');
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'styleChange',
            style: currentStyle
          }));
        }

        function flyToLocation(lat, lng) {
          map.flyTo([lat, lng], 12, { duration: 1 });
          if (searchMarker) map.removeLayer(searchMarker);
          var searchIcon = L.divIcon({
            className: 'custom-marker',
            html: '<div class="marker-drop" style="width:22px;height:22px;background:#34C759;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>',
            iconSize: [22, 22],
            iconAnchor: [11, 22]
          });
          searchMarker = L.marker([lat, lng], {icon: searchIcon}).addTo(map).bindPopup('Search result').openPopup();
        }

        function reverseGeocode(lat, lng) {
          fetch('https://nominatim.openstreetmap.org/reverse?lat=' + lat + '&lon=' + lng + '&format=json&zoom=14')
            .then(function(r) { return r.json(); })
            .then(function(data) {
              var name = '';
              if (data.address) {
                name = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.county || '';
                if (data.address.country && name) {
                  name += ', ' + data.address.country;
                } else if (data.address.country) {
                  name = data.address.country;
                }
              }
              if (!name && data.display_name) {
                var parts = data.display_name.split(',');
                name = parts.slice(0, 2).join(',').trim();
              }
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'reverseGeocode',
                name: name || 'Unknown location',
                lat: lat,
                lng: lng
              }));
            })
            .catch(function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'reverseGeocode',
                name: lat.toFixed(4) + ', ' + lng.toFixed(4),
                lat: lat,
                lng: lng
              }));
            });
        }

        map.on('click', function(e) {
          var lat = e.latlng.lat;
          var lng = e.latlng.lng;

          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'mapClick',
            lat: lat,
            lng: lng
          }));

          // Remove old line + marker
          if (selectedMarker) map.removeLayer(selectedMarker);
          if (distanceLine) map.removeLayer(distanceLine);

          selectedMarker = L.marker([lat, lng], {icon: selectedIcon})
            .addTo(map);

          // Draw distance line from user
          ${userLocation ? `
            distanceLine = L.polyline(
              [[${userLocation.latitude}, ${userLocation.longitude}], [lat, lng]],
              { color: '#FF9500', weight: 3, dashArray: '10, 8', opacity: 0.8 }
            ).addTo(map);
          ` : ''}

          // Reverse geocode
          reverseGeocode(lat, lng);
        });

        // Notify ready
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: mapHtml }}
        style={styles.map}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={Colors.compass.gold} />
          </View>
        )}
        scrollEnabled={false}
        bounces={false}
        originWhitelist={['*']}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.compass.cardBackground,
  },
});
