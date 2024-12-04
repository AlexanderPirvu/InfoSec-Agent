package main

import (
	"fmt"
	"modules/output_module"
	"os"
	"os/exec"
	"os/user"
	"strings"
)

var status string
var fix string
var modname string

// getCurrentUser retrieves the username of the user running the script.
func getCurrentUser() (string, error) {
	currentUser, err := user.Current()
	if err != nil {
		return "", err
	}
	return currentUser.Username, nil
}

// getExpectedSudoUsers initializes the expected sudo users to include only root and the current user.
func getExpectedSudoUsers() (map[string]bool, error) {
	expectedUsers := make(map[string]bool)

	// Add the root user
	expectedUsers["root"] = true

	// Add the current user running the script
	currentUsername, err := getCurrentUser()
	if err != nil {
		return nil, err
	}
	expectedUsers[currentUsername] = true

	return expectedUsers, nil
}

// executeCommand runs a shell command and returns its output as a string slice.
func executeCommand(command string, args ...string) ([]string, error) {
	cmd := exec.Command(command, args...)
	output, err := cmd.Output()
	if err != nil {
		return nil, err
	}
	return strings.Split(strings.TrimSpace(string(output)), "\n"), nil
}

// getSudoGroupUsers retrieves all users in the sudo group.
func getSudoGroupUsers() ([]string, error) {
	output, err := executeCommand("getent", "group", "sudo")
	if err != nil {
		return nil, err
	}

	if len(output) == 0 {
		return nil, fmt.Errorf("no sudo group found")
	}

	// Parse the sudo group output to extract user names
	parts := strings.Split(output[0], ":")
	if len(parts) < 4 {
		return nil, fmt.Errorf("unexpected format for sudo group output")
	}

	users := strings.Split(parts[3], ",")
	return users, nil
}

func main() {
	modname = "group-permissions"

	// Step 1: Initialize expected sudo users
	expectedUsers, err := getExpectedSudoUsers()
	if err != nil {
		fmt.Printf("Error initializing expected users: %v\n", err)
		os.Exit(1)
	}

	// Step 2: Retrieve current sudo group users
	currentSudoUsers, err := getSudoGroupUsers()
	if err != nil {
		fmt.Printf("Error retrieving sudo group users: %v\n", err)
		os.Exit(1)
	}

	// Step 3: Compare current users with expected users
	//fmt.Println("Checking sudo group permissions...")
	alert := false
	for _, user := range currentSudoUsers {
		if user == "" {
			continue
		}
		if _, exists := expectedUsers[user]; !exists {
			status := "failed"
			message := "Unusual sudo user detected: " + user
			fix := "Consider removing unusual sudo users if they are unauthorized."
			output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
			alert = true
		}
	}

	// Step 4: Print summary
	if !alert {
		status := "success"
		message := "All sudo group users are as expected (root and the current user)."
		fix := ""
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	}
}
