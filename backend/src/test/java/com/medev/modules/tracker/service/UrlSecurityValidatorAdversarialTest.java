package com.medev.modules.tracker.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.net.InetAddress;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UrlSecurityValidatorAdversarialTest {

    private UrlSecurityValidator validator;

    @BeforeEach
    void setUp() {
        validator = new UrlSecurityValidator();
    }

    @ParameterizedTest(name = "Dispatch target: {0}")
    @ValueSource(strings = {
            "http://127.0.0.1:80",
            "http://0.0.0.0/",
            "http://[::1]/",
            "http://169.254.169.254/latest/meta-data/",
            "http://10.0.0.1/",
            "http://172.16.0.1/",
            "http://192.168.1.1/",
            "http://100.64.0.1/",
            "http://example.com:6379/",
            "http://example.com:22/",
            "file:///etc/passwd",
            "file:///C:/Windows/win.ini",
            "gopher://127.0.0.1:70/",
            "ftp://example.com/file"
    })
    @DisplayName("Dispatch requirement: Blocks all required SSRF and port bypass targets")
    void testDispatchRequiredTargets(String url) {
        assertThatThrownBy(() -> validator.validateUrl(url))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @ParameterizedTest(name = "Adversarial IPv4/IPv6 target: {0}")
    @ValueSource(strings = {
            "http://127.0.0.2:80",
            "http://127.1.2.3:80",
            "http://10.254.254.254:443",
            "http://172.31.255.255:80",
            "http://192.168.254.254:80",
            "http://100.127.255.254:80",
            "http://169.254.1.1:80",
            "http://192.0.2.1:80",
            "http://198.18.0.1:80",
            "http://198.51.100.1:80",
            "http://203.0.113.1:80",
            "http://224.0.0.1:80",
            "http://239.255.255.250:80",
            "http://240.0.0.1:80",
            "http://255.255.255.255:80",
            "http://[fc00::1]:80",
            "http://[fd00::1]:80",
            "http://[fe80::1]:80",
            "http://[ff02::1]:80",
            "http://[2001:db8::1]:80",
            "http://[::ffff:127.0.0.1]:80",
            "http://[::ffff:169.254.169.254]:80",
            "http://[::ffff:10.0.0.1]:80",
            "http://[::ffff:192.168.1.1]:80"
    })
    @DisplayName("Adversarial: Blocks boundary IPs, IPv6 ULAs, link-local, multicast, documentation")
    void testBoundaryAndSpecialIps(String url) {
        assertThatThrownBy(() -> validator.validateUrl(url))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @ParameterizedTest(name = "Adversarial port: {0}")
    @ValueSource(strings = {
            "http://example.com:21",
            "http://example.com:25",
            "http://example.com:53",
            "http://example.com:3306",
            "http://example.com:5432",
            "http://example.com:6379",
            "http://example.com:8080",
            "http://example.com:8443",
            "http://example.com:9200",
            "http://example.com:27017"
    })
    @DisplayName("Adversarial: Blocks common infrastructure ports")
    void testInfrastructurePorts(String url) {
        assertThatThrownBy(() -> validator.validateUrl(url))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Port");
    }

    @ParameterizedTest(name = "Adversarial scheme: {0}")
    @ValueSource(strings = {
            "ldap://127.0.0.1/cn=root",
            "dict://127.0.0.1:11211/stat",
            "jar:file:/path/to/jar!/file",
            "javascript:alert(1)",
            "data:text/plain;base64,SGVsbG8="
    })
    @DisplayName("Adversarial: Blocks non-http/https protocols")
    void testDangerousSchemes(String url) {
        assertThatThrownBy(() -> validator.validateUrl(url))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("scheme");
    }

    @ParameterizedTest(name = "Internal name: {0}")
    @ValueSource(strings = {
            "http://localhost",
            "http://localhost:80",
            "http://db.local",
            "http://backend.internal",
            "http://api.localhost"
    })
    @DisplayName("Adversarial: Blocks internal host suffixes")
    void testInternalHostSuffixes(String url) {
        assertThatThrownBy(() -> validator.validateUrl(url))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
