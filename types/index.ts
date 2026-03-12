export interface Service {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  duration: string;
  category: string;
  icon: string;
  features: string[];
  popular?: boolean;
}

export interface Booking {
  id?: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  date: string;
  time: string;
  notes?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  createdAt: string;
  updatedAt: string;
}

export interface BookingFormData {
  serviceId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  date: string;
  time: string;
  notes?: string;
}
