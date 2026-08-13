# 2026-08-13
## AI Analysis & GitHub Phase 1 and 2 Implementation

### What was done
1. **GitHub Data Layer Implementation**:
   - Added `V20__create_github_snapshots.sql` and `GithubSnapshot` entity to store raw JSON of GitHub profiles without a surrogate ID (PK is `user_id` + `fetched_at`).
   - Created `GitHubReadmeParser` to heuristically extract technologies from repository READMEs.
   - Refactored `GitHubService.java` to fetch data in parallel using `WebClient` and Reactor (`Mono.zip`, `Flux.flatMap` with concurrency of 5).
   - Added `GitHubRepoScorer` and test `GitHubRepoScorerTest` to score repositories for selecting top 10.
2. **AI Full Profile Generation**:
   - Updated `AiParsedResumeDto` with `detectedTechnologies` and `githubOrganizations`.
   - Implemented `AiAnalysisService.generateFullProfile()` to orchestrate LLM merging of onboarding profile data and GitHub Snapshot.
   - Added `full_profile_generator_v1.txt` prompt.
   - Exposed `POST /api/v1/ai/generate-profile` in `AiController`.

### Issues Encountered & Resolved
- **Hibernate Duplicate Mapping**: Fixed `DuplicateMappingException` by removing explicitly mapped `@Column` for `fetched_at` in `GithubSnapshot` since it's already mapped through `@EmbeddedId`.
- **Test Prompt Truncation**: Fixed assertion in `AiAnalysisServiceTest` which didn't account for prompt padding size.
- **Unnecessary Stubbing**: Removed a flawed webclient mocking test in `GitHubServiceTest`.

### Next Steps
- Implement frontend UI logic to consume the new `generate-profile` endpoint and trigger GitHub data refresh.
