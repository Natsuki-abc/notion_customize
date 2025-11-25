$(function() {

  // 要素定義
  const notionApp = '#notion-app';
  const notionScroller = '.notion-scroller';
  const notionPageContent = '.notion-page-content';

  /**
   * 1. Outlineをサイドバーに表示
   *
   */
  function addOutlineToSidebar() {
    let outlineContainer = null;

    const updateOutline = () => {
      // ページの見出しを取得（Notionの見出しブロックを対象）
      const headings = Array.from(document.querySelectorAll(
        'h1[data-block-id], h2[data-block-id], h3[data-block-id], ' +
        '.notion-h, .notion-h1, .notion-h2, .notion-h3, ' +
        '[class*="notion-h1"], [class*="notion-h2"], [class*="notion-h3"]'
      )).filter(h => {
        const text = h.textContent.trim();
        return text.length > 0 && h.offsetParent !== null;
      });

      if (headings.length === 0) {
        if (outlineContainer) outlineContainer.style.display = 'none';
        return;
      }

      // Outlineコンテナが存在しない場合は作成
      if (!outlineContainer) {
        outlineContainer = document.createElement('div');
        outlineContainer.className = 'notion-customize-outline';
        outlineContainer.innerHTML = `
          <div class="notion-customize-outline-header">目次</div>
          <div class="notion-customize-outline-content"></div>
        `;
        document.body.appendChild(outlineContainer);
      }

      outlineContainer.style.display = 'block';
      const outlineContent = outlineContainer.querySelector('.notion-customize-outline-content');
      outlineContent.innerHTML = '';

      headings.forEach((heading, index) => {
        // 見出しのレベルを判定
        let level = 1;
        if (heading.tagName === 'H1' || heading.classList.contains('notion-h1') || heading.className.includes('h1')) {
          level = 1;
        } else if (heading.tagName === 'H2' || heading.classList.contains('notion-h2') || heading.className.includes('h2')) {
          level = 2;
        } else if (heading.tagName === 'H3' || heading.classList.contains('notion-h3') || heading.className.includes('h3')) {
          level = 3;
        } else {
          level = parseInt(heading.tagName.charAt(1)) || 1;
        }

        const text = heading.textContent.trim();
        const id = `notion-heading-${index}-${Date.now()}`;

        if (!heading.id) {
          heading.id = id;
        }

        const link = document.createElement('a');
        link.href = `#${heading.id}`;
        link.textContent = text;
        link.className = `notion-customize-outline-link level-${level}`;
        link.addEventListener('click', (e) => {
          e.preventDefault();
          heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        outlineContent.appendChild(link);
      });
    };

    const observer = new MutationObserver(() => {
      updateOutline();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // 初期実行
    setTimeout(updateOutline, 1000);
  }

  /**
   * 2. 画面topへのスクロールボタンを右下に作成
   *
   */
  function addScrollToTopButton() {
    onNotionPageContentReady(notionScroller, ($notionScroller) => {
      const $scrollTarget = $notionScroller.first();

      const $scrollToTopButton = $('<button>', {
        class: 'notion-customize-scroll-to-top',
        html: '↑',
        'aria-label': 'ページトップへ戻る'
      }).hide().appendTo('body');

      $scrollToTopButton.on('click', () => {
        $scrollTarget.stop(true).animate({ scrollTop: 0 }, 500);
      });

      $scrollTarget.on('scroll', () => {
        $scrollToTopButton.toggle($scrollTarget.scrollTop() > 300);
      });
    });
  }

  /**
   * 3. フォントがDefaultの場合、Noto Sans JPを使用（Mono選択時は未考慮）
   *
   */
  function applyNotoSansFont() {
    onNotionPageContentReady(notionPageContent, ($notionPageContent) => {
      console.log("Notionページコンテンツが描画されました:", $notionPageContent);

      // フォント「Serif」を選択している場合は、return
      if ($notionPageContent.css('font-family')?.includes('YuMincho')) return;

      // フォントを変更する
      $notionPageContent.css('font-family', 'Noto Sans JP, Noto Sans, sans-serif');
      console.log('フォントを変更しました');
    });
  }

  /**
   * 4. コードブロックに行番号を表示
   *
   */
  function addLineNumbersToCodeBlocks() {
    const processedBlocks = new WeakSet();

    const processCodeBlock = (block) => {
      if (processedBlocks.has(block)) return;
      processedBlocks.add(block);

      // 既にラッパーが存在する場合はスキップ
      if (block.closest('.notion-customize-code-wrapper')) return;

      const codeElement = block.querySelector('code') || block;
      if (!codeElement) return;

      const text = codeElement.textContent || '';
      const lines = text.split('\n');

      if (lines.length <= 1) return;

      // ラッパーを作成
      const wrapper = document.createElement('div');
      wrapper.className = 'notion-customize-code-wrapper';

      // 行番号コンテナを作成
      const lineNumbers = document.createElement('div');
      lineNumbers.className = 'notion-customize-line-numbers-container';

      lines.forEach((_, index) => {
        const lineNumber = document.createElement('div');
        lineNumber.className = 'notion-customize-line-number';
        lineNumber.textContent = index + 1;
        lineNumbers.appendChild(lineNumber);
      });

      // ブロックをラッパーで囲む
      block.parentNode.insertBefore(wrapper, block);
      wrapper.appendChild(lineNumbers);
      wrapper.appendChild(block);
      block.classList.add('notion-customize-line-numbers');
    };

    const observer = new MutationObserver(() => {
      // Notionのコードブロックを検索
      const codeBlocks = document.querySelectorAll(
        '.notion-code-block, ' +
        '[class*="notion-code"], ' +
        'pre[class*="code"], ' +
        'code[class*="language-"]'
      );

      codeBlocks.forEach(block => {
        // preタグの場合はその親を処理
        const targetBlock = block.tagName === 'CODE' && block.parentElement?.tagName === 'PRE'
          ? block.parentElement
          : block;
        processCodeBlock(targetBlock);
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * 5. コードブロック内でスペルチェックを実行
   *
   */
  function enableSpellCheckInCodeBlocks() {
    const observer = new MutationObserver(() => {
      const codeBlocks = document.querySelectorAll(
        '.notion-code-block code, ' +
        'code[class*="language-"], ' +
        '[class*="notion-code"] code, ' +
        'pre code'
      );

      codeBlocks.forEach(block => {
        if (block.isContentEditable || block.closest('[contenteditable="true"]')) {
          block.setAttribute('spellcheck', 'true');
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }


  /**
   * 6. 箇条書きリストに垂直のインデント行を表示
   *
   */
  function addVerticalIndentLinesToList() {
    const style = document.createElement('style');
    style.id = 'notion-customize-list-indent';
    style.textContent = `
      .notion-list-item,
      .notion-list-item-container {
        position: relative;
      }
      .notion-list-item:not(:last-child)::after,
      .notion-list-item-container:not(:last-child)::after {
        content: '';
        position: absolute;
        left: 0;
        top: 1.5em;
        bottom: -0.5em;
        width: 1px;
        background-color: rgba(55, 53, 47, 0.16);
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 7. TODOリストに垂直のインデント行を表示
   *
   */
  function addVerticalIndentLinesToTodos() {
    const style = document.createElement('style');
    style.id = 'notion-customize-todo-indent';
    style.textContent = `
      .notion-to-do-item,
      .notion-to-do-block {
        position: relative;
      }
      .notion-to-do-item:not(:last-child)::after,
      .notion-to-do-block:not(:last-child)::after {
        content: '';
        position: absolute;
        left: 0;
        top: 1.5em;
        bottom: -0.5em;
        width: 1px;
        background-color: rgba(55, 53, 47, 0.16);
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 8. 全てのページからコメントセクションの削除
   *
   */
  function removeCommentSections() {
    const observer = new MutationObserver(() => {
      // より具体的なセレクタでコメントセクションを検索
      const commentSections = document.querySelectorAll(
        '[data-block-id*="comment"]:not([data-block-id*="comment-button"]), ' +
        '.notion-comments, ' +
        '[class*="comment-section"], ' +
        '[class*="comments-container"], ' +
        '[aria-label*="Comment"][aria-label*="section"], ' +
        '[aria-label*="Comments"]'
      );

      commentSections.forEach(section => {
        // コメントボタンは除外
        if (section.closest('button') || section.tagName === 'BUTTON') return;
        section.style.display = 'none';
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // 初期化
  function init() {
    // DOMが読み込まれた後に実行
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    addOutlineToSidebar();
    applyNotoSansFont();
    addLineNumbersToCodeBlocks();
    enableSpellCheckInCodeBlocks();
    addVerticalIndentLinesToList();
    addVerticalIndentLinesToTodos();
    removeCommentSections();
  }

  // ページ遷移を監視（NotionはSPAなので）
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(init, 1000);
    }
  }).observe(document, { subtree: true, childList: true });

  addOutlineToSidebar();
  addScrollToTopButton();
  applyNotoSansFont();
  addLineNumbersToCodeBlocks();
  enableSpellCheckInCodeBlocks();
  addVerticalIndentLinesToList();
  addVerticalIndentLinesToTodos();
  removeCommentSections();
  console.log('一番外：1回だけ実行されるはず');

  /**
   * ページ監視用の共通関数
   *
   */
  function onNotionPageContentReady(selector, callback) {
    // 初期ロード時にすでに存在している場合
    if ($(selector).length > 0) {
      callback($(selector));
      console.log('初期ロード');

      return;
    }

    // MutationObserverで監視
    const observer = new MutationObserver((mutations) => {
      console.log('監視中');

      if ($(selector).length > 0) {
        console.log('見つかった');

        observer.disconnect(); // 見つかったら停止
        callback($(selector));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

});
