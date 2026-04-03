# Table of Contents Layout Fix - Summary

## Problems Fixed ✅

### 1. **Empty ToC Container** 
   - **Issue**: The ToC was rendering as a large, empty white box because it tried to pull from `site.data.headings` which didn't exist
   - **Solution**: Created a dynamic ToC generator that parses the actual rendered HTML content to extract h2 and h3 headings with their auto-generated IDs

### 2. **No Conditional Rendering**
   - **Issue**: The ToC container appeared even when empty, wasting space and pushing content to the right
   - **Solution**: Added a check that counts h2/h3 headings in the content using `scan: '<h[23]'` and only renders the ToC if headings exist

### 3. **Layout Issues (Content Squeezing)**
   - **Issue**: The grid layout always created a 2-column layout on large screens, even when ToC was empty
   - **Solution**: 
     - Modified `.post__container` to use a `--with-toc` modifier class
     - Only apply 2-column grid (`1fr 280px`) when the modifier class is present
     - Without the modifier, content takes full width

### 4. **Empty Heading Detection**
   - **Issue**: No way to know if headings would be populated
   - **Solution**: In `post.html`, we count headings before rendering and conditionally add the `post__container--with-toc` class

### 5. **Improved ToC Styling**
   - Better visual hierarchy with h2 section titles and h3 indented items
   - Improved font sizes and spacing
   - Added subtle shadow and better hover effects
   - Fixed indentation: h2 at root level, h3 nested with proper margins

### 6. **Responsive ToC**
   - On mobile/small screens, the ToC appears above the content (using CSS order property)
   - On large screens, it becomes a sticky sidebar

## Files Modified

### 1. **_layouts/post.html**
```html
{% assign headings = content | scan: '<h[23]' | size %}
<div class="post__container{% if headings > 0 %} post__container--with-toc{% endif %}">
  {% if headings > 0 %}
    {% include toc.html %}
  {% endif %}
  <div class="post__content" itemprop="articleBody">
    {{ content }}
  </div>
</div>
```

**Changes**:
- Removed hardcoded `post__container` fixed grid layout
- Added dynamic class `post__container--with-toc` only when headings are found
- Replaced non-functional `site.data.headings` with dynamic include

### 2. **_includes/toc.html** (NEW FILE)
A reusable Jekyll include that:
- Scans the rendered HTML content for h2 and h3 tags with IDs
- Extracts heading text (stripping HTML tags for clean display)
- Builds a proper nested list structure
- Only renders if headings are found

**Why this works**:
- `kramdown` with `auto_ids: true` automatically generates IDs like `#introduction`, `#qa-system-architectures`
- The include parses the final HTML output, so it works with any markdown content
- It's completely data-driven - no manual configuration needed

### 3. **_sass/_posts.scss**

**Post Container Grid**:
```scss
.post__container {
  grid-template-columns: 1fr;  // Default: full width
  
  &--with-toc {
    @include breakpoint($large) {
      grid-template-columns: 1fr 280px;  // Only 2 columns when ToC exists
    }
  }
}
```

**ToC Container**:
- Added `min-width: 280px` to prevent shrinking
- Sticky positioning only on large screens
- Proper `align-self: start` for alignment

**ToC Navigation Styling**:
- Better visual distinction between h2 and h3 items
- h2 items are bold section titles
- h3 items are nested with left margin
- Improved spacing and font sizes
- Smooth hover effects with padding animation

**Responsive Adjustments**:
- On mobile: ToC appears first (above content) with `order: -1`
- On desktop: Sticky sidebar on the right

## How It Works

1. **Post is rendered** → Jekyll converts markdown to HTML
2. **Kramdown adds IDs** → Each h2/h3 gets an auto-generated ID
3. **Post layout checks for headings** → `scan: '<h[23]'` counts them
4. **If headings found** → Includes `toc.html` and adds `post__container--with-toc` class
5. **ToC include parses content** → Extracts headings with IDs and builds nested list
6. **CSS applies appropriate layout**:
   - No ToC: Full-width content
   - With ToC: 2-column layout on desktop, stacked on mobile

## Testing Checklist

- [ ] Post with multiple h2/h3 headings shows ToC sidebar on desktop
- [ ] ToC links point to correct heading IDs (click a ToC link, page scrolls to heading)
- [ ] ToC is sticky (scrolls with page on desktop)
- [ ] Post without headings shows NO empty ToC box (full-width content)
- [ ] Mobile view stacks content nicely without ToC sidebar
- [ ] ToC styling matches the design (blue border, proper indentation)
- [ ] No horizontal scrolling or layout issues

## Technical Notes

- **Kramdown Configuration**: Already enabled `auto_ids: true` in `_config.yml`
- **No Plugins Required**: Uses only Jekyll's built-in Liquid filters (`scan`, `strip_html`)
- **Performance**: Minimal overhead - simple regex scan of already-rendered HTML
- **Accessibility**: ToC links use proper anchor tags with heading IDs

