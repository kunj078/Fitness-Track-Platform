package Fitness.Track.Platform.Reminder.System.scheduler;

import Fitness.Track.Platform.Reminder.System.service.EmailService;
import Fitness.Track.Platform.Reminder.System.repo.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class DailyReminderScheduler {
    private static final Logger log = LoggerFactory.getLogger(DailyReminderScheduler.class);

    private final EmailService emailService;
    private final UserRepository userRepository;

    @Value("${app.scheduler.enabled:true}")
    private boolean enabled;

    // Endpoint on Node.js backend that returns list of {name,email}
    @Value("${app.backend.reminderListUrl:https://fitness-track-platform-node.onrender.com/api/reminders/today}")
    private String reminderListUrl;

    public DailyReminderScheduler(EmailService emailService, UserRepository userRepository) {
        this.emailService = emailService;
        this.userRepository = userRepository;
    }

    @Scheduled(cron = "${app.scheduler.cron:0 57 23 * * *}")
    public void runDaily() {
        if (!enabled) {
            log.info("Daily reminder scheduler is disabled");
            return;
        }
        try {
            var users = userRepository.findByIsActiveTrue();
            int count = 0;
            for (var u : users) {
                String email = u.getEmail();
                if (email != null && !email.isBlank()) {
                    String name = u.getName() != null ? u.getName() : "there";
                    emailService.sendReminder(email, name);
                    count++;
                }
            }
            log.info("Scheduler sent reminders to {} active users", count);
        } catch (Exception ex) {
            log.error("Failed to run daily reminders", ex);
        }
    }
}


