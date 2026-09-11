package com.medev.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfig {

    /**
     * Dedicated thread pool for vacancy vectorization tasks (Jina AI calls + pgvector writes).
     * Separate from Spring's default executor to avoid starving other async work.
     *
     * - corePoolSize=2: keep 2 threads alive — vectorization is IO-bound, not CPU-bound
     * - maxPoolSize=5: allow bursts up to 5 concurrent vectorizations
     * - queueCapacity=50: buffer up to 50 pending tasks before rejecting
     * - threadNamePrefix: aids in tracing log lines back to this pool
     */
    @Bean(name = "vectorizationExecutor")
    public Executor vectorizationExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("vacancyvec-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.initialize();
        return executor;
    }
}
