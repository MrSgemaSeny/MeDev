package com.medev.modules.tracker.controller;

import com.medev.modules.tracker.dto.CreateJobApplicationRequest;
import com.medev.modules.tracker.dto.JobApplicationDto;
import com.medev.modules.tracker.dto.UpdateJobApplicationRequest;
import com.medev.modules.tracker.service.JobApplicationService;
import com.medev.shared.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/tracker/applications")
@RequiredArgsConstructor
public class JobApplicationController {

    private final JobApplicationService service;
    private final com.medev.modules.tracker.service.WebScraperService scraperService;

    @GetMapping
    public List<JobApplicationDto> getAll() {
        return service.getAll(SecurityUtils.getCurrentUserId());
    }

    @GetMapping("/scrape")
    public CreateJobApplicationRequest scrape(@RequestParam String url) {
        return scraperService.scrapeJobUrl(url);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public JobApplicationDto create(@RequestBody @Valid CreateJobApplicationRequest request) {
        return service.create(SecurityUtils.getCurrentUserId(), request);
    }

    @PutMapping("/{id}")
    public JobApplicationDto update(@PathVariable Long id, @RequestBody @Valid UpdateJobApplicationRequest request) {
        return service.update(SecurityUtils.getCurrentUserId(), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(SecurityUtils.getCurrentUserId(), id);
    }
}
