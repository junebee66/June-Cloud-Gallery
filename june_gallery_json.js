
  async function fetchGifData() {
    const collectionContainer = document.querySelector('.fragments-container.collection.current-collection');
    const url = collectionContainer?.dataset.link;

    if (!url) {
      console.error("No data-link found on container.");
      return;
    }

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.items) {
        const itemsWithGif = data.items.filter(item => item.gif);
        displayGifs(itemsWithGif);
      } else {
        console.error("No items found in the response.");
      }
    } catch (error) {
      console.error("Error fetching GIF data:", error);
    }
  }

  function convertGifUrl(wixImageUrl) {
    if (typeof wixImageUrl !== 'string') return null;

    const wixStaticUrlBase = "https://static.wixstatic.com/media/";
    const prefixToRemove = "wix:image://v1/";

    if (wixImageUrl.startsWith(prefixToRemove)) {
      let cleanedUrl = wixImageUrl.slice(prefixToRemove.length);
      const extensionMatch = cleanedUrl.match(/\.(jpg|jpeg|gif|png)/i);
      if (extensionMatch) {
        const extension = extensionMatch[0].toLowerCase();
        cleanedUrl = cleanedUrl.slice(0, cleanedUrl.indexOf(extension) + extension.length);
        return wixStaticUrlBase + cleanedUrl;
      }
    }
    return null;
  }

  function displayGifs(items) {
    checkImagesLoaded();
    const container = document.querySelector('.fragments-inner-container');
    container.innerHTML = '';

    const listContainer = document.querySelector('.list-column');
    if (listContainer) listContainer.innerHTML = '';

    items.forEach((item, index) => {
      const imageUrl = convertGifUrl(item.gif);
      const title = item.title || `Project ${index + 1}`;

      const originWidth = 1200;
      const originHeight = 675;
      const adjustedWidth = originWidth / 2.5;
      const adjustedHeight = originHeight / 2.5;

      const article = document.createElement('article');
      article.className = 'fragment fragment-image fragment-state-input transition-stack';
      article.dataset.id = `page://gif${index}`;
      article.dataset.colour = '#FFFFFF';
      article.dataset.zIndex = index + 1;
      article.style.zIndex = index + 1;

      article.innerHTML = `
        <div class="fragment-container" style="background: #ffffff; width: ${adjustedWidth}px; height: ${adjustedHeight}px;" data-aspect-ratio="${originWidth / originHeight}">
          <figure class="question-hover">
            <img src="${imageUrl}" alt="${title}" width="${adjustedWidth}" height="${adjustedHeight}">
            <input type="checkbox" id="toggleCaption${index}" class="fragment-toggle-checkbox">
            <label class="fragment-toggle-label" for="toggleCaption${index}">Toggle Caption</label>
            <figcaption><p>${title}</p></figcaption>
          </figure>
        </div>
      `;

      container.appendChild(article);

      // list version
      const listFragment = document.createElement('article');
      listFragment.className = 'list-fragment list-fragment-input list-fragment-image fragment-state-input';
      listFragment.dataset.id = `page://gif${index}`;
      listFragment.innerHTML = `
        <div class="list-fragment-type" data-type="image" data-code="${new Date().toISOString().slice(2, 10).replace(/-/g, ' ')}">image</div>
        <div class="list-fragment-title">${title}</div>
        <div class="list-fragment-dot"></div>
      `;

      if (listContainer) listContainer.appendChild(listFragment);
    });
  }

  function checkImagesLoaded() {
    const images = document.querySelectorAll('.fragment-image img');
    let loadedCount = 0;

    function imageLoaded() {
      loadedCount++;
      if (loadedCount === images.length) {
        startFlyInAnimation();
      }
    }

    images.forEach(img => {
      if (img.complete) {
        imageLoaded();
      } else {
        img.addEventListener('load', imageLoaded);
        img.addEventListener('error', imageLoaded);
      }
    });
  }

  function startFlyInAnimation() {
    const fragments = document.querySelectorAll('.fragment');
    fragments.forEach((fragment, index) => {
      setTimeout(() => {
        fragment.classList.add('fly-in', 'visible');
      }, index * 100);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    fetchGifData();
  });
