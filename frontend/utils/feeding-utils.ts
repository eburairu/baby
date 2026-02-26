import { FeedingFormValues } from "@/schemas/feeding"
import { FeedingCreate, FeedingType, BreastSide, BottleContentType, FeedingCompletion } from "@/types/feeding"

interface BuildFeedingPayloadOptions {
    babyId: number
    values: FeedingFormValues
    activeTab: FeedingType
    feedingCompletion: FeedingCompletion | null
    bottleContentType: BottleContentType | null
}

export function buildFeedingPayload({
    babyId,
    values,
    activeTab,
    feedingCompletion,
    bottleContentType
}: BuildFeedingPayloadOptions): FeedingCreate {
    const leftMin = values.left_breast_minutes || 0
    const rightMin = values.right_breast_minutes || 0

    let lastBreastSide: BreastSide | undefined
    if (activeTab === "BREAST") {
        if (leftMin > 0 && rightMin > 0) lastBreastSide = "BOTH"
        else if (leftMin > 0) lastBreastSide = "LEFT"
        else if (rightMin > 0) lastBreastSide = "RIGHT"
    }

    const data: FeedingCreate = {
        baby_id: babyId,
        feeding_time: values.feeding_time,
        feeding_type: activeTab,
        notes: values.notes || "",
        feeding_completion: feedingCompletion,
    }

    if (activeTab === "BREAST") {
        data.left_breast_minutes = leftMin
        data.right_breast_minutes = rightMin
        data.last_breast_side = lastBreastSide
        data.amount_ml = null
        data.bottle_content_type = null
        if (!(leftMin > 0 && rightMin > 0)) {
            data.duration_minutes = leftMin + rightMin || 0
        }
    } else {
        data.amount_ml = values.amount_ml
        data.bottle_content_type = bottleContentType
        data.left_breast_minutes = null
        data.right_breast_minutes = null
        data.last_breast_side = null
        data.duration_minutes = null
    }

    return data
}
