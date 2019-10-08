document.getElementById("clearButton").addEventListener("click", function () {
    chrome.storage.sync.set({hidden: "" }, function() {
    });
});