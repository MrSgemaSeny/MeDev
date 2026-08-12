package com.medev.modules.profile.event;

import org.springframework.context.ApplicationEvent;

public class ProfileUpdatedEvent extends ApplicationEvent {
    private final Long userId;

    public ProfileUpdatedEvent(Object source, Long userId) {
        super(source);
        this.userId = userId;
    }

    public Long getUserId() {
        return userId;
    }
}
