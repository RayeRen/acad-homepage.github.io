# Blog System - Complete Reference Guide

## Quick Start: Adding Your First Post

### Step 1: Create the file
Create a new file in `_posts/` with the naming convention `YYYY-MM-DD-title.md`:

```
_posts/2025-03-15-my-first-post.md
```

### Step 2: Add front matter and content

```yaml
---
layout: post
title: "My Machine Learning Journey"
date: 2025-03-15
tags: [machine-learning, research, neural-networks]
excerpt: "In this post, I'll share insights from my experience building scalable ML systems and lessons learned along the way."
author: "Abrar Eyasir"
---

## Introduction

Your markdown content goes here...

## Section 2

More content with **bold** and *italic* text.

### Subsection

- Bullet point 1
- Bullet point 2

1. Numbered item
2. Another item

> A blockquote to emphasize important points

## Conclusion

Wrap up your thoughts.
```

That's it! Your post will automatically appear on `/blog/` with:
- Title linked
- Publication date
- Reading time (auto-calculated)
- All tags displayed
- Excerpt shown
- "Read More" link to full post

---

## Front Matter Reference

### Required Fields
```yaml
layout: post              # Must be "post"
title: "Your Title"       # Post title (appears everywhere)
date: 2025-03-15          # Publication date (YYYY-MM-DD)
```

### Optional Fields
```yaml
tags: [tag1, tag2]        # Array of tags (used for filtering)
excerpt: "Short text"     # Summary shown in blog listing
author: "Your Name"       # Defaults to site.author.name if omitted
---
```

### Complete Example
```yaml
---
layout: post
title: "Advanced PyTorch Techniques for Production"
date: 2025-03-20
tags: [PyTorch, Deep Learning, Production, Engineering]
excerpt: "Exploring production-grade patterns for deploying PyTorch models at scale with monitoring, optimization, and error handling."
author: "Abrar Eyasir"
---
```

---

## Markdown Content Guide

### Headings (Table of Contents)
```markdown
# H1 - Appears in TOC
## H2 - Appears in TOC
### H3 - Appears in TOC
#### H4 - Small styling
```

**Note:** Use H2 or H3 for main sections. The TOC auto-generates from your headings (>5000 char posts).

### Text Formatting
```markdown
**Bold text** or __bold text__
*Italic text* or _italic text_
***Bold italic***
~~Strikethrough~~
`inline code`
```

### Code Blocks
```python
def hello_world():
    """Docstring."""
    print("Hello, World!")
```

```javascript
const greeting = () => {
    console.log("Hello, World!");
};
```

```yaml
# YAML example
key: value
nested:
  - item1
  - item2
```

### Lists
```markdown
- Unordered item 1
  - Nested item
  - Another nested
- Unordered item 2

1. Ordered item 1
2. Ordered item 2
   1. Nested ordered
   2. Another nested
3. Ordered item 3
```

### Links and Images
```markdown
[Link text](https://example.com)
[Internal link](/blog/)
![Alt text](images/screenshot.png)
```

### Blockquotes
```markdown
> A quote or important note
> 
> Can span multiple lines
```

### Tables
```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |
```

### Horizontal Rule
```markdown
---
```

---

## Blog Index Features

### Filtering by Tag
Click any tag button on `/blog/` to filter posts. Multiple tag buttons available:
- "All" shows all posts
- Individual tags show only posts with that tag

### Search
Type in the search box to filter by:
- Post title
- Post excerpt
- Real-time, no page reload

### Reading Time Calculation
Automatically calculated from word count:
- < 360 words = "Less than 1 min"
- ≥ 360 words = Calculated as `words ÷ 200`

Example:
- 1000 words = 5 min read
- 2000 words = 10 min read

---

## Post Page Features

### Automatic Elements

#### Reading Time
Shown next to date in post header.

#### Table of Contents (TOC)
Only appears if post is > 5000 characters. Auto-generates from headings.
- Sticky on desktop (right sidebar)
- Clickable links to sections
- Responsive on mobile

#### Previous/Next Navigation
Bottom of post shows:
- Link to previous post (if exists)
- Link to next post (if exists)
- Posts ordered by date (newest first)

