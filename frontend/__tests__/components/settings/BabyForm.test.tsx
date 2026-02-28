import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react"
import { BabyForm } from "@/components/settings/BabyForm"
import { expect, vi, describe, it, beforeAll, afterEach } from "vitest"

describe("BabyForm", () => {
    beforeAll(() => {
        global.ResizeObserver = class ResizeObserver {
            observe() {}
            unobserve() {}
            disconnect() {}
        };
    })

    afterEach(() => {
        cleanup()
        vi.clearAllMocks()
    })

    const createProps = () => ({
        onSubmit: vi.fn(),
        onCancel: vi.fn(),
        submitLabel: "保存",
        isSubmitting: false,
    })

    it("授乳とおむつの閾値フィールドが表示されていること", () => {
        render(<BabyForm {...createProps()} />)
        
        expect(screen.getByLabelText(/授乳の警告閾値（分）/)).toBeDefined()
        expect(screen.getByLabelText(/おむつの警告閾値（分）/)).toBeDefined()
    })

    it("数値を入力して送信した際、期待通りのデータが送信されること", async () => {
        const props = createProps()
        const { container } = render(<BabyForm {...props} />)
        
        const nameInput = container.querySelector('input[name="name"]') as HTMLInputElement
        fireEvent.change(nameInput, { target: { value: "たろう" } })
        
        fireEvent.change(screen.getByLabelText(/授乳の警告閾値（分）/), { target: { value: "120" } })
        fireEvent.change(screen.getByLabelText(/おむつの警告閾値（分）/), { target: { value: "180" } })
        
        fireEvent.click(screen.getByText("保存"))
        
        await waitFor(() => {
            const data = props.onSubmit.mock.calls[0][0]
            expect(data).toEqual(expect.objectContaining({
                name: "たろう",
                feeding_threshold_minutes: 120,
                diaper_threshold_minutes: 180,
            }))
        })
    })

    it("空欄で送信した際、nullが送信されること", async () => {
        const props = createProps()
        const { container } = render(<BabyForm {...props} />)
        
        const nameInput = container.querySelector('input[name="name"]') as HTMLInputElement
        fireEvent.change(nameInput, { target: { value: "たろう" } })
        
        fireEvent.change(screen.getByLabelText(/授乳の警告閾値（分）/), { target: { value: "" } })
        
        fireEvent.click(screen.getByText("保存"))
        
        await waitFor(() => {
            const call = props.onSubmit.mock.calls[0][0];
            expect(call.feeding_threshold_minutes).toBe(null);
        })
    })
})
