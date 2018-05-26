

  // @param {function(string)} callback called when the URL of the current tab is found.

function getCurrentTabUrl(callback) {

  // Query filter to be passed to chrome.tabs.query
  // https://developer.chrome.com/extensions/tabs#method-query

  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, (tabs) => {

    var tab = tabs[0];

    // https://developer.chrome.com/extensions/tabs#type-Tab

    var url = tab.url;

    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

  // MOST CHROME EXTENSION APIs ARE ASYNC!

}

  // @param {string} color	 | The new background color.

function changeBackgroundColor(color) {
  var script = 'document.body.style.backgroundColor="' + color + '";';

  // https://developer.chrome.com/extensions/tabs#method-executeScript

  chrome.tabs.executeScript({
    code: script
  });
}


  // @param {string} url 		| URL whose background color is to be retrieved.
  // @param {function(string)} 	| callback called with the saved background color for the given url on success, or a false value if no color is retrieved.

function getSavedBackgroundColor(url, callback) {

  // https://developer.chrome.com/apps/storage#type-StorageArea 
  // check for chrome.runtime.lastError to ensure correctness even when the API call fails

  chrome.storage.sync.get(url, (items) => {
    callback(chrome.runtime.lastError ? null : items[url]);
  });
}

  // @param {string} url 	| URL for which background color is to be saved.
  // @param {string} color 	| the background color to be saved.

function saveBackgroundColor(url, color) {
  var items = {};
  items[url] = color;

  // https://developer.chrome.com/apps/storage#type-StorageArea

  chrome.storage.sync.set(items);
}

// chrome.storage API will save as part of extention's isolated storage 
// window.localStorage API is synchronous and stores data bound to a document's origin.
// chrome.storage.sync instead of chrome.storage.local allows the extension data to be synced across multiple user devices

document.addEventListener('DOMContentLoaded', () => {
  getCurrentTabUrl((url) => {
    var dropdown = document.getElementById('dropdown');

    getSavedBackgroundColor(url, (savedColor) => {
      if (savedColor) {
        changeBackgroundColor(savedColor);
        dropdown.value = savedColor;
      }
    });

    dropdown.addEventListener('change', () => {
      changeBackgroundColor(dropdown.value);
      saveBackgroundColor(url, dropdown.value);
    });
  });
});
