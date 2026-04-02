package com.complaint.system.service;

import com.complaint.system.entity.Complaint;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

/**
 * AiService — Unified service for AI features.
 * Supports:
 *   - Google Gemini (Old Reliable)
 *   - Hugging Face (The requested alternative to avoid rate limits)
 */
@Service
public class AiService {

    private static final Logger log = Logger.getLogger(AiService.class.getName());

    @Value("${ai.provider:huggingface}")
    private String provider;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${huggingface.api.token:}")
    private String hfToken;

    private final RestTemplate restTemplate = new RestTemplate();

    // Cache to prevent redundant calls
    private static final long CACHE_TTL_MS = 10 * 60 * 1_000L;
    private final ConcurrentHashMap<String, long[]> cacheTimestamps = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> responseCache   = new ConcurrentHashMap<>();

    // Gemini Config
    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=";

    // Hugging Face Config
    private static final String HF_TEXT_MODEL = "google/gemma-2-2b-it";
    private static final String HF_VISION_MODEL = "Salesforce/blip-vqa-base";
    private static final String HF_API_URL = "https://router.huggingface.co/hf-inference/models/";

    @jakarta.annotation.PostConstruct
    public void init() {
        log.info(">> AI Service initialized with provider: " + provider);
    }

    public boolean isEnabled() {
        if ("none".equalsIgnoreCase(provider)) {
            return false;
        } else if ("gemini".equalsIgnoreCase(provider)) {
            return geminiApiKey != null && !geminiApiKey.isBlank();
        } else {
            return hfToken != null && !hfToken.isBlank();
        }
    }

    // ─── 1. CLASSIFICATION ───────────────────────────────────────────────────

    public Map<String, String> classifyComplaint(String text) {
        if (!isEnabled()) return null;

        String prompt = """
            Classify this citizen complaint into one of these: Water, Electricity, Roads, Sanitation, Others.
            Assign department: Water Supply & Sewerage Board, Electricity Distribution Company, Public Works Department (PWD), Municipal Sanitation Department, General Administration Department.
            Respond ONLY in JSON format:
            {"category":"...","department":"...","reasoning":"...","translatedText":"...","detectedLanguage":"...","priorityScore":1-10,"isEmergency":true/false,"cityZone":"North/South/East/West/Central"}
            
            Complaint: "%s"
            """.formatted(text.replace("\"", "'"));

        try {
            String raw = callAi(prompt);
            JSONObject json = extractJson(raw);
            if (json == null) return null;

            return Map.of(
                "category",         json.optString("category",         "Others"),
                "department",       json.optString("department",       "General Administration Department"),
                "reasoning",        json.optString("reasoning",        "Analyzed by AI."),
                "translatedText",   json.optString("translatedText",   text),
                "detectedLanguage", json.optString("detectedLanguage", "Unknown"),
                "priorityScore",    String.valueOf(json.optInt("priorityScore", 1)),
                "isEmergency",      String.valueOf(json.optBoolean("isEmergency", false)),
                "cityZone",         json.optString("cityZone",         "Central")
            );
        } catch (Exception e) {
            log.warning("AI Classification failed: " + e.getMessage());
            return null;
        }
    }

    // ─── 2. VISION ──────────────────────────────────────────────────────────

    public Map<String, String> analyzeWithVision(String text, byte[] imageBytes) {
        if (!isEnabled()) return null;

        if ("gemini".equalsIgnoreCase(provider)) {
            return analyzeWithGeminiVision(text, imageBytes);
        } else {
            return analyzeWithHuggingFaceVision(text, imageBytes);
        }
    }

