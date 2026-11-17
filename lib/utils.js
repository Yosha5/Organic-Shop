import { Percent, Droplets, Flame, Leaf, Nut, Cookie, Coffee, Wheat } from 'lucide-react';

export const CATEGORIES = [
  { slug: 'offer-zone', name: 'Offer Zone', bn: 'অফার জোন', icon: Percent },
  { slug: 'honey', name: 'Honey', bn: 'মধু', icon: Droplets },
  { slug: 'oil-ghee', name: 'Oil & Ghee', bn: 'তেল ও ঘি', icon: Flame },
  { slug: 'spices', name: 'Spices', bn: 'মসলা', icon: Leaf },
  { slug: 'nuts-seeds', name: 'Nuts & Seeds', bn: 'বাদাম ও বীজ', icon: Nut },
  { slug: 'dates', name: 'Dates', bn: 'খেজুর', icon: Cookie },
  { slug: 'tea-coffee', name: 'Tea & Coffee', bn: 'চা ও কফি', icon: Coffee },
  { slug: 'rice-flour', name: 'Rice & Flour', bn: 'চাল ও আটা', icon: Wheat },
];

export const FREE_DELIVERY_OVER = 2000;
export const salePrice = (p) => (p.discount_price && p.discount_price < p.price ? p.discount_price : p.price);
export const discountPct = (p) =>
  p.discount_price && p.discount_price < p.price ? Math.round((1 - p.discount_price / p.price) * 100) : 0;
export const PLACEHOLDER = 'https://placehold.co/400x400/FFF3E8/E65100?text=No+Image';
