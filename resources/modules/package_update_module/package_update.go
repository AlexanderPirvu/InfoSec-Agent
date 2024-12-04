package main

import (
	"modules/output_module"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
)

var status string
var fix string
var modname string
var message string

func main() {
	modname = "package_update_scanner"
	if runtime.GOOS != "linux" {
		status = "error"
		message := "This script is designed for Linux systems."
		fix = "Run the script on a Linux system."
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
		return
	}

	// Determine package manager
	var cmd *exec.Cmd
	var parser func(string) int
	if isCommandAvailable("apt-get") {
		cmd = exec.Command("apt-get", "-s", "upgrade")
		parser = parseAptGetOutput
		// } else if isCommandAvailable("yum") {
		// 	cmd = exec.Command("yum", "check-update")
		// 	parser = parseYumOutput
		// } else if isCommandAvailable("dnf") {
		// 	cmd = exec.Command("dnf", "check-update")
		// 	parser = parseDnfOutput
		// } else if isCommandAvailable("zypper") {
		// 	cmd = exec.Command("zypper", "list-updates")
		// 	parser = parseZypperOutput
		// } else if isCommandAvailable("pacman") {
		// 	cmd = exec.Command("pacman", "-Qu")
		// 	parser = parsePacmanOutput
	} else {
		status = "error"
		message := "Unsupported package manager or no package manager found."
		fix = "Install a supported package manager."
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
		return
	}

	// Run the command
	output, err := cmd.CombinedOutput()
	if err != nil && cmd.ProcessState.ExitCode() != 100 {
		// Exit code 100 for `yum` and `dnf` means updates are available
		status = "error"
		message := "Error checking updates: " + err.Error()
		fix = "Ensure the package manager is correctly installed and configured."
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
		return
	}

	// Parse output
	updateCount := parser(string(output))

	// Output results in JSON
	if updateCount > 0 {
		status = "warning"
		message := "Available packages for updating: " + strconv.Itoa(updateCount)
		fix = "Run the appropriate package manager's update command to install updates."

		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))

	} else {
		status = "success"
		message = "No packages are available for updating."
		fix = ""

		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	}

}

// Helper to check if a command exists
func isCommandAvailable(name string) bool {
	_, err := exec.LookPath(name)
	return err == nil
}

// Parse output for apt-get
func parseAptGetOutput(output string) int {
	lines := strings.Split(output, "\n")
	count := 0
	for _, line := range lines {
		if strings.HasPrefix(line, "Inst ") {
			count++
		}
	}
	return count
}

// Parse output for yum
// func parseYumOutput(output string) int {
// 	lines := strings.Split(output, "\n")
// 	count := 0
// 	for _, line := range lines {
// 		if strings.TrimSpace(line) != "" && !strings.HasPrefix(line, "Loaded plugins") && !strings.HasPrefix(line, "Last metadata expiration") {
// 			count++
// 		}
// 	}
// 	return count
// }

// // Parse output for dnf
// func parseDnfOutput(output string) int {
// 	return parseYumOutput(output) // Same format as `yum`
// }

// // Parse output for zypper
// func parseZypperOutput(output string) int {
// 	lines := strings.Split(output, "\n")
// 	count := 0
// 	for _, line := range lines {
// 		if strings.HasPrefix(line, "v ") || strings.HasPrefix(line, " ") {
// 			count++
// 		}
// 	}
// 	return count
// }

// // Parse output for pacman
// func parsePacmanOutput(output string) int {
// 	lines := strings.Split(output, "\n")
// 	return len(lines) - 1 // Each line represents a package
// }
