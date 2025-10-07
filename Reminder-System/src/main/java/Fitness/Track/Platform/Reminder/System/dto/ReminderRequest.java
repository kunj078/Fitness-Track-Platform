package Fitness.Track.Platform.Reminder.System.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ReminderRequest {
    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    public ReminderRequest() {}

    public ReminderRequest(String name, String email) {
        this.name = name;
        this.email = email;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}


