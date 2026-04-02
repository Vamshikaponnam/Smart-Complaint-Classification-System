package com.complaint.system.config;

import com.complaint.system.entity.Complaint;
import com.complaint.system.entity.ComplaintEvent;
import com.complaint.system.entity.User;
import com.complaint.system.repository.ComplaintEventRepository;
import com.complaint.system.repository.ComplaintRepository;
import com.complaint.system.repository.UserRepository;
import com.complaint.system.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ComplaintEventRepository eventRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private ComplaintService complaintService;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) return;

        System.out.println("🌱 Initializing Sample Data...");

        // 1. Create a Test User
        User testUser = new User("John Doe", "demo@example.com", "pass123", "+91 98765 43210");
        userRepository.save(testUser);

        // 2. Create Sample Complaints
        createSample(testUser, "Main road in Sector 5 has a huge pothole causing traffic jams.", "Sector 5");
        createSample(testUser, "Street lights are not working near the park, it is very dark at night.", "City Park");
            Complaint c1 = new Complaint();
            c1.setUserId(testUser.getId());
            c1.setName(testUser.getName());
            c1.setEmail(testUser.getEmail());
            c1.setLocation("Downtown Area");
            c1.setComplaintText("Massive garbage pileup near the central park entrance. It has been there for 3 days and smells terrible.");
            c1.setCategory("Sanitation");
            c1.setDepartment("Municipal Sanitation Department");
            c1.setStatus("Pending");
            c1.setMobileNumber(testUser.getMobileNumber());
            complaintRepository.save(c1);
            eventRepository.save(new ComplaintEvent(c1.getId(), "Pending", "Complaint registered and assigned to Sanitation Department."));

            Complaint c2 = new Complaint();
            c2.setUserId(testUser.getId());
            c2.setName(testUser.getName());
            c2.setEmail(testUser.getEmail());
            c2.setLocation("West Side, 5th Ave");
            c2.setComplaintText("Main water pipe burst near the subway station. Water is flooding the street.");
            c2.setCategory("Water");
            c2.setDepartment("Water Supply & Sewerage Board");
            c2.setStatus("Resolved");
            c2.setRating(5);
            c2.setFeedback("Amazingly fast response! The crew arrived within 2 hours and fixed it.");
            c2.setMobileNumber(testUser.getMobileNumber());
            complaintRepository.save(c2);
            eventRepository.save(new ComplaintEvent(c2.getId(), "Pending", "Emergency water leak reported."));
            eventRepository.save(new ComplaintEvent(c2.getId(), "In Progress", "Repair crew dispatched to site."));
            eventRepository.save(new ComplaintEvent(c2.getId(), "Resolved", "Pipe replaced and pressure restored. Citizen confirmed resolution."));

            Complaint c3 = new Complaint();
            c3.setUserId(testUser.getId());
            c3.setName(testUser.getName());
            c3.setEmail(testUser.getEmail());
            c3.setLocation("East Sector, Block C");
            c3.setComplaintText("Frequent power fluctuations damaging household appliances. Need transformer check.");
            c3.setCategory("Electricity");
            c3.setDepartment("Electricity Distribution Company");
            c3.setStatus("In Progress");
            c3.setMobileNumber(testUser.getMobileNumber());
            complaintRepository.save(c3);
            eventRepository.save(new ComplaintEvent(c3.getId(), "Pending", "Voltage fluctuation report received."));
            eventRepository.save(new ComplaintEvent(c3.getId(), "In Progress", "Technical audit initiated for Sector C transformer."));

            System.out.println(">> Sample Data with Timeline Events initialized!");
    }

    private void createSample(User user, String text, String location) {
        Complaint c = new Complaint();
        c.setUserId(user.getId());
        c.setName(user.getName());
        c.setEmail(user.getEmail());
        c.setLocation(location);
        c.setComplaintText(text);
        c.setMobileNumber("+91 98765 43210");
        
        // Use service to classify and assign dept
        String category = complaintService.classifyComplaint(text);
        c.setCategory(category);
        c.setDepartment(complaintService.assignDepartment(category));
        
        // Randomize status and feedback
        double rand = Math.random();
        if (rand > 0.7) {
            c.setStatus("Resolved");
            c.setRating((int) (Math.random() * 2) + 4); // 4 or 5 stars
            c.setFeedback("Great service, the issue was fixed quickly!");
        } else if (rand > 0.4) {
            c.setStatus("In Progress");
        } else {
            c.setStatus("Pending");
        }
        
        complaintRepository.save(c);
    }
}
