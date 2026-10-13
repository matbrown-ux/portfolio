# Case study media

One folder per case study, named after its slug:

    src/assets/case-studies/vamp-network/dashboard.png
    src/assets/case-studies/vamp-network/tour.mp4
    src/assets/case-studies/vamp-network/tour-poster.jpg

Refer to a file by its path inside this folder, for example `vamp-network/dashboard.png`.

- Images: `.png`, `.jpg`, `.jpeg`, `.webp`, `.avif`, `.svg`. They are resized and converted at build time.
- Videos: `.mp4`, `.webm`. A video must have a `poster` image.
- A slot with no `src` shows a labelled placeholder. A `src` that does not match a file stops the build and names the path.

Where media goes:

- Hero and Home tile: the case study's frontmatter, `media.hero` and `media.tile`, each `{ src, alt, poster }`.
- Walkthrough steps and gallery images: the `src` and `poster` of each item in the MDX.
