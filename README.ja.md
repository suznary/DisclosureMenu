[[Click here for the English version](README.md)]

# DisclosureMenu
`DisclosureMenu`クラスは、ウェブアプリケーション用のカスタマイズ可能でアクセシブルなナビゲーションメニュー管理システムです。このクラスは、特にレスポンシブデザインにおいてタッチデバイスと非タッチデバイスの両方をサポートする必要がある場合に使用されるナビゲーションバー内のドロップダウンメニューや展開メニューの動的な処理を提供します。

## 特徴
- **アクセシビリティ**: WAI-ARIA属性を実装してアクセシビリティを向上させます。
- **タッチ＆キーボードサポート**: タッチとキーボードの両方のインタラクションを処理します。
- **動的状態管理**: メニューアイテムの展開と折りたたみ状態を自動的に管理します。

## インストール
プロジェクトに`DisclosureMenu`を組み込むには、クラスファイルをプロジェクトに含めてモジュールとして使用します。

```javascript
import DisclosureMenu from './path/to/DisclosureMenu';
```

## 使用方法

### HTML
HTMLでは、親ナビゲーション要素とそれを制御するメニューのIDを指す`aria-controls`属性を持つ子要素が必要です。

```html
<nav id="disclosure-nav" aria-label="グローバルナビゲーション">
  <ul>
    <li>
      <a class="primary-link" href="#">Menu 1</a>
    </li>
    <li>
      <a class="primary-link" href="#">Menu 2</a>
      <button type="button" aria-expanded="false" aria-controls="submenu1">
        <span class="visually-hidden">Open submenu</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z" fill="black" />
        </svg>
      </button>
      <ul id="submenu1" aria-hidden="true">
        <li>
          <a href="#" tabindex="-1">Sub-item 1</a>
        </li>
        <li>
          <a href="#" tabindex="-1">Sub-item 2</a>
        </li>
      </ul>
    </li>
  </ul>
</nav>
```

### JavaScript
ナビゲーション要素を渡して`DisclosureMenu`をインスタンス化し、オプションで設定オプションを指定します。

```javascript
const navMenu = new DisclosureMenu(document.getElementById('disclosure-nav'), {
  isTouchDevice: true // オプション: タッチデバイス動作を強制
});
```

## 設定オプション
`DisclosureMenu`コンストラクターは、以下のプロパティを持つオプションの`options`オブジェクトを受け入れます：

- **isTouchDevice** （ブール値）: デバイスがタッチデバイスであるかを手動で設定します（自動検出を上書き）。

## メソッド
- **toggleExpanded(index, expand)**: 特定のインデックスのメニューの展開状態を切り替えます。
- **setAriaAttribute(index, expand)**: 展開状態に基づいて適切なARIA属性を設定します。
- **changeTabIndex(index, expand)**: サブメニュー内のフォーカス管理のためにtabindexを更新します。

## イベント
`DisclosureMenu`クラスは`keydown`、`mouseenter`、`focusout`などの様々なイベントを処理し、堅牢なユーザーインタラクションモデルを提供します。

## ブラウザ互換性
ターゲットブラウザが`querySelectorAll`、`addEventListener`、`classList`など、このクラスで使用されるJavaScriptの機能をサポートしていることを確認してください。これらは一般的に最新のブラウザでサポートされています。

## License

MIT @ muro

## 備考
この文書はChatGPTによって作成されました。