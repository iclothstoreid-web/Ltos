'use client'

import type { ProductionPacket } from '@/lib/production/types'
import type { DesignSelections } from '@/components/workspace/design-studio/types'
import type { MeasurementFields } from '@/components/workspace/measurement/types'
import type { ConsultationDocument } from '@/components/workspace/consultation-review/fitterEnhancementsCodec'
import { getCurrentStageRecord } from '@/lib/production/stageConfig'
import { StageProgressRail } from '@/components/workspace/production/StageProgressRail'
import { MediaProduksiCard } from '@/components/workspace/production/MediaProduksiCard'
import { TechnicalDetailsCard } from '@/components/workspace/order-created/TechnicalDetailsCard'
import { CustomerJourneyShareActions } from '@/components/workspace/order-created/CustomerJourneyShareActions'
import { OrderSummaryHeroCard } from './OrderSummaryHeroCard'
import { OrderSummaryMeasurementCard } from './OrderSummaryMeasurementCard'
import { ProductionQrCard } from './ProductionQrCard'
import { ShippingSummaryCard } from './ShippingSummaryCard'

interface OrderSummaryWorkspaceProps {
  orderId: string
  orderNumber: string
  orderCreatedAt: string
  estimasi: string
  customerToken: string
  customerName: string
  customerPhone: string | null
  isPreferredClient: boolean
  design: DesignSelections | null
  measurement: MeasurementFields | null
  bodyTags: string[]
  packet: ProductionPacket | null
  customerPhotoUrl: string | null
  customerReferences: ConsultationDocument[]
}

// Order Summary — Task 2 of the Fitter Order Monitoring & Shipping
// Experience sprint. 100% read-only: no edit links, no Create
// Order/Simpan Konsultasi actions, no document uploader, no estimasi
// selector (unlike consultation-review/ConsultationReviewWorkspace, which
// stays the pre-order editable screen). Every section below reuses an
// existing component rather than re-implementing its display logic —
// see the master prompt's "Reuse seluruh component yang sudah ada" rule.
//
// Section order follows the master prompt's own priority list: Customer ->
// Status Produksi -> Timeline -> Media Produksi -> QR Production -> QR
// Journey -> Shipping -> Measurement -> Design Summary -> Customer
// Reference. Customer Reference is folded into Media Produksi (via the
// already-existing MediaProduksiCard, which already composes
// CustomerReferenceCard) rather than rendered a second time at the bottom —
// avoids a duplicate section for the same data, per the "jangan membuat
// duplicate page" rule.
export function OrderSummaryWorkspace({
  orderId,
  orderNumber,
  orderCreatedAt,
  estimasi,
  customerToken,
  customerName,
  customerPhone,
  isPreferredClient,
  design,
  measurement,
  bodyTags,
  packet,
  customerPhotoUrl,
  customerReferences,
}: OrderSummaryWorkspaceProps) {
  const currentStage = packet
    ? (getCurrentStageRecord(packet.stage_records)?.stage ?? 'shipping')
    : 'material_prep'

  const packingVideoUrl = packet
    ? [...packet.stage_records]
        .filter(r => r.stage === 'packing')
        .sort((a, b) => b.attempt - a.attempt)[0]?.video_url ?? null
    : null

  return (
    <div className="min-h-screen bg-[#FDFCF7]">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <p className="font-hanken text-[10px] uppercase tracking-widest text-[#755b00] mb-1">
            Order Summary &middot; Hanya Baca
          </p>
          <h1 className="font-caslon text-2xl text-[#161b29]">{orderNumber}</h1>
        </div>

        <OrderSummaryHeroCard
          customerName={customerName}
          isPreferredClient={isPreferredClient}
          orderNumber={orderNumber}
          orderCreatedAt={orderCreatedAt}
          estimasi={estimasi}
          packet={packet}
        />

        {packet && (
          <StageProgressRail
            stageRecords={packet.stage_records}
            currentStage={currentStage}
            variant="vertical"
          />
        )}

        <MediaProduksiCard
          customerPhotoUrl={customerPhotoUrl}
          customerReferences={customerReferences}
          packingVideoUrl={packingVideoUrl}
        />

        <ProductionQrCard orderId={orderId} orderNumber={orderNumber} />

        <CustomerJourneyShareActions
          customerToken={customerToken}
          customerName={customerName}
          customerPhone={customerPhone}
          orderNumber={orderNumber}
        />

        {packet && <ShippingSummaryCard stageRecords={packet.stage_records} />}

        <OrderSummaryMeasurementCard measurement={measurement} bodyTags={bodyTags} />

        {design && <TechnicalDetailsCard design={design} />}
      </div>
    </div>
  )
}
