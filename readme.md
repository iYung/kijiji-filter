# Kijiji Filter

Kijiji Filter is a chrome extension that filters out results according to its own Kijiji Query Language. It also has a hide button to block listings that would normally pass the written query.

## Kijiji Query Language

Kijiji searches are now powered by the Kijiji Query Language! Currently it does 3 things:

* Specify words to include
* Specify words to exclude
* Specify listing attributes to be a specific value

To specify words to include, just type the word in normally! For example, this would specify dogs:
```
dogs
```
Add a `-` before a word to exclude it. The query below would get dogs but exclude listings with the word `brown`:
```
dogs -brown
```
To specify an attribute value, follow this format: `"parameter:value"`. This will filter out results that do not have this attribute or do not have the same value. For example, this query will get condos for rent that have air conditioning:
```
condos for rent "air conditioning:yes"
```

## Why does this even exist?

This extension is was made for me by me! Kijiji Filter allowed me to easily find lisitings on Kijiji that I would be interested in. Specifying words to exclude was my way of filtering out listings in areas I did not like and parameter search allowed me to only view listings with features I liked (air conditioning, furnished...).
