package ug.sotware.moodle.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    /** Cliente HTTP reactivo reutilizable para llamar a Moodle */
    @Bean
    public WebClient moodleWebClient() {
        return WebClient.builder()
                // Moodle regresa a veces JSON con content-type text/html; lo parseamos manualmente
                .build();
    }

    /** Habilita CORS para que la app React Native (Expo/Metro) pueda llamar al backend en dev */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOriginPatterns("*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*");
            }
        };
    }
}
