export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          is_subscriber: boolean;
          subscription_tier: "free" | "monthly" | "annual" | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_ends_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      ad_bookings: {
        Row: {
          id: string;
          slot_type: string;
          business_name: string;
          contact_email: string;
          contact_name: string;
          creative_url: string | null;
          link_url: string;
          sport: string | null;
          school_slug: string | null;
          duration_type: "weekly" | "monthly" | "seasonal";
          starts_at: string;
          ends_at: string;
          price_cents: number;
          stripe_session_id: string | null;
          stripe_payment_intent_id: string | null;
          status: "pending_payment" | "active" | "expired" | "cancelled";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["ad_bookings"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["ad_bookings"]["Insert"]>;
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          subscribed_at: string;
          is_active: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["newsletter_subscribers"]["Row"], "id" | "subscribed_at">;
        Update: Partial<Database["public"]["Tables"]["newsletter_subscribers"]["Insert"]>;
      };
    };
  };
}
