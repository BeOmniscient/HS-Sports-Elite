export type Sport =
  | "Football"
  | "Basketball"
  | "Baseball"
  | "Soccer"
  | "Wrestling"
  | "Volleyball"
  | "Indoor Track"
  | "Outdoor Track"
  | "Tennis"
  | "Golf"
  | "Gymnastics"
  | "Hockey";

export const ALL_SPORTS: Sport[] = [
  "Football",
  "Basketball",
  "Baseball",
  "Soccer",
  "Wrestling",
  "Volleyball",
  "Indoor Track",
  "Outdoor Track",
  "Tennis",
  "Golf",
  "Gymnastics",
];

export const SPORT_SLUG: Record<Sport, string> = {
  Football: "football",
  Basketball: "basketball",
  Baseball: "baseball",
  Soccer: "soccer",
  Wrestling: "wrestling",
  Volleyball: "volleyball",
  "Indoor Track": "indoor-track",
  "Outdoor Track": "outdoor-track",
  Tennis: "tennis",
  Golf: "golf",
  Gymnastics: "gymnastics",
  Hockey: "hockey",
};

export const SPORT_COLOR: Record<string, string> = {
  football: "bg-sport-football text-white",
  basketball: "bg-sport-basketball text-white",
  baseball: "bg-sport-baseball text-white",
  soccer: "bg-sport-soccer text-white",
  wrestling: "bg-sport-wrestling text-white",
  volleyball: "bg-sport-volleyball text-white",
  "indoor-track": "bg-sport-track text-black",
  "outdoor-track": "bg-sport-track text-black",
  tennis: "bg-sport-tennis text-white",
  golf: "bg-sport-golf text-white",
  gymnastics: "bg-sport-gymnastics text-white",
  hockey: "bg-sport-hockey text-white",
};

export const SPORT_HEX: Record<string, string> = {
  football:      "#d4380d",
  basketball:    "#fa6400",
  baseball:      "#1677ff",
  soccer:        "#389e0d",
  wrestling:     "#722ed1",
  volleyball:    "#eb2f96",
  "indoor-track":"#d4b106",
  "outdoor-track":"#d4b106",
  tennis:        "#13c2c2",
  golf:          "#52c41a",
  gymnastics:    "#c41d7f",
  hockey:        "#096dd9",
};

export interface SanityImage {
  _type: "image";
  asset: { _ref: string; _type: "reference" };
  alt?: string;
  hotspot?: { x: number; y: number; height: number; width: number };
}

export interface Article {
  _id: string;
  _createdAt: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  sport: string;
  school?: string;
  excerpt?: string;
  content?: unknown[];
  featuredImage?: SanityImage;
  relatedAthletes?: Athlete[];
  isPremium: boolean;
  source?: "original" | "rss" | "scraped";
  sourceUrl?: string;
}

export interface Athlete {
  _id: string;
  name: string;
  slug: { current: string };
  school: string;
  sports: string[];
  gradYear?: number;
  hometown?: string;
  bio?: string;
  photo?: SanityImage;
  relatedArticles?: Article[];
}

export interface School {
  _id: string;
  name: string;
  slug: { current: string };
  mascot?: string;
  location?: string;
  logo?: SanityImage;
}

export interface AdSlot {
  id: string;
  slotType: "banner_home" | "banner_sport" | "team_sponsor" | "newsletter";
  label: string;
  description: string;
  price_weekly: number;
  price_monthly: number;
  price_seasonal: number;
  sport?: string;
  school?: string;
  isAvailable: boolean;
}

export interface AdBooking {
  id: string;
  slotId: string;
  businessName: string;
  contactEmail: string;
  creativeUrl?: string;
  linkUrl: string;
  startsAt: string;
  endsAt: string;
  stripeSessionId?: string;
  status: "pending" | "active" | "expired" | "cancelled";
}
