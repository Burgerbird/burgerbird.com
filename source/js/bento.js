// Set up the Muuri grid and event listeners once the window fully loads.
window.addEventListener('load', function () {
  updateScrollbarWidthVariable();
  initializeMuuriGrid();
  setupEventListeners();
});

// Define a global variable for the Muuri grid to be accessible across functions.
let grid;

// Initializes the Muuri grid with specific settings.
function initializeMuuriGrid() {
  // Check if the current device supports touch interaction.
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  // Initialize the Muuri grid with conditional drag support and layout options.
  grid = new Muuri('.grid', {
    dragEnabled: !isTouchDevice, // Enable drag only for non-touch devices.
    layout: {
      fillGaps: true, // Reduce gaps in the layout.
      rounding: false
    },
    showDuration: 0,
    showEasing: 'linear'
  });

  // Refresh grid items and apply layout adjustments.
  grid.refreshItems().layout();
  // Mark the grid as loaded to reveal it with CSS transitions.
  document.getElementById('grid').classList.add('loaded-images');

  // Ready?
  grid.on('layoutEnd', function () {
    onMuuriLayoutEnd();
  });
}

// Sets up event listeners for category filters, search functionality, and image overlays (zooms).
function setupEventListeners() {
  setupCategoryFilters();
  setupImageRotation('doughnut');
  // setupOverlay();
  // setupSearchFilter();
  fadeOutLink('.trigger-page-fade-out', '.container', '200');
  scrollMenuMultiplier();
  window.addEventListener('resize', updateScrollbarWidthVariable);
}

// Handles category filtering through navigation links.
function setupCategoryFilters() {
  // Retrieve all category filter links.
  const categoryLinks = document.querySelectorAll('#categories a');
  categoryLinks.forEach(link => {
    // Add click event listener to each link.
    link.addEventListener('click', function (event) {
      event.preventDefault(); // Prevent the default link behavior.
      // Remove 'active' class from all links and add to the clicked one.
      categoryLinks.forEach(lnk => lnk.classList.remove('active'));
      this.classList.add('active');

      // Filter grid items based on the clicked category.
      const category = this.innerHTML.toLowerCase();
      grid.filter(item => category === 'all' ? true : item.getElement().dataset.category === category);
    });
  });
}

// Implements search functionality to filter grid items.
function setupSearchFilter() {
  // Add input event listener to the search bar.
  document.querySelector('#search-bar').addEventListener('input', function (event) {
    const searchQuery = event.target.value;
    // Filter grid items that match the search query.
    grid.filter(item => item.getElement().dataset.description.includes(searchQuery));
  });
}

function setupOverlay() {
  document.querySelectorAll('.item').forEach(item => {
    item.addEventListener('click', function () {
      // Get position and dimensions of the original item
      const rect = this.getBoundingClientRect();

      // Clone the item
      const clone = this.cloneNode(true); // Change to false if you don't need to clone child nodes

      // Apply styles to position the clone exactly over the original item
      Object.assign(clone.style, {
        position: 'fixed',
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        margin: '0',
        transition: 'all 0.5s ease', // Smooth transition to full screen
        zIndex: '3000', // Ensure it's above other content
        backgroundColor: 'blue'
      });

      // Append the clone to the body or a specific container
      document.body.appendChild(clone);

      // Animate the clone to full screen after appending to ensure transition effect
      setTimeout(() => {
        Object.assign(clone.style, {
          top: '0',
          left: '0',
          width: '100vw',
          height: '100vh',
        });
      }, 0); // Timeout ensures styles are applied after the element is rendered

      // Create and add a close button to the clone
      const closeButton = document.createElement('button');
      closeButton.textContent = 'X';
      closeButton.style.position = 'absolute';
      closeButton.style.top = '20px';
      closeButton.style.right = '20px';
      closeButton.addEventListener('click', function () {
        document.body.removeChild(clone); // Remove the clone when the button is clicked
      });

      clone.appendChild(closeButton);
    });
  });
}

function setupImageRotation(id) {
  const image = document.getElementById(id);
  let totalRotation = 0; // Initialize total rotation

  window.addEventListener('scroll', function () {
    window.requestAnimationFrame(function () {
      const scrollTop = document.documentElement.scrollTop;
      // Use the absolute scroll position to determine the rotation
      // This makes the rotation only dependent on how much the user has scrolled, not the direction
      totalRotation = scrollTop / 5 % 360; // Keep the rotation between 0 and 359 degrees

      // Apply the rotation
      image.style.transform = `rotate(${totalRotation}deg)`;
    });
  });
}

function updateScrollbarWidthVariable() {
  var scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  const rootStyle = getComputedStyle(document.documentElement);
  var scrollbarWidthOffset = parseFloat(rootStyle.getPropertyValue('--scrollbar-width-offset'));

  if (scrollbarWidth > 0) {
    if (!isNaN(scrollbarWidthOffset) && scrollbarWidthOffset != 0) {
      scrollbarWidth += scrollbarWidthOffset;
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
    } else {
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
    }
  } else {
    document.documentElement.style.setProperty('--scrollbar-width', `0px`);
  }
}

function fadeOutLink(linkClass, contentClass, duration) {
  document.querySelectorAll(linkClass).forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault(); // Prevent the default link behavior
      const href = this.getAttribute('href'); // Get the href attribute
      const content = document.querySelector(contentClass);

      if (content) {
        // Apply fade-out effect
        content.style.transition = `opacity ${duration}ms ease`;
        content.style.opacity = 0;

        // Wait for the fade-out animation to complete before navigating
        setTimeout(() => {
          window.location.href = href;
        }, duration);
      } else {
        // If the content class is not found, navigate immediately
        window.location.href = href;
      }
    });
  });
}

function scrollMenuMultiplier() {
  var lastScrollPosition = 0;
  var lastMultiplier = null; // Store the last multiplier value
  var ticking = false;

  function updateScrollMultiplier() {
    let scrollPosition = window.scrollY;
    let multiplier = 1 - Math.min(scrollPosition / 100, 1);

    // Update and log the multiplier only if it has changed
    if (multiplier !== lastMultiplier) {
      document.documentElement.style.setProperty('--menu-scroll', multiplier);
      lastMultiplier = multiplier; // Update the lastMultiplier with the current value
    }

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    lastScrollPosition = window.scrollY;

    if (!ticking) {
      window.requestAnimationFrame(function () {
        // TODO: updateScrollMultiplier();
        ticking = false;
      });

      ticking = true;
    }
  });
}

function toggleMenu() {
  const slideMenu = document.getElementById('slideMenu');
  const menuOverlay = document.getElementById('menuOverlay');
  const burgerIcon = document.getElementById('burger-icon');

  // Toggle the 'active' class to control visibility and animation
  slideMenu.classList.toggle('active');
  menuOverlay.classList.toggle('active');
  burgerIcon.classList.toggle('active');

  menuOverlay.addEventListener('click', function () {
    toggleMenu();
  });
}

function makeFooterVisible() {
  if (document.querySelector('footer.hidden')) {
    document.querySelector('footer.hidden').classList.remove('hidden');
  }
}

function onMuuriLayoutEnd() {
  makeFooterVisible();
  removePreloader();
}

function removePreloader() {
  var overlay = document.getElementById('preloader-overlay');
  overlay.classList.add('fade-out');

  overlay.addEventListener('transitionend', function () {
    overlay.style.display = 'none';
  });
}
