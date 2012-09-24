var additionalInfo = {
  "title": document.title,
  "selection": window.getSelection().toString()
};
console.log("excute content_script.js"+document.title+window.getSelection().toString());
chrome.extension.connect().postMessage(additionalInfo);