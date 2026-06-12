// ---------- Лайтбокс ----------

let lightbox = null;
let lightboxImg = null;
let scale = 1;
let initialFitScale = 1;
let naturalWidth, naturalHeight;

// Переменные для pinch-to-zoom
let initialPinchDistance = null;
let initialPinchScale = 1;

function createLightbox() {
  lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <span class="lightbox-close">&times;</span>
    <div class="lightbox-content">
      <img class="lightbox-image" src="" alt="">
    </div>
  `;
  document.body.appendChild(lightbox);

  lightboxImg = lightbox.querySelector('.lightbox-image');

  // Закрытие по клику на фон или кнопку закрытия
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
      closeLightbox();
    }
  });

  // Закрытие по клику на само изображение
  lightboxImg.addEventListener('click', (e) => {
    e.stopPropagation();
    closeLightbox();
  });

  // Закрытие по Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.style.opacity === '1') {
      closeLightbox();
    }
  });

  // Зум колёсиком мыши
  lightboxImg.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    let newScale = scale + delta;
    newScale = Math.max(initialFitScale, Math.min(5, newScale));
    setScale(newScale);
  });

  // Pinch-to-zoom (сенсорные жесты)
  lightboxImg.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      initialPinchDistance = getTouchDistance(e.touches);
      initialPinchScale = scale;
    }
  });

  lightboxImg.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && initialPinchDistance !== null) {
      e.preventDefault();
      const currentDistance = getTouchDistance(e.touches);
      const ratio = currentDistance / initialPinchDistance;
      let newScale = initialPinchScale * ratio;
      newScale = Math.max(initialFitScale, Math.min(5, newScale));
      setScale(newScale);
    }
  });

  lightboxImg.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) {
      initialPinchDistance = null;
    }
  });
}

// Вспомогательная функция: расстояние между двумя пальцами
function getTouchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
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
    setScale(scale);
    lightbox.querySelector('.lightbox-content').scrollTo(0, 0);
  };
}

function closeLightbox() {
  lightbox.style.opacity = '0';
  lightbox.style.pointerEvents = 'none';
  document.body.style.overflow = '';
}

function setScale(s) {
  scale = s;
  lightboxImg.style.width = naturalWidth * scale + 'px';
  lightboxImg.style.height = naturalHeight * scale + 'px';
}

// ---------- НАСТРОЙКИ ЛАЙТБОКСА ----------
const lightboxDisabledSelectors = ['.fullscreen-hero', '.carousel-track'];

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