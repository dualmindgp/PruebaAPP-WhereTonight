/**
 * Zustand store para estado de UI
 * Maneja modales, navegación, y estado de interfaz
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface SelectedCity {
  name: string;
  lat: number;
  lng: number;
  country?: string;
}

interface UIState {
  // Modales
  showAuthModal: boolean;
  showFilterModal: boolean;
  showEditProfileModal: boolean;
  showFriendRequestsModal: boolean;
  showAddFriendModal: boolean;
  
  // Navegación
  navTab: 'home' | 'search' | 'social' | 'profile';
  
  // Pantallas secundarias
  showSettings: boolean;
  showFavorites: boolean;
  showHistory: boolean;
  showFriends: boolean;
  showFriendProfile: boolean;
  selectedFriendId: string | null;
  
  // Venue
  selectedVenueId: string | null;
  showVenueSheet: boolean;
  
  // Ciudad
  selectedCity: SelectedCity | null;
  showCityOnboarding: boolean;
  
  // Splash
  showSplash: boolean;
  
  // Acciones para modales
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openFilterModal: () => void;
  closeFilterModal: () => void;
  openEditProfileModal: () => void;
  closeEditProfileModal: () => void;
  openFriendRequestsModal: () => void;
  closeFriendRequestsModal: () => void;
  openAddFriendModal: () => void;
  closeAddFriendModal: () => void;
  
  // Acciones para navegación
  setNavTab: (tab: 'home' | 'search' | 'social' | 'profile') => void;
  
  // Acciones para pantallas secundarias
  openSettings: () => void;
  closeSettings: () => void;
  openFavorites: () => void;
  closeFavorites: () => void;
  openHistory: () => void;
  closeHistory: () => void;
  openFriends: () => void;
  closeFriends: () => void;
  openFriendProfile: (friendId: string) => void;
  closeFriendProfile: () => void;
  
  // Acciones para venue
  selectVenue: (venueId: string) => void;
  deselectVenue: () => void;
  openVenueSheet: () => void;
  closeVenueSheet: () => void;
  
  // Acciones para ciudad
  selectCity: (city: SelectedCity) => void;
  openCityOnboarding: () => void;
  closeCityOnboarding: () => void;
  
  // Acciones para splash
  hideSplash: () => void;
  
  // Reset completo
  reset: () => void;
}

const initialState = {
  // Modales
  showAuthModal: false,
  showFilterModal: false,
  showEditProfileModal: false,
  showFriendRequestsModal: false,
  showAddFriendModal: false,
  
  // Navegación
  navTab: 'home' as const,
  
  // Pantallas secundarias
  showSettings: false,
  showFavorites: false,
  showHistory: false,
  showFriends: false,
  showFriendProfile: false,
  selectedFriendId: null,
  
  // Venue
  selectedVenueId: null,
  showVenueSheet: false,
  
  // Ciudad
  selectedCity: null,
  showCityOnboarding: false,
  
  // Splash
  showSplash: true,
};

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        
        // Modales
        openAuthModal: () => set({ showAuthModal: true }),
        closeAuthModal: () => set({ showAuthModal: false }),
        openFilterModal: () => set({ showFilterModal: true }),
        closeFilterModal: () => set({ showFilterModal: false }),
        openEditProfileModal: () => set({ showEditProfileModal: true }),
        closeEditProfileModal: () => set({ showEditProfileModal: false }),
        openFriendRequestsModal: () => set({ showFriendRequestsModal: true }),
        closeFriendRequestsModal: () => set({ showFriendRequestsModal: false }),
        openAddFriendModal: () => set({ showAddFriendModal: true }),
        closeAddFriendModal: () => set({ showAddFriendModal: false }),
        
        // Navegación
        setNavTab: (tab) => set({ navTab: tab }),
        
        // Pantallas secundarias
        openSettings: () => set({ showSettings: true }),
        closeSettings: () => set({ showSettings: false }),
        openFavorites: () => set({ showFavorites: true }),
        closeFavorites: () => set({ showFavorites: false }),
        openHistory: () => set({ showHistory: true }),
        closeHistory: () => set({ showHistory: false }),
        openFriends: () => set({ showFriends: true }),
        closeFriends: () => set({ showFriends: false, showFriendProfile: false, selectedFriendId: null }),
        openFriendProfile: (friendId) => set({ showFriendProfile: true, selectedFriendId: friendId }),
        closeFriendProfile: () => set({ showFriendProfile: false, selectedFriendId: null }),
        
        // Venue
        selectVenue: (venueId) => set({ selectedVenueId: venueId }),
        deselectVenue: () => set({ selectedVenueId: null, showVenueSheet: false }),
        openVenueSheet: () => set({ showVenueSheet: true }),
        closeVenueSheet: () => set({ showVenueSheet: false }),
        
        // Ciudad
        selectCity: (city) => set({ selectedCity: city, showCityOnboarding: false }),
        openCityOnboarding: () => set({ showCityOnboarding: true }),
        closeCityOnboarding: () => set({ showCityOnboarding: false }),
        
        // Splash
        hideSplash: () => set({ showSplash: false }),
        
        // Reset
        reset: () => set(initialState),
      }),
      {
        name: 'wheretonight-ui-store',
        partialize: (state) => ({
          // Solo persistir ciudad seleccionada y tab de navegación
          selectedCity: state.selectedCity,
          navTab: state.navTab,
        }),
      }
    ),
    {
      name: 'UI Store',
    }
  )
);

/**
 * Selectores útiles
 */
export const useIsAnyModalOpen = () => {
  const store = useUIStore();
  return (
    store.showAuthModal ||
    store.showFilterModal ||
    store.showEditProfileModal ||
    store.showFriendRequestsModal ||
    store.showAddFriendModal
  );
};

export const useIsAnyScreenOpen = () => {
  const store = useUIStore();
  return (
    store.showSettings ||
    store.showFavorites ||
    store.showHistory ||
    store.showFriends ||
    store.showFriendProfile
  );
};
