const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: true //false //default: true
    });
    
    //페이지 오픈
    const page = await browser.newPage();

    //페이지 사이즈 설정
    await page.setViewport({
      width: 1440,
      height: 980
    });

    // 웹사이트 접속
    await page.goto('https://www.naning9.com/');

    //카테고리 주소 수집
    const targetUrls = await page.evaluate(() => {
        let categories = [];
        const category = document.querySelectorAll(".header-bottom__menu.header-bottom__menu--right > ul > li");
        
        for(j = 0; j < category.length; j++) {
            categories.push(
                // {cateName: category[i].querySelector('a').innerText,
                // cateUrls: category[i].querySelector('a').href}
                category[j].querySelector('a').href
            );
        }
        return categories;
    });

    console.log(targetUrls); //카테고리 주소 확인

    const total = [];

    for(url in targetUrls) { //카테고리 주소 돌면서 실행
    // for(i = 0; i < targetUrls.length; i++) {
        await page.goto(targetUrls[url]);

        //페이징 구현
        const paging = await page.evaluate(() => {
            let pageSrc = [];
            const pageCheck = document.querySelectorAll("body > div.promotion-contents > div.list_page > ul > li");
            for(c = 2; c < pageCheck.length -1; c++) {
                pageSrc.push(
                    pageCheck[c].querySelector('a').href
                );
            }
            return pageSrc;
        });

        console.log(paging); //페이징 주소 확인



        for(p = 0; p < paging.length; p++) { //페이지 돌면서 자료수집
            const catepages = await page.evaluate(() => {
                let AllItems = [];
                const items = document.querySelectorAll('.promotion-contents > div.promotion-contents__product.product-container > div.product-list > .product-item');
    
                const itemslen = document.querySelectorAll('.promotion-contents > div.promotion-contents__product.product-container > div.product-list > .product-item').length;
    
                for (i = 0; i < itemslen; i++) {
                    AllItems.push({
                        id: items[i].querySelector('a').getAttribute('href').match(/index_no=(\d+)/)[1], //정규식.. 사용해보기
                        name: items[i].querySelector('.product-info__name').innerText,
                        img: items[i].querySelector('.product-thumnail > img').getAttribute('src'), 
                    
                        //가격 어디서 어떻게 구현할지 생각해보자
                        price: items[i].querySelector('.product-info__price').innerText
                    });  
                }
                return AllItems;
            });

            console.log(catepages); //결과값 출력 확인

            //위에 선언한 total에 수집한 정보 저장하기
            for (k in catepages) {
                total.push(catepages);
            }

            //결과 json 저장하기
            // await fs.writeFileSync("/Users/ny/Documents/git/testAction/Jtest.json", JSON.stringify(total));
            await fs.writeFileSync(path.resolve(__dirname, './Jtest.json'), JSON.stringify(total), 'utf-8');
        }
   };

    await browser.close(); //종료
})();