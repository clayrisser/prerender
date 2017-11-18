import express from 'express';
import url from 'url';
import { Logger, transports } from 'winston';
import puppeteer from 'puppeteer';

const { env } = process;
const config = {
  port: env.PORT ? Number(env.PORT) : 3000,
  host: env.HOST || '',
  timeout: env.TIMEOUT ? Number(env.TIMEOUT) : 500,
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
  host = host || url.substr(0, url.indexOf('#!') + 2);
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto(url).catch((err) => {
    if (err.message.indexOf('Cannot navigate to invalid URL undefined') <= -1) {
      throw err;
    }
  });
  return page.evaluate((host, timeout) => {
    return new Promise((resolve, reject) => {
      return window.setTimeout(() => {
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
      }, timeout);
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
