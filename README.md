# My Homepage

The source code of [my homepage](https://rayeren.github.io).

## Quick Start

1. Fork this REPO to `USERNAME/USERNAME.github.io`, where `USERNAME` is your USERNAME.
1. Configure the google scholar citation crawler:
    1. Find your google scholar ID in the url of your google scholar page (e.g., https://scholar.google.com/citations?user=SCHOLAR_ID), where `SCHOLAR_ID` is your google scholar ID.
    1. Set GOOGLE_SCHOLAR_ID variable to your google scholar ID in `Settings -> Secrets -> Actions -> New repository secret` of the REPO website with `name=GOOGLE_SCHOLAR_ID` and `value=SCHOLAR_ID`.
    1. Restart the failed `Get Citation Data` github action in `Action` of the REPO website. This action will generate google scholar citation stats data `gs_data.json` in `google-scholar-stats` branch of your REPO.
1. Generate favicon using [favicon-generator](https://redketchup.io/favicon-generator) and download all generated files to `REPO/images`.
1. Add your infomation in `_config.yml` and `_pages/about.md`.
1. Your page will be published at `https://USERNAME.github.io`.