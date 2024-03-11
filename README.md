Script to sort vinted search by number of likes of item, it was annoying for me to search through dozens of pages and not find anything interesting. Mostly those items with many likes were nice, so here is it script using Node.js and puppeteer to find clothes faster.


Requirments:
Chrome browser installed
npm
node.js

Usage: 
extract .zip where you want
npm update
node index.js

script will tell you to select search term, gender, size and optionally max price, then puppeteer window will open. Don't interfere with running script by clicking anything on webiste, window needs to be maximized to work properly, after searching by all pages results will be presented.
