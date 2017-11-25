# prerender

Prerender BlogDown

Please &#9733; this repo if you found it useful &#9733; &#9733; &#9733;

## Features
* Prerender using event listener
* Prerender using set timeout


## Usage

```sh
docker run --name some-prerender -d -e TIMOUT=5000 thingdown/prerender:latest
docker run --name some-blogdown -d -p 8801:8801 --link some-prerender:prerender -e ROOT_URI=http://localhost:8801 thingdown/blogdown:latest
```


## Dependencies

* [Docker](https://www.docker.com/)


## Support

Submit an [issue](https://github.com/thingdown/prerender/issues/new)


## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D


## License

[MIT License](https://github.com/thingdown/prerender/blob/master/LICENSE)

[Jam Risser](https://jamrizzi.com) &copy; 2017


## Credits

* [Jam Risser](https://jamrizzi.com) - Author


## Changelog

v0.0.1 (2017-11-17)
* Initial release
