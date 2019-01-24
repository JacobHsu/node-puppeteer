const fs = require('fs')
const puppeteer = require('puppeteer');

let scheduleParser = require('./lib/scheduleParser');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  let p = await page.goto('https://www.sportslottery.com.tw/zh/live-bet-schedule');
  
  if ((await p.status()) >= 400) {
    console.log('此頁不存在',p.status());
  }
  let pageInfo = await page.evaluate(scheduleParser);
  let betting  = pageInfo.postInfo.map(
    bet =>`${bet.Subject},${bet.StartDate},${bet.StartTime},${bet.EndDate},${bet.EndTime},,,`
    );
  
  let data = 'Subject, Start Date, Start Time, End Date, End Time, All Day Event, Description, Location\n'+ betting.join('\n');

  //await page.screenshot({path: 'example.png'});
  if (!fs.existsSync('./data')) fs.mkdirSync('./data');

  if (!fs.existsSync(`./data/schedule`)) fs.mkdirSync(`./data/schedule`);
  const today = new Date();
  let month = today.getMonth() +1;
  fs.writeFileSync(
      `./data/schedule/livebet_${month}.csv`,
      data,
      { flag: 'w' }
  );
  console.log(`Saved as data/schedule/livebet_${month}.json https://www.sportslottery.com.tw/zh/live-bet-schedule`);

  await browser.close();
})(); 