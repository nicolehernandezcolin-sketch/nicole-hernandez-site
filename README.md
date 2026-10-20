# nicolehernandez.co

The official site of Nicole Hernandez, a singer-songwriter based in San Diego.

Static site, no build step. Open `index.html` or serve the folder:

```
python3 -m http.server 8433
```

## Pages
- `index.html`: landing (night sea, the light reveals the photo)
- `layers.html`: the debut album *Layers*
- `videos.html`: music videos on a vintage TV
- `about.html`: bio and film photos
- `press.html`: press and shows
- `contact.html`: inquiries to Destined Echo (management)

Shared styles and behaviour live in `assets/site.css` and `assets/site.js`.

## Inquiry form
`contact.html` sends through [Web3Forms](https://web3forms.com). Paste the access key
created with Destined Echo's email into `WEB3FORMS_KEY` near the bottom of the file.

## Wordmark
Re-cut the transparent wordmark from the original artwork with:

```
swift tools/make_wordmark.swift brand/nicole-hernandez-logo-blue.png images
```
