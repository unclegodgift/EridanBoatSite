// ---------- Лайтбокс с перетаскиванием ----------
let lightbox = null;
let lightboxImg = null;
let lightboxContent = null;

let scale = 1;
let initialFitScale = 1;
let naturalWidth, naturalHeight;

// Позиция изображения (для drag)
let translateX = 0;
let translateY = 0;

// Состояния drag
let isDragging = false;
let dragStartX, dragStartY;
let startTranslateX, startTranslateY;

// Для pinch
let initialPinchDistance = null;
let initialPinchScale = 1;

function createLightbox() {
  lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <span class="lightbox-close">&times;</span>
    <div class="lightbox-content">
      <img class="lightbox-image" src="" alt="" draggable="false">
    </div>
  `;
  document.body.appendChild(lightbox);

  lightboxContent = lightbox.querySelector('.lightbox-content');
  lightboxImg = lightbox.querySelector('.lightbox-image');

  // Закрытие по клику на фон или кнопку закрытия
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
      closeLightbox();
    }
  });

  // Закрытие по двойному клику на изображение
  lightboxImg.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    closeLightbox();
  });

  // Закрытие по Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.style.opacity === '1') {
      closeLightbox();
    }
  });

  // Зум колёсиком мыши с сохранением точки под курсором
  lightboxImg.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    let newScale = scale + delta;
    newScale = Math.max(initialFitScale, Math.min(5, newScale));
    if (newScale !== scale) {
      const rect = lightboxImg.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      const prevScale = scale;
      scale = newScale;
      // Корректируем смещение, чтобы точка под курсором осталась на месте
      translateX = (translateX - offsetX) * (scale / prevScale) + offsetX;
      translateY = (translateY - offsetY) * (scale / prevScale) + offsetY;
      applyTransform();
    }
  });

  // --- Drag мышью ---
  lightboxImg.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    startTranslateX = translateX;
    startTranslateY = translateY;
    lightboxImg.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    translateX = startTranslateX + dx;
    translateY = startTranslateY + dy;
    applyTransform();
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      lightboxImg.style.cursor = 'grab';
    }
  });

  // --- Drag пальцем (одно касание) ---
  lightboxImg.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      dragStartX = e.touches[0].clientX;
      dragStartY = e.touches[0].clientY;
      startTranslateX = translateX;
      startTranslateY = translateY;
      lightboxImg.style.cursor = 'grabbing';
      e.preventDefault();
    } else if (e.touches.length === 2) {
      isDragging = false;
      initialPinchDistance = getTouchDistance(e.touches);
      initialPinchScale = scale;
      e.preventDefault();
    }
  });

  lightboxImg.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStartX;
      const dy = e.touches[0].clientY - dragStartY;
      translateX = startTranslateX + dx;
      translateY = startTranslateY + dy;
      applyTransform();
      e.preventDefault();
    } else if (e.touches.length === 2 && initialPinchDistance !== null) {
      const currentDistance = getTouchDistance(e.touches);
      const ratio = currentDistance / initialPinchDistance;
      let newScale = initialPinchScale * ratio;
      newScale = Math.max(initialFitScale, Math.min(5, newScale));
      const prevScale = scale;
      if (newScale !== prevScale) {
        scale = newScale;
        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const rect = lightboxImg.getBoundingClientRect();
        const offsetX = cx - rect.left;
        const offsetY = cy - rect.top;
        translateX = (translateX - offsetX) * (scale / prevScale) + offsetX;
        translateY = (translateY - offsetY) * (scale / prevScale) + offsetY;
        applyTransform();
      }
      e.preventDefault();
    }
  });

  lightboxImg.addEventListener('touchend', (e) => {
    if (e.touches.length === 0) {
      isDragging = false;
      initialPinchDistance = null;
      lightboxImg.style.cursor = 'grab';
    }
  });
}

// Вспомогательная функция расстояния между пальцами
function getTouchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

// Применяем трансформацию (только translate + scale, размеры не трогаем)
function applyTransform() {
  lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

// Центрирование изображения с учётом текущего scale
function centerImage() {
  if (!lightboxImg || !lightboxContent) return;

  const containerWidth = lightboxContent.clientWidth;
  const containerHeight = lightboxContent.clientHeight;

  // Визуальный размер = естественный * scale
  const visualWidth = naturalWidth * scale;
  const visualHeight = naturalHeight * scale;

  // Вычисляем translate так, чтобы центр масштабированного изображения совпал с центром контейнера
  translateX = (containerWidth - visualWidth) / 2;
  translateY = (containerHeight - visualHeight) / 2;

  applyTransform();
}

function openLightbox(src, alt) {
  if (!lightbox) createLightbox();

  lightboxImg.src = src;
  lightboxImg.alt = alt;

  lightbox.style.opacity = '1';
  lightbox.style.pointerEvents = 'auto';
  document.body.style.overflow = 'hidden';

  lightboxImg.onload = () => {
    naturalWidth = lightboxImg.naturalWidth;
    naturalHeight = lightboxImg.naturalHeight;
    const maxW = window.innerWidth * 0.9;
    const maxH = window.innerHeight * 0.9;
    initialFitScale = Math.min(maxW / naturalWidth, maxH / naturalHeight, 1);
    scale = initialFitScale;
    translateX = 0;
    translateY = 0;
    centerImage();
  };
}

function closeLightbox() {
  lightbox.style.opacity = '0';
  lightbox.style.pointerEvents = 'none';
  document.body.style.overflow = '';
  isDragging = false;
}

function setScale(s) {
  // оставлена для совместимости, не используется
}

// ---------- НАСТРОЙКИ ЛАЙТБОКСА ----------
const lightboxDisabledSelectors = ['.fullscreen-hero', '.carousel-track', '.hero'];

function initLightbox() {
  for (const selector of lightboxDisabledSelectors) {
    if (document.querySelector(selector)) return;
  }
  document.querySelectorAll('img').forEach(img => {
    if (img.closest('.carousel-track') ||
        img.closest('.social-icon') ||
        img.closest('.logo') ||
        img.closest('.lightbox')) return;
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(img.src, img.alt);
    });
  });
}


document.addEventListener('DOMContentLoaded', () => {
  // --- Бургер-меню ---
  const burger = document.querySelector('.burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const closeMenu = document.querySelector('.close-menu');

  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      mobileMenu.classList.add('active');
    });
    closeMenu.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
    });
    // Закрытие по клику на ссылку (для удобства)
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
      });
    });
  }



  AOS.init({
    duration: 800,        // длительность анимации в мс
    once: true,           // анимация срабатывает один раз
    offset: function() {
      if (window.innerWidth < 480) return 50;   // очень маленькие экраны
      if (window.innerWidth < 768) return 80;   // планшеты и крупные смартфоны
      return 120;                                // десктопы
    },          // расстояние от нижнего края экрана до элемента, когда начинается анимация
    easing: 'ease-out'
  });



  // --- Бесконечная карусель с автосменой и кнопками ---
  const track = document.querySelector('.carousel-track');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');
  let currentIndex;
  let autoPlayInterval;
  let originalSlides;
  let totalSlides; // включает клоны

  if (track) {
    // Сохраняем исходные слайды
    originalSlides = Array.from(track.children);
    const firstClone = originalSlides[0].cloneNode(true);
    const lastClone = originalSlides[originalSlides.length - 1].cloneNode(true);

    // Добавляем клоны: последний в начало, первый в конец
    track.insertBefore(lastClone, track.firstChild);
    track.appendChild(firstClone);

    const slides = Array.from(track.children); // теперь включает клоны
    totalSlides = slides.length;

    // Инициализация без анимации
    track.style.transition = 'none';
    currentIndex = 1;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    track.offsetHeight; // reflow
    track.style.transition = '';
    track.style.visibility = 'visible';

    function updateSlidePosition(animate = true) {
      if (!animate) {
        track.style.transition = 'none';
      } else {
        track.style.transition = 'transform 0.5s ease-in-out';
      }
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    function nextSlide() {
      currentIndex++;
      updateSlidePosition(true);

      // Если дошли до клона первого слайда (последний элемент)
      if (currentIndex === totalSlides - 1) {
        setTimeout(() => {
          currentIndex = 1; // реальный первый слайд
          updateSlidePosition(false);
        }, 500); // должно совпадать с длительностью CSS transition
      }
    }

    function prevSlide() {
      currentIndex--;
      updateSlidePosition(true);

      // Если дошли до клона последнего слайда (нулевой элемент)
      if (currentIndex === 0) {
        setTimeout(() => {
          currentIndex = totalSlides - 2; // реальный последний слайд
          updateSlidePosition(false);
        }, 500);
      }
    }

    function startAutoPlay() {
      stopAutoPlay();
      autoPlayInterval = setInterval(nextSlide, 4000);
    }

    function stopAutoPlay() {
      clearInterval(autoPlayInterval);
    }

    // Кнопки
    nextBtn.addEventListener('click', () => {
      nextSlide();
      startAutoPlay();
    });
    prevBtn.addEventListener('click', () => {
      prevSlide();
      startAutoPlay();
    });

    // Остановка при наведении
    track.addEventListener('mouseenter', stopAutoPlay);
    track.addEventListener('mouseleave', startAutoPlay);

    // Старт
    startAutoPlay();
  }


  // подгон размеров картинок
  function adjustArticleImages() {
    const images = document.querySelectorAll('.article-image img');
    if (!images.length) return;

    const vh = window.innerHeight;
    const heightThreshold = 0.8; // порог срабатывания (90% высоты экрана)

    images.forEach(img => {
      if (img.naturalWidth === 0) return;

      // Сброс всех инлайн-стилей до базовых CSS
      img.style.maxWidth = '';
      img.style.maxHeight = '';
      img.style.width = '';
      img.style.height = '';
      img.offsetHeight; // reflow

      const figure = img.closest('.article-image');
      const containerWidth = figure.clientWidth;
      const targetWidth = containerWidth * 0.8;
      const calculatedHeight = (targetWidth / img.naturalWidth) * img.naturalHeight;

      if (calculatedHeight > vh * heightThreshold) {
        // Вертикальное изображение – фиксируем высоту 80vh
        figure.style.maxWidth = '100%'; // разрешаем фигуре занять всю ширину статьи
        img.style.height = '60vh';
        img.style.width = 'auto';
        img.style.maxWidth = '100%';
        img.style.maxHeight = 'none';
        img.style.objectFit = 'contain';
      } else {
        // Горизонтальное или умеренное – фиксируем ширину 80% контейнера
        figure.style.maxWidth = ''; // возвращаем как было (убираем inline)
        img.style.maxWidth = '80%';
        img.style.maxHeight = '600px'; // дополнительный пиксельный лимит (опционально)
        img.style.height = 'auto';
        img.style.width = 'auto';
      }
    });
  }

  // Дебанс для ресайза (чтобы не дёргать часто)
  function debounce(fn, delay) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // Основные слушатели
  window.addEventListener('load', adjustArticleImages);
  window.addEventListener('resize', debounce(adjustArticleImages, 150));

  // Подстраховка: если какое-то изображение загрузилось позже (например, ленивая подгрузка)
  document.addEventListener('load', (e) => {
    if (e.target.tagName === 'IMG' && e.target.closest('.article-image')) {
      adjustArticleImages();
    }
  }, true); // useCapture = true, чтобы ловить события загрузки изображений
  


  // --- Фильтрация статей по категориям ---
  const filterContainer = document.getElementById('filter-buttons');
  const articleList = document.querySelector('.article-list');

  if (filterContainer && articleList) {
    const cards = Array.from(articleList.querySelectorAll('.article-card'));

    // Собираем уникальные категории из span.date
    const categories = new Set();
    cards.forEach(card => {
      const categorySpan = card.querySelector('.date');
      if (categorySpan) {
        categories.add(categorySpan.textContent.trim());
      }
    });

    // Создаём кнопку "Все"
    const allButton = document.createElement('button');
    allButton.className = 'filter-btn active';
    allButton.textContent = 'Все';
    allButton.addEventListener('click', () => {
      setActiveFilter(allButton);
      cards.forEach(card => card.style.display = '');
    });
    filterContainer.appendChild(allButton);

    // Создаём кнопки для каждой категории
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.textContent = cat;
      btn.addEventListener('click', () => {
        setActiveFilter(btn);
        cards.forEach(card => {
          const cardCat = card.querySelector('.date')?.textContent.trim();
          card.style.display = (cardCat === cat) ? '' : 'none';
        });
      });
      filterContainer.appendChild(btn);
    });

    // Функция переключения активного класса
    function setActiveFilter(activeBtn) {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      activeBtn.classList.add('active');
    }
  }

  initLightbox();

});