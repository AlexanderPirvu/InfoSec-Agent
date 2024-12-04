package main

import (
	"bytes"
	"fmt"
	"modules/output_module"
	"os/exec"
	"strings"
	// "../output_module"
)

const (
	modname = "firewall_security" //name of the module
)

// Function to execute a command and return the output
func executeCommand(command string, args ...string) (string, error) {
	var out bytes.Buffer
	cmd := exec.Command(command, args...)
	cmd.Stdout = &out
	cmd.Stderr = &out
	err := cmd.Run()
	if err != nil {
		return "", err
	}
	return out.String(), nil
}

// Global variables to collect warnings
var warnings []string
var suggestions []string

var status string
var message string
var fix string

// Function to check if UFW is installed
func checkFirewallInstalled() bool {
	_, err := exec.LookPath("ufw")
	if err != nil {
		//fmt.Println("UFW (Uncomplicated Firewall) is not installed.")
		status = "fail"
		message = "UFW (Uncomplicated Firewall) is not installed"
		fix = "sudo apt install ufw"
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
		return false
	}
	return true
}

// Function to check if UFW is enabled
func checkFirewallEnabled() bool {
	output, err := executeCommand("sudo", "ufw", "status")
	if err != nil {
		fmt.Println("Error checking firewall status:", err)
		return false
	}
	if strings.Contains(output, "Status: inactive") {
		//fmt.Println("Firewall is not enabled.")
		status = "fail"
		message = "Firewall is not enabled"
		fix = "use sudo ufw enable"
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
		return false
	}
	//fmt.Println("Firewall is enabled.")
	return true
}

// Function to check the default policies of the firewall
func checkDefaultPolicies() {
	//fmt.Println("\nChecking default firewall policies...")
	output, err := executeCommand("sudo", "ufw", "status", "verbose")
	if err != nil {
		fmt.Println("Error checking default policies:", err)
		return
	}

	if strings.Contains(output, "Default: allow (incoming)") {
		warnings = append(warnings, "Default incoming policy is set to ALLOW. Consider changing it to DENY.")
		suggestions = append(suggestions, "Set the default incoming policy to DENY: sudo ufw default deny incoming")
	}
	if strings.Contains(output, "Default: allow (outgoing)") {
		warnings = append(warnings, "Note: Default outgoing policy is set to ALLOW.")
		suggestions = append(suggestions, "")
	}
}

// Function to check if logging is enabled and its level
func checkLoggingStatus() {
	//fmt.Println("\nChecking firewall logging status...")
	output, err := executeCommand("sudo", "ufw", "status", "verbose")
	if err != nil {
		fmt.Println("Error checking logging status:", err)
		return
	}

	if strings.Contains(output, "Logging: off") {
		warnings = append(warnings, "Firewall logging is disabled.")
		suggestions = append(suggestions, "Enable logging with: sudo ufw logging on")
	} else if strings.Contains(output, "Logging: on (low)") {
		warnings = append(warnings, "Firewall logging level is set to low.")
		suggestions = append(suggestions, "Increase logging level to medium or high: sudo ufw logging medium")
	}
}

// Function to analyze firewall rules for suspicious configurations
func checkFirewallRules() {
	//fmt.Println("\nAnalyzing firewall rules...")
	output, err := executeCommand("sudo", "ufw", "status", "numbered")
	if err != nil {
		fmt.Println("Error retrieving firewall rules:", err)
		return
	}

	lines := strings.Split(output, "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)

		// Check for overly permissive "any-to-any" rules
		if strings.Contains(line, "ALLOW") && strings.Contains(line, "Anywhere") {
			warnings = append(warnings, fmt.Sprintf("Suspicious rule detected: %s", line))
			suggestions = append(suggestions, "Consider restricting 'ALLOW Anywhere' rules to specific IP ranges.")

			// Check for outdated or insecure protocols
		} else if strings.Contains(line, "ALLOW") && (strings.Contains(line, "23") || strings.Contains(line, "21")) {
			warnings = append(warnings, fmt.Sprintf("Insecure protocol detected (Telnet/FTP): %s", line))
			suggestions = append(suggestions, "Replace Telnet/FTP with secure alternatives like SSH/SFTP.")

			// Check for well-known attack ports (e.g., SSH, SMB)
		} else if strings.Contains(line, "ALLOW") && (strings.Contains(line, "22") || strings.Contains(line, "445")) {
			warnings = append(warnings, fmt.Sprintf("Potentially risky open port detected: %s", line))
			suggestions = append(suggestions, "Restrict access to SSH (port 22) or SMB (port 445) to specific IPs.")

			// Check for overly broad IP ranges
		} else if strings.Contains(line, "ALLOW") && strings.Contains(line, "0.0.0.0/0") {
			warnings = append(warnings, fmt.Sprintf("Overly broad IP range detected: %s", line))
			suggestions = append(suggestions, "Limit IP ranges to trusted networks only.")
		}
	}
}

// Function to print a summary with suggestions and warnings
func printSummary() {
	//fmt.Println("\n--- Security Check Summary ---")
	if len(warnings) == 0 {
		fmt.Println("No critical issues detected. Your firewall configuration looks good.")
		status = "success"
		message = "No critical issues detected. Your firewall configuration looks good."
		fix = ""
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	} else {

		for i, warning := range warnings {
			//fmt.Printf("- %s\n", warning)
			status = "warn"
			output_module.PrintOutput(output_module.NewMainOut(status, warning, suggestions[i], modname))
		}
		// fmt.Println("\nSuggestions:")
		// for _, suggestion := range suggestions {
		// 	fmt.Printf("- %s\n", suggestion)
		// }
	}
}

func main() {
	//fmt.Println("Starting firewall security check...")

	// Step 1: Check if UFW is installed
	if !checkFirewallInstalled() {
		return
	}

	// Step 2: Check if the firewall is enabled
	if !checkFirewallEnabled() {
		return
	}

	// Step 3: Check firewall configuration
	checkDefaultPolicies()
	checkLoggingStatus()

	// Step 4: Check firewall rules for potential issues
	checkFirewallRules()

	// Step 5: Print summary
	printSummary()
}
