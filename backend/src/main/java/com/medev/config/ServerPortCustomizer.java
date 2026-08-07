package com.medev.config;

import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.servlet.server.ConfigurableServletWebServerFactory;
import org.springframework.context.annotation.Configuration;

import java.net.ServerSocket;

@Configuration
public class ServerPortCustomizer implements WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> {

    @Override
    public void customize(ConfigurableServletWebServerFactory factory) {
        for (int port = 8080; port <= 8083; port++) {
            try (ServerSocket serverSocket = new ServerSocket(port)) {
                factory.setPort(port);
                return;
            } catch (Exception e) {
                // Port in use, try the next one
            }
        }
        throw new IllegalStateException("All ports in range 8080-8083 are in use.");
    }
}
