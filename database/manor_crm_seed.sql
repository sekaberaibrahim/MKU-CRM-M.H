-- The Manor Hotel CRM seed data (PostgreSQL)
-- Import after Prisma migration:
-- psql -h localhost -U postgres -d manor_crm -f database/manor_crm_seed.sql

INSERT INTO "User" ("id","fullName","email","passwordHash","role","isActive","createdAt","updatedAt") VALUES
('usr_admin_001','System Admin','admin@manorhotel.com','$2b$10$qKothKKUQ6R4jq9Y9l9kIe/ly.c/1EoHFevPWx31XK66irVNX69DG','ADMIN',true,NOW(),NOW()),
('usr_mgr_001','General Manager','manager@manorhotel.com','$2b$10$qKothKKUQ6R4jq9Y9l9kIe/ly.c/1EoHFevPWx31XK66irVNX69DG','MANAGER',true,NOW(),NOW()),
('usr_rcp_001','Front Desk One','reception@manorhotel.com','$2b$10$qKothKKUQ6R4jq9Y9l9kIe/ly.c/1EoHFevPWx31XK66irVNX69DG','RECEPTION',true,NOW(),NOW()),
('usr_mkt_001','Marketing Team','marketing@manorhotel.com','$2b$10$qKothKKUQ6R4jq9Y9l9kIe/ly.c/1EoHFevPWx31XK66irVNX69DG','MARKETING',true,NOW(),NOW())
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "Room" ("id","roomNumber","type","ratePerNight","status") VALUES
('rm_101','101','STANDARD',80.00,'AVAILABLE'),
('rm_102','102','STANDARD',80.00,'AVAILABLE'),
('rm_103','103','STANDARD',80.00,'AVAILABLE'),
('rm_201','201','DELUXE',120.00,'AVAILABLE'),
('rm_202','202','DELUXE',120.00,'AVAILABLE'),
('rm_301','301','SUITE',180.00,'AVAILABLE')
ON CONFLICT ("roomNumber") DO NOTHING;

INSERT INTO "Customer" ("id","fullName","email","phone","country","notes","loyaltyTier","loyaltyPoints","createdAt","updatedAt") VALUES
('cus_001','Alice Johnson','alice.johnson@example.com','+250700111111','Rwanda','Prefers quiet room','SILVER',120, NOW() - INTERVAL '90 days', NOW()),
('cus_002','Brian Uwimana','brian.uwimana@example.com','+250700222222','Rwanda','Business traveler','GOLD',340, NOW() - INTERVAL '75 days', NOW()),
('cus_003','Chloe Mutesi','chloe.mutesi@example.com','+250700333333','Uganda','Vegetarian breakfast','BRONZE',40, NOW() - INTERVAL '40 days', NOW()),
('cus_004','David Smith','david.smith@example.com','+447700111222','UK','Late check-in often','SILVER',190, NOW() - INTERVAL '25 days', NOW())
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "Reservation" ("id","customerId","roomId","source","checkInDate","checkOutDate","adults","children","status","specialRequest","createdAt") VALUES
('res_001','cus_001','rm_201','WEBSITE',NOW() - INTERVAL '20 days',NOW() - INTERVAL '18 days',2,0,'CHECKED_OUT','High floor',NOW() - INTERVAL '22 days'),
('res_002','cus_002','rm_301','DIRECT',NOW() + INTERVAL '7 days',NOW() + INTERVAL '10 days',1,0,'CONFIRMED','Airport pickup',NOW() - INTERVAL '2 days'),
('res_003','cus_003','rm_101','PHONE',NOW() + INTERVAL '15 days',NOW() + INTERVAL '17 days',2,1,'CONFIRMED','Baby crib',NOW() - INTERVAL '1 day')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Invoice" ("id","reservationId","subtotal","taxAmount","totalAmount","status","issuedAt") VALUES
('inv_001','res_001',240.00,43.20,283.20,'PAID',NOW() - INTERVAL '18 days')
ON CONFLICT ("reservationId") DO NOTHING;

INSERT INTO "Payment" ("id","invoiceId","method","amount","paidAt","reference") VALUES
('pay_001','inv_001','CARD',283.20,NOW() - INTERVAL '18 days','TXN-93831')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Complaint" ("id","customerId","title","description","severity","status","resolutionNote","createdAt","resolvedAt") VALUES
('cmp_001','cus_001','Slow check-in','Guest reported a 30-minute delay at front desk','MEDIUM','RESOLVED','Added express check-in lane',NOW() - INTERVAL '19 days', NOW() - INTERVAL '18 days'),
('cmp_002','cus_004','Noisy corridor','Noise from hallway after midnight','LOW','OPEN',NULL,NOW() - INTERVAL '2 days', NULL)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Interaction" ("id","customerId","channel","subject","notes","happenedAt") VALUES
('int_001','cus_002','EMAIL','Corporate package inquiry','Requested monthly corporate rates',NOW() - INTERVAL '7 days'),
('int_002','cus_003','PHONE','Reservation adjustment','Asked to add one child to booking',NOW() - INTERVAL '1 day')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Campaign" ("id","name","segment","channel","status","message","scheduledAt","createdAt") VALUES
('cam_001','Weekend Escape Promo','SILVER_AND_GOLD','EMAIL','SENT','Enjoy 20% off on weekend stays at The Manor Hotel.',NOW() - INTERVAL '5 days',NOW() - INTERVAL '8 days')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "CampaignRecipient" ("id","campaignId","customerId","deliveryStatus","deliveredAt") VALUES
('rcp_001','cam_001','cus_001','SENT',NOW() - INTERVAL '5 days'),
('rcp_002','cam_001','cus_002','SENT',NOW() - INTERVAL '5 days'),
('rcp_003','cam_001','cus_004','FAILED',NULL)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "LoyaltyTransaction" ("id","customerId","points","reason","createdAt") VALUES
('ltx_001','cus_001',60,'Stayed for 2 nights',NOW() - INTERVAL '18 days'),
('ltx_002','cus_002',120,'Premium suite booking bonus',NOW() - INTERVAL '12 days'),
('ltx_003','cus_003',40,'First-time booking',NOW() - INTERVAL '6 days')
ON CONFLICT ("id") DO NOTHING;
