var hidden = [];
var modifiers = ["-", '"'];

var searchBar = document.querySelector('input[name=keywords]');

var cloneBar = copySearchBar(searchBar);

chrome.storage.sync.get(['hidden', 'query'], function(result) {
    cloneBar.value = result.query ? result.query : "";
    if (result.hidden) {
        result.hidden.split("~").forEach(elem => hidden.push(elem));
    }
    var ignoredWords = result.query ? getIgnoredWords(result.query) : [];
    var attributes = result.query ? getAttributes(result.query) : [];
    var listings = document.querySelectorAll('[data-listing-id]');

    listings.forEach(listing => {
        if (filterListing(listing, ignoredWords, attributes)) {
            deleteListing(listing);
        }
    })
});

function filterListing(listing, ignoredWords, attributes) {
    var id = listing.getAttribute("data-listing-id");
    if(hidden.includes(id)) {
        return true;
    }
    var titles = listing.getElementsByClassName("title");
    for (var i = 0; i < titles.length; i++) {
        if (ignoredWords.some(ignoredWord => titles[i].innerText.toLowerCase().includes(ignoredWord))) {
            return true;
        }
    }
    var descriptions = listing.getElementsByClassName("description");
    for (var i = 0; i < descriptions.length; i++) {
        if (ignoredWords.some(ignoredWord => descriptions[i].innerText.toLowerCase().includes(ignoredWord))) {
            return true;
        } else {
            addButton(descriptions[i], id);
        }
    }
    if (attributes.length > 0) {
        openListing(listing, attributes);
    }
    return false;
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
        deleteListing(listing);
    });
}

function getListing(element) {
    return element.hasAttribute("data-listing-id") ? element : getListing(element.parentElement);
}

function copySearchBar(searchBar) {
    var searchBarParent = searchBar.parentElement;
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
    var params = cloneBar.value.split('"').filter((word, index) => index % 2 == 0).join("").split(" ").filter(word => (word.length > 0) && !(modifiers.includes(word[0])));
    chrome.storage.sync.set({query: cloneBar.value })
    searchBar.value = params.join(" ");
}

function getIgnoredWords(query) {
    return query.split(" ").filter(word => (word.length > 0) && (word[0] == "-")).map(word => word.slice(1).toLowerCase());
}

function getAttributes(query) {
    return query.split('"').filter((word, index) => index % 2 == 1).filter(word => (word.length > 2) && (word.includes(":"))).map(datum => datum.split(":"));
}

function openListing(listing, attributes) {
    var url = listing.getAttribute("data-vip-url");
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4)  {
            var frag = new DocumentFragment()
            var body = document.createElement("body");
            frag.appendChild(body);
            body.innerHTML = xhr.responseText;
            for (var i = 0; i < attributes.length; i++) {
                console.dir(attributes[i]);
                if (!pageHasKeyVal(body, attributes[i][0], attributes[i][1])){
                    deleteListing(listing);
                    return;
                }
            }
        }
    };
    xhr.send(null);
}

function getNodeWithText(root, key) {
    var nodes = [root];
    while (nodes.length > 0) {
        node = nodes.pop();
        if (!node.innerText || node.innerText.toLowerCase() != key.toLowerCase()) {
            for (var i = 0; i < node.children.length; i++) {
                nodes.push(node.children[i]);
            }
        } else {
            return node;
        }
    }
    return null;
}

function pageHasKeyVal(node, key, val) {
    var acNode = getNodeWithText(node, key);
    console.dir(acNode);
    console.dir(key);
    if (acNode == null) {
        return false;
    }
    var ans = getNodeWithText(acNode.parentElement, val) != null;
    console.dir(ans);
    console.dir(val);
    return ans;
}

function deleteListing(listing) {
    listing.parentElement.removeChild(listing);
}