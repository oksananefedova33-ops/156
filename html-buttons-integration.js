// /ui/html-buttons/html-buttons-integration.js

(function() {
  'use strict';

  // Ждем загрузки HtmlPreviewModal
  const waitForDependencies = () => {
    return new Promise((resolve) => {
      const check = () => {
        if (window.HtmlPreviewModal && window.HtmlButtonGenerator) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  };

  // Интеграция с HTML Preview Modal
  async function integrateWithHtmlPreview() {
    await waitForDependencies();

    // Патчим метод createModal для добавления кнопок
    const originalCreateModal = window.HtmlPreviewModal.prototype.createModal;

    window.HtmlPreviewModal.prototype.createModal = function() {
      // Вызываем оригинальный метод
      originalCreateModal.call(this);

      // Добавляем наши кнопки в toolbar
      const toolbar = this.modal.querySelector('.html-preview-editor-panel .html-preview-search-container');
      
      if (toolbar) {
        // Создаем контейнер для наших кнопок
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'display:flex; gap:8px; padding:8px 12px; border-bottom:1px solid #1f2b3b; background:#0a0f1a;';

        // Кнопка "Вставить кнопку-ссылку"
        const btnInsertLink = document.createElement('button');
        btnInsertLink.className = 'html-preview-btn';
        btnInsertLink.style.cssText = 'padding:6px 12px; font-size:13px; flex:1;';
        btnInsertLink.innerHTML = '🔗 Кнопка-ссылка';
        btnInsertLink.title = 'Создать HTML-код кнопки-ссылки';

        // Кнопка "Вставить кнопку-файл"
        const btnInsertFile = document.createElement('button');
        btnInsertFile.className = 'html-preview-btn';
        btnInsertFile.style.cssText = 'padding:6px 12px; font-size:13px; flex:1;';
        btnInsertFile.innerHTML = '📎 Кнопка-файл';
        btnInsertFile.title = 'Создать HTML-код кнопки-файла';

        buttonContainer.appendChild(btnInsertLink);
        buttonContainer.appendChild(btnInsertFile);

        // Вставляем контейнер после toolbar
        toolbar.parentNode.insertBefore(buttonContainer, toolbar.nextSibling);

        // Обработчики событий
        const self = this;
        const generator = new window.HtmlButtonGenerator();

        btnInsertLink.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();

          generator.openLinkButtonModal((html) => {
            insertHtmlAtCursor(self.textarea, html);
            self.refreshPreview();
          });
        });

        btnInsertFile.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();

          generator.openFileButtonModal((html) => {
            insertHtmlAtCursor(self.textarea, html);
            self.refreshPreview();
          });
        });
      }
    };

    console.log('✅ HTML Buttons integration loaded');
  }

  // Вспомогательная функция для вставки HTML в позицию курсора
  function insertHtmlAtCursor(textarea, html) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    // Вставляем HTML с переносами строк для читаемости
    const before = text.substring(0, start);
    const after = text.substring(end);
    const insert = '\n' + html + '\n';

    textarea.value = before + insert + after;

    // Устанавливаем курсор после вставленного кода
    const newPosition = start + insert.length;
    textarea.setSelectionRange(newPosition, newPosition);
    textarea.focus();

    // Триггерим событие input для обновления
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // Инициализация при загрузке страницы
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', integrateWithHtmlPreview);
  } else {
    integrateWithHtmlPreview();
  }
})();