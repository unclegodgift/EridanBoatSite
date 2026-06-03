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
    offset: 100,          // расстояние от нижнего края экрана до элемента, когда начинается анимация
    easing: 'ease-out'
  });



  // --- Карусель с автосменой и кнопками ---
  const track = document.querySelector('.carousel-track');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');
  let currentIndex = 0;
  let autoPlayInterval;

  if (track) {
    const slides = Array.from(track.children);
    const totalSlides = slides.length;

    function updateSlidePosition() {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    function nextSlide() {
      currentIndex = (currentIndex + 1) % totalSlides;
      updateSlidePosition();
    }

    function prevSlide() {
      currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
      updateSlidePosition();
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
      startAutoPlay(); // перезапускаем таймер после ручного действия
    });
    prevBtn.addEventListener('click', () => {
      prevSlide();
      startAutoPlay();
    });

    // Остановка автосмены при наведении (опционально)
    track.addEventListener('mouseenter', stopAutoPlay);
    track.addEventListener('mouseleave', startAutoPlay);

    // Запуск
    updateSlidePosition();
    startAutoPlay();
  }



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


  
});