

import { genresObj, authors, books, BOOKS_PER_PAGE } from "./data.js";

/**
 * Function that gets the needed element from the DOM
 *
 * @param {string} label -Represent the identifying element from the DOM
 * @param {HTMLElement | ShadowRoot} [target]
 * @returns {HTMLElement}
 */
export const getHtmlElement = (label, target) => {
  const scope = target || document;
  const node = scope.querySelector(`${label}`);
  if (!(node instanceof HTMLElement)) {
    throw new Error(`${label} element not found in HTML`);
  }
  return node;
};

/**
 * Object containing all query selectors
 */
export const selectors = {
  list: getHtmlElement("[data-list-items]"),
  message: getHtmlElement("[data-list-message]"),
  loadMore: getHtmlElement("[data-list-button]"),
  previewOverlay: {
    overlay: getHtmlElement("[data-list-active]"),
    overlayBtn: getHtmlElement("[data-list-close]"),
    overlayBlur: getHtmlElement("[data-list-blur]"),
    overlayImage: getHtmlElement("[data-list-image]"),
    titleOverlay: getHtmlElement("[data-list-title]"),
    dataOverlay: getHtmlElement("[data-list-subtitle]"),
    infoOverlay: getHtmlElement("[data-list-description]"),
  },
  theme: {
    themeBtn: getHtmlElement("[data-header-settings]"),
    themeOverlay: getHtmlElement("[data-settings-overlay]"),
    themeCancelBtn: getHtmlElement("[data-settings-cancel]"),
    themeForm: getHtmlElement("[data-settings-form]"),
    themeSelect: getHtmlElement("[data-settings-theme]"),
  },
  search: {
    searchBtn: getHtmlElement("[data-header-search]"),
    searchOverlay: getHtmlElement("[data-search-overlay]"),
    searchCancelBtn: getHtmlElement("[data-search-cancel]"),
    searchForm: getHtmlElement("[data-search-form]"),
  },
  genresSelect: getHtmlElement("[data-search-genres]"),
  authorSelect: getHtmlElement("[data-search-authors]"),
  title: getHtmlElement("[data-search-title]"),
  outline: getHtmlElement(".overlay__button"),
};

export const css = {
  day: {
    dark: "10, 10, 20",
    light: "255, 255, 255",
  },
  night: {
    dark: "255, 255, 255",
    light: "10, 10, 20",
  },
};

selectors.outline.style.outline = "0"; // Fixing the outline bug with the overlay close button

/**
 * Function made to insert values from the inputted objects to the newly created 'option' element, a fragment is created
 * as well and the new options elements with their values are appended to the fragment, the function then returns the
 * fragment which can then be appended to the required parent element, the function also takes in a string argument
 * which is primarily used to create a default option value i.e "All". To get the the values from the objects the function
 * runs a loop through the object getting both the key values and the properties of those key values.
 * @param {string} text
 * @param {object} object
 * @returns {DocumentFragment}
 */
const optionsCreate = (text, object) => {
  const fragment = document.createDocumentFragment();
  const allOption = document.createElement("option");
  allOption.value = "All";
  allOption.innerText = text;
  fragment.appendChild(allOption);

  for (const [keyValue, property] of Object.entries(object)) {
    const option = document.createElement("option");
    option.value = keyValue;
    option.innerText = property;
    fragment.appendChild(option);
  }

  return fragment;
};

selectors.genresSelect.appendChild(optionsCreate("All genres", genresObj));
selectors.authorSelect.appendChild(optionsCreate("All authors", authors));

//Set the colors of the preview overlay text to correspond with the theme change
selectors.previewOverlay.titleOverlay.style.color = `rgba(var(--color-dark))`;
selectors.previewOverlay.dataOverlay.style.color = `rgba(var(--color-dark))`;
selectors.previewOverlay.infoOverlay.style.color = `rgba(var(--color-dark))`;


