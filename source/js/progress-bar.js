document.addEventListener('DOMContentLoaded', function() {
  let loadedResources = 0;
  const totalResources = document.images.length;
  const initialProgress = 1; // Start from 10%
  const finalStretch = 95; // Reserve the last 5% for the final animation

  function updateProgress() {
      if (totalResources > 0) {
          const progress = (loadedResources / totalResources) * (finalStretch - initialProgress) + initialProgress;
          document.getElementById('progress-bar').style.width = `${progress}%`;
      }
  }

  Array.from(document.images).forEach(img => {
      img.addEventListener('load', () => {
          loadedResources++;
          updateProgress();
      });
      img.addEventListener('error', () => {
          loadedResources++;
          updateProgress();
      });
  });

  // Final animation and fade out when everything is loaded
  window.addEventListener('load', () => {
      // Ensure the progress bar completes the final stretch
      document.getElementById('progress-bar').style.width = `100%`;
      // Fade out the progress bar
      document.querySelector('.progress-container').style.opacity = '0';
      document.querySelector('.progress-container').style.transition = 'opacity 2s ease';
      // Optionally, remove the progress bar from the DOM after the fade out
      setTimeout(() => {
          document.querySelector('.progress-container').style.display = 'none';
      }, 2000); // Match the duration of the opacity transition
  });
});
