const puppeteer = require("puppeteer");
const input = require("input");

askStuff();

async function askStuff() {
    const name = await input.text('What is your search term?',{default:"trousers"});

    const pages = await input.text("How many pages to scan?",{default:10});

    const price = await input.text("Max price? (press enter if you don't want to search by price)");
    const sex = await input.select(`Male or Female?`, [
        'Male', 'Female']);
    const sizes = await input.checkboxes(`Select Size (space to select)`, (sex =="Male") ? [
        'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL','4XL','5XL','6XL','7XL','8XL'
      ] : [
        'XXXS', 'XXS', 'XS', 'S', 'M', 'L', 'XL','4XL','5XL','6XL','7XL','8XL',"9XL"
      ]);


    if(name.length!=0&&isNumber(pages)) {
        const browser = await puppeteer.launch({ 
            headless: false ,
            defaultViewport: null,
        });

        const page = await browser.newPage();

        await page.goto("https://www.vinted.pl/catalog?search_text="+name);

        await delay(2000);

        if(await page.$("#onetrust-accept-btn-handler") !==null) {
            await page.click("#onetrust-accept-btn-handler");

            await delay(2000);
        }



        //size selection
        await page.click("button[data-testid=catalog--size-filter--trigger]");

        if(sex=="Male") {
            await page.click("div[data-testid=dropdown-content] ul li:nth-child(2)");
        } else {
            await page.click("div[data-testid=dropdown-content] ul li:first");
        }

        
        await delay(1000);

        for(size in sizes) {
            const el =(await page.$$("xpath/.//div[@data-testid='dropdown-content']//ul//h2[text()='"+sizes[size]+"']"))[0];
            el.click();
        }
        
        await delay(2000);

        //setting max price
        if(price!=""&&isNumber(price)) {
            await page.click("button[data-testid=catalog--price-filter--trigger]");

            await page.type('div[data-testid=dropdown-content] label[for=price_to] input', price, { delay: 10 });
            await page.click("body");
        }



        await delay(5000);

        var itemsList = [];
        itemsList = await collectData(page);

        for(var i=2;i<=pages;i++) {
            btn = await page.$$('xpath/.//li[@class="web_ui__Pagination__item"]//a[contains(.,"'+i+'")]');
            if(btn[0]) {
                btn[0].click();
                await delay(5000);
    
                const items = await collectData(page);
                if(items.length==0) {
                    break;
                }
                itemsList.push(...items);
            } else {
                break;
            }

            
        }
        itemsList = [...itemsList.entries()].sort((a, b) => b[1]["likes"] - a[1]["likes"]);

        await page.evaluate((itemsList) => {
            jQuery("body").html("");
            var list = jQuery("<ul></ul>");

            for(key in itemsList) {
                console.log(itemsList[key]);
                var li = jQuery("<li></li>");
                jQuery(li).append(a);

                var a = jQuery("<a></a>");
                a.attr("href",itemsList[key][1]["href"]);
                a.attr("target","_blank");

                var img = jQuery("<img/>");
                img.attr("src",itemsList[key][1]["src"]);

                var likes = jQuery("<p></p>");
                jQuery(likes).text("Likes: "+ itemsList[key][1]["likes"]);

                var price = jQuery("<p></p>");
                jQuery(price).text("Price: " +itemsList[key][1]["price"]);

                jQuery(a).append(img);
                jQuery(a).append(likes);
                jQuery(a).append(price);
                
                jQuery(list).append(li);
            }

            jQuery("body").append(list);
        },itemsList);


    }
}
  

function isNumber(n) { return !isNaN(parseFloat(n)) && !isNaN(n - 0) }

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  } 
  

async function collectData(page) {

    return await page.evaluate(async () => {
        var jq = document.createElement('script');
            jq.src = "https://code.jquery.com/jquery-3.7.1.min.js";
            document.getElementsByTagName('head')[0].appendChild(jq);
            await new Promise(r => setTimeout(r, 3000));
            // ... give time for script to load, then type (or see below for non wait option)
            jQuery.noConflict();

        var map = [];
        jQuery(".feed-grid__item").each(function(i) {
            var el = {};
            el["likes"] = jQuery(this).find(".web_ui__Cell__suffix span:last").text();
            el["src"] = jQuery(this).find("img:last").attr("src");
            el["price"] = jQuery(this).find(".title-content p").text();
            el["href"] = jQuery(this).find("a:last").attr("href");
            map.push(el);
        });

        return map;
    });
}