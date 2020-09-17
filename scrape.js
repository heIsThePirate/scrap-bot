const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const url =
  "https://www.topuniversities.com/university-rankings/world-university-rankings/2021";

const getContent = async (url) => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });

    const scrapedData = [];

    for (let i = 0; i < 10; i++) {
      const content = await page.content();

      const $ = cheerio.load(content);

      $("#qs-rankings > tbody > tr").each((index, element) => {
        const tds = $(element).find("td");

        const rank = $(tds[0]).text();
        const university = $(tds[1]).text();
        const location = $(tds[2]).text();

        scrapedData.push({ rank, university, location });
      });

      await page.$eval("#qs-rankings_next", elem => elem.click())
    }

    await browser.close();
    console.log(scrapedData);
  } catch (err) {
    console.log(err);
  }
};

getContent(url);
