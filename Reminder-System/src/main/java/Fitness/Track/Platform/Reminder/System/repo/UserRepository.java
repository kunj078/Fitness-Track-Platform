package Fitness.Track.Platform.Reminder.System.repo;

import Fitness.Track.Platform.Reminder.System.model.UserDoc;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface UserRepository extends MongoRepository<UserDoc, String> {
    List<UserDoc> findByIsActiveTrue();
}


