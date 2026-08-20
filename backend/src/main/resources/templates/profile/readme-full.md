<div align="center">

# Hi there, I'm [(${profile.fullName})] 👋
### [(${profile.headline})]

[# th:if="${profile.location} != null"]📍 **[(${profile.location})]**[/]

[# th:if="${profile.githubUsername} != null"]
[![GitHub Stats](https://github-readme-stats.vercel.app/api?username=[(${profile.githubUsername})]&show_icons=true&theme=github_dark&hide_border=true&count_private=true)](https://github.com/[(${profile.githubUsername})])
[![Top Langs](https://github-readme-stats.vercel.app/api/top-langs/?username=[(${profile.githubUsername})]&layout=compact&theme=github_dark&hide_border=true)](https://github.com/[(${profile.githubUsername})])
[/]

</div>

---

### 👨‍💻 About Me
[(${profile.summary})]

[# th:if="${profile.skills} != null and !${profile.skills.isEmpty()}"]
### 🛠 Tech Stack
<p align="left">
[# th:each="skill : ${profile.skills}"]`[(${skill.name})]` [/]
</p>
[/]

[# th:if="${profile.experience} != null and !${profile.experience.isEmpty()}"]
### 💼 Work Experience
[# th:each="exp : ${profile.experience}"]
- **[(${exp.position})]** @ **[(${exp.company})]** _([(${exp.startDate})] — [(${exp.isCurrent ? 'Present' : exp.endDate})])_
  [(${exp.description})]
[/]
[/]

[# th:if="${profile.projects} != null and !${profile.projects.isEmpty()}"]
### 🚀 Featured Projects
[# th:each="proj : ${profile.projects}"]
- **[(${proj.name})]**[# th:if="${proj.githubUrl} != null"] — [Source Code]([(${proj.githubUrl})])[/][# th:if="${proj.liveUrl} != null"] | [Live Demo]([(${proj.liveUrl})])[/]
  > [(${proj.description})]
[/]
[/]

[# th:if="${profile.website} != null or ${profile.linkedin} != null or ${profile.telegram} != null"]
### 📬 Connect with Me
[# th:if="${profile.website} != null"]- 🌐 **Website**: [[(${profile.website})]]([(${profile.website})])
[/][# th:if="${profile.linkedin} != null"]- 💼 **LinkedIn**: [[(${profile.linkedin})]]([(${profile.linkedin})])
[/][# th:if="${profile.telegram} != null"]- ✈️ **Telegram**: [@`[(${profile.telegram})]`](https://t.me/[(${profile.telegram})])
[/]
[/]

---
<p align="center">
  <sub>Generated automatically with <a href="https://medev.app">MeDev</a></sub>
</p>