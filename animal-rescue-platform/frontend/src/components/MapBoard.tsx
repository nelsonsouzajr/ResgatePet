interface MapPin {
  id: number;
  label: string;
  latitude: number | null;
  longitude: number | null;
  colorClass?: string;
}

interface MapBoardProps {
  pins: MapPin[];
  heightClass?: string;
}

function projectCoordsToBoard(lat: number, lng: number) {
  const clampedLat = Math.max(-34, Math.min(5, lat));
  const clampedLng = Math.max(-74, Math.min(-34, lng));

  const y = ((5 - clampedLat) / (5 - -34)) * 100;
  const x = ((clampedLng - -74) / (-34 - -74)) * 100;

  return { x, y };
}

export function MapBoard({ pins, heightClass = 'h-72' }: MapBoardProps) {
  const validPins = pins.filter(
    (pin) => pin.latitude !== null && pin.longitude !== null
  );

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-sand-200 bg-[radial-gradient(circle_at_30%_20%,#fff6e7,transparent_40%),radial-gradient(circle_at_80%_80%,#ffe1c4,transparent_35%),linear-gradient(140deg,#fffefb_0%,#fce7cf_100%)] ${heightClass}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(transparent_95%,rgba(20,23,31,0.06)_95%),linear-gradient(90deg,transparent_95%,rgba(20,23,31,0.06)_95%)] bg-[length:24px_24px]" />

      {validPins.map((pin) => {
        const point = projectCoordsToBoard(pin.latitude as number, pin.longitude as number);

        return (
          <div
            key={pin.id}
            className="group absolute"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          >
            <span
              className={`block h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-white ${pin.colorClass ?? 'bg-brand'}`}
            />
            <div className="pointer-events-none absolute left-2 top-2 hidden rounded-md bg-ink-900 px-2 py-1 text-xs font-semibold text-white shadow-lg group-hover:block">
              {pin.label}
            </div>
          </div>
        );
      })}

      {!validPins.length && (
        <div className="grid h-full place-items-center text-sm font-semibold text-ink-500">
          Sem coordenadas para exibir no mapa.
        </div>
      )}
    </div>
  );
}
