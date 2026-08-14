# 2026-08-14: Fix MeDev PDF Generation Bugs (Flying Saucer)

**Issue**: `github.html` PDF export was completely broken: Cyrillic dropped, Grid layout smashed, fake Contact button, empty labels shown.

**Action Taken**:
1. Moved `Roboto-*.ttf` to `src/main/resources/fonts/`.
2. Updated `PdfGeneratorService.java`:
   - Added `@PostConstruct` logic to extract fonts from the classpath to temp files (with `.deleteOnExit()`) to guarantee iText can load them in a packaged fat-jar deployment.
   - Changed font registration to pass `"Identity-H"` directly, avoiding `org.xhtmlrenderer.pdf.BaseFont` class resolution issues.
3. Fixed `resume/github.html`:
   - Updated `.contact-item` checks to `!profile.linkedin.isBlank()`.
   - Removed `.btn-follow` dead UI element.
   - Replaced CSS Grid `.projects-wrapper` with `float: left` layout for Flying Saucer compatibility.
   - Replaced `.timeline-item` absolute positioned pseudo-lines with a robust HTML `<table>` layout to guarantee correct rendering of icons and borders in Flying Saucer.

**Risks Mitigated**:
- Cyrillic is now fully encoded.
- `::before` and `position: absolute` are no longer used for timelines, preventing silent line-drops.

6. **Final Aesthetic Polish for A4 (`resume/github.html`)**:
   - Replaced CSS variables with hardcoded hex codes for Flying Saucer compatibility.
   - Restructured layout: Reduced sidebar width (320px -> 220px) and avatar size (288px -> 140px) to balance the page.
   - Refined Typography: Maintained A4-appropriate font sizes (13px body, 22px headers) and removed clunky box borders from Experience/Education.
   - Polished Timeline: Minimized icon to 9px perfectly centered on a 1px connecting thread.
   - Projects: Restored descriptions (`display: block`), made cards 100% width, and limited to top 3 (`stat.index < 3`) to ensure a concise 1-page PDF.

5. **Fixed OGNL Crash in `ReadmeGeneratorService`**:
   - Changed the standalone `new TemplateEngine()` to `new org.thymeleaf.spring6.SpringTemplateEngine()`. This switches the default dialect from OGNL (removed from dependencies) to SpringEL, resolving the `java.lang.NoClassDefFoundError: ognl/PropertyAccessor` crash.

**Future Considerations**:
- `Languages` logic currently outputs programming languages if the AI Parser incorrectly places them there instead of Spoken Languages. Needs fixing on the Parser/UI level.
