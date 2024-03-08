window.addEventListener('load', function () {
  const swiper = new Swiper('.action-swiper', {
    modules: [SwiperGL],
    speed: 1200,
    effect: 'gl',
    loop: true,
    gl: {
      shader: 'random',
    },
    autoplay: {
      delay: 2500, // Delay in ms before auto-switching to the next slide
      disableOnInteraction: false, // Continue autoplay after user interaction
    },
  });
});