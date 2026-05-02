-- AlterTable
ALTER TABLE "businesses" ADD COLUMN     "razorpay_key_id" TEXT,
ADD COLUMN     "razorpay_key_secret" TEXT;

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "email_opened_at" TIMESTAMP(3),
ADD COLUMN     "public_id_expires_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" SERIAL NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "business_id" INTEGER NOT NULL,
    "to_email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "sent_at" TIMESTAMP(3),
    "opened_at" TIMESTAMP(3),
    "failure_reason" TEXT,
    "next_retry_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_events" (
    "id" SERIAL NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "business_id" INTEGER NOT NULL,
    "event_type" TEXT NOT NULL,
    "actor_type" TEXT NOT NULL,
    "actor_id" INTEGER,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_logs_invoice_id_idx" ON "email_logs"("invoice_id");

-- CreateIndex
CREATE INDEX "email_logs_business_id_idx" ON "email_logs"("business_id");

-- CreateIndex
CREATE INDEX "invoice_events_invoice_id_idx" ON "invoice_events"("invoice_id");

-- CreateIndex
CREATE INDEX "invoice_events_business_id_idx" ON "invoice_events"("business_id");

-- AddForeignKey
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_events" ADD CONSTRAINT "invoice_events_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_events" ADD CONSTRAINT "invoice_events_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
