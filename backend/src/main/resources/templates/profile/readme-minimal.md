# [(${profile.fullName})]

> [(${profile.headline})]
[# th:if="${profile.location} != null"]> [(${profile.location})][/]

[(${profile.summary})]

[# th:if="${profile.skills} != null and !${profile.skills.isEmpty()}"]
### Stack
[# th:each="skill : ${profile.skills}"]`[(${skill.name})]` [/]
[/]

[# th:if="${profile.projects} != null and !${profile.projects.isEmpty()}"]
### Projects
[# th:each="proj : ${profile.projects}"]
- **[(${proj.name})]**[# th:if="${proj.githubUrl} != null"] ([Source]([(${proj.githubUrl})]))[/][# th:if="${proj.liveUrl} != null"] ([Demo]([(${proj.liveUrl})]))[/]: [(${proj.description})]
[/]
[/]

[# th:if="${profile.githubUsername} != null or ${profile.website} != null or ${profile.linkedin} != null"]
---
[# th:if="${profile.githubUsername} != null"][GitHub](https://github.com/[(${profile.githubUsername})]) [/][# th:if="${profile.website} != null"]• [Website]([(${profile.website})]) [/][# th:if="${profile.linkedin} != null"]• [LinkedIn]([(${profile.linkedin})])[/]
[/]