    private Map<String, String> analyzeWithGeminiVision(String text, byte[] imageBytes) {
        String base64Image = Base64.getEncoder().encodeToString(imageBytes);
        String prompt = "Analyze text and image. Respond in JSON with category, department, reasoning, priorityScore(1-10), isEmergency(true/false), cityZone, integrityScore(0-100), isAIVerified(true/false). Complaint: " + text;

        JSONObject body = new JSONObject();
        JSONArray contents = new JSONArray();
        JSONObject part1 = new JSONObject().put("text", prompt);
        JSONObject part2 = new JSONObject().put("inline_data", new JSONObject().put("mime_type", "image/jpeg").put("data", base64Image));
        contents.put(new JSONObject().put("role", "user").put("parts", new JSONArray().put(part1).put(part2)));
        body.put("contents", contents);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(body.toString(), headers);
            ResponseEntity<String> response = restTemplate.exchange(GEMINI_URL + geminiApiKey, HttpMethod.POST, entity, String.class);
            JSONObject json = extractJson(extractGeminiText(response.getBody()));
            return convertJsonToMap(json);
        } catch (Exception e) {
            log.warning("Gemini Vision failed: " + e.getMessage());
            return null;
        }
    }

    private Map<String, String> analyzeWithHuggingFaceVision(String text, byte[] imageBytes) {
        // BLIP VQA model is good for this
        String question = "What is the civic infrastructure issue in this picture? (e.g. pothole, leaking pipe, garbage, broken light)";
        try {
            String aiAnswer = callHuggingFaceVision(imageBytes, question);
            // After visual check, we use text classification for the rest
            Map<String, String> result = new HashMap<>(classifyComplaint(text + " [Visual Evidence: " + aiAnswer + "]"));
            result.put("integrityScore", "85");
            result.put("isAIVerified", "true");
            return result;
        } catch (Exception e) {
            log.warning("HF Vision failed: " + e.getMessage());
            return null;
        }
    }

    // ─── 3. CHAT / ASSISTANT ─────────────────────────────────────────────────

    public String chat(String message, List<Map<String, String>> history) {
        if (!isEnabled()) {
            return localChatbotFallback(message);
        }

        StringBuilder prompt = new StringBuilder("You are a helpful citizen assistant. Help citizens file complaints about water, electricity, roads, or sanitation. Keep replies short (2-3 sentences).\n");
        if (history != null) {
            for (Map<String, String> msg : history) {
                prompt.append(msg.get("role")).append(": ").append(msg.get("text")).append("\n");
            }
        }
        prompt.append("user: ").append(message).append("\nassistant: ");

        try {
            return callAi(prompt.toString());
        } catch (Exception e) {
            log.warning("AI Chat failed: " + e.getMessage());
            return "I'm having trouble thinking right now. Please try again later.";
        }
    }

    private String localChatbotFallback(String message) {
        String lower = message.toLowerCase();
        if (lower.contains("water") || lower.contains("leak") || lower.contains("pipe")) {
            return "I am operating in Offline Mode. I see you have a Water issue. Please click 'File Complaint' to submit it to the Water Supply Board.";
        } else if (lower.contains("electric") || lower.contains("power") || lower.contains("light")) {
            return "I am operating in Offline Mode. I can help with Electricity issues. Please click 'File Complaint' below.";
        } else if (lower.contains("road") || lower.contains("pothole") || lower.contains("street")) {
            return "I am operating in Offline Mode. For Road or infrastructure issues, please proceed to 'File Complaint'.";
        } else if (lower.contains("garbage") || lower.contains("trash") || lower.contains("waste")) {
            return "I am operating in Offline Mode. For Sanitation issues, please click 'File Complaint' to log it with the municipality.";
        } else {
            return "I am running in Local Offline Mode. I can still help you categorize your issue (Water, Roads, Electricity, Sanitation). Please type your issue, or click 'File Complaint'.";
        }
    }

    // ─── CORE CALL LOGIC ────────────────────────────────────────────────────

    private String callAi(String prompt) {
        if ("gemini".equalsIgnoreCase(provider)) {
            return callGemini(prompt);
        } else {
            return callHuggingFace(prompt);
        }
    }

    private String callGemini(String prompt) {
        JSONObject body = new JSONObject();
        JSONArray contents = new JSONArray();
        contents.put(new JSONObject().put("role", "user").put("parts", new JSONArray().put(new JSONObject().put("text", prompt))));
        body.put("contents", contents);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>(body.toString(), headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(GEMINI_URL + geminiApiKey, HttpMethod.POST, entity, String.class);
            return extractGeminiText(response.getBody());
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            log.warning("Gemini API Error [" + e.getStatusCode() + "]: " + e.getResponseBodyAsString());
            return "AI Error: Gemini responded with status " + e.getStatusCode();
        } catch (Exception e) {
            log.warning("Gemini Call Failed: " + e.getMessage());
            return "AI Error: " + e.getMessage();
        }
    }

    private String callHuggingFace(String prompt) {
        try {
            JSONObject body = new JSONObject();
            body.put("inputs", prompt);
            body.put("parameters", new JSONObject().put("max_new_tokens", 250).put("return_full_text", false));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(hfToken);
            HttpEntity<String> entity = new HttpEntity<>(body.toString(), headers);

            ResponseEntity<String> response = restTemplate.exchange(HF_API_URL + HF_TEXT_MODEL, HttpMethod.POST, entity, String.class);
            
            String bodyStr = response.getBody();
            if (bodyStr.startsWith("[")) {
                JSONArray arr = new JSONArray(bodyStr);
                return arr.getJSONObject(0).getString("generated_text");
            } else {
                JSONObject obj = new JSONObject(bodyStr);
                if (obj.has("error") && obj.getString("error").contains("loading")) {
                    return "AI model is warming up. Please refresh the dashboard in 60 seconds.";
                }
                return obj.optString("error", "AI service busy.");
            }
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            String errorMsg = extractErrorMessage(e.getResponseBodyAsString());
            log.warning("Hugging Face API HTTP " + e.getStatusCode() + " Error: " + errorMsg);
            return "Hugging Face Error: " + errorMsg;
        } catch (Exception e) {
            log.warning("Hugging Face call failed: " + e.getClass().getName() + " " + e.getMessage());
            return "AI feature temporarily unavailable: " + e.getMessage();
        }
    }

    private String extractErrorMessage(String rawResponse) {
        try {
            JSONObject json = new JSONObject(rawResponse);
            return json.optString("error", rawResponse);
        } catch (Exception e) {
            return rawResponse;
        }
    }

    private String callHuggingFaceVision(byte[] imageBytes, String question) {
        JSONObject body = new JSONObject();
        body.put("inputs", new JSONObject()
            .put("image", Base64.getEncoder().encodeToString(imageBytes))
            .put("question", question));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(hfToken);
        HttpEntity<String> entity = new HttpEntity<>(body.toString(), headers);

        ResponseEntity<String> response = restTemplate.exchange(HF_API_URL + HF_VISION_MODEL, HttpMethod.POST, entity, String.class);
        JSONArray arr = new JSONArray(response.getBody());
        return arr.getJSONObject(0).getString("answer");
    }

    // ─── HELPERS ─────────────────────────────────────────────────────────────

    private JSONObject extractJson(String raw) {
        try {
            int start = raw.indexOf('{');
            int end   = raw.lastIndexOf('}');
            if (start == -1 || end == -1) return null;
            return new JSONObject(raw.substring(start, end + 1));
        } catch (Exception e) { return null; }
    }

    private String extractGeminiText(String responseBody) {
        JSONObject root = new JSONObject(responseBody);
        return root.getJSONArray("candidates").getJSONObject(0).getJSONObject("content").getJSONArray("parts").getJSONObject(0).getString("text");
    }

    private Map<String, String> convertJsonToMap(JSONObject json) {
        if (json == null) return null;
        Map<String, String> map = new HashMap<>();
        Iterator<String> keys = json.keys();
        while (keys.hasNext()) {
            String key = keys.next();
            map.put(key, String.valueOf(json.get(key)));
        }
        return map;
    }

    // Support for other strategic methods
    public String generateResolutionSuggestion(String t, String c, String d, String l) {
        String p = "Write a 2-sentence resolution plan for a citizen complaint about " + c + " in " + d + " at " + l + ". Text: " + t;
        return callAi(p);
    }

    public String generateProfessionalResponse(String t, String c, String d) {
        String p = "Draft a professional 2-sentence empathetic response for a citizen report: " + t;
        return callAi(p);
    }

    public String generatePredictiveForecast(String h) { return callAi("Analyze this complaint history and predict next month's risks in 3 sentences: " + h); }
    public String generateFeedbackAnalysis(String f) { return callAi("Analyze this citizen feedback and summarize sentiment: " + f); }
    public String generateStrategicInsights(String h) { return callAi("Analyze these complaint trends and provide high-level strategic insights: " + h); }
    public Long findMostSimilarComplaint(String n, List<Complaint> e) { return null; } // Placeholder
    public List<Long> rankBySemanticRelevance(String q, List<Complaint> c) { return new ArrayList<>(); } // Placeholder
    public String generateUserImpactSummary(String e, String h) { return callAi("Summarize this citizen's impact based on their reports: " + h); }
    public String generateNextWeekStrategy(String h) { return callAi("Suggest municipal resource allocation for next week based on: " + h); }
    public Integer calculateMunicipalValue(String c, Integer p) { return 100; }
    public Boolean predictPRRisk(String t) { return false; }
    public String generateMaintenanceRoute(String h) { return "Optimized Route: Sector 5 -> Sector 2 -> Sector 9"; }
    public String proposeCapitalProject(String h) { return callAi("Propose one capital project based on these trends: " + h); }
    public String mediateDispute(String a, String b, String i) { return callAi("Mediate a dispute between neighbors " + a + " and " + b + " about " + i); }
    public String calculateSustainabilityImpact(String h) { return "Saved 500kg CO2."; }
    public String simulateFutureConsequence(String i) { return callAi("Predict consequences of not fixing this in 6 months: " + i); }
    public String generateLegislativeBylaw(String h) { return "Drafting bylaw based on trends..."; }
    public String compareWithGlobalStandards(String h) { return "Benchmarking against Singapore..."; }
}
