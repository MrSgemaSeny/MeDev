package com.medev.modules.tracker.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.Inet4Address;
import java.net.Inet6Address;
import java.net.InetAddress;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.UnknownHostException;
import java.util.Arrays;
import java.util.Set;

/**
 * Service to validate external URLs against Server-Side Request Forgery (SSRF) vulnerabilities.
 * Enforces allowed schemes, permitted ports, and strictly blocks all internal, loopback,
 * link-local, multicast, documentation, and private network addresses across IPv4 and IPv6.
 */
@Slf4j
@Service
public class UrlSecurityValidator {

    public static final Set<String> ALLOWED_JOB_HOSTS = Set.of(
            "hh.kz", "hh.ru", "headhunter.kz", "headhunter.ru",
            "linkedin.com", "www.linkedin.com",
            "habr.com", "career.habr.com",
            "indeed.com", "www.indeed.com"
    );

    private static final Set<String> ALLOWED_SCHEMES = Set.of("http", "https");
    private static final Set<Integer> ALLOWED_PORTS = Set.of(-1, 80, 443);

    /**
     * Validates that the provided URL is well-formed, uses http/https, connects only to standard ports,
     * and does not resolve to any internal or restricted IP addresses.
     *
     * @param rawUrl The URL string to validate
     * @return The parsed URI if safe
     * @throws IllegalArgumentException if the URL violates security boundaries
     */
    public URI validateUrl(String rawUrl) {
        if (rawUrl == null || rawUrl.isBlank()) {
            throw new IllegalArgumentException("URL must not be null or blank");
        }

        URI uri;
        try {
            uri = new URI(rawUrl.trim());
        } catch (URISyntaxException e) {
            throw new IllegalArgumentException("Invalid URL syntax: " + rawUrl, e);
        }

        String scheme = uri.getScheme();
        if (scheme == null || !ALLOWED_SCHEMES.contains(scheme.toLowerCase())) {
            throw new IllegalArgumentException("Invalid URL scheme: " + scheme + ". Only HTTP and HTTPS are allowed");
        }

        int port = uri.getPort();
        if (!ALLOWED_PORTS.contains(port)) {
            throw new IllegalArgumentException("Port " + port + " is not allowed. Only standard ports (80, 443) are permitted");
        }

        String host = uri.getHost();
        if (host == null || host.isBlank()) {
            throw new IllegalArgumentException("URL host is missing or invalid");
        }

        validateHost(host.trim());
        return uri;
    }

    /**
     * Checks if the host belongs to the verified job boards allowlist.
     */
    public boolean isAllowedJobDomain(String host) {
        if (host == null || host.isBlank()) {
            return false;
        }
        String normalizedHost = host.toLowerCase().trim();
        return ALLOWED_JOB_HOSTS.contains(normalizedHost);
    }

    /**
     * Resolves all DNS entries for the host and ensures no resolved IP address
     * falls into private, loopback, link-local, multicast, or reserved ranges.
     */
    public void validateHost(String host) {
        String lowerHost = host.toLowerCase();

        if ("localhost".equals(lowerHost) || lowerHost.endsWith(".localhost") || lowerHost.endsWith(".local") || lowerHost.endsWith(".internal")) {
            throw new IllegalArgumentException("Host " + host + " resolves to internal domain name");
        }

        InetAddress[] addresses;
        try {
            addresses = InetAddress.getAllByName(host);
        } catch (UnknownHostException e) {
            throw new IllegalArgumentException("Unable to resolve host: " + host, e);
        }

        if (addresses == null || addresses.length == 0) {
            throw new IllegalArgumentException("No IP addresses found for host: " + host);
        }

        for (InetAddress address : addresses) {
            validateIpAddress(address);
        }
    }

    /**
     * Validates a single resolved InetAddress against all forbidden network ranges.
     */
    public void validateIpAddress(InetAddress address) {
        if (address.isLoopbackAddress()) {
            throw new IllegalArgumentException("Loopback address blocked: " + address.getHostAddress());
        }
        if (address.isAnyLocalAddress()) {
            throw new IllegalArgumentException("Any-local address blocked: " + address.getHostAddress());
        }
        if (address.isSiteLocalAddress()) {
            throw new IllegalArgumentException("Site-local private address blocked: " + address.getHostAddress());
        }
        if (address.isLinkLocalAddress()) {
            throw new IllegalArgumentException("Link-local address blocked: " + address.getHostAddress());
        }
        if (address.isMulticastAddress()) {
            throw new IllegalArgumentException("Multicast address blocked: " + address.getHostAddress());
        }

        byte[] octets = address.getAddress();

        if (address instanceof Inet4Address) {
            validateIpv4(octets, address.getHostAddress());
        } else if (address instanceof Inet6Address) {
            validateIpv6(octets, address.getHostAddress());
        }
    }

