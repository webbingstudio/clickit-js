/*!
 * ClickIt.js v1.0.0
 * Clickit.js is a simple library. Implements the process of "rewriting the class attribute when clicked".
 * 
 * https://github.com/webbingstudio/clickit-js
 * https://webbingstudio.github.io/clickit-js/
 * 
 * Copyright 2022 WebbingStudio
 * Released under the MIT license
 * https://opensource.org/licenses/MIT
 */

class ClickIt {

  constructor(options) {
    this.initial = {
      trigger: '.js-clickit',
      sync: null,
      mode: null,
      delay: 0,
      openDelay: null,
      closeDelay: null,
      height: false,
      closeOther: false,
      readyClass: 'js-clickit-ready',
      openClass: 'js-clickit-opening',
      closeClass: 'js-clickit-closing',
      lockClass: 'js-clickit-lock'
    };
    this.settings = Object.assign( this.initial, options );

    if( ( !this.settings.openDelay )||( isNaN(this.settings.openDelay) ) ) {
      this.settings.openDelay = this.settings.delay;
    }
    if( ( !this.settings.closeDelay )||( isNaN(this.settings.closeDelay) ) ) {
      this.settings.closeDelay = this.settings.delay;
    }

    // modeがtabであればcloseOtherを有効にする
    if( this.settings.mode === 'tab' ) {
      this.settings.closeOther = true;
    }

    this.controls = [];
    this.syncs = [];

    // トリガーを取得
    this.triggers = document.querySelectorAll(this.settings.trigger);
    if( this.triggers ) {
      // console.log('トリガーに指定した要素が見つかりませんでした');
      return false;
    }
  
  }

