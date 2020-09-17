const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const Excel = require("exceljs");

const url =
  "https://www.topuniversities.com/university-rankings/world-university-rankings/2021";

const numberOfPages = 10;

const getData = async (url, N) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });

    const scrapedData = [];

    for (let i = 0; i < N; i++) {
      const content = await page.content();

      const $ = cheerio.load(content);

      $("#qs-rankings > tbody > tr").each((index, element) => {
        const tds = $(element).find("td");

        let rank = $(tds[0]).text();
        const university = $(tds[1]).text();
        const location = $(tds[2]).text();

        rank = rank[0] === '=' ? parseInt(rank.slice(1)) : parseInt(rank);

        scrapedData.push({ rank, university, location });
      });

      await page.$eval("#qs-rankings_next", (elem) => elem.click());
    }

    await browser.close();

    return scrapedData;
  } catch (err) {
    console.log(err);
  }
};

const scrapeData = async (url, N) => {
  const data = await getData(url, N);

  let workbook = new Excel.Workbook();

  let worksheet = workbook.addWorksheet("University Rankings");

  worksheet.columns = [
    { header: "Rank", key: "rank" },
    { header: "University", key: "university" },
    { header: "Location", key: "location" },
  ];

  worksheet.columns.forEach((column) => {
    column.width = column.header.length < 12 ? 12 : column.header.length;
  });

  worksheet.getRow(1).font = { bold: true };

  data.forEach((e, index) => {
    const rowIndex = index + 2;
    worksheet.addRow({
      ...e,
    });
  });

  workbook.xlsx.writeFile('University Rankings.xlsx')
};

scrapeData(url, numberOfPages);