    private void validateIpv4(byte[] octets, String ipStr) {
        int b0 = octets[0] & 0xFF;
        int b1 = octets[1] & 0xFF;
        int b2 = octets[2] & 0xFF;
        int b3 = octets[3] & 0xFF;

        // 0.0.0.0/8 - Current network
        if (b0 == 0) {
            throw new IllegalArgumentException("Current network address blocked: " + ipStr);
        }

        // 10.0.0.0/8 - Private-use networks (RFC 1918)
        if (b0 == 10) {
            throw new IllegalArgumentException("Private Class A address blocked: " + ipStr);
        }

        // 100.64.0.0/10 - Shared Address Space / Carrier-Grade NAT (RFC 6598)
        if (b0 == 100 && (b1 >= 64 && b1 <= 127)) {
            throw new IllegalArgumentException("Shared Address Space (CGNAT) blocked: " + ipStr);
        }

        // 127.0.0.0/8 - Loopback
        if (b0 == 127) {
            throw new IllegalArgumentException("Loopback address blocked: " + ipStr);
        }

        // 169.254.0.0/16 - Link-Local / Cloud metadata
        if (b0 == 169 && b1 == 254) {
            throw new IllegalArgumentException("Link-local / Cloud metadata address blocked: " + ipStr);
        }

        // 172.16.0.0/12 - Private-use networks (RFC 1918)
        if (b0 == 172 && (b1 >= 16 && b1 <= 31)) {
            throw new IllegalArgumentException("Private Class B address blocked: " + ipStr);
        }

        // 192.0.0.0/24 - IETF Protocol Assignments
        if (b0 == 192 && b1 == 0 && b2 == 0) {
            throw new IllegalArgumentException("IETF Protocol Assignment address blocked: " + ipStr);
        }

        // 192.0.2.0/24 - TEST-NET-1 documentation
        if (b0 == 192 && b1 == 0 && b2 == 2) {
            throw new IllegalArgumentException("Documentation address blocked: " + ipStr);
        }

        // 192.168.0.0/16 - Private-use networks (RFC 1918)
        if (b0 == 192 && b1 == 168) {
            throw new IllegalArgumentException("Private Class C address blocked: " + ipStr);
        }

        // 198.18.0.0/15 - Network benchmark testing (RFC 2544)
        if (b0 == 198 && (b1 == 18 || b1 == 19)) {
            throw new IllegalArgumentException("Benchmark testing address blocked: " + ipStr);
        }

        // 198.51.100.0/24 - TEST-NET-2 documentation
        if (b0 == 198 && b1 == 51 && b2 == 100) {
            throw new IllegalArgumentException("Documentation address blocked: " + ipStr);
        }

        // 203.0.113.0/24 - TEST-NET-3 documentation
        if (b0 == 203 && b1 == 0 && b2 == 113) {
            throw new IllegalArgumentException("Documentation address blocked: " + ipStr);
        }

        // 224.0.0.0/4 - Multicast (224-239)
        if (b0 >= 224 && b0 <= 239) {
            throw new IllegalArgumentException("Multicast address blocked: " + ipStr);
        }

        // 240.0.0.0/4 - Reserved for Future Use
        if (b0 >= 240) {
            throw new IllegalArgumentException("Reserved address blocked: " + ipStr);
        }

        // 255.255.255.255 - Limited Broadcast
        if (b0 == 255 && b1 == 255 && b2 == 255 && b3 == 255) {
            throw new IllegalArgumentException("Broadcast address blocked: " + ipStr);
        }
    }

    private void validateIpv6(byte[] octets, String ipStr) {
        // Check for IPv4-mapped IPv6 address (::ffff:x.x.x.x -> 10 zeros, 2 0xFF, then 4 IPv4 bytes)
        boolean isIpv4Mapped = true;
        for (int i = 0; i < 10; i++) {
            if (octets[i] != 0) {
                isIpv4Mapped = false;
                break;
            }
        }
        if (isIpv4Mapped && (octets[10] & 0xFF) == 0xFF && (octets[11] & 0xFF) == 0xFF) {
            byte[] ipv4Bytes = Arrays.copyOfRange(octets, 12, 16);
            validateIpv4(ipv4Bytes, ipStr);
            return;
        }

        // Check for IPv4-compatible IPv6 (::x.x.x.x -> 12 zeros, then 4 IPv4 bytes)
        boolean isIpv4Compat = true;
        for (int i = 0; i < 12; i++) {
            if (octets[i] != 0) {
                isIpv4Compat = false;
                break;
            }
        }
        if (isIpv4Compat && (octets[12] != 0 || octets[13] != 0 || octets[14] != 0 || octets[15] != 1)) {
            byte[] ipv4Bytes = Arrays.copyOfRange(octets, 12, 16);
            validateIpv4(ipv4Bytes, ipStr);
            return;
        }

        int b0 = octets[0] & 0xFF;
        int b1 = octets[1] & 0xFF;

        // fc00::/7 - Unique Local Addresses (fc00::/8 and fd00::/8)
        if ((b0 & 0xFE) == 0xFC) {
            throw new IllegalArgumentException("IPv6 Unique Local Address (ULA) blocked: " + ipStr);
        }

        // fe80::/10 - Link-Local Unicast
        if (b0 == 0xFE && (b1 & 0xC0) == 0x80) {
            throw new IllegalArgumentException("IPv6 Link-Local Unicast blocked: " + ipStr);
        }

        // ff00::/8 - Multicast
        if (b0 == 0xFF) {
            throw new IllegalArgumentException("IPv6 Multicast blocked: " + ipStr);
        }

        // 2001:db8::/32 - Documentation
        if (b0 == 0x20 && b1 == 0x01 && (octets[2] & 0xFF) == 0x0D && (octets[3] & 0xFF) == 0xB8) {
            throw new IllegalArgumentException("IPv6 Documentation address blocked: " + ipStr);
        }
    }
}
