package main

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
	"strings"
)

type PasswordPolicy struct {
	MinLength        int
	MinDaysBetween   int
	RequireUpperCase bool
	RequireLowerCase bool
	RequireDigit     bool
	RequireSpecial   bool
}

func parseLoginDefs(policy *PasswordPolicy) {
	file, err := os.Open("/etc/login.defs")
	if err != nil {
		fmt.Println("Could not open /etc/login.defs:", err)
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		fields := strings.Fields(line)
		if len(fields) < 2 || strings.HasPrefix(fields[0], "#") {
			continue
		}

		switch fields[0] {
		case "PASS_MIN_LEN":
			minLength, _ := strconv.Atoi(fields[1])
			policy.MinLength = minLength
		case "PASS_MIN_DAYS":
			minDays, _ := strconv.Atoi(fields[1])
			policy.MinDaysBetween = minDays
		}
	}
}

func parsePwQuality(policy *PasswordPolicy) {
	file, err := os.Open("/etc/security/pwquality.conf")
	if err != nil {
		fmt.Println("Could not open /etc/security/pwquality.conf:", err)
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		line = strings.TrimSpace(line) // Remove any surrounding whitespace
		if len(line) == 0 || strings.HasPrefix(line, "#") {
			continue // Skip empty lines and comments
		}

		parts := strings.SplitN(line, "=", 2) // Split at the first '=' sign
		if len(parts) < 2 {
			continue // Skip lines that don’t contain key-value pairs
		}

		key := strings.TrimSpace(parts[0])
		value := strings.TrimSpace(parts[1])

		// fmt.Printf("Processing key: %s, value: %s\n", key, value) // Debug log

		switch key {
		case "minlen":
			minLength, _ := strconv.Atoi(value)
			if minLength > policy.MinLength {
				policy.MinLength = minLength
			}
		case "dcredit":
			if value == "-1" {
				policy.RequireDigit = true
			}
		case "ucredit":
			if value == "-1" {
				policy.RequireUpperCase = true
			}
		case "lcredit":
			if value == "-1" {
				policy.RequireLowerCase = true
			}
		case "ocredit":
			if value == "-1" {
				policy.RequireSpecial = true
			}
		}
	}

	if err := scanner.Err(); err != nil {
		fmt.Println("Error reading file:", err)
	}
}

// The policies can be customized from here

func evaluatePolicy(policy *PasswordPolicy) string {
	if policy.MinLength >= 12 &&
		policy.RequireUpperCase &&
		policy.RequireLowerCase &&
		policy.RequireDigit &&
		policy.RequireSpecial &&
		policy.MinDaysBetween >= 1 {
		return "Password policy is strong."
	}
	return "Password policy is weak."
}

func main() {
	policy := &PasswordPolicy{}

	parseLoginDefs(policy)
	parsePwQuality(policy)

	fmt.Printf("Password Policy:\n")
	fmt.Printf("Minimum Length: %d\n", policy.MinLength)
	fmt.Printf("Minimum Days Between Password Changes: %d\n", policy.MinDaysBetween)
	fmt.Printf("Require Uppercase: %v\n", policy.RequireUpperCase)
	fmt.Printf("Require Lowercase: %v\n", policy.RequireLowerCase)
	fmt.Printf("Require Digit: %v\n", policy.RequireDigit)
	fmt.Printf("Require Special Character: %v\n", policy.RequireSpecial)

	fmt.Println(evaluatePolicy(policy))
}
