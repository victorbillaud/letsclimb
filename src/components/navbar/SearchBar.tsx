'use client';

import { isSearchingAtom } from '@/hooks/jotai/maps/atom';
import { Database } from '@/lib/db_types';
import { logger } from '@/lib/logger';
import { useAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import React, { MouseEventHandler, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSupabase } from '../auth/SupabaseProvider';
import { Button, Card, Flex, Icon, InputText, Text } from '../common';

export type ISpotSearch =
  Database['public']['Views']['spot_search_view']['Row'];

type SearchBarProps = {
  onClickItem?: (spot: ISpotSearch) => void;
  showMapLink?: boolean;
};

export const SearchBar = ({
  onClickItem,
  showMapLink = true,
}: SearchBarProps) => {
  const [isSearching, setIsSearching] = useAtom(isSearchingAtom);

  const { supabase } = useSupabase();
  const router = useRouter();

  const [search, setSearch] = React.useState('');
  const [results, setResults] = React.useState<ISpotSearch[] | null>(null);
  const [focus, setFocus] = React.useState(true);
  const inputRef = React.useRef<HTMLInputElement>(null); // represents the input element
  const resultsRef = React.useRef<HTMLDivElement>(null); // represents the results element

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current) {
        if (
          inputRef.current.contains(event.target as Node) ||
          resultsRef?.current?.contains(event.target as Node)
        ) {
          setFocus(true);
          setIsSearching(true);
        } else {
          setFocus(false);
          setIsSearching(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = async (search: string) => {
    const { data: spots, error } = await supabase.rpc('search_spots', {
      keyword: search,
    });

    if (error) {
      toast.error(error.message);
      logger.error(error);
    }

    if (spots) {
      setResults(spots);
    }
  };

  useEffect(() => {
    if (search.length > 2) {
      handleSearch(search);
      setIsSearching(true);
    } else {
      setIsSearching(false);
      setResults(null);
    }
  }, [search]);

  return (
    <Flex className="relative w-full">
      <InputText
        className="search-bar w-full"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        icon="loop"
        ref={inputRef}
      />
      {results && focus && (
        <>
          <Card
            className="search-bar-results absolute top-14 w-[97vw] md:w-auto md:-inset-x-20 z-50"
            ref={resultsRef}
          >
            {results.length > 0 ? (
              <Flex
                direction="column"
                horizontalAlign="left"
                className="divide-y divide-white-300 dark:divide-dark-300 max-h-80 overflow-y-auto"
                gap={0}
              >
                {results.map((spot, index) => (
                  <SpotListItems
                    key={index}
                    spot={spot}
                    setFocus={setFocus}
                    onClickText={() => {
                      setFocus(false);
                      setIsSearching(false);
                      onClickItem && onClickItem(spot);
                    }}
                    onClickMaps={(e) => {
                      e.stopPropagation();
                      if (showMapLink) {
                        setFocus(false);
                        setIsSearching(false);
                        router.push(`/maps?spotId=${spot.id}`);
                      }
                    }}
                    showMapLink={showMapLink}
                  />
                ))}
              </Flex>
            ) : (
              <Flex fullSize verticalAlign="center" horizontalAlign="center">
                <Text variant="body">No results</Text>
              </Flex>
            )}
          </Card>
        </>
      )}
    </Flex>
  );
};

const SpotListItems = ({
  spot,
  setFocus,
  showMapLink = true,
  onClickText,
  onClickMaps,
}: {
  spot: ISpotSearch;
  // eslint-disable-next-line no-unused-vars
  setFocus: (focus: boolean) => void;
  showMapLink?: boolean;
  // eslint-disable-next-line no-unused-vars
  onClickText: MouseEventHandler<HTMLDivElement>;
  // eslint-disable-next-line no-unused-vars
  onClickMaps: MouseEventHandler<HTMLButtonElement>;
}) => {
  return (
    <Flex
      fullSize
      direction="row"
      verticalAlign="center"
      horizontalAlign="stretch"
      className="p-2 cursor-pointer"
    >
      <Flex
        direction="row"
        verticalAlign="center"
        horizontalAlign="stretch"
        className="w-full"
        onClick={onClickText}
      >
        <Flex direction="row" className="w-full" horizontalAlign="left">
          <Text variant="body" className="">
            {spot.name}
          </Text>
          <Text
            variant="caption"
            className="opacity-30"
          >{`${spot.city}, ${spot.department}`}</Text>
        </Flex>
        <Flex
          direction="row"
          horizontalAlign="center"
          verticalAlign="center"
          gap={0}
        >
          {spot.note ? (
            <>
              <Text variant="body" className="opacity-80">
                {spot.note.toFixed(1)}
              </Text>
              <Icon name="star" color="text-yellow-400" fill />
            </>
          ) : null}
        </Flex>
      </Flex>
      {showMapLink && (
        <Button
          variant="none"
          text="See on map"
          icon="map"
          className="text-brand-400"
          iconOnly={true}
          onClick={onClickMaps}
        />
      )}
    </Flex>
  );
};
