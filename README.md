# HS Sports Elite — NJ High School Sports

Automated NJ high school sports article tracker for [highschoolsportselite.com](https://highschoolsportselite.com).

## Contents

| File | Description |
|------|-------------|
| `nj_sports_scraper.py` | Daily scraper — pulls NJ.com RSS feed, deduplicates, appends to Excel |
| `NJ_HS_Sports_Articles_2026.xlsx` | Master spreadsheet (1,248+ articles, Jan–May 2026) |
| `scraped_urls.json` | Tracking file of already-collected article URLs |
| `kolkebeck_article.html` | Sample magazine-style game article |

## How the Scraper Works

1. Fetches `https://www.nj.com/arc/outboundfeeds/rss/category/highschoolsports/`
2. Paginates with `?from=N` to capture up to 300 recent articles
3. Skips URLs already in `scraped_urls.json`
4. Appends new rows to the Excel file with: Title, Date, School, Sport, Link, Summary, Author
5. Scheduled to run daily at 7:05 AM via Claude Cowork

## Spreadsheet Columns

- **Article Title** — Full headline
- **Published Date** — YYYY-MM-DD
- **School Name** — Extracted from headline
- **Sport Category** — Baseball, Softball, Basketball, etc.
- **Article Link** — Direct URL to NJ.com article
- **Summary** — First 300 characters of article description
- **Author** — Byline from RSS feed
- **Date Added** — When row was added to spreadsheet

## Running Manually

```bash
pip install openpyxl
python3 nj_sports_scraper.py
```

## Data Source

Articles sourced from NJ.com's public RSS feed:
`https://www.nj.com/arc/outboundfeeds/rss/category/highschoolsports/`
