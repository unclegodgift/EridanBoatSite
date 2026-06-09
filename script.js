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
  


});