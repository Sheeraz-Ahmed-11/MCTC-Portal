import { beltRanks } from "@/lib/db/schema";

export const BELT_RANK_LABELS: Record<string, string> = {
  white: "White",
  yellow: "Yellow",
  green: "Green",
  blue: "Blue",
  red: "Red",
  black: "Black",
  orange: "Orange",
  purple: "Purple",
  brown: "Brown",
  red_black: "Red/Black",
};

export const BELT_OPTIONS = [
  { value: "white", label: "White" },
  { value: "yellow", label: "Yellow" },
  { value: "green", label: "Green" },
  { value: "blue", label: "Blue" },
  { value: "red", label: "Red" },
  { value: "black", label: "Black" },
];

export const WEIGHT_CLASS_OPTIONS = [
  { value: "finweight", label: "Finweight" },
  { value: "flyweight", label: "Flyweight" },
  { value: "bantamweight", label: "Bantamweight" },
  { value: "featherweight", label: "Featherweight" },
  { value: "lightweight", label: "Lightweight" },
  { value: "welterweight", label: "Welterweight" },
  { value: "middleweight", label: "Middleweight" },
  { value: "heavyweight", label: "Heavyweight" },
];

export const EVENT_TYPE_OPTIONS = [
  { value: "sparring", label: "Sparring" },
  { value: "poomsae", label: "Poomsae" },
];

export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
] as const;

export const SEASON_OPTIONS = [
  { value: "spring", label: "Spring" },
  { value: "fall", label: "Fall" },
] as const;

export const ROSTER_STATUS_OPTIONS = [
  { value: "registered", label: "Registered" },
  { value: "confirmed", label: "Confirmed" },
  { value: "withdrawn", label: "Withdrawn" },
] as const;

