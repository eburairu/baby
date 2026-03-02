2023-10-25 - [React Hooks]
学び: setTimeoutをuseEffect内で使用する際、アンマウント時のクリーンアップ処理（clearTimeout）を忘れると、アンマウント済みのコンポーネントに対する状態更新（setState）が発生し、メモリリークの原因となる。
アクション: 今後、useEffect内で非同期処理（タイマーやイベントリスナー）を登録する場合は、必ずクリーンアップ関数を返す設計にする。

2023-10-25 - [React Hook Form]
学び: React Hook Formの `form.watch` をコンポーネントのトップレベルで直接呼び出すと、値の変更ごとにコンポーネント全体が再レンダリングされてしまう。また、React Compiler（React19以降の実験的機能など）において「incompatible library」の警告を引き起こす。
アクション: 特定のフィールド値のみを監視したい場合は、常に `useWatch({ control, name })` を使用し、不要な再レンダリングを防ぎ、コンパイラの警告を解消する。

2023-10-25 - [TypeScript]
学び: zodResolverを使用する際に型エラーを回避する目的で `as any` を安易に使用すると、TypeScriptの厳密な型チェックが機能しなくなる。
アクション: どうしても型の不一致を解消する必要がある場合は、`as unknown as Resolver<FormValuesType>` のように一旦 `unknown` を経由して目的の型にキャストすることで、anyの利用を避け、型安全性を確保する。
