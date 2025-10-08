package Fitness.Track.Platform.Reminder.System.service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    
    private final SendGrid sendGrid;

    @Value("${app.mail.from:noreply@fitness-track.local}")
    private String from;

    public EmailService(@Value("${sendgrid.api.key}") String apiKey) {
        this.sendGrid = new SendGrid(apiKey);
    }

    public void sendReminder(String to, String name) {
        try {
            Email fromEmail = new Email(from);
            Email toEmail = new Email(to);
            String subject = "Daily Activity Reminder";
            Content content = new Content("text/plain", 
                "Hi " + name + ",\n\nDon't forget to log today's activity!\n\n— Fitness Track Platform");
            
            Mail mail = new Mail(fromEmail, subject, toEmail, content);
            
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            
            Response response = sendGrid.api(request);
            
            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                log.info("Email sent successfully to: {}", to);
            } else {
                log.error("Failed to send email to: {}. Status: {}, Body: {}", 
                    to, response.getStatusCode(), response.getBody());
            }
        } catch (IOException e) {
            log.error("Error sending email to: {}", to, e);
        }
    }
}


