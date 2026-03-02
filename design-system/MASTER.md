# Botoro Hexagonal Design System (MASTER)

## Concept
"Soft Honeycomb" - 育児の温かさと、機能的な記録の整理を両立させる正六角形（Rounded Hexagon）を基調としたデザイン。

## Shape: Rounded Hexagon
- **Geometry**: 正六角形（Regular Hexagon）
- **Radius**: 角の丸み（Radius）はサイズに対して一定の割合（デフォルト 12%）とし、小さいサイズでも六角形の形状が維持されるようにする。刺々しさを排除しつつ、一貫したアスペクト比を保つ。
- **Orientation**: 頂点が上下に来る（Pointy-topped）配置をデフォルトとする。

## Colors
- **Primary**: #F472B6 (oklch(0.72 0.18 350)) - Soft Pink
- **Secondary**: #FBCFE8 (oklch(0.90 0.07 350)) - Pale Pink
- **Accent (Safe)**: #22C55E (oklch(0.72 0.19 142)) - Nature Green
- **Background**: #FDF2F8 (oklch(0.98 0.012 350)) - Warm Pinkish White

## Typography
- **Headings**: Varela Round - 柔らかい丸みのあるフォント
- **Body**: Nunito Sans - 読みやすく親しみやすいフォント

## Component Guidelines
### 1. Hexagon Buttons
- アイコンを中央に配置。
- ホバー時にはわずかに拡大（scale-105）し、ソフトなシャドウを強める。
- アクティブな記録（例：睡眠中）は、六角形の縁を光らせる（Glow effect）。

### 2. Honeycomb Grid
- クイックアクションバーなどのボタン群は、互い違いに配置してハニカム構造を作る。
- 余白を一定に保ち、有機的な繋がりを感じさせる。

### 3. Claymorphism Integration
- `clay-card` ユーティリティと組み合わせ、立体感のある柔らかいUIを実現する。

## Accessibility
- コントラスト比 4.5:1 以上を維持。
- 六角形の形状にかかわらず、クリック可能な領域は十分な広さを確保する（最小 44x44px）。
