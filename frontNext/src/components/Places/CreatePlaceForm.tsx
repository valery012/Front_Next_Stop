import React, { useState } from 'react';
import { MapPicker } from '../Map/MapPicker';

interface CreatePlaceFormProps {
  onSubmit: (data: {
    name: string;
    description: string;
    category: string;
    latitude: number;
    longitude: number;
    imageUrl: string; // URL de la imagen opcional
  }) => void;
}

export const CreatePlaceForm: React.FC<CreatePlaceFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    latitude: 0,
    longitude: 0,
    imageUrl: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes('latitude') || name.includes('longitude') ? parseFloat(value) : value,
    }));
  };

  const handleMapChange = (lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ name: '', description: '', category: '', latitude: 0, longitude: 0, imageUrl: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-xl border border-gray-200 max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          <span className="bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">Nuevo Lugar</span>
        </h2>
        <span className="text-xs text-gray-500">Todos los campos son obligatorios</span>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white/90 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
            placeholder="Ej: Mirador Café y Libros"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white/90 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
          >
            <option value="">Selecciona una categoría</option>
            <option value="restaurant">Restaurante</option>
            <option value="hotel">Hotel</option>
            <option value="natural">Natural</option>
            <option value="viewpoint">Mirador</option>
            <option value="cafe">Café</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">Estas son las categorías usadas en los filtros.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Coordenadas</label>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">Lat: {formData.latitude || 0}</span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">Lon: {formData.longitude || 0}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Imagen (URL)</label>
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white/90 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
          />
          {formData.imageUrl && (
            <div className="mt-2 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
              {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
              <img
                src={formData.imageUrl}
                alt="preview"
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white/90 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
            placeholder="Cuenta qué hace especial a este lugar"
            rows={4}
          />
        </div>
      </div>

      <div className="mt-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Ubicación en el mapa</label>
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <MapPicker
            latitude={formData.latitude}
            longitude={formData.longitude}
            onChange={handleMapChange}
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">Haz clic en el mapa para fijar el punto exacto.</p>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-orange-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow hover:shadow-md transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          Crear lugar
        </button>
      </div>
    </form>
  );
};
