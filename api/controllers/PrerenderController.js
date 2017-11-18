import Controller from 'trails/controller';

export default class PrerenderController extends Controller {
  prerender(req, res, next) {
    const s = this.app.services;
    return s.PrerenderService.prerender(req.query.url).then((html) => {
      return res.send(html);
    }).catch(next);
  }
}