#### Author Section
Auto-populated from `_config.yml`:
```yaml
author:
  name: "Abrar Eyasir"
  avatar: "images/android-chrome-512x512.png"
  bio: "CS Researcher @ University of Dhaka"
  location: "Dhaka, Bangladesh"
  email: "eyasir2047@gmail.com"
  github: "eyasir2047"
  linkedin: "abrar-eyasir-4423b7216"
  twitter: "@yourhandle"  # if you add this
```

Social icons appear for any of:
- `email`
- `github`
- `linkedin`
- `twitter`

---

## Customization Guide

### Changing Blog Colors

Edit `_sass/_variables.scss`:

```scss
/* Primary accent color (buttons, links, borders) */
$primary-color              : #2563eb;  /* Blue */
$primary-color-light        : #3b82f6;
$primary-color-dark         : #1d4ed8;

/* Text colors */
$darker-gray                : #1e293b;  /* Dark text */
$text-color                 : #334155;  /* Body text */
$text-color-light           : #64748b;  /* Muted text */

/* Background colors */
$body-color                 : #ffffff;  /* Post bg */
$code-background-color      : #f8fafc;  /* Code blocks, cards */
```

Then rebuild: The blog will use new colors everywhere.

### Changing Blog Grid Layout

Edit `_sass/_posts.scss`, find `.blog__posts`:

**Current (2 columns on desktop):**
```scss
.blog__posts {
  grid-template-columns: 1fr;

  @include breakpoint($medium) {
    grid-template-columns: repeat(2, 1fr);  # ← 2 columns
  }
}
```

**For 3 columns:**
```scss
@include breakpoint($medium) {
  grid-template-columns: repeat(3, 1fr);  # ← 3 columns
}
```

**For single column:**
```scss
@include breakpoint($medium) {
  grid-template-columns: 1fr;  # ← 1 column
}
```

### Changing Post Card Styling

Edit `.blog__post-card`:

```scss
.blog__post-card {
  padding: 1.5em;           # Card padding
  border-radius: 12px;      # Corner roundness
  border: 1px solid ...;    # Border width/color

  &:hover {
    border-color: $primary-color;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
    transform: translateY(-4px);  # Lift effect on hover
  }
}
```

### Changing Font Sizes

Edit `_sass/_variables.scss`, find type scale:

```scss
$type-size-1 : 2.5em;  /* Blog title, post title */
$type-size-2 : 2em;    /* H1 in post */
$type-size-3 : 1.5em;  /* H2 in post */
$type-size-4 : 1.25em; /* Card titles, H3 */
$type-size-5 : 1em;    /* Body text */
$type-size-6 : 0.9em;  /* Small text, dates */
```

### Adding Custom CSS

Add to `_sass/_posts.scss` or create `_sass/_blog-custom.scss` and import in `assets/css/main.scss`:

```scss
@import "blog-custom";
```

---

## Advanced Customizations

### Adding Author Image to Posts

The author avatar is already configured. Ensure `_config.yml` has:

```yaml
author:
  avatar: "images/android-chrome-512x512.png"  # Path to your image
```

### Changing Post Typography

Edit `.post__content` in `_sass/_posts.scss`:

```scss
.post__content {
  font-size: $type-size-5;    # Body font size
  line-height: 1.8;           # Line spacing
  color: $text-color;         # Text color

  h2 {
    border-bottom: 1px solid ..;  # Heading underline
  }
}
```

### Customizing Code Block Colors

Edit the `pre` and `code` rules in `.post__content`:

```scss
pre {
  background-color: #2d2d2d;  # Dark background
  
  code {
    color: #f8f8f2;  # Light text
  }
}
```

### Adding Syntax Highlighting

Jekyll includes syntax highlighting. Your posts automatically highlight code based on language:

````markdown
```python
def example():
    return True
```
````

Install Rouge (syntax highlighter):
```bash
gem install rouge
```

Update `_config.yml`:
```yaml
markdown: kramdown
highlighter: rouge
```

### Email Subscribe Form

Add to `_layouts/post.html` before closing `</article>`:

