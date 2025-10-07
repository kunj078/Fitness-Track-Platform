package Fitness.Track.Platform.Reminder.System.controller;

import Fitness.Track.Platform.Reminder.System.dto.ReminderRequest;
import Fitness.Track.Platform.Reminder.System.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reminders")
public class ReminderController {

    private final EmailService emailService;

    public ReminderController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/send")
    public ResponseEntity<?> sendNow(@RequestBody List<@Valid ReminderRequest> users) {
        users.forEach(u -> emailService.sendReminder(u.getEmail(), u.getName()));
        return ResponseEntity.ok().body("Reminders sent: " + users.size());
    }

    @GetMapping("/")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok().body("Test");
    }
}


