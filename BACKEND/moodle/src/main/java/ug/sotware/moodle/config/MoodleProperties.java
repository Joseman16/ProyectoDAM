package ug.sotware.moodle.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "moodle")
public record MoodleProperties(
        String baseUrl,
        String serviceName,
        String adminToken
) {
    /** URL del endpoint REST de Moodle (webservice/rest/server.php) */
    public String restEndpoint() {
        return baseUrl + "/webservice/rest/server.php";
    }

    /** URL del endpoint de login por token (para intercambiar user/pass -> token) */
    public String tokenEndpoint() {
        return baseUrl + "/login/token.php";
    }
}
