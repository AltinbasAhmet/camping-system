import type { User } from "./auth";

export type CampPhoto = {
  id: number;
  campId: number;
  imageUrl: string;
  isCover: boolean;
  createdAt?: string;
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
  status: "PENDING" | "ACTIVE" | "PASSIVE" | "REJECTED";
  hasToilet: boolean;
  hasShower: boolean;
  hasHotWater: boolean;
  hasElectricity: boolean;
  hasWifi: boolean;
  hasMarket: boolean;
  petFriendly: boolean;
  photos?: CampPhoto[];
  owner?: User;
  events?: CampEvent[];
  reservations?: CampReservation[];
  createdAt?: string;
  updatedAt?: string;
};

export type CampEvent = {
  id: number;
  campId: number;
  organizerId?: number;
  title: string;
  description: string;
  dateTime: string;
  capacity: number;
  price: number;
  camp?: Camp;
  organizer?: { id: number; name: string; role?: string };
  bookings?: EventBooking[];
  ticketsSold?: number;
  remainingCapacity?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ReservationGuest = {
  id?: number;
  reservationId?: number;
  fullName: string;
  nationalId?: string;
  nationalIdLast4?: string | null;
  nationalIdMasked?: string | null;
};

export type CampReservation = {
  id: number;
  campId: number;
  userId: number;
  checkInDate: string;
  checkOutDate: string;
  accommodationType: "TENT" | "CARAVAN";
  plateNumber?: string | null;
  guestCount: number;
  reservationCode: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "CHECKED_IN" | "CHECKED_OUT";
  camp?: Camp;
  user?: User;
  guests?: ReservationGuest[];
  createdAt?: string;
  updatedAt?: string;
};

export type EventBooking = {
  id: number;
  eventId: number;
  userId: number;
  guestCount: number;
  bookedAt: string;
  event?: CampEvent;
  user?: User;
};
