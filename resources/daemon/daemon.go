// daemon.go
package main

import (
    "encoding/json"
    "io/ioutil"
    "log"
    "net/http"
    "os/exec"
)

func getEnv(key, fallback string) string {
    if value, exists := os.LookupEnv(key); exists {
        return value
    }
    return fallback
}

const (
    authToken = getEnv("INFOSEC_AGENT_KEY", "token") // Change "default_token" to a strong default token if needed
)


type CommandRequest struct {
    Command string `json:"command"`
}

func runCommand(w http.ResponseWriter, r *http.Request) {
    // Check for authentication
    if r.Header.Get("Authorization") != "Bearer "+authToken {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }

    // Read the command from the request
    var req CommandRequest
    body, err := ioutil.ReadAll(r.Body)
    if err != nil {
        http.Error(w, "Bad Request", http.StatusBadRequest)
        return
    }
    defer r.Body.Close()

    if err := json.Unmarshal(body, &req); err != nil {
        http.Error(w, "Invalid JSON", http.StatusBadRequest)
        return
    }

    // Execute the command
    output, err := exec.Command("bash", "-c", req.Command).CombinedOutput()
    if err != nil {
        http.Error(w, string(output), http.StatusInternalServerError)
        return
    }

    // Return the output
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{"output": string(output)})
}

// CORS middleware function
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*")                                     // Allow all origins (adjust as needed)
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")                        // Allow POST and OPTIONS
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization") // Allow specific headers

		// Handle preflight requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		// Call the next handler
		next.ServeHTTP(w, r)
	})
}

func main() {
    http.Handle("/run-command", corsMiddleware(http.HandlerFunc(runCommand)))
    log.Println("Starting service on port 5879...")
    if err := http.ListenAndServe(":5879", nil); err != nil {
        log.Fatal(err)
    }
}
