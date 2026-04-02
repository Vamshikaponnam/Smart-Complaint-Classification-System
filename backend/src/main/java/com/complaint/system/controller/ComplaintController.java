package com.complaint.system.controller;

import com.complaint.system.entity.Complaint;
import com.complaint.system.service.ComplaintService;
import com.complaint.system.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;
    @Autowired
    private AiService aiService;

    @GetMapping("/health")
    public String health() {
        return "OK";
    }

    // ─── COMPLAINT CRUD ──────────────────────────────────────────────────────

    /** POST /api/complaint — Submit a new complaint with optional image */
    @PostMapping(value = "/complaint", consumes = { "multipart/form-data" })
    public ResponseEntity<Map<String, Object>> submitComplaint(
            @RequestPart("complaint") String complaintJson,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        try {
            ObjectMapper mapper = new ObjectMapper();
            Complaint complaint = mapper.readValue(complaintJson, Complaint.class);

            byte[] imageBytes = (image != null) ? image.getBytes() : null;
            Complaint saved = complaintService.submitComplaint(complaint, imageBytes);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Complaint submitted successfully!",
                    "id", saved.getId(),
                    "category", saved.getCategory(),
                    "department", saved.getDepartment(),
                    "status", saved.getStatus(),
                    "aiReasoning", saved.getAiReasoning() != null ? saved.getAiReasoning() : "",
                    "aiEnabled", aiService.isEnabled(),
                    "complaint", saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /** GET /api/complaints — Get all complaints */
    @GetMapping("/complaints")
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    /** GET /api/complaints/email/{email} — Get complaints by user email */
    @GetMapping("/complaints/email/{email}")
    public ResponseEntity<List<Complaint>> getByEmail(@PathVariable String email) {
        return ResponseEntity.ok(complaintService.getComplaintsByEmail(email));
    }

    /** GET /api/complaints/{id} — Get single complaint */
    @GetMapping("/complaints/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return complaintService.getComplaintById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** PUT /api/status/{id} — Update complaint status with optional note */
    @PutMapping("/status/{id}")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String status = body.get("status");
        String note = body.get("note"); // optional professional response

        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Status value is required."));
        }
        try {
            Complaint updated = complaintService.updateStatus(id, status, note);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Status updated to: " + status,
                    "complaint", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** DELETE /api/complaints/{id} — Delete complaint */
    @DeleteMapping("/complaints/{id}")
    public ResponseEntity<Map<String, Object>> deleteComplaint(@PathVariable Long id) {
        complaintService.deleteComplaint(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Complaint deleted."));
    }

    /** POST /api/complaints/{id}/feedback — Submit user feedback */
    @PostMapping("/complaints/{id}/feedback")
    public ResponseEntity<Map<String, Object>> submitFeedback(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {

        return complaintService.getComplaintById(id)
                .map(complaint -> {
                    Integer rating = (Integer) body.get("rating");
                    String feedback = (String) body.get("feedback");
                    complaint.setRating(rating);
                    complaint.setFeedback(feedback);
                    Complaint saved = complaintService.saveRaw(complaint);
                    return ResponseEntity.ok(Map.of(
                            "success", true,
                            "message", "Feedback submitted successfully!",
                            "complaint", saved));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /** GET /api/user/impact — Get citizen's contribution and tier */
    @GetMapping("/user/impact")
    public ResponseEntity<Map<String, Object>> getUserImpact(@RequestParam String email) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "impact", complaintService.getUserImpactData(email)));
    }

    // ─── AI ENDPOINTS ────────────────────────────────────────────────────────

    /** GET /api/user/impact-report — Personalized AI Story of Citizen's help */
    @GetMapping("/user/impact-report")
    public ResponseEntity<Map<String, Object>> getUserImpactReport(@RequestParam String email) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "report", complaintService.getUserImpactReport(email)));
    }

    /** GET /api/analytics/next-week-strategy — AI Strategic Forecast */
    @GetMapping("/analytics/next-week-strategy")
    public ResponseEntity<Map<String, Object>> getNextWeekStrategy() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "strategy", complaintService.getNextWeekStrategy()));
    }

    /** GET /api/analytics/alerts — Real-time Anomaly Alerts */
    @GetMapping("/analytics/alerts")
    public ResponseEntity<Map<String, Object>> getAnomalyAlerts() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "alerts", complaintService.getAnomalyAlerts()));
    }

    /** GET /api/governance/value-saved — Economic impact of AI municipal actions */
    @GetMapping("/governance/value-saved")
    public ResponseEntity<Map<String, Object>> getMunicipalValue() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", complaintService.getMunicipalValueReport()));
    }

    /**
     * POST /api/governance/marketplace/redeem — Spend impact points on civic perks
     */
    @PostMapping("/governance/marketplace/redeem")
    public ResponseEntity<Map<String, Object>> redeemPerk(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(complaintService.redeemPerk(request.get("email"), request.get("perkName")));
    }

    /** GET /api/governance/proposals — Open capital projects for citizen voting */
    @GetMapping("/governance/proposals")
    public ResponseEntity<Map<String, Object>> getProposals() {
        return ResponseEntity.ok(complaintService.getCapitalProposals());
    }

    /** POST /api/governance/proposals/{id}/vote — High-impact citizen referendum */
    @PostMapping("/governance/proposals/{id}/vote")
    public ResponseEntity<Map<String, Object>> voteProposal(@PathVariable Long id, @RequestParam String email) {
        return ResponseEntity.ok(complaintService.voteForProject(email, id));
    }

    /** GET /api/governance/sustainability — Municipal Environmental Analytics */
    @GetMapping("/governance/sustainability")
    public ResponseEntity<Map<String, Object>> getSustainability() {
        return ResponseEntity.ok(complaintService.getSustainabilityReport());
    }

    /**
     * POST /api/governance/proposals/{id}/pledge — Crowdfunding pledge for city
     * projects
     */
    @PostMapping("/governance/proposals/{id}/pledge")
    public ResponseEntity<Map<String, Object>> pledgeToProposal(@PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(
                complaintService.pledgeToProposal((String) request.get("email"), id, (Integer) request.get("points")));
    }

    /** GET /api/governance/benchmarks — World-class city comparison KPIs */
    @GetMapping("/governance/benchmarks")
    public ResponseEntity<Map<String, Object>> getBenchmarks() {
        return ResponseEntity.ok(complaintService.getGlobalBenchmarkingReport());
    }

    /** GET /api/governance/ledger — Immutable audit of all city/AI decisions */
    @GetMapping("/governance/ledger")
    public ResponseEntity<List<Map<String, Object>>> getLedger() {
        return ResponseEntity.ok(complaintService.getZenithLedger());
    }

    /**
     * GET /api/complaints/{id}/ai-suggest — Get AI-generated resolution suggestion
     */
    @GetMapping("/complaints/{id}/ai-suggest")
    public ResponseEntity<Map<String, Object>> getAiSuggestion(@PathVariable Long id) {
        try {
            String suggestion = complaintService.getResolutionSuggestion(id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "suggestion", suggestion,
                    "aiEnabled", aiService.isEnabled()));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** GET /api/complaints/{id}/ai-draft — Get AI-drafted professional response */
    @GetMapping("/complaints/{id}/ai-draft")
    public ResponseEntity<Map<String, Object>> getAiDraft(@PathVariable Long id) {
        try {
            String draft = complaintService.getAiResponseDraft(id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "draft", draft,
                    "aiEnabled", aiService.isEnabled()));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * POST /api/ai/chat
     * Citizen chatbot — proxies messages to Gemini.
     * Body: { "message": "...", "history":
     * [{"role":"user","text":"..."},{"role":"model","text":"..."}] }
     */
    @PostMapping("/ai/chat")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, Object> body) {
        String message = (String) body.get("message");
        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "reply", "Message cannot be empty."));
        }

        @SuppressWarnings("unchecked")
        List<Map<String, String>> history = (List<Map<String, String>>) body.get("history");

        String reply = aiService.chat(message, history);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "reply", reply,
                "aiEnabled", aiService.isEnabled()));
    }

    /** GET /api/classify — Test classification without saving */
    @GetMapping("/classify")
    public ResponseEntity<Map<String, Object>> classify(@RequestParam String text) {
        Map<String, String> result = complaintService.classifyWithAi(text);
        return ResponseEntity.ok(Map.of(
                "category", result.get("category"),
                "department", result.get("department"),
                "reasoning", result.get("reasoning"),
                "aiEnabled", aiService.isEnabled()));
    }

    @GetMapping("/ai/status")
    public ResponseEntity<Map<String, Object>> aiStatus() {
        return ResponseEntity.ok(Map.of(
                "aiEnabled", aiService.isEnabled(),
                "message", aiService.isEnabled()
                        ? "Smart AI Assistant is active."
                        : "Running in keyword-fallback mode. Add your AI API key to enable AI."));
    }

    /**
     * GET /api/analytics/insights — Get AI-powered strategic insights for admins
     */
    @GetMapping("/analytics/insights")
    public ResponseEntity<Map<String, Object>> getStrategicInsights() {
        String insights = complaintService.getAiStrategicInsights();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "insights", insights,
                "aiEnabled", aiService.isEnabled()));
    }

    /** GET /api/analytics/zonal-health — Geographic Heatmap Data */
    @GetMapping("/analytics/daily-route")
    public ResponseEntity<Map<String, Object>> getDailyRoute() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "route", complaintService.getDailyMaintenanceRoute()));
    }

    /**
     * POST /api/admin/trigger-oracle — Manually trigger the preventive
     * infrastructure oracle
     */
    @PostMapping("/admin/trigger-oracle")
    public ResponseEntity<Complaint> triggerOracle() {
        return ResponseEntity.ok(complaintService.triggerPreventiveOracle());
    }

    /** POST /api/ai/mediate — AI-driven neutral mediation for community disputes */
    @PostMapping("/ai/mediate")
    public ResponseEntity<Map<String, Object>> mediate(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "mediation", complaintService.mediateNeighborDispute(request.get("userA"), request.get("userB"),
                        request.get("issue"))));
    }

    /** GET /api/analytics/forecast — Municipal Predictive Forecast */
    @GetMapping("/analytics/forecast")
    public ResponseEntity<Map<String, Object>> getPredictiveForecast() {
        String forecast = complaintService.getAiPredictiveForecast();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "forecast", forecast,
                "aiEnabled", aiService.isEnabled()));
    }

    /** GET /api/analytics/feedback — AI Community Sentiment Analysis */
    @GetMapping("/analytics/feedback")
    public ResponseEntity<Map<String, Object>> getFeedbackAnalysis() {
        String analysis = complaintService.getAiFeedbackAnalysis();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "analysis", analysis,
                "aiEnabled", aiService.isEnabled()));
    }

    /** POST /api/complaints/check-similarity — Check if complaint already exists */
    @PostMapping("/complaints/check-similarity")
    public ResponseEntity<Complaint> checkSimilarity(@RequestBody Map<String, String> body) {
        String text = body.get("complaintText");
        String location = body.get("location");
        Complaint match = complaintService.checkSimilarity(text, location);
        return ResponseEntity.ok(match);
    }

    /** POST /api/complaints/{id}/support — Support an existing complaint */
    @PostMapping("/complaints/{id}/support")
    public ResponseEntity<Complaint> support(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.supportExistingComplaint(id));
    }

    /** POST /api/complaints/search — Semantic Search */
    @PostMapping("/complaints/search")
    public ResponseEntity<List<Complaint>> search(@RequestBody Map<String, String> body) {
        String query = body.get("query");
        String email = body.get("email"); // optional filter
        return ResponseEntity.ok(complaintService.searchSemantic(query, email));
    }
}
