"use client";



import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";

import { Label } from "@/components/ui/label";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import { ChevronDown, Search, X } from "lucide-react";

import { useAuth } from "@/context/context";

import axios from "axios";



interface LocationNode {

  id: string;

  name: string;

  type: "COUNTRY" | "STATE" | "CITY" | "ZIP";

  children?: LocationNode[];

  parentId?: string;

}



interface SelectedLocation {

  id: string;

  name: string;

  type: "COUNTRY" | "STATE" | "CITY" | "ZIP";

  country?: string;

  region?: string;

  city?: string;

  enabled: boolean;

  bid_adjustment: number;

}



interface LocationTargetingProps {

  selectedIds?: Set<string>;

  onSelectionChange?: (selectedIds: Set<string>) => void;

  onDataChange?: (locationData: SelectedLocation[]) => void;

}



interface ApiResponse {

  response?: {

    rows?: Record<string, unknown>;

  };

}



interface CountryData {

  iso: string;

  name: string;

  children_count: number;

}



interface RegionData {

  id: number;

  iso: string;

  name: string;

  country_iso: string;

  children_count: number;

}



interface CityData {

  id: number;

  region_id: number;

  name: string;

  children_count: number;

}



interface PostalData {

  id: number;

  city_id: number;

  code: string;

}



type CountryOption = {

  iso: string;

  name: string;

  children_count?: number;

};



type RegionOption = {

  id: number;

  name: string;

  country_iso: string;

  children_count?: number;

};



type CityOption = {

  id: number;

  name: string;

  region_id: number;

  children_count?: number;

};



type PostalOption = {

  id: number;

  code: string;

  city_id: number;

};



