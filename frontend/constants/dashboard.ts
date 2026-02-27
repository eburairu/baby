/**
 * ダッシュボードのハニカムグリッドに関する定数
 */
export const DASHBOARD_UI = {
    /** ウィジェットの基本サイズ（高さ/直径） */
    WIDGET_SIZE: {
        DESKTOP: 160,
        MOBILE: 140,
    },
    /** ウィジェット間の隙間 */
    WIDGET_GAP: 16,
    /** 
     * ハニカムグリッドの配置パターン
     * [[row0], [row1], [row2]]
     * 0: Feeding, 1: Sleep, 2: Diaper, 3: Growth, 4: Note, 5: Diary
     */
    WIDGET_ROWS: [[0, 2], [1, null, 3], [4, 5]],
} as const;
