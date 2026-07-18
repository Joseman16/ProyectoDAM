package ug.sotware.moodle;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan   // ← esta es la que probablemente falta
public class MoodleApplication {
	public static void main(String[] args) {
		SpringApplication.run(MoodleApplication.class, args);
	}
}