const preview = document.createElement('template')
preview.innerHTML = `
<style> 

*{
  box-sizing: border-box;
}


.preview {
  border-width: 0;
  width: 100%;
  font-family: Roboto, sans-serif;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  text-align: left;
  border-radius: 8px;
  border: 1px solid rgba(var(--color-dark), 0.15);
  background: rgba(var(--color-light), 1);
}

@media (min-width: 60rem) {
  .preview {
    padding: 1rem;
  }
}

.preview_hidden {
  display: none;
}

.preview:hover {
  background: rgba(var(--color-blue), 0.05);
}

.preview__image {
  width: 48px;
  height: 70px;
  object-fit: cover;
  background: grey;
  border-radius: 2px;
  box-shadow: 0px 2px 1px -1px rgba(0, 0, 0, 0.2),
    0px 1px 1px 0px rgba(0, 0, 0, 0.1), 0px 1px 3px 0px rgba(0, 0, 0, 0.1);
}

.preview__info {
  padding: 1rem;
}

.preview__title {
  margin: 0 0 0.5rem;
  font-weight: bold;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
  color: rgba(var(--color-dark), 0.8)
}

.preview__author {
  color: rgba(var(--color-dark), 0.4);
} </style>
<div class="preview">
<img src=""  class="preview__image" ></img>
<div class="preview__info">
  <h3 class="preview__title"></h3>
  <div class="preview__author"></div>
  </div>
  </div>`;
  
  export class BookPreview extends HTMLElement {
    inner = this.attachShadow({mode: "closed"})
    constructor() {
      super();
      const {content} = preview
      this.inner.appendChild(content.cloneNode(true));
    }
  
    connectedCallback() {
      if (this.hasAttribute('prop') && this.hasAttribute('index')){
      const imgElement = this.inner.querySelector('.preview__image');
      const titleElement = this.inner.querySelector('.preview__title');
      const authorElement =this.inner.querySelector('.preview__author');
  
      const prop = JSON.parse(this.getAttribute('prop'));
      const index = this.getAttribute('index');
  
      imgElement.src = prop.image;
      titleElement.textContent = prop.title;
      authorElement.textContent = authors[prop.author];
  
      this.dataset.index = index;
      this.id = prop.id;
      this.className = "preview"
      }
    }
  }
  
  customElements.define('book-preview', BookPreview);
  
// Initial loading of the first 36 books
for (let i = 0; i < BOOKS_PER_PAGE; i++) {
  const bookPreview = new BookPreview();
  const prop = books[i];
  const index = i;
  bookPreview.setAttribute('prop', JSON.stringify(prop));
  bookPreview.setAttribute('index', index);
  selectors.list.appendChild(bookPreview);
}

// Changing the text content of the "Show more" button
selectors.loadMore.innerHTML = `<span>Show more</span>
<span class = "list__remaining">(${books.length - BOOKS_PER_PAGE})</span>`;














//old code handling the loading of books before using the class BookPreview

// /** Function made to create the innerHtml for the created element(booksElement) in the function and insert the values inputted
//  * to the areas required in order to display correctly in the html/DOM, this function will also take
//  * in the inputted values to add unique attributes to the created element i.e. class name and or 
//  * dataset. The function returns the booksElement which can be later appended to the chosen parent element.
//  * 
// @param {Object} prop - The book (in the form of an object).
//  * @param {string} prop.id - The unique identifier of the book.
//  * @param {string} prop.image - The URL of the book's image.
//  * @param {string} prop.title - The title of the book.
//  * @param {string} prop.author - The author of the book represented by a UUID, which correlates with the key values in the authors Object
//  * @param {number} index - The index associated with the book.
//  * @returns {HTMLElement} - The created booksElement.
//  */
// export const innerHTML = (prop, index) => {
//   if (typeof prop !== "object" || prop === null) {
//     throw new Error(`${prop} needed to be an object with the following properties
//     id, title, author. Expected an object, received ${typeof prop}.`);
//   }
//   const { id, image, title, author } = prop;

//   const booksElement = document.createElement("div");
//   booksElement.dataset.index = `${index}`; // Retrieving the index to make it easier to fetch data for future use
//   booksElement.className = "preview";
//   booksElement.id = id;
//   booksElement.innerHTML = ` <img src = ${image} class = 'preview__image'  alt="${title} book image"></img>
//   <div class="preview__info">
//     <h3 class="preview__title">${title}</h3>
//     <div class="preview__author">${authors[author]}</div>
//     </div>`;
//   return booksElement;
// };