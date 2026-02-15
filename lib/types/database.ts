export type UserRole = "user" | "premium" | "admin"

export type PropertyType =
  | "house"
  | "apartment"
  | "office"
  | "villa"
  | "townhome"
  | "bungalow"
  | "condo"
  | "land"
  | "commercial"

export type PropertyStatus = "for_sale" | "for_rent" | "sold" | "rented"

export type PublicationStatus = "pending_payment" | "published" | "expired" | "rejected"

export type PaymentType = "publication" | "featured"

export type PaymentStatus = "pending" | "approved" | "rejected" | "cancelled"

export type TransactionType = "deposit" | "withdrawal" | "property_payment" | "subscription"

export type TransactionStatus = "pending" | "completed" | "failed"

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Wallet {
  id: string
  user_id: string
  balance: number
  created_at: string
  updated_at: string
}

export interface Property {
  id: string
  user_id: string
  title: string
  description: string | null
  property_type: PropertyType
  status: PropertyStatus
  price: number
  bedrooms: number | null
  bathrooms: number | null
  square_feet: number | null
  address: string
  city: string
  state: string | null
  country: string
  zip_code: string | null
  latitude: number | null
  longitude: number | null
  property_id_code: string | null
  featured: boolean
  views: number
  publication_status: PublicationStatus
  is_featured_paid: boolean
  featured_until: string | null
  payment_reference: string | null
  featured_payment_reference: string | null
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  user_id: string
  property_id: string | null
  payment_type: PaymentType
  amount: number
  currency: string
  status: PaymentStatus
  bold_reference: string | null
  bold_transaction_id: string | null
  payment_method: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface PropertyImage {
  id: string
  property_id: string
  image_url: string
  is_primary: boolean
  created_at: string
}

export interface PropertyAmenity {
  id: string
  property_id: string
  amenity: string
  created_at: string
}

export interface PriceAlert {
  id: string
  user_id: string
  property_type: PropertyType | null
  city: string | null
  min_price: number | null
  max_price: number | null
  min_bedrooms: number | null
  max_bedrooms: number | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  wallet_id: string
  amount: number
  transaction_type: TransactionType
  transaction_status: TransactionStatus
  description: string | null
  property_id: string | null
  created_at: string
  updated_at: string
}