export default function LocationTargeting({

  selectedIds: propSelectedIds,

  onSelectionChange,

  onDataChange,

}: LocationTargetingProps) {

  console.log("📍 Location component: Component rendering with props:", {

    hasOnSelectionChange: !!onSelectionChange,

    hasOnDataChange: !!onDataChange,

  });



  const auth = useAuth();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());



  const didAutoSelectAllCountriesRef = useRef(false);

  const didAutoSelectAllRegionsRef = useRef(false);



  const [countriesLoading, setCountriesLoading] = useState(false);

  const [regionsLoading, setRegionsLoading] = useState(false);

  const [citiesLoading, setCitiesLoading] = useState(false);

  const [postalsLoading, setPostalsLoading] = useState(false);



  const [countriesError, setCountriesError] = useState<string | null>(null);

  const [regionsError, setRegionsError] = useState<string | null>(null);

  const [citiesError, setCitiesError] = useState<string | null>(null);

  const [postalsError, setPostalsError] = useState<string | null>(null);



  const [countryQuery, setCountryQuery] = useState("");

  const [regionQuery, setRegionQuery] = useState("");

  const [cityQuery, setCityQuery] = useState("");

  const [postalQuery, setPostalQuery] = useState("");



  const [countryOpen, setCountryOpen] = useState(true); // Open by default

  const [regionOpen, setRegionOpen] = useState(false);

  const [cityOpen, setCityOpen] = useState(false);

  const [postalOpen, setPostalOpen] = useState(false);



  const [countryChipsExpanded, setCountryChipsExpanded] = useState(false);

  const [regionChipsExpanded, setRegionChipsExpanded] = useState(false);

  const [cityChipsExpanded, setCityChipsExpanded] = useState(false);

  const [postalChipsExpanded, setPostalChipsExpanded] = useState(false);



  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([]);

  const [regionOptions, setRegionOptions] = useState<RegionOption[]>([]);

  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);

  const [postalOptions, setPostalOptions] = useState<PostalOption[]>([]);



  const [selectedCountries, setSelectedCountries] = useState<Record<string, CountryOption>>({});

  const [selectedRegions, setSelectedRegions] = useState<Record<string, RegionOption>>({});

  const [selectedCities, setSelectedCities] = useState<Record<string, CityOption>>({});

  const [selectedPostals, setSelectedPostals] = useState<Record<string, PostalOption>>({});



  const selectedCountryIsos = useMemo(

    () => Object.keys(selectedCountries),

    [selectedCountries]

  );



  const selectedCountryIsoSet = useMemo(() => {

    return new Set(selectedCountryIsos.map((iso) => (iso || "").toUpperCase()));

  }, [selectedCountryIsos]);



  const getCountryNameByIso = useCallback(

    (iso: string) => {

      const key = (iso || "").toUpperCase();

      if (!key) return undefined;

      const fromSelected = selectedCountries[key];

      if (fromSelected?.name) return fromSelected.name;

      const fromOptions = countryOptions.find((c) => (c.iso || "").toUpperCase() === key);

      return fromOptions?.name;

    },

    [selectedCountries, countryOptions]

  );



  const getRegionById = useCallback(

    (regionId: number) => {

      const key = String(regionId);

      const fromSelected = selectedRegions[key];

      if (fromSelected) return fromSelected;

      const fromOptions = regionOptions.find((r) => r.id === regionId);

      return fromOptions;

    },

    [selectedRegions, regionOptions]

  );



  const getCityById = useCallback(

    (cityId: number) => {

      const key = String(cityId);

      const fromSelected = selectedCities[key];

      if (fromSelected) return fromSelected;

      const fromOptions = cityOptions.find((c) => c.id === cityId);

      return fromOptions;

    },

    [selectedCities, cityOptions]

  );

  const selectedRegionIds = useMemo(

    () => Object.keys(selectedRegions).map((k) => Number(k)).filter((n) => !Number.isNaN(n)),

    [selectedRegions]

  );

  const selectedCityIds = useMemo(

    () => Object.keys(selectedCities).map((k) => Number(k)).filter((n) => !Number.isNaN(n)),

    [selectedCities]

  );



  const cascadesEmpty = useMemo(

    () =>

      Object.keys(selectedCountries).length === 0 &&

      Object.keys(selectedRegions).length === 0 &&

      Object.keys(selectedCities).length === 0 &&

      Object.keys(selectedPostals).length === 0,

    [selectedCountries, selectedRegions, selectedCities, selectedPostals]

  );


  // Log warning when no locations are selected in create mode
  useEffect(() => {
    if (propSelectedIds === undefined && cascadesEmpty) {
      console.log("⚠️ Location Targeting: No locations selected. User must explicitly choose locations.");
    }
  }, [propSelectedIds, cascadesEmpty]);



  // Initialize with selectedIds from props (for edit mode or when navigating back)
  useEffect(() => {
    if (propSelectedIds !== undefined && propSelectedIds.size > 0) {
      // Edit mode or returning from next step: use the provided selectedIds
      setSelectedIds(new Set(propSelectedIds));
      console.log(
        "🔄 Location Component: Restoring selectedIds from props:",
        Array.from(propSelectedIds)
      );
      
      // NOTE: We intentionally do NOT restore cascade state (selectedCountries, etc.)
      // because that would trigger buildSelectionFromCascades and create wrong locationData.
      // The selectedIds are what matter for the final payload.
    } else if (propSelectedIds !== undefined && propSelectedIds.size === 0) {
      // Explicitly empty
      setSelectedIds(new Set());
      console.log(
        "🔄 Location Component: Cleared selection (empty propSelectedIds)"
      );
    } else {
      // Create mode: propSelectedIds is undefined, start with empty selection
      setSelectedIds(new Set());
      console.log(
        "🔄 Location Component: Create mode - starting with empty selection"
      );
    }
  }, [propSelectedIds]);



  const emitSelection = useCallback(

    (nextSelectedIds: Set<string>, nextLocationData: SelectedLocation[]) => {

      if (onSelectionChange) {

        onSelectionChange(nextSelectedIds);

      }

      if (onDataChange) {

        onDataChange(nextLocationData);

      }

    },

    [onSelectionChange, onDataChange]

  );



  const buildSelectionFromCascades = useCallback(() => {

    if (propSelectedIds !== undefined && cascadesEmpty) {

      return;

    }

    const nextSelected = new Set<string>();

    const nextLocationData: SelectedLocation[] = [];



    const countriesByIso = selectedCountries;

    const regionsById = selectedRegions;

    const citiesById = selectedCities;

    const postalsById = selectedPostals;



    // Determine which geo level has selections (priority: postal > city > region > country)
    const hasPostals = Object.keys(postalsById).length > 0;
    const hasCities = Object.keys(citiesById).length > 0;
    const hasRegions = Object.keys(regionsById).length > 0;
    const hasCountries = Object.keys(countriesByIso).length > 0;



    // Only include the most specific level that has selections
    if (hasPostals) {
      // Send ALL postal codes - enabled for selected, disabled for unselected
      const allPostals = postalOptions || [];
      allPostals.forEach((p) => {
        const id = String(p.id);
        const isSelected = postalsById[id] !== undefined;
        
        if (isSelected) {
          nextSelected.add(id);
        }

        const city = citiesById[String(p.city_id)];
        const region = city ? regionsById[String(city.region_id)] : undefined;
        const country = region ? countriesByIso[(region.country_iso || "").toUpperCase()] : undefined;
        const countryName = country?.name;
        const regionName = region?.name;
        const cityName = city?.name;

        nextLocationData.push({
          id,
          name: countryName && regionName && cityName ? `${countryName} > ${regionName} > ${cityName} > ${p.code}` : p.code,
          type: "ZIP",
          country: countryName,
          region: regionName,
          city: cityName,
          enabled: isSelected,
          bid_adjustment: 1.0,
        });
      });
    } else if (hasCities) {
      // Send ALL cities - enabled for selected, disabled for unselected
      const allCities = cityOptions || [];
      allCities.forEach((c) => {
        const id = String(c.id);
        const isSelected = citiesById[id] !== undefined;
        
        if (isSelected) {
          nextSelected.add(id);
        }

        const region = regionsById[String(c.region_id)];
        const country = region ? countriesByIso[(region.country_iso || "").toUpperCase()] : undefined;
        const countryName = country?.name;
        const regionName = region?.name;

        nextLocationData.push({
          id,
          name: countryName && regionName ? `${countryName} > ${regionName} > ${c.name}` : c.name,
          type: "CITY",
          country: countryName,
          region: regionName,
          city: c.name,
          enabled: isSelected,
          bid_adjustment: 1.0,
        });
      });
    } else if (hasRegions) {
      // Send ALL regions - enabled for selected, disabled for unselected
      const allRegions = regionOptions || [];
      allRegions.forEach((r) => {
        const id = String(r.id);
        const isSelected = regionsById[id] !== undefined;
        
        if (isSelected) {
          nextSelected.add(id);
        }

        const country = countriesByIso[(r.country_iso || "").toUpperCase()];
        const countryName = country?.name;

        nextLocationData.push({
          id,
          name: countryName ? `${countryName} > ${r.name}` : r.name,
          type: "STATE",
          country: countryName,
          region: r.name,
          enabled: isSelected,
          bid_adjustment: 1.0,
        });
      });
    } else if (hasCountries) {
      // IMPORTANT: Send ALL countries from options, not just selected ones
      // Selected countries get enabled: true, unselected get enabled: false
      countryOptions.forEach((c) => {
        const id = (c.iso || "").toUpperCase();
        const isSelected = countriesByIso[id] !== undefined;
        
        // Only add to nextSelected if actually selected
        if (isSelected) {
          nextSelected.add(id);
        }
        
        // Add ALL countries to locationData with proper enabled status
        nextLocationData.push({
          id,
          name: c.name,
          type: "COUNTRY",
          country: c.name,
          enabled: isSelected, // true if selected, false if not
          bid_adjustment: 1.0,
        });
      });
    } else {
      // No selections - send ALL countries with enabled: false
      countryOptions.forEach((c) => {
        const id = (c.iso || "").toUpperCase();
        nextLocationData.push({
          id,
          name: c.name,
          type: "COUNTRY",
          country: c.name,
          enabled: false,
          bid_adjustment: 1.0,
        });
      });
    }



    setSelectedIds(nextSelected);

    emitSelection(nextSelected, nextLocationData);

  }, [emitSelection, selectedCountries, selectedRegions, selectedCities, selectedPostals, propSelectedIds, cascadesEmpty, countryOptions]);



  useEffect(() => {

    buildSelectionFromCascades();

  }, [buildSelectionFromCascades]);



  const fetchCountries = useCallback(

    async (q: string) => {

      if (!auth.token) return;

      setCountriesLoading(true);

      setCountriesError(null);

      try {

        const res = await axios.get<ApiResponse>(

          `https://panel.adsaro.com/advertiser/api/GeoCountries/?version=5&token=${auth.token}&q=${encodeURIComponent(q || "")}`

        );

        const rows = (res.data?.response?.rows || {}) as Record<string, CountryData>;

        const list: CountryOption[] = Object.entries(rows)

          .map(([k, v]) => ({

            // Some API responses provide ISO as the object key (e.g. "us": {...})

            // so fall back to the key when v.iso is missing.

            iso: String(v?.iso || k || ""),

            name: String(v?.name || ""),

            children_count: v?.children_count,

          }))

          .filter((v) => Boolean(v.iso) && Boolean(v.name));

        setCountryOptions(list);

      } catch (e) {

        console.error("Failed to fetch GeoCountries", e);

        setCountriesError("Failed to load countries");

        setCountryOptions([]);

      } finally {

        setCountriesLoading(false);

      }

    },

    [auth.token]

  );



  const fetchRegions = useCallback(

    async (countryIsos: string[], q: string) => {

      if (!auth.token) return;

      if (!countryIsos || countryIsos.length === 0) return;

      setRegionsLoading(true);

      setRegionsError(null);

      try {

        const results = await Promise.all(

          countryIsos

            .filter(Boolean)

            .map((iso) =>

              axios.get<ApiResponse>(

                `https://panel.adsaro.com/advertiser/api/GeoRegions/?version=5&token=${auth.token}&country_iso=${encodeURIComponent(

                  iso.toLowerCase()

                )}&q=${encodeURIComponent(q || "")}`

              )

            )

        );



        const byId = new Map<number, RegionOption>();

        results.forEach((res) => {

          const rows = (res.data?.response?.rows || {}) as Record<string, RegionData>;

          Object.values(rows).forEach((v) => {

            const id = Number(v.id);

            if (Number.isNaN(id)) return;

            byId.set(id, {

              id,

              name: String(v.name || ""),

              country_iso: String(v.country_iso || ""),

              children_count: v.children_count,

            });

          });

        });



        const wanted = new Set(countryIsos.map((iso) => (iso || "").toUpperCase()));

        const merged = Array.from(byId.values())

          .filter((r) => wanted.has((r.country_iso || "").toUpperCase()))

          .sort((a, b) => a.name.localeCompare(b.name));

        setRegionOptions(merged);

      } catch (e) {

        console.error("Failed to fetch GeoRegions", e);

        setRegionsError("Failed to load regions");

        setRegionOptions([]);

      } finally {

        setRegionsLoading(false);

      }

    },

    [auth.token]

  );



  const visibleRegionOptions = useMemo(() => {

    if (selectedCountryIsoSet.size === 0) return [];

    return regionOptions.filter((r) =>

      selectedCountryIsoSet.has((r.country_iso || "").toUpperCase())

    );

  }, [regionOptions, selectedCountryIsoSet]);



  const fetchCities = useCallback(

    async (regionId: number, q: string) => {

      if (!auth.token) return;

      if (!regionId) return;

      setCitiesLoading(true);

      setCitiesError(null);

      try {

        const res = await axios.get<ApiResponse>(

          `https://panel.adsaro.com/advertiser/api/GeoCities/?version=5&token=${auth.token}&region_id=${encodeURIComponent(String(regionId))}&q=${encodeURIComponent(q || "")}`

        );

        const rows = (res.data?.response?.rows || {}) as Record<string, CityData>;

        const list: CityOption[] = Object.values(rows)

          .map((v) => ({

            id: Number(v.id),

            name: String(v.name || ""),

            region_id: Number(v.region_id),

            children_count: v.children_count,

          }))

          // Defensive: ensure only the requested region's cities are shown.

          .filter((c) => c.region_id === regionId);

        setCityOptions(list);

      } catch (e) {

        console.error("Failed to fetch GeoCities", e);

        setCitiesError("Failed to load cities");

        setCityOptions([]);

      } finally {

        setCitiesLoading(false);

      }

    },

    [auth.token]

  );



  const fetchPostals = useCallback(

    async (cityId: number, q: string) => {

      if (!auth.token) return;

      if (!cityId) return;

      setPostalsLoading(true);

      setPostalsError(null);

      try {

        const res = await axios.get<ApiResponse>(

          `https://panel.adsaro.com/advertiser/api/GeoPostalCodes/?version=5&token=${auth.token}&range=0-1000&city_id=${encodeURIComponent(String(cityId))}&q=${encodeURIComponent(q || "")}`

        );

        const rows = (res.data?.response?.rows || {}) as Record<string, PostalData>;

        const list: PostalOption[] = Object.values(rows)

          .map((v) => ({

            id: Number(v.id),

            code: String(v.code || ""),

            city_id: Number(v.city_id),

          }))

          // Defensive: ensure only the requested city's postal codes are shown.

          .filter((p) => p.city_id === cityId);

        setPostalOptions(list);

      } catch (e) {

        console.error("Failed to fetch GeoPostalCodes", e);

        setPostalsError("Failed to load postal codes");

        setPostalOptions([]);

      } finally {

        setPostalsLoading(false);

      }

    },

    [auth.token]

  );



  useEffect(() => {

    void fetchCountries(countryQuery);

  }, [fetchCountries, countryQuery]);

  // Auto-select all countries when they load
  useEffect(() => {
    if (countryOptions.length > 0 && Object.keys(selectedCountries).length === 0) {
      console.log('📍 Auto-selecting all countries');
      const allCountries: Record<string, CountryOption> = {};
      countryOptions.forEach((c) => {
        const iso = (c.iso || "").toUpperCase();
        if (iso) {
          allCountries[iso] = { ...c, iso };
        }
      });
      setSelectedCountries(allCountries);
    }
  }, [countryOptions]);

  const visibleCountryOptions = useMemo(() => {
    const q = (countryQuery || "").trim().toLowerCase();
    if (!q) return countryOptions;
    return countryOptions.filter((c) => {
      const name = (c.name || "").toLowerCase();
      const iso = (c.iso || "").toLowerCase();
      return name.includes(q) || iso.includes(q);
    });
  }, [countryOptions, countryQuery]);



  // DISABLED: Auto-select all countries - Users must now explicitly select their locations
  // useEffect(() => {
  //   if (propSelectedIds !== undefined) return;
  //   if (didAutoSelectAllCountriesRef.current) return;
  //   if (countriesLoading) return;
  //   if (countryOptions.length === 0) return;

  //   didAutoSelectAllCountriesRef.current = true;

  //   setSelectedCountries(() => {
  //     const next: Record<string, CountryOption> = {};
  //     countryOptions.forEach((c) => {
  //       const iso = (c.iso || "").toUpperCase();
  //       if (!iso) return;
  //       next[iso] = { ...c, iso };
  //     });
  //     return next;
  //   });

  //   setSelectedRegions({});
  //   setSelectedCities({});
  //   setSelectedPostals({});
  // }, [propSelectedIds, countriesLoading, countryOptions]);



  useEffect(() => {

    if (selectedCountryIsos.length === 0) {

      setRegionOptions([]);

      return;

    }

    if (selectedCountryIsos.length <= 3) {

      void fetchRegions(selectedCountryIsos, regionQuery);

      return;

    }

    setRegionOptions([]);

  }, [fetchRegions, selectedCountryIsos, regionQuery]);



  // Auto-select all regions DISABLED - User must explicitly select regions now



  useEffect(() => {

    if (selectedRegionIds.length === 1) {

      void fetchCities(selectedRegionIds[0], cityQuery);

    } else {

      setCityOptions([]);

    }

  }, [fetchCities, selectedRegionIds, cityQuery]);



  useEffect(() => {

    if (selectedCityIds.length === 1) {

      void fetchPostals(selectedCityIds[0], postalQuery);

    } else {

      setPostalOptions([]);

    }

  }, [fetchPostals, selectedCityIds, postalQuery]);



  const toggleSelectedCountry = (opt: CountryOption) => {

    const iso = (opt.iso || "").toUpperCase();

    // Multiple selection: Toggle add/remove
    setSelectedCountries((prev) => {
      const next = { ...prev };
      if (next[iso]) {
        delete next[iso];  // Remove if already selected
      } else {
        next[iso] = { ...opt, iso };  // Add if not selected
      }
      return next;
    });

    // Clear all lower level selections
    setSelectedRegions({});
    setSelectedCities({});
    setSelectedPostals({});

    setSelectedPostals({});

  };



  const toggleSelectedRegion = (opt: RegionOption) => {

    const id = String(opt.id);

    // Multiple selection: Toggle add/remove
    setSelectedRegions((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];  // Remove if already selected
      } else {
        next[id] = opt;  // Add if not selected
      }
      return next;
    });

    // Clear all lower level selections
    setSelectedCities({});
    setSelectedPostals({});

  };



  const toggleSelectedCity = (opt: CityOption) => {

    const id = String(opt.id);

    // Multiple selection: Toggle add/remove
    setSelectedCities((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];  // Remove if already selected
      } else {
        next[id] = opt;  // Add if not selected
      }
      return next;
    });

    // Clear all lower level selections
    setSelectedPostals({});

  };



  const toggleSelectedPostal = (opt: PostalOption) => {

    const id = String(opt.id);

    // Multiple selection: Toggle add/remove
    setSelectedPostals((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];  // Remove if already selected
      } else {
        next[id] = opt;  // Add if not selected
      }
      return next;
    });

  };



  const removeChip = (level: "country" | "region" | "city" | "postal", id: string) => {

    if (level === "country") {

      setSelectedCountries((prev) => {

        const next = { ...prev };

        delete next[id];

        return next;

      });

      setSelectedRegions({});

      setSelectedCities({});

      setSelectedPostals({});

    }

    if (level === "region") {

      setSelectedRegions((prev) => {

        const next = { ...prev };

        delete next[id];

        return next;

      });

      setSelectedCities({});

      setSelectedPostals({});

    }

    if (level === "city") {

      setSelectedCities((prev) => {

        const next = { ...prev };

        delete next[id];

        return next;

      });

      setSelectedPostals({});

    }

    if (level === "postal") {

      setSelectedPostals((prev) => {

        const next = { ...prev };

        delete next[id];

        return next;

      });

    }

  };



  return (

    <div className="space-y-4 rounded-md border border-gray-300 bg-blue-50 p-3 w-full text-sm space-y-3 mt-6">

      <Label className="text-lg font-semibold block">Locations Targeting</Label>



      <div className="grid grid-cols-1 gap-4">

        <div>

          <div className="flex items-center justify-between">

            <Label className="text-sm">Geo Countries</Label>

            <div className="flex items-center gap-2">

              <Button

                type="button"

                size="sm"

                variant="outline"

                onClick={() => {

                  setSelectedCountries(() => {

                    const next: Record<string, CountryOption> = {};

                    countryOptions.forEach((c) => {

                      const iso = (c.iso || "").toUpperCase();

                      if (!iso) return;

                      next[iso] = { ...c, iso };

                    });

                    return next;

                  });

                  setSelectedRegions({});

                  setSelectedCities({});

                  setSelectedPostals({});

                  didAutoSelectAllRegionsRef.current = false;

                }}

              >

                Select All

              </Button>

              <Button

                type="button"

                size="sm"

                variant="outline"

                onClick={() => {

                  setSelectedCountries({});

                  setSelectedRegions({});

                  setSelectedCities({});

                  setSelectedPostals({});

                  didAutoSelectAllRegionsRef.current = false;

                }}

              >

                Clear

              </Button>

            </div>

          </div>

          <div className="mt-1 rounded-md border border-gray-300 bg-white">

            <button

              type="button"

              onClick={() =>

                setCountryOpen((v) => {

                  const next = !v;

                  if (next && countryOptions.length === 0 && !countriesLoading) {

                    void fetchCountries(countryQuery);

                  }

                  return next;

                })

              }

              className="flex w-full items-center justify-between px-3 py-2 text-left"

            >

              <div className="text-sm text-gray-900">

                {Object.keys(selectedCountries).length > 0

                  ? `${Object.keys(selectedCountries).length} selected`

                  : "Select countries"}

              </div>

              <ChevronDown size={16} className="text-gray-500" />

            </button>



            {Object.keys(selectedCountries).length > 0 && (

              <div className="flex flex-wrap gap-2 px-3 pb-2">

                {Object.entries(selectedCountries)

                  .slice(0, countryChipsExpanded ? undefined : 3)

                  .map(([iso, c]) => (

                    <div

                      key={iso}

                      className="flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-1 text-xs text-white"

                    >

                      <span>{c.name}</span>

                      <button

                        type="button"

                        onClick={() => removeChip("country", iso)}

                        className="rounded-full bg-white/20 p-0.5"

                      >

                        <X className="h-3 w-3" />

                      </button>

                    </div>

                  ))}

                {Object.keys(selectedCountries).length > 3 && (

                  <button

                    type="button"

                    onClick={() => setCountryChipsExpanded((v) => !v)}

                    className="text-xs text-blue-700 hover:underline"

                  >

                    {countryChipsExpanded

                      ? "Show less"

                      : `View all (+${Object.keys(selectedCountries).length - 3})`}

                  </button>

                )}

              </div>

            )}



            {countryOpen && (

              <div className="border-t border-gray-200 p-3">

                <div className="relative mb-2">

                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />

                  <Input

                    value={countryQuery}

                    onChange={(e) => setCountryQuery(e.target.value)}

                    className="pl-8"

                    placeholder="Search countries..."

                  />

                </div>

                {countriesError ? (

                  <div className="text-xs text-red-600">{countriesError}</div>

                ) : null}

                <div className="max-h-56 overflow-auto">

                  {countriesLoading ? (

                    <div className="py-4 text-center text-xs text-gray-500">Loading...</div>

                  ) : visibleCountryOptions.length === 0 ? (

                    <div className="py-4 text-center text-xs text-gray-500">No results</div>

                  ) : (

                    visibleCountryOptions.map((opt) => {

                      const iso = (opt.iso || "").toUpperCase();

                      const checked = Boolean(selectedCountries[iso]);

                      return (

                        <button

                          key={iso}

                          type="button"

                          onClick={() => toggleSelectedCountry(opt)}

                          className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-sm ${
                            checked ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50"
                          }`}

                        >

                          <div className={`text-gray-900 ${checked ? "font-semibold text-blue-700" : ""}`}>{opt.name}</div>

                          <input type="checkbox" checked={checked} readOnly />

                        </button>

                      );

                    })

                  )}

                </div>

              </div>

            )}

          </div>

        </div>



        <div>

          <Label className="text-sm">Geo Regions</Label>

          <div className="mt-1 rounded-md border border-gray-300 bg-white">

            <button

              type="button"

              disabled={selectedCountryIsos.length === 0 || selectedCountryIsos.length > 3}

              onClick={() => setRegionOpen((v) => !v)}

              className="flex w-full items-center justify-between px-3 py-2 text-left disabled:cursor-not-allowed disabled:opacity-60"

            >

              <div className="text-sm text-gray-900">

                {selectedCountryIsos.length === 0

                  ? "Select a country first"

                  : selectedCountryIsos.length > 3

                    ? "Select up to 3 countries to load regions"

                  : Object.keys(selectedRegions).length > 0

                    ? `${Object.keys(selectedRegions).length} selected`

                    : "Select regions"}

              </div>

              <ChevronDown size={16} className="text-gray-500" />

            </button>



            {Object.keys(selectedRegions).length > 0 && (

              <div className="flex flex-wrap gap-2 px-3 pb-2">

                {Object.entries(selectedRegions)

                  .slice(0, regionChipsExpanded ? undefined : 3)

                  .map(([id, r]) => (

                    <div

                      key={id}

                      className="flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-1 text-xs text-white"

                    >

                      <span>

                        {(() => {

                          const countryName = getCountryNameByIso(r.country_iso);

                          return countryName ? `${countryName} > ${r.name}` : r.name;

                        })()}

                      </span>

                      <button

                        type="button"

                        onClick={() => removeChip("region", id)}

                        className="rounded-full bg-white/20 p-0.5"

                      >

                        <X className="h-3 w-3" />

                      </button>

                    </div>

                  ))}

                {Object.keys(selectedRegions).length > 3 && (

                  <button

                    type="button"

                    onClick={() => setRegionChipsExpanded((v) => !v)}

                    className="text-xs text-blue-700 hover:underline"

                  >

                    {regionChipsExpanded

                      ? "Show less"

                      : `View all (+${Object.keys(selectedRegions).length - 3})`}

                  </button>

                )}

              </div>

            )}



            {regionOpen && (

              <div className="border-t border-gray-200 p-3">

                <div className="relative mb-2">

                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />

                  <Input

                    value={regionQuery}

                    onChange={(e) => setRegionQuery(e.target.value)}

                    className="pl-8"

                    placeholder="Search regions..."

                  />

                </div>

                <div className="mb-2 flex items-center justify-end gap-2">

                  <Button

                    type="button"

                    size="sm"

                    variant="outline"

                    onClick={(e) => {

                      e.preventDefault();

                      e.stopPropagation();

                      setSelectedRegions(() => {

                        const next: Record<string, RegionOption> = {};

                        visibleRegionOptions.forEach((r) => {

                          const id = String(r.id);

                          if (!id) return;

                          next[id] = r;

                        });

                        return next;

                      });

                      setSelectedCities({});

                      setSelectedPostals({});

                    }}

                  >

                    Select All

                  </Button>

                  <Button

                    type="button"

                    size="sm"

                    variant="outline"

                    onClick={(e) => {

                      e.preventDefault();

                      e.stopPropagation();

                      setSelectedRegions({});

                      setSelectedCities({});

                      setSelectedPostals({});

                    }}

                  >

                    Clear

                  </Button>

                </div>

                {regionsError ? (

                  <div className="text-xs text-red-600">{regionsError}</div>

                ) : null}

                <div className="max-h-56 overflow-auto">

                  {regionsLoading ? (

                    <div className="py-4 text-center text-xs text-gray-500">Loading...</div>

                  ) : regionOptions.length === 0 ? (

                    <div className="py-4 text-center text-xs text-gray-500">No results</div>

                  ) : (

                    visibleRegionOptions.map((opt) => {

                      const id = String(opt.id);

                      const checked = Boolean(selectedRegions[id]);

                      const countryName = getCountryNameByIso(opt.country_iso);

                      const displayName = countryName ? `${countryName} > ${opt.name}` : opt.name;

                      return (

                        <button

                          key={id}

                          type="button"

                          onClick={() => toggleSelectedRegion(opt)}

                          className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-gray-50"

                        >

                          <div className="text-gray-900">{displayName}</div>

                          <input type="checkbox" checked={checked} readOnly />

                        </button>

                      );

                    })

                  )}

                </div>

              </div>

            )}

          </div>

        </div>



        {/* <div>

          <Label className="text-sm">Geo Cities</Label>

          <div className="mt-1 rounded-md border border-gray-300 bg-white">

            <button

              type="button"

              disabled={selectedRegionIds.length === 0 || selectedRegionIds.length > 1}

              onClick={() => setCityOpen((v) => !v)}

              className="flex w-full items-center justify-between px-3 py-2 text-left disabled:cursor-not-allowed disabled:opacity-60"

            >

              <div className="text-sm text-gray-900">

                {selectedRegionIds.length === 0

                  ? "Select a region first"

                  : selectedRegionIds.length > 1

                    ? "Select 1 region to load cities"

                    : Object.keys(selectedCities).length > 0

                      ? `${Object.keys(selectedCities).length} selected`

                      : "Select cities"}

              </div>

              <ChevronDown size={16} className="text-gray-500" />

            </button>



            {Object.keys(selectedCities).length > 0 && (

              <div className="flex flex-wrap gap-2 px-3 pb-2">

                {Object.entries(selectedCities)

                  .slice(0, cityChipsExpanded ? undefined : 3)

                  .map(([id, c]) => (

                    <div

                      key={id}

                      className="flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-1 text-xs text-white"

                    >

                      <span>{c.name}</span>

                      <button

                        type="button"

                        onClick={() => removeChip("city", id)}

                        className="rounded-full bg-white/20 p-0.5"

                      >

                        <X className="h-3 w-3" />

                      </button>

                    </div>

                  ))}

                {Object.keys(selectedCities).length > 3 && (

                  <button

                    type="button"

                    onClick={() => setCityChipsExpanded((v) => !v)}

                    className="text-xs text-blue-700 hover:underline"

                  >

                    {cityChipsExpanded

                      ? "Show less"

                      : `View all (+${Object.keys(selectedCities).length - 3})`}

                  </button>

                )}

              </div>

            )}



            {cityOpen && (

              <div className="border-t border-gray-200 p-3">

                <div className="relative mb-2">

                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />

                  <Input

                    value={cityQuery}

                    onChange={(e) => setCityQuery(e.target.value)}

                    className="pl-8"

                    placeholder="Search cities..."

                  />

                </div>

                {citiesError ? (

                  <div className="text-xs text-red-600">{citiesError}</div>

                ) : null}

                <div className="max-h-56 overflow-auto">

                  {citiesLoading ? (

                    <div className="py-4 text-center text-xs text-gray-500">Loading...</div>

                  ) : cityOptions.length === 0 ? (

                    <div className="py-4 text-center text-xs text-gray-500">No results</div>

                  ) : (

                    cityOptions.map((opt) => {

                      const id = String(opt.id);

                      const checked = Boolean(selectedCities[id]);

                      const region = getRegionById(opt.region_id);

                      const countryName = region ? getCountryNameByIso(region.country_iso) : undefined;

                      const regionName = region?.name;

                      const displayName =

                        countryName && regionName

                          ? `${countryName} > ${regionName} > ${opt.name}`

                          : regionName

                            ? `${regionName} > ${opt.name}`

                            : opt.name;

                      return (

                        <button

                          key={id}

                          type="button"

                          onClick={() => toggleSelectedCity(opt)}

                          className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-gray-50"

                        >

                          <div className="text-gray-900">{displayName}</div>

                          <input type="checkbox" checked={checked} readOnly />

                        </button>

                      );

                    })

                  )}

                </div>

              </div>

            )}

          </div>

        </div>



        <div>

          <Label className="text-sm">Geo Postal Codes</Label>

          <div className="mt-1 rounded-md border border-gray-300 bg-white">

            <button

              type="button"

              disabled={selectedCityIds.length === 0 || selectedCityIds.length > 1}

              onClick={() => setPostalOpen((v) => !v)}

              className="flex w-full items-center justify-between px-3 py-2 text-left disabled:cursor-not-allowed disabled:opacity-60"

            >

              <div className="text-sm text-gray-900">

                {selectedCityIds.length === 0

                  ? "Select a city first"

                  : selectedCityIds.length > 1

                    ? "Select 1 city to load postal codes"

                    : Object.keys(selectedPostals).length > 0

                      ? `${Object.keys(selectedPostals).length} selected`

                      : "Select postal codes"}

              </div>

              <ChevronDown size={16} className="text-gray-500" />

            </button>



            {Object.keys(selectedPostals).length > 0 && (

              <div className="flex flex-wrap gap-2 px-3 pb-2">

                {Object.entries(selectedPostals)

                  .slice(0, postalChipsExpanded ? undefined : 3)

                  .map(([id, p]) => (

                    <div

                      key={id}

                      className="flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-1 text-xs text-white"

                    >

                      <span>

                        {(() => {

                          const city = getCityById(p.city_id);

                          const region = city ? getRegionById(city.region_id) : undefined;

                          const countryName = region ? getCountryNameByIso(region.country_iso) : undefined;

                          const regionName = region?.name;

                          const cityName = city?.name;

                          if (countryName && regionName && cityName) {

                            return `${countryName} > ${regionName} > ${cityName} > ${p.code}`;

                          }

                          if (regionName && cityName) {

                            return `${regionName} > ${cityName} > ${p.code}`;

                          }

                          if (cityName) {

                            return `${cityName} > ${p.code}`;

                          }

                          return p.code;

                        })()}

                      </span>

                      <button

                        type="button"

                        onClick={() => removeChip("postal", id)}

                        className="rounded-full bg-white/20 p-0.5"

                      >

                        <X className="h-3 w-3" />

                      </button>

                    </div>

                  ))}

                {Object.keys(selectedPostals).length > 3 && (

                  <button

                    type="button"

                    onClick={() => setPostalChipsExpanded((v) => !v)}

                    className="text-xs text-blue-700 hover:underline"

                  >

                    {postalChipsExpanded

                      ? "Show less"

                      : `View all (+${Object.keys(selectedPostals).length - 3})`}

                  </button>

                )}

              </div>

            )}



            {postalOpen && (

              <div className="border-t border-gray-200 p-3">

                <div className="relative mb-2">

                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />

                  <Input

                    value={postalQuery}

                    onChange={(e) => setPostalQuery(e.target.value)}

                    className="pl-8"

                    placeholder="Search postal codes..."

                  />

                </div>

                {postalsError ? (

                  <div className="text-xs text-red-600">{postalsError}</div>

                ) : null}

                <div className="max-h-56 overflow-auto">

                  {postalsLoading ? (

                    <div className="py-4 text-center text-xs text-gray-500">Loading...</div>

                  ) : postalOptions.length === 0 ? (

                    <div className="py-4 text-center text-xs text-gray-500">No results</div>

                  ) : (

                    postalOptions.map((opt) => {

                      const id = String(opt.id);

                      const checked = Boolean(selectedPostals[id]);

                      const city = getCityById(opt.city_id);

                      const region = city ? getRegionById(city.region_id) : undefined;

                      const countryName = region ? getCountryNameByIso(region.country_iso) : undefined;

                      const regionName = region?.name;

                      const cityName = city?.name;

                      const displayName =

                        countryName && regionName && cityName

                          ? `${countryName} > ${regionName} > ${cityName} > ${opt.code}`

                          : regionName && cityName

                            ? `${regionName} > ${cityName} > ${opt.code}`

                            : cityName

                              ? `${cityName} > ${opt.code}`

                              : opt.code;

                      return (

                        <button

                          key={id}

                          type="button"

                          onClick={() => toggleSelectedPostal(opt)}

                          className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-gray-50"

                        >

                          <div className="text-gray-900">{displayName}</div>

                          <input type="checkbox" checked={checked} readOnly />

                        </button>

                      );

                    })

                  )}

                </div>

              </div>

            )}

          </div>

        </div> */}

      </div>



      <div className="flex items-center gap-2">

        <Button

          type="button"

          size="sm"

          variant="outline"

          onClick={() => {

            setSelectedCountries({});

            setSelectedRegions({});

            setSelectedCities({});

            setSelectedPostals({});

          }}

        >

          Clear All

        </Button>

      </div>

    </div>

  );

}


