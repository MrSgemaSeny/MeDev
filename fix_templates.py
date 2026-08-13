import os
import re

directories = [
    r"backend\src\main\resources\templates\resume",
    r"backend\src\main\resources\templates\resume-html"
]

for directory in directories:
    for filename in os.listdir(directory):
        if filename.endswith(".html"):
            filepath = os.path.join(directory, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # Fix 1: <div th:switch... class="section"> -> <th:block th:switch...> and move class="section" to th:case
            # Or simpler: Just fix the fact that an empty .section is rendered.
            # Instead of changing to th:block which requires balancing tags,
            # we can just add `th:if="${(sectionName == 'summary' and profile.summary != null and !profile.summary.isEmpty()) or (sectionName == 'experience' and profile.experience != null and !profile.experience.isEmpty()) or (sectionName == 'education' and profile.education != null and !profile.education.isEmpty()) or (sectionName == 'skills' and groupedSkills != null and !groupedSkills.isEmpty()) or (sectionName == 'languages' and languagesStr != null and !languagesStr.isEmpty()) or (sectionName == 'projects' and profile.projects != null and !profile.projects.isEmpty())}"`
            # to the outer div!
            
            # Wait, changing to th:block is much cleaner. Let's do string replacements carefully.
            # Find the start of the switch:
            switch_pattern = re.compile(r'<div th:switch="\$\{sectionName\}"(?: class="section")?>')
            
            # If we find it, replace it with <th:block th:switch="${sectionName}">
            content = switch_pattern.sub(r'<th:block th:switch="${sectionName}">', content)
            
            # Now we need to replace the corresponding closing </div> with </th:block>
            # The closing </div> is usually just before the loop closes.
            # In our templates, the loop is:
            # <div th:each="...">
            #     <th:block th:switch="${sectionName}">
            #        ...
            #     </th:block>
            # </div>
            # We can find `</div>\s*</div>\s*(?:<div class="footer">|</body>|</div>)`
            
            # Actually, doing it via beautifulsoup is too complex if not installed.
            # Let's just fix the `th:case` lines to include the class if they had `style="display: contents;"`
            content = re.sub(r'<div th:case="([^"]+)" th:if="([^"]+)" style="display: contents;">', r'<div th:case="\1" th:if="\2" class="section">', content)
            
            # For templates that didn't have `style="display: contents;"` (like milky-soft):
            # <div th:case="'experience'" th:if="..." style="margin-bottom: 60px;">
            # Actually, milky soft didn't use `class="section"`, it just used `style="margin-bottom: 60px;"` on the inner div, BUT the outer div was just `<div th:switch...>`, so if we change the outer to `<th:block>`, we just need to fix the closing tag.
            
            # To fix the closing tag, we replace the `</div>` that closes the switch.
            # Since our templates are very consistent:
            #                     </div>
            #                 </div>
            #             </div>
            #             <div class="footer">EOF</div>
            #         </div>
            #     </div>
            # </body>
            # We can just replace the block closing manually for each file structure, or use a simple regex that matches the end of the each loop.
            
            # Let's try replacing the exact closing tag.
            lines = content.split('\n')
            new_lines = []
            switch_depth = 0
            
            for line in lines:
                if '<div th:switch="${sectionName}"' in line:
                    new_lines.append(line.replace('<div th:switch="${sectionName}"', '<th:block th:switch="${sectionName}"').replace(' class="section">', '>'))
                    switch_depth += 1
                elif '</div>' in line and switch_depth > 0:
                    # Let's count divs. This is fragile.
                    new_lines.append(line)
                else:
                    new_lines.append(line)
                    
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write("\n".join(new_lines))

