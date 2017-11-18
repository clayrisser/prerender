import Service from 'trails/service';
import puppeteer from 'puppeteer';

export default class PrerenderService extends Service {
  async prerender(url, host) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    host = host || url.substr(0, url.indexOf('#!') + 2);
    await page.goto(url);
    return page.evaluate((host) => {
      return new Promise((resolve, reject) => {
        return window.setTimeout(() => {
          let html = document.body.innerHTML;
          document.body.innerHTML.match(/href="\/[^"]*/g).map((match) => {
            const hrefReplacement = match.replace('href="', `href="${host}`);
            html = html.replace(match, hrefReplacement);
            return match;
          });
          return resolve(html);
        }, 5000);
      });
    }, host);
  }
}
