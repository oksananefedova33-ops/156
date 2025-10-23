// /ui/html-buttons/html-buttons.js

(function() {
  'use strict';

  const COLORS = {
    linkbtn: ['#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#6366f1', '#ec4899', '#14b8a6'],
    filebtn: ['#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#6366f1', '#ec4899', '#14b8a6']
  };

  const ANIMATIONS = [
    { key: 'none', label: '🚫 Нет' },
    { key: 'pulse', label: '💓 Пульсация' },
    { key: 'shake', label: '🔔 Встряхивание' },
    { key: 'fade', label: '✨ Мерцание' },
    { key: 'slide', label: '⬆️ Покачивание' },
    { key: 'bounce', label: '🏀 Подпрыгивание' },
    { key: 'glow', label: '💡 Свечение' },
    { key: 'rotate', label: '🔄 Вращение' }
  ];

  function getFileIcon(fileName) {
    if (!fileName) return '📄';
    const ext = fileName.split('.').pop().toLowerCase();
    
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) return '📦';
    if (['pdf'].includes(ext)) return '📕';
    if (['doc', 'docx'].includes(ext)) return '📘';
    if (['xls', 'xlsx'].includes(ext)) return '📗';
    if (['ppt', 'pptx'].includes(ext)) return '📙';
    if (['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(ext)) return '🎵';
    if (['mp4', 'avi', 'mkv', 'mov', 'webm'].includes(ext)) return '🎬';
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return '🖼️';
    if (['js', 'json', 'xml', 'html', 'css', 'php', 'py'].includes(ext)) return '💻';
    if (['exe', 'apk', 'dmg', 'deb'].includes(ext)) return '💿';
    if (['txt', 'md', 'csv'].includes(ext)) return '📝';
    
    return '📄';
  }

  class HtmlButtonGenerator {
    constructor() {
      this.modal = null;
      this.type = null;
      this.callback = null;
    }

    // Генерация HTML-кода для кнопки-ссылки
    generateLinkButtonHtml(options) {
      const {
        text = 'Кнопка',
        url = '#',
        bg = '#3b82f6',
        color = '#ffffff',
        radius = 12,
        anim = 'none'
      } = options;

      const animClass = anim !== 'none' ? ` bl-anim-${anim}` : '';
      
      return `<a href="${url}" 
  class="bl-linkbtn${animClass}" 
  data-type="linkbtn" 
  data-anim="${anim}"
  style="
    --bl-bg: ${bg};
    --bl-color: ${color};
    --bl-radius: ${radius}px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 16px;
    text-decoration: none;
    font-weight: 600;
    border-radius: ${radius}px;
    background: ${bg};
    color: ${color};
    box-shadow: 0 2px 6px rgba(0,0,0,.12);
    transition: transform .08s ease, box-shadow .2s ease;
  "
  target="_blank" 
  rel="noopener">${text}</a>`;
    }

    // Генерация HTML-кода для кнопки-файла
    generateFileButtonHtml(options) {
      const {
        text = 'Скачать файл',
        fileUrl = '#',
        fileName = '',
        bg = '#10b981',
        color = '#ffffff',
        radius = 12,
        anim = 'none'
      } = options;

      const icon = getFileIcon(fileName);
      const animClass = anim !== 'none' ? ` bf-anim-${anim}` : '';
      
      return `<a href="${fileUrl}" 
  class="bf-filebtn${animClass}" 
  data-type="filebtn" 
  data-anim="${anim}"
  data-file-name="${fileName}"
  style="
    --bf-bg: ${bg};
    --bf-color: ${color};
    --bf-radius: ${radius}px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 16px;
    text-decoration: none;
    font-weight: 600;
    border-radius: ${radius}px;
    background: ${bg};
    color: ${color};
    box-shadow: 0 2px 6px rgba(0,0,0,.12);
    transition: transform .08s ease, box-shadow .2s ease;
  "
  download="${fileName}"
  target="_blank">${icon ? `<span class="bf-icon" style="margin-right:8px;font-size:18px;">${icon}</span>` : ''}${text}</a>`;
    }

    // Открытие модального окна для создания кнопки-ссылки
    openLinkButtonModal(callback) {
      this.type = 'link';
      this.callback = callback;
      this.createModal({
        title: '🔗 Создать кнопку-ссылку',
        fields: [
          { name: 'text', label: 'Текст кнопки', type: 'text', value: 'Перейти', required: true },
          { name: 'url', label: 'URL ссылки', type: 'text', value: 'https://', required: true },
          { name: 'bg', label: 'Цвет фона', type: 'color', value: '#3b82f6', colors: COLORS.linkbtn },
          { name: 'color', label: 'Цвет текста', type: 'color', value: '#ffffff', colors: ['#ffffff', '#000000', '#f3f4f6', '#1f2937'] },
          { name: 'radius', label: 'Округление (0-40px)', type: 'range', min: 0, max: 40, value: 12 },
          { name: 'anim', label: 'Анимация', type: 'animation', value: 'none' }
        ]
      });
    }

    // Открытие модального окна для создания кнопки-файла
    openFileButtonModal(callback) {
      this.type = 'file';
      this.callback = callback;
      this.createModal({
        title: '📎 Создать кнопку-файла',
        fields: [
          { name: 'text', label: 'Текст кнопки', type: 'text', value: 'Скачать файл', required: true },
          { name: 'file', label: 'Загрузить файл', type: 'file', accept: '*/*' },
          { name: 'fileUrl', label: 'Или укажите URL файла', type: 'text', value: '', placeholder: '/uploads/document.pdf' },
          { name: 'fileName', label: 'Имя файла', type: 'text', value: '', placeholder: 'document.pdf' },
          { name: 'bg', label: 'Цвет фона', type: 'color', value: '#10b981', colors: COLORS.filebtn },
          { name: 'color', label: 'Цвет текста', type: 'color', value: '#ffffff', colors: ['#ffffff', '#000000', '#f3f4f6', '#1f2937'] },
          { name: 'radius', label: 'Округление (0-40px)', type: 'range', min: 0, max: 40, value: 12 },
          { name: 'anim', label: 'Анимация', type: 'animation', value: 'none' }
        ]
      });
    }

    createModal(config) {
      const back = document.createElement('div');
      back.className = 'hb-modal-back';

      const container = document.createElement('div');
      container.className = 'hb-modal-container';

      // Header
      const header = document.createElement('div');
      header.className = 'hb-modal-header';
      header.innerHTML = `
        <h3>${config.title}</h3>
        <button class="hb-modal-close" type="button">&times;</button>
      `;

      // Body
      const body = document.createElement('div');
      body.className = 'hb-modal-body';

      const form = document.createElement('form');
      form.id = 'hbForm';

      config.fields.forEach(field => {
        const fieldDiv = this.createField(field);
        form.appendChild(fieldDiv);
      });

      body.appendChild(form);

      // Footer
      const footer = document.createElement('div');
      footer.className = 'hb-modal-footer';
      footer.innerHTML = `
        <button class="hb-btn danger" type="button" data-action="cancel">Отмена</button>
        <button class="hb-btn primary" type="button" data-action="generate">Генерировать код</button>
      `;

      container.appendChild(header);
      container.appendChild(body);
      container.appendChild(footer);
      back.appendChild(container);

      this.modal = back;
      document.body.appendChild(back);

      this.attachEventListeners();
    }

    createField(field) {
      const div = document.createElement('div');
      div.className = 'hb-field';

      const label = document.createElement('label');
      label.textContent = field.label;
      div.appendChild(label);

      switch (field.type) {
        case 'text':
          const input = document.createElement('input');
          input.type = 'text';
          input.name = field.name;
          input.value = field.value || '';
          input.placeholder = field.placeholder || '';
          if (field.required) input.required = true;
          div.appendChild(input);
          break;

        case 'file':
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.name = field.name;
          fileInput.accept = field.accept || '*/*';
          fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
          div.appendChild(fileInput);
          
          const uploadStatus = document.createElement('div');
          uploadStatus.className = 'hb-upload-status';
          uploadStatus.style.display = 'none';
          uploadStatus.id = 'uploadStatus';
          div.appendChild(uploadStatus);
          break;

        case 'range':
          const rangeWrapper = document.createElement('div');
          rangeWrapper.style.display = 'flex';
          rangeWrapper.style.gap = '12px';
          rangeWrapper.style.alignItems = 'center';

          const rangeInput = document.createElement('input');
          rangeInput.type = 'range';
          rangeInput.name = field.name;
          rangeInput.min = field.min || 0;
          rangeInput.max = field.max || 100;
          rangeInput.value = field.value || 0;
          rangeInput.style.flex = '1';

          const rangeValue = document.createElement('span');
          rangeValue.textContent = field.value + 'px';
          rangeValue.style.color = '#9fb2c6';
          rangeValue.style.fontSize = '13px';
          rangeValue.style.minWidth = '45px';

          rangeInput.addEventListener('input', (e) => {
            rangeValue.textContent = e.target.value + 'px';
          });

          rangeWrapper.appendChild(rangeInput);
          rangeWrapper.appendChild(rangeValue);
          div.appendChild(rangeWrapper);
          break;

        case 'color':
          const colorGrid = document.createElement('div');
          colorGrid.className = 'hb-color-grid';

          field.colors.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'hb-color-swatch';
            swatch.style.background = color;
            swatch.dataset.color = color;
            if (color === field.value) swatch.classList.add('selected');

            swatch.addEventListener('click', () => {
              colorGrid.querySelectorAll('.hb-color-swatch').forEach(s => s.classList.remove('selected'));
              swatch.classList.add('selected');
            });

            colorGrid.appendChild(swatch);
          });

          const colorInput = document.createElement('input');
          colorInput.type = 'hidden';
          colorInput.name = field.name;
          colorInput.value = field.value;

          div.appendChild(colorGrid);
          div.appendChild(colorInput);
          break;

        case 'animation':
          const animGrid = document.createElement('div');
          animGrid.className = 'hb-anim-grid';

          ANIMATIONS.forEach(anim => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'hb-anim-btn';
            btn.textContent = anim.label;
            btn.dataset.anim = anim.key;
            if (anim.key === field.value) btn.classList.add('selected');

            btn.addEventListener('click', () => {
              animGrid.querySelectorAll('.hb-anim-btn').forEach(b => b.classList.remove('selected'));
              btn.classList.add('selected');
            });

            animGrid.appendChild(btn);
          });

          const animInput = document.createElement('input');
          animInput.type = 'hidden';
          animInput.name = field.name;
          animInput.value = field.value;

          div.appendChild(animGrid);
          div.appendChild(animInput);
          break;
      }

      return div;
    }

    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const statusDiv = document.getElementById('uploadStatus');
      statusDiv.style.display = 'block';
      statusDiv.className = 'hb-upload-status loading';
      statusDiv.textContent = '📤 Загрузка файла...';

      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'file');

      try {
        const response = await fetch('/editor/api.php?action=uploadAsset&type=file', {
          method: 'POST',
          body: fd,
          cache: 'no-store'
        });

        const data = await response.json();

        if (data.ok && data.url) {
          statusDiv.className = 'hb-upload-status success';
          statusDiv.textContent = '✅ Файл загружен успешно!';

          // Автоматически заполняем поля
          const fileUrlInput = this.modal.querySelector('input[name="fileUrl"]');
          const fileNameInput = this.modal.querySelector('input[name="fileName"]');

          if (fileUrlInput) fileUrlInput.value = data.url;
          if (fileNameInput && !fileNameInput.value) fileNameInput.value = file.name;

          setTimeout(() => {
            statusDiv.style.display = 'none';
          }, 3000);
        } else {
          throw new Error(data.error || 'Ошибка загрузки');
        }
      } catch (error) {
        statusDiv.className = 'hb-upload-status error';
        statusDiv.textContent = '❌ ' + error.message;
      }
    }

    attachEventListeners() {
      const closeBtn = this.modal.querySelector('.hb-modal-close');
      const cancelBtn = this.modal.querySelector('[data-action="cancel"]');
      const generateBtn = this.modal.querySelector('[data-action="generate"]');

      closeBtn.addEventListener('click', () => this.close());
      cancelBtn.addEventListener('click', () => this.close());
      generateBtn.addEventListener('click', () => this.generate());

      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.close();
      });
    }

    generate() {
      const form = this.modal.querySelector('#hbForm');
      const formData = new FormData(form);

      const options = {};
      
      // Собираем все поля
      for (let [key, value] of formData.entries()) {
        options[key] = value;
      }

      // Собираем выбранный цвет
      const selectedBg = this.modal.querySelector('.hb-color-swatch.selected[data-color]');
      if (selectedBg) {
        const colorName = this.modal.querySelector('input[name="bg"]') ? 'bg' : 'color';
        options[colorName] = selectedBg.dataset.color;
      }

      // Собираем цвет текста
      const colorGrids = this.modal.querySelectorAll('.hb-color-grid');
      if (colorGrids.length > 1) {
        const textColorSwatch = colorGrids[1].querySelector('.hb-color-swatch.selected');
        if (textColorSwatch) {
          options.color = textColorSwatch.dataset.color;
        }
      }

      // Собираем анимацию
      const selectedAnim = this.modal.querySelector('.hb-anim-btn.selected');
      if (selectedAnim) {
        options.anim = selectedAnim.dataset.anim;
      }

      // Валидация
      if (this.type === 'link') {
        if (!options.text || !options.url) {
          alert('Заполните текст и URL кнопки!');
          return;
        }
        if (options.url === 'https://') {
          alert('Укажите корректный URL!');
          return;
        }
      }

      if (this.type === 'file') {
        if (!options.text) {
          alert('Заполните текст кнопки!');
          return;
        }
        if (!options.fileUrl) {
          alert('Загрузите файл или укажите URL файла!');
          return;
        }
        if (!options.fileName) {
          options.fileName = options.fileUrl.split('/').pop();
        }
      }

      // Генерируем HTML
      let html = '';
      if (this.type === 'link') {
        html = this.generateLinkButtonHtml(options);
      } else if (this.type === 'file') {
        html = this.generateFileButtonHtml(options);
      }

      // Вызываем callback
      if (this.callback && typeof this.callback === 'function') {
        this.callback(html);
      }

      this.close();
    }

    close() {
      if (this.modal && this.modal.parentNode) {
        this.modal.parentNode.removeChild(this.modal);
      }
      this.modal = null;
      this.type = null;
      this.callback = null;
    }
  }

  window.HtmlButtonGenerator = HtmlButtonGenerator;
})();