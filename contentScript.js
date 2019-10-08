var hidden = [];
var searchBar = document.querySelector('input[name=keywords]');

var cloneBar = copySearchBar(searchBar);

chrome.storage.sync.get(['hidden', 'query'], function(result) {
    cloneBar.value = result.query ? result.query : "";
    result.hidden.split("~").forEach(elem => hidden.push(elem));

    var ignoredWords = result.query ? getIgnoredWords(result.query) : [];

    var listings = document.querySelectorAll('[data-listing-id]');

    listings.forEach(listing => {
        var remove = false;
        var id = listing.getAttribute("data-listing-id");
        if(hidden.includes(id)) {
            remove = true;
        }
        var titles = listing.getElementsByClassName("title");
        for (var i = 0; i < titles.length; i++) {
            if (ignoredWords.some(ignoredWord => titles[i].innerText.toLowerCase().includes(ignoredWord))) {
                remove = true;
            }
        }
        var descriptions = listing.getElementsByClassName("description");
        for (var i = 0; i < descriptions.length; i++) {
            if (ignoredWords.some(ignoredWord => descriptions[i].innerText.toLowerCase().includes(ignoredWord))) {
                remove = true;
            } else {
                addButton(descriptions[i], id);
            }
        }
        if (remove) {
            listing.parentElement.removeChild(listing);
        }
    })
});

function populateHideButtons() {
    
}

function addButton(element) {
    var btn = document.createElement("BUTTON");
    btn.innerHTML = "HIDE";
    btn.onclick = hideListing;
    element.appendChild(btn);
}

function hideListing(event) {
    event.stopPropagation();
    var listing = getListing(event.target);
    hidden.push(listing.getAttribute("data-listing-id"));
    chrome.storage.sync.set({hidden: hidden.join("~") }, function() {
        listing.parentElement.removeChild(listing);
    });
}

function getListing(element) {
    return element.hasAttribute("data-listing-id") ? element : getListing(element.parentElement);
}

function copySearchBar(searchBar) {
    var searchBarParent = searchBar.parentElement;
    console.dir(searchBarParent);
    searchBar.setAttribute("type", "hidden");
    var cloneBar = document.createElement("input");
    cloneBar.value = searchBar.value;
    cloneBar.setAttribute("class", searchBar.getAttribute("class"));
    cloneBar.onkeyup = updateRealBar;
    searchBarParent.appendChild(cloneBar);
    return cloneBar;
}

function updateRealBar(event) {
    var cloneBar = event.target;
    var params = cloneBar.value.split(" ").filter(word => (word.length > 0) && (word[0] != "-"));
    chrome.storage.sync.set({query: cloneBar.value })
    searchBar.value = params.join(" ");
}

function getIgnoredWords(query) {
    return query.split(" ").filter(word => (word.length > 0) && (word[0] == "-")).map(word => word.slice(1).toLowerCase());
}