# Editing the portfolio site

All the text on the site lives in plain files in the `_data/` folder.
To change the site, edit one of those files. You don't need to touch any HTML.

## Which file to edit

| I want to change… | Edit this file |
|---|---|
| Name, email, LinkedIn/GitHub links, browser tab title, footer, hero clock city/timezone | `_data/site.yml` |
| Top of the page: badge, typing roles, short bio, photos, orbiting icons | `_data/hero.yml` |
| About paragraphs and stat counters | `_data/about.yml` |
| Skill groups, the scrolling logo strip, which skills get a ★ and their % | `_data/skills.yml` |
| Jobs (role, company, dates, metric chips, bullet points, tags) and the filter buttons above them | `_data/experience.yml` |
| Degrees | `_data/education.yml` |
| Certifications | `_data/certifications.yml` |
| Project cards and their "View case study" details | `_data/projects.yml` |

Each file starts with comments explaining its fields.

## Common edits

**Add a project:** open `_data/projects.yml` and copy an existing block, from `- name:` down to the end of its `case_study`. Paste it where you want it (cards show in file order) and change the text. `case_study` is optional; leave it out and the card just won't have the "View case study" button.

**Add a job:** same idea in `_data/experience.yml`, copying from `- role:` down to its last tag. Newest job goes first.

**Add a bullet point:** add a new line starting with `- ` under `bullets:`, lined up with the others.

**Add a logo or photo:** upload the image on GitHub into `assets/logos/` (logos) or `assets/` (photos) with **Add file → Upload files** on the `dev` branch. Then reference it in the data file, e.g. `logo: assets/logos/newcompany.png`. Square PNG/JPG files around 200–600 px work best.

**Make text bold:** wrap it in double stars: `**Kubernetes upgrades**`.

## Rules that prevent most mistakes

1. **Indentation matters.** Use spaces, never tabs, and line new lines up exactly with the ones above them.
2. **Quote text that has a colon followed by a space**, e.g. `name: "Migration: Docker → containerd"`.
3. **Quote values that start with a special character** (`*`, `&`, `!`, `{`, `[`, `#`, `@`, `` ` ``).
4. Emojis and characters like `—`, `→` and `·` are fine as-is.

## Workflow: dev branch → main

- `main` is the **live site** (GitHub Pages publishes it).
- `dev` is where you work.

1. On GitHub, switch the branch selector to **dev**, open the `_data` file, click the pencil icon, edit, and commit.
2. The **Check site build** action runs automatically (Actions tab). Green means the site builds. Red usually means a YAML typo, and the log shows the file and line number.
3. When you're happy, open a pull request **dev → main** and merge it. The live site updates within a minute or two.

## Preview on your own computer (optional)

Requires Ruby, or Docker.

```bash
# Ruby
bundle install
bundle exec jekyll serve      # then open http://127.0.0.1:4000

# or Docker
docker run --rm -p 4000:4000 -v "$PWD":/srv/jekyll jekyll/jekyll:pages jekyll serve
```

Opening `index.html` directly in a browser won't work any more: the page is assembled from the `_data` files when it's built.

## How the repo is organised

```
_data/            ← all content (edit these)
_includes/
  sections/       ← HTML template for each page section (hero, about, skills, …)
  head.html, page-chrome-*.html, tags.html, section-header.html, inline-markdown.html
_layouts/default.html   ← page skeleton; passes data to the scripts
assets/css/main.css     ← all styling
assets/js/*.js          ← animations, theme toggle, ⌘K menu, case studies
assets/                 ← photos and logos
index.html        ← lists the sections in page order
_config.yml       ← site build settings
README.md         ← your GitHub profile page (not part of the website)
```
