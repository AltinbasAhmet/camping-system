export type CampPhoto = {
  id: number;
  campId: number;
  imageUrl: string;
  isCover: boolean;
  createdAt: string;
};

export type Camp = {
  id: number;
  ownerId: number;
  name: string;
  description: string;
  city: string;
  district?: string | null;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  phone: string;
  email?: string | null;
  customerNumber: string;
  totalCapacity: number;
  caravanCapacity: number;
  tentCapacity?: number | null;
  pricePerNight?: number | null;
  status: string;
  hasToilet: boolean;
  hasShower: boolean;
  hasHotWater: boolean;
  hasElectricity: boolean;
  hasWifi: boolean;
  hasMarket: boolean;
  petFriendly: boolean;
  photos: CampPhoto[];
  createdAt: string;
  updatedAt: string;
};

export type CampEvent = {
  id: number;
  campId: number;
  title: string;
  description: string;
  dateTime: string;
  capacity: number;
  price: number;
  ticketsSold?: number;
  remainingCapacity?: number;
};

export type CampReservation = {
  id: number;
  campId: number;
  userId: number;
  checkInDate: string;
  checkOutDate: string;
  plateNumber: string;
  guestCount: number;
  reservationCode: string;
  status: string;
  camp: Camp;
};

export type EventBooking = {
  id: number;
  eventId: number;
  userId: number;
  guestCount: number;
  bookedAt: string;
  event: CampEvent & {
    camp: Camp;
  };
};