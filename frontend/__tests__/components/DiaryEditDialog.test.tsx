import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { vi, describe, it, expect } from 'vitest'
import { DiaryEditDialog } from '@/components/diary/DiaryEditDialog'

describe('DiaryEditDialog Optimistic Locking', () => {
    const mockSummary = {
        id: 1,
        baby_id: 1,
        user_id: 1,
        summary_date: '2026-03-11',
        generated_content: 'Generated',
        edited_content: 'Edited',
        is_edited: true,
        model_name: 'gemini',
        image_urls: [],
        created_at: '2026-03-11T00:00:00Z',
        updated_at: '2026-03-11T00:00:00Z',
        display_content: 'Edited'
    }

    it('shows conflict error message on 409 from onSave', async () => {
        // Create an onSave mock that throws 409
        const mockOnSave = vi.fn().mockRejectedValue({
            response: { status: 409 }
        })

        const onOpenChange = vi.fn()

        render(
            <DiaryEditDialog
                summary={mockSummary}
                open={true}
                onOpenChange={onOpenChange}
                onSave={mockOnSave}
            />
        )

        // Click save
        const saveButton = screen.getByRole('button', { name: '保存' })
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(screen.getByText('他のユーザーによってデータが更新されました。画面を更新して最新のデータを取得してください。')).toBeInTheDocument()
        })

        expect(onOpenChange).not.toHaveBeenCalled()
    })
})
