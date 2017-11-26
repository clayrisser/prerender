import express from 'express';
import url from 'url';
import puppeteer from 'puppeteer';
import { Logger, transports } from 'winston';

const { env } = process;
const config = {
  port: env.PORT ? Number(env.PORT) : 8803,
  host: env.HOST || '',
  timeout: env.TIMEOUT ? Number(env.TIMEOUT) : null,
  logLevel: env.DEBUG === 'true' ? 'debug' : 'info'
};

const app = express();
const log = new Logger({
  level: config.logLevel,
  transports: [new transports.Console()]
});

app.get('/*', async (req, res) => {
  const { pathname } = url.parse(req.originalUrl);
  const urlPath = pathname.substr(1, pathname.length);
  if (!urlPath) return res.status(404).json({ message: 'Invalid url' });
  return prerender({
    url: urlPath,
    host: config.host,
    timeout: config.timeout
  }).then((html) => {
    return res.send(html);
  }).catch((err) => {
    log.error(err);
    return res.status(500).json({ message: err.message });
  });
});

async function prerender({ url, host, timeout }) {
  log.info('url', url);
  const matches = url.match(/.+:\/{2}[^\/]+/g);
  if (matches && matches.length > 0) {
    host = matches[0];
  }
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto(url).catch((err) => {
    if (err.message.indexOf('Cannot navigate to invalid URL undefined') <= -1) {
      throw err;
    }
  });
  return page.evaluate((host, timeout) => {
    return new Promise((resolve, reject) => {
      function prerender() {
        try {
          let html = document.body.innerHTML;
          (document.body.innerHTML.match(/href="\/[^"]*/g) || []).map((match) => {
            const hrefReplacement = match.replace('href="', `href="${host}`);
            html = html.replace(match, hrefReplacement);
            return match;
          });
          return resolve(html);
        } catch (err) {
          return reject(err);
        }
      }
      if (timeout) {
        return window.setTimeout(() => {
          prerender();
        }, timeout);
      } else {
        window.addEventListener('prerender-ready', function(e) {
          prerender();
        }, false);
      }
    });
  }, host, timeout);
}

app.listen(config.port, () => {
  log.info('config', config);
  log.info(`listening at http://localhost:${config.port}`);
});

process.on('SIGINT', () => {
  log.info('Killing server . . .');
  process.exit(1);
});
