```
  __  __      ____             
 |  \/  | ___|  _ \  _____   __
 | |\/| |/ _ \ | | |/ _ \ \ / /
 | |  | |  __/ |_| |  __/\ V / 
 |_|  |_|\___|____/ \___| \_/  
```

# I am **[(${profile.fullName})]**

```yaml
role: "[(${profile.headline})]"
location: "[(${profile.location})]"
status: "Building software"
```

### Bio
> [(${profile.summary})]

[# th:if="${profile.skills} != null and !${profile.skills.isEmpty()}"]
### Stack
```
[# th:each="skill : ${profile.skills}"][(${skill.name})] • [/]
```
[/]

[# th:if="${profile.projects} != null and !${profile.projects.isEmpty()}"]
### Shipments
[# th:each="proj : ${profile.projects}"]
- **`[(${proj.name})]`**: [(${proj.description})]
  [# th:if="${proj.githubUrl} != null"] [Repository]([(${proj.githubUrl})])[/] [# th:if="${proj.liveUrl} != null"] [Live Preview]([(${proj.liveUrl})])[/]
[/]
[/]

[# th:if="${profile.githubUsername} != null"]
### Activity
[![GitHub Streak](https://github-readme-streak-stats.herokuapp.com/?user=[(${profile.githubUsername})]&theme=dark&hide_border=true)](https://git.io/streak-stats)
[/]

---
<sub>Crafted with <a href="https://medev.app">MeDev</a></sub>