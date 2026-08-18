'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { defaultProvince, mockData, type ProvinceData, type CityData } from '../data/mockData';

interface DashboardContextType {
  currentProvince: string;
  setCurrentProvince: (province: string) => void;
  currentCity: string;
  setCurrentCity: (city: string) => void;
  data: CityData;
  provinceData: ProvinceData;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [currentProvince, setCurrentProvinceState] = useState(defaultProvince);
  const [currentCity, setCurrentCityState] = useState('');

  const provinceData = mockData[currentProvince] || mockData[defaultProvince];
  const data = currentCity && provinceData.cities?.[currentCity]
    ? provinceData.cities[currentCity]
    : provinceData;

  const setCurrentProvince = useCallback((province: string) => {
    setCurrentProvinceState(province);
    setCurrentCityState('');
  }, []);

  const setCurrentCity = useCallback((city: string) => {
    setCurrentCityState(city);
  }, []);

  return (
    <DashboardContext.Provider value={{ currentProvince, setCurrentProvince, currentCity, setCurrentCity, data, provinceData }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
