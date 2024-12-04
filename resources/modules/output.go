package main

import (
	"encoding/json"
	"fmt"
)

// MessageOut represents a message.
type MainOut struct {
	Status  string `json:"status"`   // Either "success", "warn", or "fail"
	Message string `json:"message"`  // Description of the outcome
	Fix     string `json:"fix"`      // Recommended fix or action
	ModName string `json:"mod_name"` // Module name
}

// NewMainOut creates a new standardized output object.
func NewMainOut(status, message, fix, modname string) *MainOut {
	return &MainOut{
		Status:  status,
		Message: message,
		Fix:     fix,
		ModName: modname,
	}
}

// ToJSON converts the MainOut object to JSON format.
func (m *MainOut) ToJSON() (string, error) {
	data, err := json.MarshalIndent(m, "", "  ")
	if err != nil {
		return "", err
	}
	return string(data), nil
}

// Helper function to print the output in JSON format
func PrintOutput(output *MainOut) {
	jsonOutput, err := output.ToJSON()
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	fmt.Println(jsonOutput)
}

// func main() {
// 	printOutput(NewMainOut("success", "Operation completed successfully", "No action needed"))
// }
