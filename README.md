# clickit-js

version 1.0.0

Copyright 2022 WebbingStudio  
Released under the MIT license  
http://opensource.org/licenses/MIT

----

ClickIt.js is a simple library. Implements the process of "rewriting the class attribute when clicked".

ClickIt.js（クリックイットジェーエス）は「クリックするとclass属性を書き換える」処理を実装できるシンプルなライブラリです。

- Native JavaScript (Vanilla JS)
- WAI-ARIA support
- no webpack needed

See document

https://webbingstudio.github.io/clickit-js/

----

## Quickstart

### Setup

Upload ```clickit.js``` in your site, or import in your webpack project.

### Link ClickIt.js

```html
<script src="/path/to/js/clickit.js"></script>
```

### Markup

#### Example 1: aria-controls (recommend)

```html
<button class="js-clickit my-trigger" aria-controls="my-menu">Menu</button>
. . .

<div id="my-menu" class="my-menu">
    <!-- opens and closes here -->
</div>
```

#### Example 2: anchor

```html
<a href="#my-menu" class="js-clickit my-trigger">Menu</a>
. . .

<div id="my-menu" class="my-menu">
<!-- opens and closes here -->
</div>
```

### Make instance and Init

```clickit``` can be any variable name you like

```html
<script>
const clickit = new ClickIt();

window.addEventListener('DOMContentLoaded', () => {
    clickit.init();
});
</script>
```

