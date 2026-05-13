import { useEffect, useMemo } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import type { LatLngBoundsExpression } from 'leaflet';

interface MapPin {
  id: number;
  label: string;
  latitude: number | null;
  longitude: number | null;
  color?: string;
}

interface MapBoardProps {
  pins: MapPin[];
  heightClass?: string;
}

const defaultCenter: [number, number] = [-14.235, -51.9253];

function MapViewport({ pins }: { pins: Array<{ latitude: number; longitude: number }> }) {
  const map = useMap();

  const bounds = useMemo<LatLngBoundsExpression | null>(() => {
    if (!pins.length) {
      return null;
    }

    return pins.map((pin) => [pin.latitude, pin.longitude]);
  }, [pins]);

  useEffect(() => {
    if (!bounds) {
      map.setView(defaultCenter, 4);
      return;
    }

    if (pins.length === 1) {
      map.setView([pins[0].latitude, pins[0].longitude], 11);
      return;
    }

    map.fitBounds(bounds, { padding: [32, 32] });
  }, [bounds, map, pins]);

  return null;
}

export function MapBoard({ pins, heightClass = 'h-72' }: MapBoardProps) {
  const validPins = pins.filter(
    (pin): pin is MapPin & { latitude: number; longitude: number } =>
      pin.latitude !== null && pin.longitude !== null
  );

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-sand-200 ${heightClass}`}>
      <MapContainer
        center={defaultCenter}
        zoom={4}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewport pins={validPins} />

        {validPins.map((pin) => (
          <CircleMarker
            key={pin.id}
            center={[pin.latitude as number, pin.longitude as number]}
            pathOptions={{
              color: pin.color ?? '#d16400',
              fillColor: pin.color ?? '#d16400',
              fillOpacity: 0.9,
              weight: 3,
            }}
            radius={9}
          >
            <Popup>
              <div className="space-y-1">
                <p className="text-sm font-black text-ink-900">{pin.label}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {!validPins.length && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-white/35 text-sm font-semibold text-ink-600 backdrop-blur-[1px]">
          Sem coordenadas para exibir no mapa.
        </div>
      )}
    </div>
  );
}
