'use client';

import { FloatingPanel } from '@/components/common';
import { Text } from '@/components/common/text';
import { useToggle } from '@/hooks';
import { Database } from '@/lib/db_types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMemo, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Flex, Icon } from '../common';
import CustomImage from '../common/image/CustomImage';
import { LazyMapContainer, LazyMarker, LazyTileLayer } from './Lazy';

export type Location = Database['public']['Tables']['locations']['Row'];
export type Spot = Database['public']['Tables']['spots']['Row'];
export interface ISpot extends Omit<Spot, 'location'> {
  location: Location;
}
export interface IMapProps {
  spots?: ISpot[];
}

const DEFAULT_ZOOM = 13;
const DEFAULT_BOUNDS = new L.LatLngBounds(
  new L.LatLng(0, 0),
  new L.LatLng(0, 0)
);

export const getBounds = (spots: ISpot[]) => {
  if (!spots || spots.length === 0) {
    return DEFAULT_BOUNDS;
  }
  const bounds = spots.reduce(
    (bounds, { location: { latitude, longitude } }) => {
      return bounds.extend([latitude, longitude]);
    },
    new L.LatLngBounds(
      new L.LatLng(spots[0].location.latitude, spots[0].location.longitude),
      new L.LatLng(spots[0].location.latitude, spots[0].location.longitude)
    )
  );
  return bounds;
};

export const getMarkerIcon = () => {
  const marker = renderToStaticMarkup(
    <Flex className="relative bg-brand-200 border border-white-200 w-6 h-6 p-2 rounded-full">
      <div className="absolute -bottom-1 -z-1 w-3 h-3 bg-brand-200 border-r border-b border-white-200 transform rotate-45" />
      <Icon name="eye" color="text-white-100" className="z-10" scale={1} />
    </Flex>
  );

  return L.divIcon({
    html: marker,
    className: 'hidden',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, 0],
  });
};

export const getMarker = (spot: ISpot, setActualSpot: (spot: ISpot) => void) => {
  return (
    <LazyMarker
      icon={getMarkerIcon()}
      key={spot.id}
      position={[
        parseFloat(spot.location.latitude),
        parseFloat(spot.location.longitude),
      ]}
      eventHandlers={{
        click: () => {
          setActualSpot(spot);
        },
      }}
    />
  );
};

const Map = ({ spots }: IMapProps) => {
  const markers: ISpot[] | undefined = useMemo(() => {
    return spots?.map((spot) => {
      return {
        ...spot,
        latitude: parseFloat(spot.location.latitude),
        longitude: parseFloat(spot.location.longitude),
      };
    });
  }, [spots]);

  let [actualSpot, setActualSpot] = useState<ISpot | undefined>(undefined);

  const [open, setOpen, setClose, toggleOpen] = useToggle(false);

  return (
    <>
      <div className="absolute top-0 bottom-0 left-0 right-0 z-0">
        <LazyMapContainer
          bounds={getBounds(spots)}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={true}
          className="w-full h-full bg-black"
          zoomControl={false}
        >
          <LazyTileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png"
          />
          {markers?.map((spot) => {
            return getMarker(spot, (spot) => {
              setActualSpot(spot);
              toggleOpen();
            });
          })}
        </LazyMapContainer>
      </div>
      <FloatingPanel
        isOpen={open}
        title={actualSpot?.name || 'Map'}
        onClose={setClose}
        onConfirm={setClose}
        size="large"
      >
        {actualSpot && (
          <Flex fullSize verticalAlign="top" horizontalAlign="left">
            {actualSpot.image?.map((image, index) => {
              return (
                <CustomImage
                  key={index}
                  src={image}
                  alt={actualSpot?.name || 'Map'}
                  loader={true}
                  height={200}
                  fullWidth={true}
                  fit="cover"
                  rounded="md"
                />
              );
            })}
            <Text style="body">{actualSpot.id}</Text>
          </Flex>
        )}
      </FloatingPanel>
    </>
  );
};

export default Map;