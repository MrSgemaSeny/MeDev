package com.medev.modules.tracker.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.net.InetAddress;
import java.net.URI;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UrlSecurityValidatorTest {

    private UrlSecurityValidator validator;

    @BeforeEach
    void setUp() {
        validator = new UrlSecurityValidator();
    }

    @Test
    @DisplayName("Throws exception on null or empty URL")
    void testNullOrBlankUrl() {
        assertThatThrownBy(() -> validator.validateUrl(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("must not be null or blank");

        assertThatThrownBy(() -> validator.validateUrl("   "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("must not be null or blank");
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "ftp://example.com/file.txt",
            "file:///etc/passwd",
            "gopher://127.0.0.1:70",
            "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
            "javascript:alert(1)"
    })
    @DisplayName("Blocks invalid or dangerous URL schemes")
    void testInvalidSchemes(String url) {
        assertThatThrownBy(() -> validator.validateUrl(url))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("scheme");
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "http://example.com:22",
            "http://example.com:6379",
            "http://example.com:8080",
            "https://example.com:8443",
            "http://example.com:3000"
    })
    @DisplayName("Blocks non-standard ports")
    void testBlockedPorts(String url) {
        assertThatThrownBy(() -> validator.validateUrl(url))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Port");
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "http://localhost",
            "http://localhost:80",
            "https://sub.localhost",
            "http://service.local",
            "http://internal.internal"
    })
    @DisplayName("Blocks internal and localhost domain names")
    void testInternalDomains(String url) {
        assertThatThrownBy(() -> validator.validateUrl(url))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "127.0.0.1",
            "127.0.0.2",
            "127.255.255.255",
            "10.0.0.1",
            "10.255.255.255",
            "172.16.0.1",
            "172.31.255.255",
            "192.168.0.1",
            "192.168.255.255",
            "169.254.169.254",
            "169.254.1.1",
            "0.0.0.0",
            "100.64.0.1",
            "100.127.255.254",
            "192.0.2.1",
            "198.18.0.1",
            "198.51.100.1",
            "203.0.113.1",
            "224.0.0.1",
            "239.255.255.255",
            "240.0.0.1",
            "255.255.255.255"
    })
    @DisplayName("Directly validates and blocks all restricted IPv4 addresses")
    void testRestrictedIpv4Addresses(String ip) throws Exception {
        InetAddress addr = InetAddress.getByName(ip);
        assertThatThrownBy(() -> validator.validateIpAddress(addr))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "::1",
            "0:0:0:0:0:0:0:1",
            "fc00::1",
            "fd00::1",
            "fe80::1",
            "ff02::1",
            "2001:db8::1",
            "::ffff:127.0.0.1",
            "::ffff:10.0.0.1",
            "::ffff:169.254.169.254",
            "::ffff:192.168.1.1"
    })
    @DisplayName("Directly validates and blocks all restricted IPv6 addresses")
    void testRestrictedIpv6Addresses(String ip) throws Exception {
        InetAddress addr = InetAddress.getByName(ip);
        assertThatThrownBy(() -> validator.validateIpAddress(addr))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("Permits public IP addresses")
    void testAllowedPublicIpAddresses() throws Exception {
        InetAddress publicIp1 = InetAddress.getByName("8.8.8.8");
        InetAddress publicIp2 = InetAddress.getByName("1.1.1.1");

        // Should not throw
        validator.validateIpAddress(publicIp1);
        validator.validateIpAddress(publicIp2);
    }

    @Test
    @DisplayName("Correctly identifies verified job board domains")
    void testAllowedJobDomains() {
        assertThat(validator.isAllowedJobDomain("hh.kz")).isTrue();
        assertThat(validator.isAllowedJobDomain("hh.ru")).isTrue();
        assertThat(validator.isAllowedJobDomain("headhunter.kz")).isTrue();
        assertThat(validator.isAllowedJobDomain("linkedin.com")).isTrue();
        assertThat(validator.isAllowedJobDomain("www.linkedin.com")).isTrue();
        assertThat(validator.isAllowedJobDomain("habr.com")).isTrue();
        assertThat(validator.isAllowedJobDomain("career.habr.com")).isTrue();
        assertThat(validator.isAllowedJobDomain("indeed.com")).isTrue();
        assertThat(validator.isAllowedJobDomain("www.indeed.com")).isTrue();

        assertThat(validator.isAllowedJobDomain("malicious-site.com")).isFalse();
        assertThat(validator.isAllowedJobDomain("evil-hh.kz.attacker.com")).isFalse();
        assertThat(validator.isAllowedJobDomain("")).isFalse();
        assertThat(validator.isAllowedJobDomain(null)).isFalse();
    }
}
