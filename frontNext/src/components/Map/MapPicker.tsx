import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import type { LeafletMouseEvent, Map } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapPickerProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}

const LocationMarker: React.FC<{ position: [number, number]; onChange: (lat: number, lng: number) => void }> = ({ position, onChange }) => {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return <Marker position={position} />;
};

export const MapPicker: React.FC<MapPickerProps> = ({ latitude, longitude, onChange }) => {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserPosition(coords);
          // Centrar y hacer zoom si el mapa ya está montado
          if (mapRef.current) {
            mapRef.current.setView(coords, 16);
          }
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const position: [number, number] = [
    latitude || userPosition?.[0] || 4.710989,
    longitude || userPosition?.[1] || -74.072092
  ];

  return (
    <div style={{ height: 300, width: '100%', marginBottom: 16 }}>
      <MapContainer
        center={position}
        zoom={userPosition ? 16 : 13}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker position={position} onChange={onChange} />
      </MapContainer>
    </div>
  );
};
