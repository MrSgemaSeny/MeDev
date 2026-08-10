# [(${profile.fullName})]

> [(${profile.headline})]
> 📍 [(${profile.location})]

[(${profile.summary})]

## 🚀 GitHub Stats
* GitHub Username: [[(${profile.githubUsername})](https://github.com/[(${profile.githubUsername})])]

## 💼 Experience

[# th:each="exp : ${profile.experience}"]
### [(${exp.position})] at [(${exp.company})]
_[(${exp.startDate})] - [(${exp.endDate})]_

[(${exp.description})]

**Tech Stack**: [(${exp.techStack})]
[/]

## 🛠 Projects

[# th:each="proj : ${profile.projects}"]
### [(${proj.name})]
[(${proj.description})]

[# th:if="${proj.githubUrl} != null"]
[GitHub]([(${proj.githubUrl})])
[/] [# th:if="${proj.liveUrl} != null"] | [Live Demo]([(${proj.liveUrl})])[/]
[/]

## 🎓 Education

[# th:each="edu : ${profile.education}"]
### [(${edu.institution})]
**[(${edu.degree})]**, [(${edu.fieldOfStudy})] ([(${edu.graduationYear})])
[/]

---
_Generated with [MeDev](https://github.com/MrSgemaSeny/MeDev)_
