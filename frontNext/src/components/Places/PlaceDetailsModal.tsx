import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Place } from '../../types';

interface PlaceDetailsModalProps {
  place: Place;
  onClose: () => void;
}

export const PlaceDetailsModal: React.FC<PlaceDetailsModalProps> = ({ place, onClose }) => {
  const hasCoords = typeof place.latitude === 'number' && typeof place.longitude === 'number';

  const center = useMemo<[number, number]>(() => {
    if (hasCoords) return [place.latitude as number, place.longitude as number];
    return [4.710989, -74.072092];
  }, [hasCoords, place.latitude, place.longitude]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-900">{place.name}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600" title="Cerrar">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {place.category && (
            <span className="inline-block mb-3 text-xs uppercase tracking-wide text-purple-600 font-medium bg-purple-50 px-3 py-1.5 rounded">
              {place.category}
            </span>
          )}

          {place.description && (
            <p className="text-gray-700 mb-4">{place.description}</p>
          )}

          {place.photos && place.photos.length > 0 && (
            <div className="mb-5">
              <div className="grid grid-cols-2 gap-3">
                {place.photos.map((photo, idx) => (
                  <img
                    key={idx}
                    src={photo}
                    alt={`${place.name} ${idx + 1}`}
                    className="w-full h-40 object-cover rounded-lg border border-gray-200"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 mb-5">
            {place.creatorName && (
              <div className="text-sm text-gray-600"><strong>Creador:</strong> {place.creatorName}</div>
            )}
            {place.status && (
              <div className="text-sm text-gray-600"><strong>Estado:</strong> {place.status}</div>
            )}
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Ubicación</h4>
            {hasCoords ? (
              <div style={{ height: 300 }} className="rounded-lg overflow-hidden border border-gray-200">
                <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={center}>
                    <Popup>
                      {place.name}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Este lugar aún no tiene coordenadas registradas.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
