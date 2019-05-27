const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless: false})
  const page = await browser.newPage()
  
  await page.goto('https://twitter.com/login?lang=zh-tw')
  
  await page.setViewport({ width: 1300, height: 500 })

  await page.keyboard.type('jacobhsu')
  await page.keyboard.press('Tab'); 
  await page.keyboard.type('1234');
  await page.keyboard.press('Tab'); 
  await page.keyboard.press('Enter'); 

  //await browser.close()
})()