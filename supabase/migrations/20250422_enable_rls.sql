-- Enable Row Level Security on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Gown" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClientOnboarding" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InvoiceItem" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for Invoice table
-- Allow all operations for now (you can restrict this later based on your auth needs)
CREATE POLICY "Enable all for Invoice" ON "Invoice" FOR ALL USING (true) WITH CHECK (true);

-- Create RLS policies for InvoiceItem table
CREATE POLICY "Enable all for InvoiceItem" ON "InvoiceItem" FOR ALL USING (true) WITH CHECK (true);

-- Create RLS policies for User table
CREATE POLICY "Enable all for User" ON "User" FOR ALL USING (true) WITH CHECK (true);

-- Create RLS policies for Gown table
CREATE POLICY "Enable all for Gown" ON "Gown" FOR ALL USING (true) WITH CHECK (true);

-- Create RLS policies for Order table
CREATE POLICY "Enable all for Order" ON "Order" FOR ALL USING (true) WITH CHECK (true);

-- Create RLS policies for OrderItem table
CREATE POLICY "Enable all for OrderItem" ON "OrderItem" FOR ALL USING (true) WITH CHECK (true);

-- Create RLS policies for ClientOnboarding table
CREATE POLICY "Enable all for ClientOnboarding" ON "ClientOnboarding" FOR ALL USING (true) WITH CHECK (true);
