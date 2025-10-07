package Fitness.Track.Platform.Reminder.System.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@fitness-track.local}")
    private String from;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendReminder(String to, String name) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject("Daily Activity Reminder");
        message.setText("Hi " + name + ",\n\nDon't forget to log today's activity!\n\n— Fitness Track Platform");
        mailSender.send(message);
    }
}