```html
<aside class="post__subscribe">
  <h3>Subscribe to Updates</h3>
  <p>Get new posts delivered to your inbox</p>
  <form action="https://example.us1.list-manage.com/subscribe/..." method="post">
    <input type="email" name="EMAIL" placeholder="your@email.com" required>
    <button type="submit">Subscribe</button>
  </form>
</aside>
```

Then add styling to `_sass/_posts.scss`.

---

## SEO and Performance

### Automatic SEO
Your blog posts get:
- Schema.org structured data (BlogPosting)
- Meta descriptions (from excerpt)
- Open Graph tags (for social sharing)
- Proper heading hierarchy (h1 → h6)

### Performance Tips

1. **Optimize images:**
   - Use WebP format
   - Compress with TinyPNG
   - Responsive images with srcset

2. **Lazy load images:**
   Add to `_layouts/post.html`:
   ```html
   <img loading="lazy" src="..." alt="...">
   ```

3. **Minify CSS:**
   Run: `sass --watch assets/css:_site/assets/css --style compressed`

---

## Troubleshooting

### Post Not Appearing

1. **Check file location:** Must be in `_posts/` directory
2. **Check filename:** Must match `YYYY-MM-DD-title.md` format
3. **Check date:** Post date shouldn't be in future
4. **Check front matter:** Must have `layout: post`
5. **Rebuild Jekyll:** `jekyll build` or `jekyll serve`

### Tags Not Filtering

1. Check tag spelling matches exactly (case-sensitive)
2. Ensure `tags: [tag1, tag2]` is a YAML array
3. Clear browser cache (Ctrl+Shift+Del or Cmd+Shift+Del)

### Reading Time Wrong

Reading time is calculated as `words ÷ 200`. If it seems off:
- Count actual words in post
- Divide by 200
- Round to nearest minute

For example, 1800 words = 9 min read (1800 ÷ 200 = 9)

### TOC Not Appearing

TOC only appears if post is > 5000 characters. Check:
1. Post length with: `wc -c filename.md`
2. If too short, add more content
3. Or remove TOC by setting post < 5000 chars

---

## Example Posts Template Library

### Research Paper Summary
```markdown
---
layout: post
title: "Paper Summary: Attention Is All You Need"
date: 2025-04-01
tags: [research, papers, transformers, NLP]
excerpt: "Summary and key takeaways from the seminal Transformer paper"
---

## Abstract
Brief summary of the paper...

## Main Contributions
- Contribution 1
- Contribution 2

## Technical Details
Explain the approach...

## Results
Key findings...

## Critique & Limitations
Your thoughts...

## References
- Paper link
- Related work
```

### Tutorial Post
```markdown
---
layout: post
title: "Getting Started with PyTorch Lightning"
date: 2025-04-05
tags: [pytorch, lightning, tutorial, deep-learning]
excerpt: "Step-by-step guide to building and training models with PyTorch Lightning"
---

## Introduction
Why use Lightning...

## Installation
```bash
pip install pytorch-lightning
```

## Basic Example
Code example...

## Running Training
Instructions...

## Advanced Features
More features...

## Next Steps
Further learning...
```

### Project Post-Mortem
```markdown
---
layout: post
title: "ZeroBin - Building an AI Waste Management Platform"
date: 2025-04-10
tags: [projects, AI, sustainability, hackathon]
excerpt: "Lessons learned building an award-winning waste management solution"
---

## Project Overview
What we built...

## Tech Stack
- Framework 1
- Framework 2

## Key Challenges
Challenge 1 & solution...
Challenge 2 & solution...

## What Went Well
Success 1...
Success 2...

## What We'd Do Differently
Lesson 1...
Lesson 2...

## Results & Awards
Final outcome...
```

---

## Git Workflow for Blog Posts

### Adding a post locally
```bash
cd "your-repo-path"
git add _posts/2025-03-15-my-post.md
git commit -m "Add blog post: My Post Title"
git push origin main
```

### GitHub Pages automatically rebuilds when you push!

---

**Happy blogging!** 📝✨

For more Jekyll docs, visit: https://jekyllrb.com/docs/
For Markdown syntax: https://commonmark.org/help/
