export type Role = "ADMIN" | "MANAGER" | "MARKETING" | "RECEPTION";

export type LoyaltyTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

export type RoomType = "STANDARD" | "DELUXE" | "SUITE";
export type RoomStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";

export type ReservationSource = "DIRECT" | "PHONE" | "WEBSITE" | "OTA";
export type ReservationStatus = "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED";

export type ComplaintSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ComplaintStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export type CampaignChannel = "EMAIL" | "SMS" | "WHATSAPP";
export type CampaignStatus = "DRAFT" | "SCHEDULED" | "SENT";
export type DeliveryStatus = "PENDING" | "SENT" | "FAILED";

export type InvoiceStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID" | "VOID";
export type PaymentMethod = "CASH" | "CARD" | "BANK_TRANSFER" | "MOBILE_MONEY";
export type InteractionChannel = "PHONE" | "EMAIL" | "FRONT_DESK" | "WHATSAPP";

export type Customer = {
  id: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  country?: string | null;
  notes?: string | null;
  loyaltyTier: LoyaltyTier;
  loyaltyPoints: number;
  createdAt: string;
};

export type StaffUser = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
};

export type Payment = {
  id: string;
  invoiceId: string;
  method: PaymentMethod;
  amount: string;
  paidAt: string;
  reference?: string | null;
};

export type Invoice = {
  id: string;
  reservationId: string;
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
  status: InvoiceStatus;
  issuedAt: string;
  reservation?: Reservation;
  payments: Payment[];
};

export type Interaction = {
  id: string;
  customerId: string;
  channel: InteractionChannel;
  subject: string;
  notes: string;
  happenedAt: string;
  customer?: Customer;
};

export type Room = {
  id: string;
  roomNumber: string;
  type: RoomType;
  ratePerNight: string;
  status: RoomStatus;
};

export type Reservation = {
  id: string;
  customerId: string;
  roomId: string;
  source: ReservationSource;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  status: ReservationStatus;
  specialRequest?: string | null;
  createdAt: string;
  customer?: Customer;
  room?: Room;
};

export type Complaint = {
  id: string;
  customerId: string;
  title: string;
  description: string;
  severity: ComplaintSeverity;
  status: ComplaintStatus;
  createdAt: string;
  resolvedAt?: string | null;
  customer?: Customer;
};

export type CampaignRecipient = {
  id: string;
  customerId: string;
  deliveryStatus: DeliveryStatus;
  customer?: Customer;
};

export type Campaign = {
  id: string;
  name: string;
  segment: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  message: string;
  createdAt: string;
  recipients: CampaignRecipient[];
};

export type DashboardKpis = {
  customers: number;
  reservations: number;
  complaintsOpen: number;
  revenueCollected: number;
};
