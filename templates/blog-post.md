---
# Copy to src/content/blog/<slug>.md (or <slug>/index.md to keep images next to it).
# The file name becomes the URL: /blog/<slug>/
title: 'Title of the article'
description: 'One or two sentences shown in listings, search results and social previews.'
published: 2026-01-31
# updated: 2026-02-15          # set when the content changes meaningfully
category: linux                 # id from src/content/categories.yaml
tags: [linux, example]          # lowercase kebab-case
kind: tutorial                  # tutorial | troubleshooting | architecture | experiment | article
draft: true                     # remove or set false to publish
featured: false                 # featured posts are shown on the home page
# cover: ./cover.png            # optional, relative to this file
# coverAlt: 'Describe the image for screen readers'
# relatedPosts: [other-post-id]
# relatedNotes: [linux/journalctl-cheatsheet]
---

<!-- Every section is optional: delete the ones that do not apply. -->

## Context

What situation or problem led to this article?

## Objectives

- What the reader will achieve.

## Prerequisites

- Versions, access and tools required.

## Implementation

Step-by-step instructions. Use fenced code blocks with a language:

```bash
echo "hello"
```

Images and diagrams live next to the article and use relative paths:

![Describe the diagram](./diagram.svg)

## Validation

How to confirm it works.

## Troubleshooting

| Symptom | Cause | Fix |
| ------- | ----- | --- |
|         |       |     |

## Security considerations

Risks, hardening and what not to expose.

## References

- [Official documentation](https://example.com/)
