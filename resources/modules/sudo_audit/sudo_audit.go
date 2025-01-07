package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"modules/output_module"
)

const (
        modname = "sudo_audit" //name of the module
)

var status string
var message string
var fix string

func main() {
	// Check if the script is running with sudo privileges
	if os.Geteuid() != 0 {
		fmt.Println("This script must be run as root (with sudo).")
		return
	}
	checkSudoersFile("/etc/sudoers") // Check the sudoers file first
	checkSudoersDirectory("/etc/sudoers.d") // Check the sudoers.d directory
}

func checkSudoersFile(sudoersFile string) {
	file, err := os.ReadFile(sudoersFile)
	if err != nil {
		fmt.Printf("Error reading %s: %s\n", sudoersFile, err)
		return
	}

	lines := strings.Split(string(file), "\n")

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		if strings.Contains(line, "(ALL : ALL) ALL") {
                        user := getUserFromLine(line)
                        status = "fail"
			if strings.Contains(user, "%"){
				message = fmt.Sprintf("The group '%s' can execute all commands from any user and group.", user)
			} else {
				message = fmt.Sprintf("The user '%s' can execute all commands from any user and group.", user)
        		}
	                fix = "Limit the permissions to only strictly neccessary."
                        output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
                        fmt.Println("The user is based.")
                } else if strings.Contains(line, "(ALL) ALL"){
			user := getUserFromLine(line)
                        status = "fail"
                        if strings.Contains(user, "%"){
                                message = fmt.Sprintf("The group '%s' can execute all commands from any user.", user)
                        } else {
                                message = fmt.Sprintf("The user '%s' can execute all commands from any user.", user)
                        }
			fix = "Limit the permissions to only strictly neccessary."
                        output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
                        //fmt.Println("The user has sudo access to one or more commands.")
                } else if strings.Contains(line, "ALL"){
			user := getUserFromLine(line)
                        status = "fail"
                        if strings.Contains(user, "%"){
                                message = fmt.Sprintf("The group '%s' can execute all commands.", user)
                        } else {
                                message = fmt.Sprintf("The user '%s' can execute all commands.", user)
                        }
                        fix = "Limit the permissions to only strictly neccessary."
                        output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
                        //fmt.Println("The user has sudo access to one or more commands.")
                } else if strings.Contains(line, "may run the following commands"){
			user := getUserFromLine(line)
                        status = "warn"
                        if strings.Contains(user, "%"){
                                message = fmt.Sprintf("The group '%s' can execute one or more commands.", user)
                        } else {
                                message = fmt.Sprintf("The user '%s' can execute one or more commands.", user)
                        }
                        fix = "Check if access is needed for these commands."
                        output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
                }
                if strings.Contains(line, "NOPASSWD") {
                        user := getUserFromLine(line)
			status = "fail"
                        if strings.Contains(user, "%"){
                                message = fmt.Sprintf("The group '%s' can execute commands without password.", user)
                        } else {
                                message = fmt.Sprintf("The user '%s' can execute commands without password.", user)
                        }
                        fix = "Check if passwordless access is needed for these commands."
                        output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
                }
	}
}

func checkSudoersDirectory(sudoersDir string) {
	files, err := os.ReadDir(sudoersDir)
	if err != nil {
		fmt.Printf("Error reading directory %s: %s\n", sudoersDir, err)
		return
	}

	for _, file := range files {
		if file.IsDir() {
			continue
		}

		filePath := filepath.Join(sudoersDir, file.Name())
		fileContent, err := os.ReadFile(filePath)
		if err != nil {
			fmt.Printf("Error reading file %s: %s\n", filePath, err)
			continue
		}

		lines := strings.Split(string(fileContent), "\n")

		for _, line := range lines {
			line = strings.TrimSpace(line)
			if line == "" || strings.HasPrefix(line, "#") {
				continue
			}
			if strings.Contains(line, "(ALL : ALL) ALL") {
				user := getUserFromLine(line)
				status = "fail"
                		if strings.Contains(user, "%"){
                                	message = fmt.Sprintf("The group '%s' can execute all commands from any user and group.", user)
                        	} else {
                                	message = fmt.Sprintf("The user '%s' can execute all commands from any user and group.", user)
                        	}
                		fix = "Limit the  permissions to only strictly neccessary."
                		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
                		//fmt.Println("The user is based.")
        		} else if strings.Contains(line, "(ALL) ALL"){
				user := getUserFromLine(line)
                		status = "fail"
                		if strings.Contains(user, "%"){
                                        message = fmt.Sprintf("The group '%s' can execute all commands from any user.", user)
                                } else {
                                        message = fmt.Sprintf("The user '%s' can execute all commands from any user.", user)
                                }
				fix = "Limit the permissions to only strictly neccessary."
                		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
                		//fmt.Println("The user has sudo access to one or more commands.")
        		} else if strings.Contains(line, "ALL"){
				user := getUserFromLine(line)
                		status = "fail"
                		if strings.Contains(user, "%"){
                                        message = fmt.Sprintf("The group '%s' can execute all commands.", user)
                                } else {
                                        message = fmt.Sprintf("The user '%s' can execute all commands.", user)
                                }
                		fix = "Limit the permissions to only strictly neccessary."
                		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
                		//fmt.Println("The user has sudo access to one or more commands.")
        		} else if strings.Contains(line, "may run the following commands"){
				user := getUserFromLine(line)
                		status = "warn"
                		if strings.Contains(user, "%"){
                                        message = fmt.Sprintf("The group '%s' can execute one or more commands.", user)
                                } else {
                                        message = fmt.Sprintf("The user '%s' can execute one or more commands.", user)
                                }
                		fix = "Check if access is needed for these commands."
                		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
       			}
			if strings.Contains(line, "NOPASSWD") {
				user := getUserFromLine(line)
				status = "fail"
                	        if strings.Contains(user, "%"){
                                        message = fmt.Sprintf("The group '%s' can execute commands without password", user)
                                } else {
                                        message = fmt.Sprintf("The user '%s' can execute commands without password", user)
                                }
        	                fix = "Check if passwordless access is needs for these commands."
	                        output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
			}
		}
	}
}

func getUserFromLine(line string) string {
	// Extract the user from the sudoers line (assuming the format is like "username ALL=(ALL) ALL")
	parts := strings.Fields(line)
	if len(parts) > 0 {
		return parts[0]
	}
	return ""
}