  // 初期化
  init = () => {
    this.triggers.forEach( ( trigger, i ) => {
      let key = i;

      // 展開する要素を取得
      // aria-controls属性、もしくはhref属性のアンカーを展開する要素として扱う
      let control_id = trigger.getAttribute('aria-controls');
      control_id = !control_id ? trigger.hash.replace(/^#/, '') : control_id;
      if(!control_id) {
        // console.log('展開する要素を示すIDが見つかりませんでした');
        return false;
      }

      this.controls[key] = document.getElementById(control_id);
      if(!this.controls[key]) {
        // console.log('展開する要素が見つかりませんでした');
        return false;
      }

      // modeがpopupかmodalであればWAI-ARIA属性を追加
      if( ( this.settings.mode === 'popup' )||( this.settings.mode === 'modal' ) ) {
        trigger.setAttribute( 'aria-haspopup', 'true' );
      }
      // modeがtabであればroleを追加
      if( this.settings.mode === 'tab' ) {
        trigger.setAttribute( 'role', 'tab' );
      }

      // 展開する要素が存在していればWAI-ARIA属性を付与する
      // modeがtabであればWAI-ARIA属性を追加
      trigger.setAttribute( 'aria-controls', control_id );
      if( trigger.getAttribute('aria-expanded') === 'true' ) {
        this.controls[key].setAttribute( 'aria-hidden', false );
        if( this.settings.mode === 'tab' ) {
          trigger.setAttribute( 'aria-selected', 'true' );
        }
      } else {
        trigger.setAttribute( 'aria-expanded', false );
        this.controls[key].setAttribute( 'aria-hidden', true );
        if( this.settings.mode === 'tab' ) {
          trigger.setAttribute( 'aria-selected', 'false' );
        }
      }

      // heightが有効であれば展開する要素にインラインスタイルで高さを付与する
      if( this.settings.height === true ) {
        this.setHeight(key);
      }

      this.controls[key].classList.add(this.settings.readyClass);

      // 同期する要素（トリガーのエイリアス）を取得
      // this.settings.sync、もしくはdata-clickit-sync属性を同期する要素として扱う
      let sync_selector = this.settings.sync ? this.settings.sync : trigger.dataset.clickitSync;

      // たとえエイリアスが存在しないとしても配列であると宣言しておかないとあとでforEachが実行できずエラーになる
      this.syncs[key] = sync_selector ? document.querySelectorAll(sync_selector) : [];

      // 同期する要素が存在していればトリガーにクリックイベントを付与する
      trigger.addEventListener( 'click', e => {
        // e.currentTarget = クリックした自身
        this.afterClick( e.currentTarget, key, trigger, this.controls[key], this.syncs[key] );
      });

      // 同期する要素が存在していればトリガーと同じWAI-ARIA属性とクリックイベントを付与する
      if( (this.syncs[key])&&(this.syncs[key].length > 0) ) {
        this.syncs[key].forEach( sync => {
          sync.setAttribute( 'aria-controls', control_id );
          sync.addEventListener( 'click', e => {
            this.afterClick( e.currentTarget, key, trigger, this.controls[key], this.syncs[key] );
          });
          if( ( this.settings.mode === 'popup' )||( this.settings.mode === 'modal' ) ) {
            sync.setAttribute( 'aria-haspopup', 'true' );
          }
        })
      }

      // heightが有効であればリサイズ時に高さを再計算する
      if( this.settings.height === true ) {
        window.addEventListener( 'resize', () => {
          this.setHeight(key);
        });
      }

    })
  
  }

  // クリック直後に展開可能かをチェックする
  afterClick = ( currentTarget, key, trigger, control, sync ) => {
    // 連打による暴走を防ぐ。アニメーション実行中クラスがあれば中断
    if( currentTarget.classList.contains(this.settings.lockClass) ) {
      // console.log('そんなに焦らないでください');
      return false;
    }

    if( this.settings.closeOther === true ) {
      this.closeOther(key);
    }
    // modeがmodalであれば強制的にフォーカスを外す
    if( this.settings.mode === 'modal' ) {
      currentTarget.blur();
    }

    // aria-expanded属性の値によって開閉を判定する
    if ( currentTarget.getAttribute('aria-expanded') === 'false' ) {
      this.open(key);
    } else {
      this.close(key);
    }
  }

  // 開く（トリガー、展開する要素、トリガーと同期する要素）
  open = ( key = 0 ) => {
    const trigger = this.triggers[key];
    const control = this.controls[key];
    const syncs = this.syncs[key];
    trigger.classList.add(this.settings.lockClass);
    trigger.setAttribute( 'aria-expanded', 'true' );
    syncs.forEach( sync => {
      sync.classList.add(this.settings.lockClass);
      sync.setAttribute( 'aria-expanded', 'true' );
    })

    // modeがtabであればWAI_ARIA属性を変更
    if( this.settings.mode === 'tab' ) {
      trigger.setAttribute( 'aria-selected', 'true' );
    }

    // アニメーション実行中クラスを付与
    control.classList.add(this.settings.openClass);

    // 高さを0にする
    if( this.settings.height === true ) {
      control.style.height = '0px';
    }

    setTimeout( () => {
      // 高さをすぐにdata属性に保存していた値に復元してCSSアニメーションを補助する
      if( this.settings.height === true ) {
        control.style.height = control.dataset.clickitHeight;
      }
    }, 10 );

    setTimeout( () => {
      // openDelayの値だけ待機した後にアニメーション実行中クラスを削除
      control.setAttribute( 'aria-hidden', 'false' );
      control.classList.remove(this.settings.openClass);

      // modeがmodalであればロールと属性を追加
      if( this.settings.mode === 'modal' ) {
        control.setAttribute( 'aria-modal', 'true' );
        control.setAttribute( 'role', 'dialog' );
      }
  
      // heightを破棄=外部CSSの指定に戻す
      if( this.settings.height === true ) {
        control.style.height = '';
      }

      // ロックを解除する
      trigger.classList.remove(this.settings.lockClass);
      syncs.forEach( sync => {
        sync.classList.remove(this.settings.lockClass);
      })
    }, this.settings.openDelay );

  }

  // 閉じる（クリックした自身、展開する要素、クリックした自身と同期する要素）
  close = ( key = 0 ) => {
    const trigger = this.triggers[key];
    const control = this.controls[key];
    const syncs = this.syncs[key];
    trigger.classList.add(this.settings.lockClass);
    trigger.setAttribute( 'aria-expanded', 'false' );
    syncs.forEach( sync => {
      sync.classList.add(this.settings.lockClass);
      sync.setAttribute( 'aria-expanded', 'false' );
    })

    // modeがtabであればWAI_ARIA属性を変更
    if( this.settings.mode === 'tab' ) {
      trigger.setAttribute( 'aria-selected', 'false' );
    }

    // アニメーション実行中クラスを付与
    control.classList.add(this.settings.closeClass);

    // 高さをdata属性に保存していた値に復元する
    if( this.settings.height === true ) {
      control.style.height = control.dataset.clickitHeight;
    }

    setTimeout( () => {
      // 高さをすぐに0pxにしてCSSアニメーションを補助する
      if( this.settings.height === true ) {
        control.style.height = '0px';
      }
    }, 10 );

    setTimeout( () => {
      // closeDelayの値だけ待機した後にアニメーション実行中クラスを削除
      control.setAttribute( 'aria-hidden', 'true' );
      control.classList.remove(this.settings.closeClass);

      // modeがmodalであればロールと属性を破棄
      if( this.settings.mode === 'modal' ) {
        control.removeAttribute('aria-modal');
        control.removeAttribute('role');
      }

      // heightを破棄=外部CSSの指定に戻す
      if( this.settings.height === true ) {
        control.style.height = '';
      }

      // ロックを解除する
      trigger.classList.remove(this.settings.lockClass);
      syncs.forEach( sync => {
        sync.classList.remove(this.settings.lockClass);
      })
    }, this.settings.closeDelay );

  }

  // すべて開く
  openAll = () => {
    this.triggers.forEach( i => {
      this.open(i);
    })
  }

  // すべて閉じる
  closeAll = () => {
    this.triggers.forEach( i => {
      this.close(i);
    })
  }

  // 他を閉じる
  closeOther = current => {
    this.triggers.forEach( ( trigger, i ) => {
      if( current != i ) {
        this.close(i);
      }
    })
  }

  setHeight = ( key = 0 ) => {
    let control = this.controls[key];
    setTimeout( () => {
      control.dataset.clickitHeight = control.firstElementChild.clientHeight + 'px';
    }, 500 );
  }
  
};
