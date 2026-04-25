# about.foreach.in

Personal portfolio built with [Astro](https://astro.build/).

## Development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # Static output in dist/
npm run preview  # Preview the build
```

## Daily Workflow

### Adding a TIL

TILs are organized by year and month:

```
src/content/til/
  2026/
    04/
      kafka-consumer-rebalance.md
      python-match-gotchas.md
    05/
      docker-buildkit-cache.md
```

1. Create the file at `src/content/til/<year>/<month>/<slug>.md`:

```bash
mkdir -p src/content/til/2026/04
```

```markdown
---
title: "Kafka consumer rebalance triggers"
date: 2026-04-25
tags: ["kafka"]
description: "What causes a consumer group rebalance and how to minimize them"
---

Your full article here. Supports all markdown — code blocks, links, lists, etc.

```python
# code blocks get syntax highlighted
consumer = KafkaConsumer('topic', group_id='my-group')
```
```

2. Commit and push:

```bash
git add src/content/til/2026/04/kafka-consumer-rebalance.md
git commit -m "til: kafka consumer rebalance triggers"
git push
```

The site auto-deploys. Your new TIL shows up in the grid view and becomes navigable in the scroll/timeline view.

**Tips:**
- `tags` is an array — first tag is shown on the card badge. Use lowercase (e.g. `["python", "testing"]`).
- `description` is the short text on the grid card. Keep it under ~80 chars.
- `date` determines position on the timeline. Use `YYYY-MM-DD` format.
- Filename becomes the URL slug: `kafka-consumer-rebalance.md` → `/til/kafka-consumer-rebalance/`.
- Folders are just for organization — the URL is always flat (`/til/<slug>/`).

### Adding a Someday topic

1. Create a new file in `src/content/want-to-learn/` named `<slug>.md` (e.g. `rust-ownership.md`):

```markdown
---
title: "Rust ownership model"
description: "Understand borrow checker, lifetimes, and zero-cost abstractions"
tag: "rust"
---
```

2. Commit and push. A new star appears orbiting the black hole.

**Tips:**
- Each file = one star on the canvas.
- `tag` is singular (one category per topic).
- To "learn" a topic, move the file from `want-to-learn/` to a TIL entry — the star gets consumed by the black hole (disappears) and becomes a TIL card.

### Removing or editing content

- Edit any `.md` file and push. Changes go live on next deploy.
- Delete a `.md` file to remove it from the site.

## Deployment

Pushes to `main` auto-deploy via GitHub Actions to GitHub Pages at [about.foreach.in](https://about.foreach.in).
