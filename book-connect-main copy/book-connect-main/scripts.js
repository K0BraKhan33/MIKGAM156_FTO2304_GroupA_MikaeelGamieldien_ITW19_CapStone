document.addEventListener('DOMContentLoaded', function () {
  let matches = books;
  let page = 1;
  const booksPerPage = BOOKS_PER_PAGE;
  let currentOverlay = null; // Variable to keep track of the currently open overlay


  //book preview creation
  function createPreview(book, authors) {
    //for specific book
    const { author, image, title, id, published } = book;
    const publicationDate = new Date(published).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
    });


    //set up class book system
    const preview = document.createElement('button');
    preview.classList = 'preview';
    preview.setAttribute('data-preview', id);

    preview.innerHTML = `
      <img class="preview__image" src="${image}" />
      <div class="preview__info">
        <h3 class="preview__title">${title}</h3>
        <div class="preview__author">By ${authors[author]} </div>
      </div>
    `;

    return preview;
  }

  //show book details
  // make sure overlay works
  function showBookDetails(event) {
    // Check if there is an existing overlay
    if (currentOverlay) {
      document.body.removeChild(currentOverlay);
      document.body.removeChild(document.querySelector('.backdrop'));
      currentOverlay = null;
    }
//close and reopen with new book info
    const previewButton = event.target.closest('.preview');
    if (!previewButton) return;

    const bookId = previewButton.getAttribute('data-preview');
    const book = books.find((book) => book.id === bookId);
    if (!book) return;

    const { author, image, title, description, published } = book;
    const publicationDate = new Date(published).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const overlay = document.createElement('div');
    overlay.classList.add('overlay');

    overlay.innerHTML = `
    <div class="overlay__content">
    <img class="overlay__blur" src="${image}" alt="${title}" />
    <img class="overlay__image" src="${image}" alt="${title}" />
    
      <h2 class="overlay__title">${title}</h2>
      <p class="overlay__author">By ${authors[author]} (${publicationDate})</p>
      <div class="overlay__data">
      <div class="overlay__description">${description}</div>
    </div class="overlay__button_primary">
    <button class="overlay__button">Close</button>
  </div>
`;

    const backdrop = document.createElement('div');
    backdrop.classList.add('backdrop');

    currentOverlay = overlay;

    // Close the overlay and backdrop when the close button is clicked
    const closeButton = overlay.querySelector('.overlay__button');
    closeButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
      document.body.removeChild(backdrop);
      currentOverlay = null;
    });

    document.body.appendChild(overlay);
    document.body.appendChild(backdrop);
  }