... If you want to customize more, read [Options](https://webbingstudio.github.io/clickit-js/#options) and [Method](https://webbingstudio.github.io/clickit-js/#method)

#### Example 1: Drawer menu

```html
<script>
const drawer = new ClickIt({
    trigger: '.drawer',
    sync: '.drawer-close-button'
});

window.addEventListener('DOMContentLoaded', () => {
    drawer.init();
});
</script>
```

#### Example 2: Accordions

```html
<script>
const accordion = new ClickIt({
    trigger: '.accordion-header',
    height: true,
    delay: 500
});

window.addEventListener('DOMContentLoaded', () => {
    accordion.init();
});
</script>
```

#### Example 3: Modal popup

```html
<script>
const modal = new ClickIt({
    mode: 'modal',
    openDelay: 1000,
    closeDelay: 500
});

window.addEventListener('DOMContentLoaded', () => {
    modal.init();
});
</script>
```

#### Example 4: Tabs

```html
<script>
const tabs = new ClickIt({
    mode: 'tab'
});

window.addEventListener('DOMContentLoaded', () => {
    tabs.init();
});
</script>
```

#### Example 5: Cusom method

Global navigation on [docs](https://webbingstudio.github.io/clickit-js/), automatically closes the menu when you click on a link, when you're on the home page (because it's an anchor that scroll in page).

```html
<script>
const drawer = new ClickIt({
    trigger: '.js-drawer',
    delay: 500,
    sync: '.js-drawer-close'
});

window.addEventListener('DOMContentLoaded', () => {
    drawer.init();

    const navs = document.querySelectorAll('.drawer .echo-nav-label');
    if( navs ) {
        navs.forEach( nav => {
            nav.addEventListener( 'click', () => {
                if( (window.location.pathname === '/')||(window.location.pathname.indexOf('/index.html')) ) {
                    drawer.close();
                }
            });
        })
    }
});
</script>
```

### Decorate with CSS

Here is the minimal CSS. the rest is your choice

```css
.my-menu.js-clickit-ready {
    /* After initialization */
    overflow: hidden;
    height: 0;
    opacity: 0;
    transition: opacity 0.5s;
}

.my-menu[aria-hidden="false"] {
    /* open */
    height: auto;
    opacity: 1;
}

.my-menu[aria-hidden="true"] {
    /* close */
}

.my-menu.js-clickit-opening {
    /* while open (require delay property) */
}

.my-menu.js-clickit-closing {
    /* while close (require delay property) */
}

.my-trigger[aria-expanded="true"] {
    /* open */
    color: white;
    background-color: blue;
}

.my-trigger[aria-expanded="false"] {
    /* close */
    color: blue;
    background-color: silver;
}
```

Sorry, the rest content is only in Japanese.

----

## Demo

- [モーダルポップアップ](https://webbingstudio.github.io/clickit-js/modal.html)
- [ハンバーガーメニュー](https://webbingstudio.github.io/clickit-js/hamburger.html)
- [タブ](https://webbingstudio.github.io/clickit-js/tab.html)
- [アコーディオン](https://webbingstudio.github.io/clickit-js/accordion.html)

## Options

### trigger

type: String / default: ```.js-clickit```

トグルボタンなど、クリックイベントのトリガーとなる要素を、querySelectorで認識できる形式で指定します。トリガーには、aria-controls属性、もしくはa要素のアンカーが必須となります（展開される要素のIDとして扱います）。

### sync

type: String / default: ```null```

トリガーとなる要素と同じ動作をする要素（エイリアス）を、querySelectorで認識できる形式で指定します。

### mode

type: String / default: ```null```

(none): aria-control属性のみを制御します。

```popup```: 初期化したときに、トリガーにaria-haspopup属性を付与します。

```modal```: 初期化したときに、トリガーにaria-haspopup属性を付与します。また、展開される要素が開いたときにトリガーのフォーカスを外し、展開される要素にaria-modal属性、role="dialog"を付与します。

```tab```: 初期化したときに、トリガーにaria-selected属性、role="tab"を付与します。また、展開されるとき、選択したトリガーのaria-selected属性をtrueにしたうえで、他のタブをすべて閉じます。

### delay

type: Number / default: ```0```

展開される要素が開閉をはじめてから、設定したミリ秒の間だけ、各要素のaria属性の更新を待機します。待機中は、```openClass```プロパティ等で指定したアニメーションを補助するclassが付与されます。

### openDelay

type: Number / default: ```null```

展開される要素が開きはじめてから、設定したミリ秒の間だけ、各要素のaria属性の更新を待機します。```delay```プロパティを上書きします。

### closeDelay

type: Number / default: ```null```

展開される要素が閉じはじめてから、設定したミリ秒の間だけ、各要素のaria属性の更新を待機します。```delay```プロパティを上書きします。

### height

type: boolean / default: ```false```

```true```を指定すると、展開される要素の高さをstyle属性で付与します。高さは、展開される要素の直下の子要素の高さを参照します。ウィンドウのサイズが変更されると、500ミリ秒ごとに再計算が行われます。

### closeOther

type: boolean / default: ```false```

```true```を指定すると、要素が展開される都度、それ以外をすべて閉じます。```trigger```プロパティで指定した要素がひとつしかなかった場合は、何も起きません。

### readyClass

type: String / default: ```js-clickit-ready```

初期化が終了したときに、展開される要素に付与するclass名を指定します。

### openClass

type: String / default: ```js-clickit-opening```

展開される要素が開きはじめてから、ARIA属性が書き換えられるまでの間（```delay```プロパティで指定したミリ秒）に、展開される要素に付与するclass名を指定します。

### closeClass

type: String / default: ```js-clickit-closing```

展開される要素が閉じはじめてから、ARIA属性が書き換えられるまでの間（```delay```プロパティで指定したミリ秒）に、展開される要素に付与するclass名を指定します。

### lockClass

type: String / default: ```js-clickit-lock```

展開される要素が開閉をはじめてから、ARIA属性が書き換えられるまでの間（```delay```プロパティで指定したミリ秒）に、トリガー、エイリアスの両方に付与するclass名を指定します。このクラスが付与されている間はクリックイベントが無効になります。

## Method

### init()

parameter = (none)

インスタンスを作成したあと、すべてのクリックイベントが有効になるようセットアップします。複数回の実行や、再起動は想定していません。

### open()

parameter = type: Number / default: ```0```

（指定した数値）番目の要素を開きます。引数は0から数えるため、0がドキュメント内で最初に出現した要素となります。

### close()

parameter = type: Number / default: ```0```

（指定した数値）番目の要素を閉じます。引数は0から数えるため、0がドキュメント内で最初に出現した要素となります。

### closeOther()

parameter = type: Number / default: ```0```

（指定した数値）番目以外の要素を閉じます。引数は0から数えるため、0がドキュメント内で最初に出現した要素となります。

### openAll()

parameter = (none)

すべての要素を開きます。

### closeAll()

parameter = (none)

すべての要素を閉じます。

### setHeight()

parameter = type: Number / default: ```0```

（指定した数値）番目以外の高さを再計算し、data属性を更新します。引数は0から数えるため、0がドキュメント内で最初に出現した要素となります。

----

© 2022 webbingstudio.com

// For a moment, but like a flash
