const fs = require('fs');
const puppeteer = require('puppeteer');

let pageParser = require('./lib/pageParser');
let articleParser = require('./lib/articleParser');

let Board = 'Soft_Job'; // Beauty, Gossiping 
let nowPage = 0;
let age18 = 1;
let isHeadless = true;
if (process.argv[2]) Board = process.argv[2];
if (process.argv[3]) nowPage = process.argv[3];
if (process.argv[4] === 'false') isHeadless = false;


// Uses Headless mode : Puppeteer launches Chromium in headless mode. To launch a full version of Chromium, set the 'headless' option when launching a browser:
// ${看板名} ${欲往前爬取的頁數} ${是否headless}
console.log(`Board ${Board} / Page ${nowPage} / headless? ${isHeadless}`);

(async () => {
    const browser = await puppeteer.launch({ headless: isHeadless });
    const page = await browser.newPage();
    // handled promise rejection
    await page.setRequestInterception(true);
    // 註冊request事件，攔截非必要請求，不浪費流量去載入不必要的圖片、樣式表
    page.on('request', request => {
        if (
          ['image', 'stylesheet', 'font', 'script'].indexOf(
            request.resourceType()
          ) !== -1
        ) {
          request.abort();
        } else {
          request.continue();
        }
      });

    console.log('goto:',`https://www.ptt.cc/bbs/${Board}/index${nowPage}.html`);
    while (true) {
        let p = await page.goto(
        `https://www.ptt.cc/bbs/${Board}/index${nowPage}.html`,
        {
            waitUntil: 'domcontentloaded',
            timeout: 0
        }
        );

        // 400 Bad Request· 403 Forbidden · 404 Not Found 
        if ((await p.status()) >= 400) {
            console.log('此頁不存在',p.status());
            continue;
        }

        // 西斯版 (sex) 或是八卦版 (gossiping) 必須把 cookie 的 over18 設定為1
        if (age18) {
            await page.setCookie({
                name: 'over18',
                value: '1'
            });
            //不可以reload 因為頁面被跳轉了
            await page.goto(`https://www.ptt.cc/bbs/${Board}/index${nowPage}.html`, {
                waitUntil: 'domcontentloaded',
                timeout: 50 * 1000
            });
            age18 = 0; // only one time to reload cookie;
        }

        let pageInfo = await page.evaluate(pageParser);
        nowPage = pageInfo.pageNumber; //Now page;
        let articleInfo = [];

        for (let i = 0; i < pageInfo.links.length; i++) {
            let article = await page.goto(pageInfo.links[i].link, {
                waitUntil: 'domcontentloaded',
                timeout: 0
            });
            if ((await article.status()) >= 400) {
                console.log('此篇文章不存在',p.status());
                continue;
            }
            articleInfo.push(await page.evaluate(articleParser));
        }
        if (!fs.existsSync('./data')) fs.mkdirSync('./data');
        //write data to json
        if (!fs.existsSync(`./data/${Board}`)) fs.mkdirSync(`./data/${Board}`);

        fs.writeFileSync(
            `./data/${Board}/${Board}_${nowPage}.json`,
            JSON.stringify(articleInfo),
            { flag: 'w' }
        );
        console.log(`Saved as data/${Board}/${Board}_${nowPage}.json https://www.ptt.cc/bbs/${Board}/index${nowPage}.html`);
        nowPage -= 1;
        if (nowPage === 0) break;
    }



    await browser.close();
  })();