//given
  const css = {
    day: {
      dark: '10, 10, 20',
      light: '255, 255, 255',
    },
    night: {
      dark: '255, 255, 255',
      light: '10, 10, 20',
    },
  };


  //books shown per page
  const fragment = document.createDocumentFragment();
  const extracted = books.slice(0, booksPerPage);
  //getting var from data.js
  for (const { author, image, title, id } of extracted) {
    const preview = createPreview({ author, image, title, id }, authors);
    fragment.appendChild(preview);
    console.log(preview);
  }
  let sender = document.querySelector('[data-list-items]');
  sender.appendChild(fragment);


  //Search Algorithm
  const genresFragment = document.createDocumentFragment();
  let element = document.createElement('option');
  element.value = 'any';
  element.innerText = 'All Genres';
  genresFragment.appendChild(element);

  for (const [id, name] of Object.entries(genres)) {
    element = document.createElement('option');
    element.value = id;
    element.innerText = name;
    genresFragment.appendChild(element);
  }

  document.querySelector('[data-search-genres]').appendChild(genresFragment);

  const authorsFragment = document.createDocumentFragment();
  element = document.createElement('option');
  element.value = 'any';
  element.innerText = 'All Authors';
  authorsFragment.appendChild(element);

  for (const [id, name] of Object.entries(authors)) {
    element = document.createElement('option');
    element.value = id;
    element.innerText = name;
    authorsFragment.appendChild(element);
  }

  document.querySelector('[data-search-authors]').appendChild(authorsFragment);
  //Theme Change
  const userPrefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = userPrefersDarkMode ? 'night' : 'day';

  document.documentElement.style.setProperty('--color-dark', css[theme].dark);
  document.documentElement.style.setProperty('--color-light', css[theme].light);

  function handleThemeChange(event) {
    const selectedTheme = event.target.value;
    document.documentElement.style.setProperty('--color-dark', css[selectedTheme].dark);
    document.documentElement.style.setProperty('--color-light', css[selectedTheme].light);
  }


  //to display the needed overlay using functions
  function showSettingsDialog() {
    const settingsDialog = document.querySelector('[data-settings-overlay]');
    if (settingsDialog) {
      settingsDialog.open = true;
    }
  }

  function closeSettingsDialog() {
    const settingsDialog = document.querySelector('[data-settings-overlay]');
    if (settingsDialog) {
      settingsDialog.open = false;
    }
  }

  const settingsButton = document.querySelector('[data-header-settings]');
  if (settingsButton) {
    settingsButton.addEventListener('click', showSettingsDialog);
  }
  //Theme selector
  const settingsForm = document.querySelector('[data-settings-form]');
  if (settingsForm) {
    settingsForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      const theme = formData.get('theme');
      handleThemeChange({ target: { value: theme } });
      closeSettingsDialog();
    });
  }

  //

  const cancelButton = document.querySelector('[data-settings-cancel]');
  if (cancelButton) {
    cancelButton.addEventListener('click', closeSettingsDialog);
  }
  //making sure the show butto works by doing simple faraction math
  document.querySelector('[data-list-button]').textContent = `Show more (${matches.length - (page * booksPerPage) > 0 ? matches.length - (page * booksPerPage) : 0})`;
  document.querySelector('[data-list-button]').disabled = !(matches.length - page * booksPerPage > 0);

  //Event listiners
  const previews = document.querySelectorAll(".preview");
  previews.forEach(preview => {
    preview.addEventListener('click', showBookDetails);
  });

  document.querySelector('[data-list-button]').addEventListener('click', () => {
    const nextPageBooks = matches.slice(page * booksPerPage, (page + 1) * booksPerPage);
    const nextPageFragment = document.createDocumentFragment();

    for (const { author, image, title, id } of nextPageBooks) {
      const preview = createPreview({ author, image, title, id }, authors);
      nextPageFragment.appendChild(preview);
    }

    document.querySelector('[data-list-items]').appendChild(nextPageFragment);

    const remainingBooks = matches.length - (page + 1) * booksPerPage;
    const remainingText = remainingBooks > 0 ? ` (${remainingBooks})` : '';
    document.querySelector('[data-list-button]').textContent = `Show more${remainingText}`;

    document.querySelector('[data-list-button]').disabled = !(remainingBooks > 0);

    page++;
  });

  document.querySelector('[data-header-search]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = true;
    document.querySelector('[data-search-title]').focus();
    if (currentOverlay) {
      document.body.removeChild(currentOverlay);
      document.body.removeChild(document.querySelector('.backdrop'));
      currentOverlay = ''
    }
  });

  document.querySelector('[data-search-cancel]').addEventListener('click', (event) => {
    document.querySelector('[data-search-overlay]').open = false;
  });

  document.querySelector('[data-list-items]').addEventListener('click', showBookDetails);


  //input for search algorythem
  document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    const result = [];

    for (const book of books) {                                     //no case sencativity
      const titleMatch = filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase());
      const authorMatch = filters.author === 'any' || book.author === filters.author;
      let genreMatch = filters.genre === 'any';

      if (!genreMatch) {
        for (const genre of book.genres) {
          if (genre === filters.genre) {
            genreMatch = true;
            break;
          }
        }
      }

      if (titleMatch && authorMatch && genreMatch) {
        result.push(book);
      }
    }
    // console conformation
    console.clear();
    console.warn('Searching in progress...');
    if (result.length < 1) {
      document.querySelector('[data-list-message]').classList.add('list__message_show');
      console.warn('No books following your input search again.');
    } else {
      document.querySelector('[data-list-message]').classList.remove('list__message_show');
      console.warn('Found Items');
    }

    //displaying small preview for user so that the image and ame are there for the user

    document.querySelector('[data-list-items]').innerHTML = '';
    const fragment = document.createDocumentFragment();
    const extracted = result.slice(0, booksPerPage);

    for (const { author, image, title, id } of extracted) {
      const element = document.createElement('button');
      element.classList = 'preview';
      element.setAttribute('data-preview', id);

      element.innerHTML = `
        <img class="preview__image" src="${image}" />
        <div class="preview__info">
          <h3 class="preview__title">${title}</h3>
          <div class="preview__author">${authors[author]}</div>
        </div>
      `;

      fragment.appendChild(element);
    }

    document.querySelector('[data-list-items]').appendChild(fragment);


    //showmore call
    const initial = result.length - (page * booksPerPage);
    const remaining = initial > 0 ? initial : 0;
    document.querySelector('[data-list-button]').disabled = initial <= 0;

    document.querySelector('[data-list-button]').innerHTML = `
      <span>Show more</span>
      <span class="list__remaining"> (${remaining})</span>
    `;

    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelector('[data-search-overlay]').open = false;
  });


  //book click call overlay
  document.querySelector('[data-search-overlay]').addEventListener('click', (event) => {
    if (event.target === document.querySelector('[data-search-overlay]')) {
      document.querySelector('[data-search-overlay]').open = false;
    }
  });
});
