package com.complaint.system.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "complaints")
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Location is required")
    private String location;

    @Column(length = 2000)
    @NotBlank(message = "Complaint text is required")
    private String complaintText;

    private String category;       // Water, Electricity, Roads, Sanitation, Others
    private String department;     // Assigned department
    private String status;         // Pending, In Progress, Resolved
    private Integer rating;        // 1-5 Stars
    @Column(length = 1000)
    private String feedback;       // Citizen feedback comment
    private String mobileNumber;   // Citizen mobile number

    @Column(length = 500)
    private String aiReasoning;      // Gemini AI classification explanation

    private Integer supportCount = 0; // Number of neighbors who 'Supported' this same issue

    @Column(length = 2000)
    private String translatedText;   // English translation (if original is non-English)
    private String detectedLanguage; // e.g. "Hindi", "Spanish", "English"
    private String cityZone;         // e.g. "North", "South", "East", "West", "Central"

    // Pillar 15 & 16: Integrity and Dispatch
    private Boolean isAIVerified = false;
    private Integer integrityScore = 0; // 0-100 scale
    private Boolean isDispatched = false;

    // Pillar 21-25: Sovereign Governance
    private Integer municipalValue = 0; // Estimated value saved (e.g. in dollars)
    private Boolean isViralRisk = false; // PR/Reputation risk flag
    private String externalVendor; // e.g. "Electric Board", "Water Authority"
    private Boolean isSystemAlert = false; // Pillar 30: Preventive Maintenance

    @Lob
    @Column(name = "image_data", length = 10000000)
    private byte[] imageData;        // Store image as BLOB

    private Integer priorityScore = 1; // 1-10 (AI-determined based on severity)
    private Boolean isEmergency = false; // True if life-threatening or high-risk

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "complaintId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("timestamp ASC")
    private List<ComplaintEvent> history = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = "Pending";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public Complaint() {}

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getComplaintText() { return complaintText; }
    public void setComplaintText(String complaintText) { this.complaintText = complaintText; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

    public String getAiReasoning() { return aiReasoning; }
    public void setAiReasoning(String aiReasoning) { this.aiReasoning = aiReasoning; }

    public Integer getSupportCount() { return supportCount == null ? 0 : supportCount; }
    public void setSupportCount(Integer supportCount) { this.supportCount = supportCount; }

    public String getTranslatedText() { return translatedText; }
    public void setTranslatedText(String translatedText) { this.translatedText = translatedText; }

    public String getDetectedLanguage() { return detectedLanguage; }
    public void setDetectedLanguage(String detectedLanguage) { this.detectedLanguage = detectedLanguage; }

    public Integer getPriorityScore() { return priorityScore == null ? 1 : priorityScore; }
    public void setPriorityScore(Integer priorityScore) { this.priorityScore = priorityScore; }

    public Boolean getIsEmergency() { return isEmergency != null && isEmergency; }
    public void setIsEmergency(Boolean isEmergency) { this.isEmergency = isEmergency; }

    public String getCityZone() { return cityZone == null ? "Central" : cityZone; }
    public void setCityZone(String cityZone) { this.cityZone = cityZone; }

    public Boolean getIsAIVerified() { return isAIVerified; }
    public void setIsAIVerified(Boolean isAIVerified) { this.isAIVerified = isAIVerified; }

    public Integer getIntegrityScore() { return integrityScore; }
    public void setIntegrityScore(Integer integrityScore) { this.integrityScore = integrityScore; }

    public Boolean getIsDispatched() { return isDispatched; }
    public void setIsDispatched(Boolean isDispatched) { this.isDispatched = isDispatched; }

    public Integer getMunicipalValue() { return municipalValue; }
    public void setMunicipalValue(Integer municipalValue) { this.municipalValue = municipalValue; }

    public Boolean getIsViralRisk() { return isViralRisk; }
    public void setIsViralRisk(Boolean isViralRisk) { this.isViralRisk = isViralRisk; }

    public String getExternalVendor() { return externalVendor; }
    public void setExternalVendor(String externalVendor) { this.externalVendor = externalVendor; }

    public Boolean getIsSystemAlert() { return isSystemAlert; }
    public void setIsSystemAlert(Boolean isSystemAlert) { this.isSystemAlert = isSystemAlert; }

    public byte[] getImageData() { return imageData; }
    public void setImageData(byte[] imageData) { this.imageData = imageData; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<ComplaintEvent> getHistory() { return history; }
    public void setHistory(List<ComplaintEvent> history) { this.history = history; }
}
