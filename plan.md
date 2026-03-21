1. **`frontend/components/dashboard/BabyInfoPopup.tsx` のタブUIのアクセシビリティ向上**
   - タブのコンテナ (`<div className="flex border-b border-border/50 mb-4">`) に `role="tablist"` と `aria-label="赤ちゃん情報のタブ"` を追加。
   - 各タブボタン (`<button>`) に `role="tab"`, `aria-selected={activeTab === tab.id}`, および `aria-controls` を追加。

2. **`frontend/components/charts/ChartViewToggle.tsx` のタブUIのアクセシビリティ向上**
   - トグルコンテナに `role="tablist"` と `aria-label="チャートビューの切り替え"` を追加。
   - 各ボタンに `role="tab"`, `aria-selected={active}` を追加 (現在の `aria-pressed` の代わりにタブセマンティクスを使用)。

3. **Pre-commitステップの実行**
   - `pre_commit_instructions` ツールを呼び出し、適切なテスト、検証、レビュー、反映が行われたことを確認します。

4. **変更のコミットとプッシュ**
   - すべてのテストがパスし、変更が期待通りであることを確認したら、コミットしてブランチにプッシュします。
