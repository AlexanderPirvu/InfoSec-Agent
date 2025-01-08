package main

import (
	"bufio"
//	"encoding/json"
	"fmt"
//	"io/ioutil"
//	"log"
	"os"
	"os/exec"
//	"regexp"
//	"strconv"
	"strings"
//	"time"
	"modules/output_module"
)

const (
        modname = "cis_benchmarks" //name of the module
)

var status string
var message string
var fix string

/*func main() {
        // Check if the script is running with sudo privileges
        if os.Geteuid() != 0 {
                fmt.Println("This script must be run as root (with sudo).")
                return
        }

}*/

// runCommand runs a shell command and returns the output
func runCommand(command string) (string, error) {
	cmd := exec.Command("sh", "-c", command)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("error running command: %v, output: %s", err, output)
	}
	return string(output), nil
}

// checkMountOptions checks mount options for a given partition
func checkMountOptions(partition string) {
	mounts, err := os.ReadFile("/proc/mounts")
	if err != nil {
		/**results = append(*results, CISResult{
			BenchmarkID:    "1.1.X",
			Status:         "fail",
			Finding:        fmt.Sprintf("Error reading /proc/mounts: %v", err),
			Recommendation: "Check system permissions and integrity.",
		})**/
		fmt.Printf("Error reading /proc/mounts: %v", err)
		return
	}

	partitionFound := false
	for _, line := range strings.Split(string(mounts), "\n") {
		fields := strings.Fields(line)
		if len(fields) < 4 {
			continue
		}
		if fields[1] == partition {
			partitionFound = true
			options := strings.Split(fields[3], ",")
			checkMountOption(options, "noexec", "1.1.2", partition)
			checkMountOption(options, "nodev", "1.1.3", partition)
			checkMountOption(options, "nosuid", "1.1.4", partition)
			break // Assuming only one entry per partition
		}
	}

	if !partitionFound {
		/*results = append(*results, CISResult{
			BenchmarkID:    "1.1.X",
			Status:         "warn",
			Finding:        fmt.Sprintf("Partition %s not found in /proc/mounts", partition),
			Recommendation: "Ensure the partition is mounted if it is expected to be.",
		})*/
		status = "warn"
		message = fmt.Sprintf("Parition %s not found in /proc/mounts", partition)
	}
}

// checkMountOption verifies if a specific option is set and updates results
func checkMountOption(options []string, option, benchmarkID, partition string) {
	for _, opt := range options {
		if opt == option {
			status = "success"
			message = fmt.Sprintf("Option '%s' is set for partition %s", option, partition)
			fix = ""
			output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
			/*results = append(*results, CISResult{
				BenchmarkID:    benchmarkID,
				Status:         "pass",
				Finding:        fmt.Sprintf("Option '%s' is set for partition %s", option, partition),
			})*/
			return
		}
	}
	status = "fail"
	message = fmt.Sprintf("Option '%s' not set for partition %s", option, partition)
	fix = fmt.Sprintf("Add '%s' option to the mount entry for %s in /etc/fstab", option, partition)
	output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	/*results = append(*results, CISResult{
		BenchmarkID:    benchmarkID,
		Status:         "fail",
		Finding:        fmt.Sprintf("Option '%s' not set for partition %s", option, partition),
		Recommendation: fmt.Sprintf("Add '%s' option to the mount entry for %s in /etc/fstab", option, partition),
	})*/
}

// Helper function to check permissions and ownership
func checkFilePermissions(path string, expectedPerms os.FileMode, expectedOwner, expectedGroup string, benchmarkID string) {
	fileInfo, err := os.Stat(path)
	if err != nil {
		/*results = append(*results, CISResult{
			BenchmarkID:    benchmarkID,
			Status:         "fail",
			Finding:        fmt.Sprintf("Error stating file %s: %v", path, err),
			Recommendation: "Verify the file exists and has appropriate permissions.",
		})*/
		fmt.Printf("Error stating file %s: %v", path, err)
		return
	}

	actualPerms := fileInfo.Mode() & os.ModePerm
	if actualPerms == expectedPerms {
		/*results = append(*results, CISResult{
			BenchmarkID:    benchmarkID,
			Status:         "pass",
			Finding:        fmt.Sprintf("Permissions on %s are correctly set to %o", path, expectedPerms),
		})*/
		status = "success"
		message = fmt.Sprintf("Permissions on %s are correctly set to %o", path, expectedPerms)
		fix = ""
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	} else {
		/*results = append(*results, CISResult{
			BenchmarkID:    benchmarkID,
			Status:         "fail",
			Finding:        fmt.Sprintf("Incorrect permissions on %s. Expected %o, got %o", path, expectedPerms, actualPerms),
			Recommendation: fmt.Sprintf("Set permissions on %s to %o", path, expectedPerms),
		})*/
		status = "fail"
		message = fmt.Sprintf("Incorrect permissions on %s. Expected %o, got %o", path, expectedPerms, actualPerms)
		fix = fmt.Sprintf("Set permissions on %s to %o", path, expectedPerms)
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	}

	// Ownership check - Consider adding a more robust check using syscall.Stat_t if needed
}

// checkFstabEntry ensures each fstab entry is valid and meets requirements
func checkFstabEntry(line string) {
	fields := strings.Fields(line)
	if len(fields) != 6 {
		/*results = append(*results, CISResult{
			BenchmarkID:    "1.1.X",
			Status:         "fail",
			Finding:        "Invalid fstab entry",
			Recommendation: "Review and correct the fstab entry",
		})*/
		status = "fail"
		message = "Invalid fstab entry"
		fix = "Review and correct the fstab entry"
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
		return
	}
	// basic validation for now
	if !strings.HasPrefix(fields[0], "/") && !strings.HasPrefix(fields[0], "UUID=") {
		/*results = append(*results, CISResult{
			BenchmarkID:    "1.1.X",
			Status:         "fail",
			Finding:        "Device specifier is invalid",
			Recommendation: "Ensure device is specified by absolute path or UUID",
		})*/
		status = "fail"
		message = "Device specifier is invalid"
		fix = "Ensure device is specified by absolute path or UUID"
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
		return
	}

	if !strings.HasPrefix(fields[1], "/") {
		/*results = append(*results, CISResult{
			BenchmarkID:    "1.1.X",
			Status:         "fail",
			Finding:        "Mount point is invalid",
			Recommendation: "Ensure mount point is an absolute path",
		})*/
		status = "fail"
		message = "Mount point is invalid"
		fix = "Ensure mount point is an absolute path"
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
		return
	}
}

// checkPartitioning checks for the existence of specific partitions
func checkPartitioning() {
	requiredPartitions := []string{"/tmp", "/var", "/var/tmp", "/var/log", "/var/log/audit", "/home"}
	for _, partition := range requiredPartitions {
		checkPartitionExists(partition)
	}
}

// checkPartitionExists checks if a partition exists and adds a success result if it does
func checkPartitionExists(partition string) {
	mounts, err := os.ReadFile("/proc/mounts")
	if err != nil {
		/*results = append(*results, CISResult{
			BenchmarkID:    "1.1.X",
			Status:         "fail",
			Finding:        fmt.Sprintf("Error reading /proc/mounts: %v", err),
			Recommendation: "Check system permissions and integrity.",
		})*/
		fmt.Printf("Error reading /proc/mounts", err)
		return
	}

	for _, line := range strings.Split(string(mounts), "\n") {
		fields := strings.Fields(line)
		if len(fields) >= 2 && fields[1] == partition {
			/*results = append(*results, CISResult{
				BenchmarkID: "1.1.1", // Using 1.1.1 as a general benchmark for partition existence
				Status:      "pass",
				Finding:     fmt.Sprintf("Partition %s exists", partition),
			})*/
			status = "success"
			message = fmt.Sprintf("Partition %s exists", partition)
			fix = ""
			output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
			return // Partition found
		}
	}
	status = "fail"
	message = fmt.Sprintf("Partition %s not found", partition)
	fix = fmt.Sprintf("Create a separate partition for %s", partition)
	output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	/*results = append(*results, CISResult{
		BenchmarkID:    "1.1.1", // Update with specific benchmark ID if needed
		Status:         "fail",
		Finding:        fmt.Sprintf("Partition %s not found", partition),
		Recommendation: fmt.Sprintf("Create a separate partition for %s", partition),
	})*/
}

// checkWorldWritableFiles checks for world-writable files
func checkWorldWritableFiles() {
	// Using `find` command to find world-writable files
	command := "find / -xdev -type d \\( -perm -0002 -a ! -perm -1000 \\) -print"
	output, err := runCommand(command)
	if err != nil {
		/*results = append(*results, CISResult{
			BenchmarkID:    "5.2.11",
			Status:         "fail",
			Finding:        fmt.Sprintf("Error finding world-writable files: %v", err),
			Recommendation: "Check system permissions and integrity.",
		})*/
		//fmt.Printf("Error finding world-writable files: %v", err) - mby make into success or fail msg
		return
	}

	if output != "" {
		for _, line := range strings.Split(output, "\n") {
			if line != "" {
				/*results = append(*results, CISResult{
					BenchmarkID:    "5.2.11",
					Status:         "fail",
					Finding:        fmt.Sprintf("World-writable file found: %s", line),
					Recommendation: "Remove world-writable permission from the file.",
				})*/
				status = "fail"
				message = fmt.Sprintf("World-writable file found: %s", line)
				fix = "Remove world-writable permission from the file."
				output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
			}
		}
	} else {
		/*results = append(*results, CISResult{
			BenchmarkID:    "5.2.11",
			Status:         "pass",
			Finding:        "No world-writable files found.",
		})*/
		status = "success"
		message = "No world-writable files found"
		fix = ""
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	}
}

// checkUnownedFiles checks for un-owned files
func checkUnownedFiles() {
	// Using `find` command to find un-owned files
	command := "find / -xdev \\( -nouser -o -nogroup \\) -print"
	output, err := runCommand(command)
	if err != nil {
		/*results = append(*results, CISResult{
			BenchmarkID:    "5.2.12",
			Status:         "fail",
			Finding:        fmt.Sprintf("Error finding un-owned files: %v", err),
			Recommendation: "Check system permissions and integrity.",
		})*/
		//fmt.Printf("Error finding un-owned files: %v", err) - mby make into success or fail msg
		return
	}

	if output != "" {
		for _, line := range strings.Split(output, "\n") {
			if line != "" {
				/*results = append(*results, CISResult{
					BenchmarkID:    "5.2.12",
					Status:         "fail",
					Finding:        fmt.Sprintf("Un-owned file found: %s", line),
					Recommendation: "Set ownership of the file.",
				})*/
				status = "fail"
				message = fmt.Sprintf("Un-owned file found: %s", line)
				fix = "Set ownership of the file."
			}
		}
	} else {
		status = "success"
		message = "No un-owned files found."
		/*results = append(*results, CISResult{
			BenchmarkID:    "5.2.12",
			Status:         "pass",
			Finding:        "No un-owned files found.",
		})*/
	}
}

// checkSUIDFiles checks for files with SUID/SGID set
func checkSUIDFiles() {
	command := `find / -xdev \( -perm -4000 -o -perm -2000 \) -type f -print`
	output, err := runCommand(command)

	if err != nil {
		/*results = append(*results, CISResult{
			BenchmarkID:    "1.1.22",
			Status:         "fail",
			Finding:        fmt.Sprintf("Error finding SUID/SGID files: %v", err),
			Recommendation: "Check system permissions and integrity.",
		})*/
		//fmt.Printf("Error finding SUID/SGID files: %v", err) - mby make into success or fail msg
		return
	}

	if output != "" {
		for _, line := range strings.Split(output, "\n") {
			if line != "" {
				/*results = append(*results, CISResult{
					BenchmarkID:    "1.1.22",
					Status:         "warn",
					Finding:        fmt.Sprintf("SUID/SGID file found: %s", line),
					Recommendation: "Review the necessity of SUID/SGID bit on this file and remove it if not needed.",
				})*/
				status = "warn"
				message = fmt.Sprintf("SUID/SGID file found: %s", line)
				fix = "Review the necessity of SUID/SGID bit on this file and remove it if not needed."
				output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
			}
		}
	} else {
		/*results = append(*results, CISResult{
			BenchmarkID:    "1.1.22",
			Status:         "pass",
			Finding:        "No SUID/SGID files found.",
		})*/
		status = "success"
		message = "No SUID/SGID files found"
		fix = ""
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	}
}

// Check for presence of core dumps
func checkCoreDumps() {
	// Check if core dumps are enabled
	output, err := runCommand("ulimit -c")
	if err != nil {
		/*results = append(*results, CISResult{
			BenchmarkID:    "1.1.23",
			Status:         "fail",
			Finding:        fmt.Sprintf("Error checking core dump status: %v", err),
			Recommendation: "Check system permissions and integrity.",
		})*/
		fmt.Printf("Error checking core dump status: %v", err)
		return
	}

	// Check if core dumps are restricted
	corePattern, err := os.ReadFile("/proc/sys/kernel/core_pattern")
	if err != nil {
		/*results = append(*results, CISResult{
			BenchmarkID:    "1.1.23",
			Status:         "fail",
			Finding:        fmt.Sprintf("Error reading core_pattern: %v", err),
			Recommendation: "Check system permissions and integrity.",
		})*/
		fmt.Printf("Error reading core_patterns: %v, err")
		return
	}

	// Remove leading/trailing whitespace and newline characters
	corePatternStr := strings.TrimSpace(string(corePattern))

	// Check if the output is not "0" (unlimited)
	if output != "" && strings.TrimSpace(output) != "0" {
		/*results = append(*results, CISResult{
			BenchmarkID:    "1.1.23",
			Status:         "fail",
			Finding:        "Core dumps are enabled.",
			Recommendation: "Disable core dumps or restrict them to a specific directory.",
		})*/
		status = "fail"
		message = "Core dumps are enabled"
		fix = "Disable core dumps or restrict them to a specific dorectory"
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	} else if !strings.HasPrefix(corePatternStr, "|") {
		// Check if core_pattern does not start with "|"
		/*results = append(*results, CISResult{
			BenchmarkID:    "1.1.23",
			Status:         "fail",
			Finding:        "Core dumps are not restricted.",
			Recommendation: "Restrict core dumps to a specific directory by setting a core_pattern.",
		})*/
		status = "fail"
		message = "Core dumps are not restricted"
		fix = "Restrict core dumps to a specific directory by setting a core_pattern"
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	} else {
		/*results = append(*results, CISResult{
			BenchmarkID:    "1.1.23",
			Status:         "pass",
			Finding:        "Core dumps are disabled or restricted.",
		})*/
		status = "success"
		message = "Core dumps are disabled or restricted"
		fix = ""
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	}
}

// CIS 2.1
// checkServiceStatus checks if a service is enabled and running
func checkServiceStatus(serviceName, benchmarkID string, shouldBeRunning bool) {
	// Check if the service is enabled
	enabledOutput, err := runCommand(fmt.Sprintf("systemctl is-enabled %s", serviceName))
	if err != nil {
		/*results = append(*results, CISResult{
			BenchmarkID:    benchmarkID,
			Status:         "fail",
			Finding:        fmt.Sprintf("Error checking if service %s is enabled: %v", serviceName, err),
			Recommendation: "Check systemd service status.",
		})*/
		fmt.Printf("Error checking if service %s is enabled: %v", serviceName, err)
		return
	}

	// Check if the service is active
	statusOutput, err := runCommand(fmt.Sprintf("systemctl is-active %s", serviceName))
	if err != nil {
		/*results = append(*results, CISResult{
			BenchmarkID:    benchmarkID,
			Status:         "fail",
			Finding:        fmt.Sprintf("Error checking if service %s is active: %v", serviceName, err),
			Recommendation: "Check systemd service status.",
		})*/
		fmt.Printf("Error checking if service %s is active: %v", serviceName, err)
		return
	}

	enabled := strings.TrimSpace(enabledOutput) == "enabled"
	active := strings.TrimSpace(statusOutput) == "active"

	if shouldBeRunning {
		if enabled && active {
			/*results = append(*results, CISResult{
				BenchmarkID:    benchmarkID,
				Status:         "pass",
				Finding:        fmt.Sprintf("Service %s is enabled and running", serviceName),
			})*/
			status = "success"
			message = fmt.Sprintf("Service %s is enabled and running", serviceName)
			fix = ""
			output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
		} else if !enabled {
			/*results = append(*results, CISResult{
				BenchmarkID:    benchmarkID,
				Status:         "fail",
				Finding:        fmt.Sprintf("Service %s is not enabled", serviceName),
				Recommendation: fmt.Sprintf("Enable service %s if it should be running", serviceName),
			})*/
			status = "fail"
			message = fmt.Sprintf("Service %s is not enabled", serviceName)
			fix = fmt.Sprintf("Enable service %s if it should be running <sudo systemctl enable %s>", serviceName, serviceName)
			output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
		} else {
			/*results = append(*results, CISResult{
				BenchmarkID:    benchmarkID,
				Status:         "fail",
				Finding:        fmt.Sprintf("Service %s is not running", serviceName),
				Recommendation: fmt.Sprintf("Start and enable service %s if it should be running", serviceName),
			})*/
			status = "fail"
			message = fmt.Sprintf("Service %s us not running", serviceName)
			fix = fmt.Sprintf("Start and enable service %s if it should be running <sudo systemctl start %S>", serviceName, serviceName)
			output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
		}
	} else {
		if !enabled {
			/*results = append(*results, CISResult{
				BenchmarkID:    benchmarkID,
				Status:         "pass",
				Finding:        fmt.Sprintf("Service %s is disabled", serviceName),
			})*/
			status = "success"
			message = fmt.Sprintf("Service %s is disabled", serviceName)
			fix = ""
			output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
		} else if enabled && !active {
			/*results = append(*results, CISResult{
				BenchmarkID:    benchmarkID,
				Status:         "warn",
				Finding:        fmt.Sprintf("Service %s is enabled but not running", serviceName),
				Recommendation: fmt.Sprintf("Disable service %s or investigate why it's not running", serviceName),
			})*/
			status = "warn"
			message = fmt.Sprintf("Service %s us enabled but not running", serviceName)
			fix = fmt.Sprintf("Disable service %s or investigate why it's not running", serviceName)
			output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
		} else {
			/*results = append(*results, CISResult{
				BenchmarkID:    benchmarkID,
				Status:         "fail",
				Finding:        fmt.Sprintf("Service %s is enabled and running", serviceName),
				Recommendation: fmt.Sprintf("Disable service %s", serviceName),
			})*/
			status = "fail"
			message = fmt.Sprintf("Service %s is enabled and running", serviceName)
			fix = fmt.Sprintf("Disable service %s", serviceName)
			output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
		}
	}
}

// checkLegacyService ensures legacy service is not enabled
func checkLegacyService(serviceName string) {
	// Check if the service is installed
	_, err := runCommand(fmt.Sprintf("which %s", serviceName))
	if err != nil {
		/*results = append(*results, CISResult{
			BenchmarkID:    "2.1.1",
			Status:         "info",
			Finding:        fmt.Sprintf("Legacy service %s is not installed on this system.", serviceName),
			Recommendation: fmt.Sprintf("Ensure legacy service %s is not installed.", serviceName),
		})*/
		fmt.Printf("Legacy service %s is not installed on this system", serviceName)
		return
	}

	// Check if the service is enabled
	enabledOutput, err := runCommand(fmt.Sprintf("systemctl is-enabled %s", serviceName))
	if err != nil {
		/*results = append(*results, CISResult{
			BenchmarkID:    "2.1.1",
			Status:         "fail",
			Finding:        fmt.Sprintf("Error checking if service %s is enabled: %v", serviceName, err),
			Recommendation: "Check systemd service status.",
		})*/
		fmt.Printf("Error checking if service %s is enabled: %v", serviceName, err)
		return
	}

	if strings.TrimSpace(enabledOutput) == "enabled" {
		/*results = append(*results, CISResult{
			BenchmarkID:    "2.1.1",
			Status:         "fail",
			Finding:        fmt.Sprintf("Legacy service %s is enabled", serviceName),
			Recommendation: fmt.Sprintf("Disable service %s", serviceName),
		})*/
		status = "fail"
		message = fmt.Sprintf("Legacy service %s is enabled", serviceName)
		fix = fmt.Sprintf("Disable service %s", serviceName)
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	} else {
		/*results = append(*results, CISResult{
			BenchmarkID:    "2.1.1",
			Status:         "pass",
			Finding:        fmt.Sprintf("Legacy service %s is not enabled", serviceName),
		})*/
		status = "success"
		message = fmt.Sprintf("Legacy service %s is not enabled", serviceName)
		fix = ""
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	}
}

// CIS 3.1
// checkIPForwarding checks if IP forwarding is disabled
func checkIPForwarding() {
	// Read the value from the sysctl configuration
	data, err := os.ReadFile("/proc/sys/net/ipv4/ip_forward")
	if err != nil {
		/*results = append(*results, CISResult{
			BenchmarkID:    "3.1.1",
			Status:         "fail",
			Finding:        fmt.Sprintf("Error reading /proc/sys/net/ipv4/ip_forward: %v", err),
			Recommendation: "Check system permissions and integrity.",
		})*/
		fmt.Printf("Error reading /proc/sys/net/ipv4/ip_forward: %v", err)
		return
	}

	// Convert the value to a string and trim whitespace
	value := strings.TrimSpace(string(data))

	// Check if IP forwarding is disabled
	if value == "0" {
		/*results = append(*results, CISResult{
			BenchmarkID:    "3.1.1",
			Status:         "pass",
			Finding:        "IP forwarding is disabled",
		})*/
		status = "success"
		message = "IP forwarding is disabled"
		fix = ""
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	} else {
		/*results = append(*results, CISResult{
			BenchmarkID:    "3.1.1",
			Status:         "fail",
			Finding:        "IP forwarding is enabled",
			Recommendation: "Set net.ipv4.ip_forward = 0 in /etc/sysctl.conf and run sysctl -p",
		})*/
		status = "fail"
		message = "IP forwarding is enabled"
		fix = "Set net.ipv4.ip_forward = 0 in /etc/sysctl.conf and run sysctl -p unless it is needed"
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	}
}

// checkPacketRedirectSending checks if packet redirect sending is disabled
func checkPacketRedirectSending() {
	// Read the value from the sysctl configuration
	data, err := os.ReadFile("/proc/sys/net/ipv4/conf/all/send_redirects")
	if err != nil {
		/*results = append(*results, CISResult{
			BenchmarkID:    "3.1.2",
			Status:         "fail",
			Finding:        fmt.Sprintf("Error reading /proc/sys/net/ipv4/conf/all/send_redirects: %v", err),
			Recommendation: "Check system permissions and integrity.",
		})*/
		fmt.Printf("Error reading /proc/sys/net/ipv4/conf/all/send_redirects: %v", err)
		return
	}

	// Convert the value to a string and trim whitespace
	value := strings.TrimSpace(string(data))

	// Check if packet redirect sending is disabled
	if value == "0" {
		/*results = append(*results, CISResult{
			BenchmarkID:    "3.1.2",
			Status:         "pass",
			Finding:        "Packet redirect sending is disabled",
		})*/
		status = "success"
		message = "Packet redirect sending is disabled"
		fix = ""
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	} else {
		/*results = append(*results, CISResult{
			BenchmarkID:    "3.1.2",
			Status:         "fail",
			Finding:        "Packet redirect sending is enabled",
			Recommendation: "Set net.ipv4.conf.all.send_redirects = 0 in /etc/sysctl.conf and run sysctl -p",
		})*/
		status = "fail"
		message = "Packet redirect sending is enabled"
		fix = "Set net.ipv4.conf.all.send_redirects = 0 in /etc/sysctl.conf and run sysctl -p"
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	}
}

// CIS 3.7
// checkGPGInstalled checks if GPG is installed
func checkGPGInstalled() {
	_, err := exec.LookPath("gpg")
	if err != nil {
		/*results = append(*results, CISResult{
			BenchmarkID:    "3.7.1",
			Status:         "fail",
			Finding:        "GPG is not installed",
			Recommendation: "Install GPG using: apt install gnupg",
		})*/
		status = "fail"
		message = "GPG is not installed"
		fix = "Install GPG"
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	} else {
		/*results = append(*results, CISResult{
			BenchmarkID:    "3.7.1",
			Status:         "pass",
			Finding:        "GPG is installed",
		})*/
		status = "success"
		message = "GPG is installed"
		fix = ""
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	}
}

// checkGPGKeyConfigured checks if system-wide GPG keys are configured
func checkGPGKeyConfigured() {
	// Check for the existence of a common GPG keyring directory
	if _, err := os.Stat("/etc/apt/trusted.gpg.d"); os.IsNotExist(err) {
		/*results = append(*results, CISResult{
			BenchmarkID:    "3.7.2",
			Status:         "warn",
			Finding:        "System-wide GPG keyring directory (/etc/apt/trusted.gpg.d) does not exist",
			Recommendation: "Configure system-wide GPG keys as per organizational policy",
		})*/
		status = "warn"
		message = "System-wide GPG keyring directory (/etc/apt/truested.gpg.d) does not exist"
		fix = "Configure system-wide GPG keys"
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	} else {
		/*results = append(*results, CISResult{
			BenchmarkID:    "3.7.2",
			Status:         "info",
			Finding:        "System-wide GPG keyring directory (/etc/apt/trusted.gpg.d) exists",
		})*/
		status = "success"
		message = "System-wide GPG keyring directory (/etc/apt/trusted.gpg.d) exists"
		fix = ""
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	}
}

// checkCryptoPreferredHashes checks if preferred hashes are configured correctly in gpg.conf
func checkCryptoPreferredHashes() {
	output, err := runCommand("gpg --version | grep -i 'pubkey' | cut -d: -f2")
	if err != nil {
		/*results = append(*results, CISResult{
			BenchmarkID:    "3.7.3",
			Status:         "fail",
			Finding:        fmt.Sprintf("Error checking preferred hashes using gpg: %v", err),
			Recommendation: "Check GPG installation and configuration.",
		})*/
		fmt.Printf("Error checking preferred hashes using gpg: %v", err)
		return
	}

	preferredHashAlgos := strings.Split(strings.TrimSpace(output), ",")

	recommendedAlgos := []string{"SHA512", "SHA384", "SHA256"}
	var missingAlgos []string

	for _, recommended := range recommendedAlgos {
		found := false
		for _, algo := range preferredHashAlgos {
			if strings.TrimSpace(algo) == recommended {
				found = true
				break
			}
		}
		if !found {
			missingAlgos = append(missingAlgos, recommended)
		}
	}

	if len(missingAlgos) == 0 {
		/*results = append(*results, CISResult{
			BenchmarkID:    "3.7.3",
			Status:         "pass",
			Finding:        "System-wide cryptographically preferred hashes are configured correctly in gpg.conf",
		})*/
		status = "success"
		message = "System-wide cryptograpically preferred hashes are configured correctly in gpg.conf"
		fix = ""
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	} else {
		/*results = append(*results, CISResult{
			BenchmarkID:    "3.7.3",
			Status:         "fail",
			Finding:        fmt.Sprintf("System-wide cryptographically preferred hashes are not configured correctly in gpg.conf. Missing: %s", strings.Join(missingAlgos, ", ")),
			Recommendation: fmt.Sprintf("Update gpg.conf to include preferred hash algorithms: %s", strings.Join(recommendedAlgos, ", ")),
		})*/
		status = "fail"
		message = fmt.Sprintf("System-wide cryptographically preferred hashes are not configured correctly in gpg.conf. Missing: %s", strings.Join(missingAlgos, ", "))
		fix = fmt.Sprintf("Update gpg.conf to include preferred hash algorithms: %s", strings.Join(recommendedAlgos, ", "))
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	}
}

// CIS 4.3
// timeSyncServices is a list of common time synchronization services to check
var timeSyncServices = []string{"chrony", "ntp", "systemd-timesyncd"}

// checkTimeSyncEnabled checks if at least one time synchronization service is enabled
func checkTimeSyncEnabled() {
	serviceEnabled := false
	for _, service := range timeSyncServices {
		output, err := runCommand(fmt.Sprintf("systemctl is-enabled %s", service))
		if err == nil && strings.TrimSpace(output) == "enabled" {
			serviceEnabled = true
			/*results = append(*results, CISResult{
				BenchmarkID: "4.3.1",
				Status:      "pass",
				Finding:     fmt.Sprintf("Time synchronization service enabled: %s", service),
			})*/
			status = "success"
			message = fmt.Sprintf("Time synchronization service enabled: %s", service)
			fix = ""
			output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
			break
		}
	}

	if !serviceEnabled {
		/*results = append(*results, CISResult{
			BenchmarkID:    "4.3.1",
			Status:         "fail",
			Finding:        "No time synchronization service is enabled",
			Recommendation: "Enable and configure a time synchronization service like chrony, ntp, or systemd-timesyncd",
		})*/
		status = "fail"
		message = "No time syncronization service is enabled"
		fix = "Enable and configure a time synchronization service like chrony, ntp, or systemd-timesyncd"
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	}
}

// checkTimeSyncRunning checks if the enabled time synchronization service is running
func checkTimeSyncRunning() {
	serviceRunning := false
	for _, service := range timeSyncServices {
		// Check if enabled first
		enabledOutput, err := runCommand(fmt.Sprintf("systemctl is-enabled %s", service))
		if err != nil || strings.TrimSpace(enabledOutput) != "enabled" {
			continue // Skip to the next service if not enabled
		}

		// Check if running
		output, err := runCommand(fmt.Sprintf("systemctl is-active %s", service))
		if err == nil && strings.TrimSpace(output) == "active" {
			serviceRunning = true
			/*results = append(*results, CISResult{
				BenchmarkID: "4.3.2",
				Status:      "pass",
				Finding:     fmt.Sprintf("Time synchronization service is running: %s", service),
			})*/
			status = "success"
			message = fmt.Sprintf("Time synchronization service is running: %s", service)
			fix = ""
			output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
			break
		}
	}

	if !serviceRunning {
		/*results = append(*results, CISResult{
			BenchmarkID:    "4.3.2",
			Status:         "fail",
			Finding:        "No time synchronization service is running",
			Recommendation: "Start the enabled time synchronization service",
		})*/
		status = "fail"
		message = "No time syncronization service is running"
		fix = "Start the enabled time syncronization service"
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	}
}

// checkChronyConfig checks chrony specific configuration
func checkChronyConfig() {
	if _, err := os.Stat("/etc/chrony/chrony.conf"); err != nil {
		/*results = append(*results, CISResult{
			BenchmarkID:    "4.3.3",
			Status:         "info",
			Finding:        "chrony configuration file (/etc/chrony/chrony.conf) not found",
			Recommendation: "If using chrony, ensure it is configured properly",
		})*/
		status = "warn"
		message = "chrony configuration file (/etc/chrony/chrony.conf) not found"
		fix = "If using chrony, ensure it is configured properly"
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
		return
	}

	// Check for at least 4 time sources
	output, err := runCommand("grep -v '^#' /etc/chrony/chrony.conf | grep -E '^(server|pool)' | wc -l")
	if err != nil {
		/*results = append(*results, CISResult{
			BenchmarkID:    "4.3.3",
			Status:         "fail",
			Finding:        fmt.Sprintf("Error checking chrony configuration: %v", err),
			Recommendation: "Check chrony configuration file",
		})*/
		status = "fail"
		message = fmt.Sprintf("Error checking chrony configuration: %v", err)
		fix = "Check chrony configuration file"
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
		return
	}

	numSources, err := parseInt(strings.TrimSpace(output))
	if err != nil {
		/*results = append(*results, CISResult{
			BenchmarkID:    "4.3.3",
			Status:         "fail",
			Finding:        fmt.Sprintf("Error parsing number of time sources: %v", err),
			Recommendation: "Check chrony configuration file",
		})*/
		status = "fail"
		message = fmt.Sprintf("Error parsing number of time sources: %v", err)
		fix = "Check chrony configuration file"
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
		return
	}
	if numSources >= 3 {
		/*results = append(*results, CISResult{
			BenchmarkID:    "4.3.3",
			Status:         "pass",
			Finding:        fmt.Sprintf("chrony configured with at least 3 time sources (%d)", numSources),
		})*/
		status = "success"
		message = fmt.Sprintf("chrony configured with at least 3 time sources (%d)", numSources)
		fix = ""
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	} else {
		/*results = append(*results, CISResult{
			BenchmarkID:    "4.3.3",
			Status:         "fail",
			Finding:        fmt.Sprintf("chrony configured with fewer than 3 time sources (%d)", numSources),
			Recommendation: "Configure chrony with at least 3 time sources in /etc/chrony/chrony.conf",
		})*/
		status = "fail"
		message = fmt.Sprintf("chrony configured with fewer than 3 time sources (%d)", numSources)
		fix = "Configure chrony with at least 3 time sources in /etc/chrony/chrony.conf"
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	}

	// Check if maxdistance is not set
	output, err = runCommand("grep -i 'maxdistance' /etc/chrony/chrony.conf")
	if err != nil {
		// If grep returns an error other than no match, we have a problem
		if _, ok := err.(*exec.ExitError); !ok {
			/*results = append(*results, CISResult{
				BenchmarkID:    "4.3.4",
				Status:         "fail",
				Finding:        fmt.Sprintf("Error checking chrony maxdistance setting: %v", err),
				Recommendation: "Check chrony configuration file",
			})*/
			status = "fail"
			message = fmt.Sprintf("Error checking chrony maxdistance setting: %v", err)
			fix = "Check chrony configuration file"
			output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
			return
		}
	}
	if output != "" {
		/*results = append(*results, CISResult{
			BenchmarkID:    "4.3.4",
			Status:         "warn",
			Finding:        "chrony maxdistance setting is configured",
			Recommendation: "Remove or comment out the maxdistance setting in /etc/chrony/chrony.conf",
		})*/
		status = "warn"
		message = "chrony maxdistance setting is configured"
		fix = "Remove or comment out the maxdistance setting in /etc/chrony/chrony.conf"
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	} else {
		/*results = append(*results, CISResult{
			BenchmarkID:    "4.3.4",
			Status:         "pass",
			Finding:        "chrony maxdistance setting is not configured",
		})*/
		status = "success"
		message = "chrony maxdistance setting is not configured"
		fix = ""
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	}
}

// parseInt is a helper to convert string to int, handling errors
func parseInt(s string) (int, error) {
	var i int
	_, err := fmt.Sscan(s, &i)
	return i, err
}

// checkNTPConfig checks ntp specific configuration
func checkNTPConfig() {
	if _, err := os.Stat("/etc/ntp.conf"); err != nil {
		/*results = append(*results, CISResult{
			BenchmarkID:    "4.3.5",
			Status:         "info",
			Finding:        "NTP configuration file (/etc/ntp.conf) not found",
			Recommendation: "If using NTP, ensure it is configured properly",
		})*/
		status = "warn"
		message = "NTP configuration file (/etc/ntp.conf) not found"
		fix = "If using NTP, ensure it is configured properly"
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
		return
	}

	// Check for at least 4 time sources
	output, err := runCommand("grep -v '^#' /etc/ntp.conf | grep -E '^(server|peer)' | wc -l")
	if err != nil {
		/*results = append(*results, CISResult{
			BenchmarkID:    "4.3.5",
			Status:         "fail",
			Finding:        fmt.Sprintf("Error checking NTP configuration: %v", err),
			Recommendation: "Check NTP configuration file",
		})*/
		fmt.Printf("Error checking NTP configuration: %v", err)
		return
	}

	numSources, err := parseInt(strings.TrimSpace(output))
	if err != nil {
		/*results = append(*results, CISResult{
			BenchmarkID:    "4.3.5",
			Status:         "fail",
			Finding:        fmt.Sprintf("Error parsing number of time sources: %v", err),
			Recommendation: "Check NTP configuration file",
		})*/
		fmt.Printf("Error parsing number of time sources: %v", err)
		return
	}

	if numSources >= 3 {
		/*results = append(*results, CISResult{
			BenchmarkID:    "4.3.5",
			Status:         "pass",
			Finding:        fmt.Sprintf("NTP configured with at least 3 time sources (%d)", numSources),
		})*/
		status = "success"
		message = fmt.Sprintf("NTP configured with at least 3 time sources (%d)", numSources)
		fix = ""
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	} else {
		/*results = append(*results, CISResult{
			BenchmarkID:    "4.3.5",
			Status:         "fail",
			Finding:        fmt.Sprintf("NTP configured with fewer than 3 time sources (%d)", numSources),
			Recommendation: "Configure NTP with at least 3 time sources in /etc/ntp.conf",
		})*/
		status = "fail"
		message = fmt.Sprintf("NTP configured with fewer than 3 time sources (%d)", numSources)
		fix = "Configure NTP with at least 3 time sources in /etc/ntp.conf"
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	}

	// Check for specific ntp options
	checkNTPOption("restrict default kod nomodify notrap nopeer noquery", "4.3.6")
	checkNTPOption("restrict 127.0.0.1", "4.3.7")
	checkNTPOption("restrict ::1", "4.3.8")
}

// checkNTPOption checks if a specific NTP option is set
func checkNTPOption(option string, benchmarkID string) {
	output, err := runCommand(fmt.Sprintf("grep '%s' /etc/ntp.conf", option))
	if err != nil {
		// If grep returns an error other than no match, we have a problem
		if _, ok := err.(*exec.ExitError); !ok {
			/*results = append(*results, CISResult{
				BenchmarkID:    benchmarkID,
				Status:         "fail",
				Finding:        fmt.Sprintf("Error checking NTP option '%s': %v", option, err),
				Recommendation: "Check NTP configuration file",
			})*/
			fmt.Printf("Error checking NTP option '%s': %v", option, err)
		} else {
			/*results = append(*results, CISResult{
				BenchmarkID:    benchmarkID,
				Status:         "fail",
				Finding:        fmt.Sprintf("NTP option '%s' is not configured", option),
				Recommendation: fmt.Sprintf("Configure NTP option '%s' in /etc/ntp.conf", option),
			})*/
			status = "fail"
			message = fmt.Sprintf("NTP option '%s' is not configured", option)
			fix = fmt.Sprintf("Configure NTP option '%s' in /etc/ntp.conf", option)
			output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
		}
	} else if output != "" {
		/*results = append(*results, CISResult{
			BenchmarkID:    benchmarkID,
			Status:         "pass",
			Finding:        fmt.Sprintf("NTP option '%s' is configured", option),
		})*/
		status = "success"
		message = fmt.Sprintf("NTP option '%s' is configured", option)
		fix = ""
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	}
}

// CIS 6.1
// checkUpdatesInstalled checks if updates, patches and additional security software are installed (6.1.1)
func checkUpdatesInstalled() {
	// Using apt-check (requires the update-notifier-common package)
	output, err := runCommand("/usr/lib/update-notifier/apt-check --human-readable")
	if err != nil {
		/*results = append(*results, CISResult{
			BenchmarkID:    "6.1.1",
			Status:         "fail",
			Finding:        fmt.Sprintf("Error checking for updates: %v", err),
			Recommendation: "Ensure the update-notifier-common package is installed and apt-check is working.",
		})*/
		status = "fail"
		message = fmt.Sprintf("Error checking for updates: %v", err)
		fix = "Ensure the update-notifier-common package is installed and apt-check is working."
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
		return
	}

	lines := strings.Split(output, "\n")
	if len(lines) >= 2 {
		// Check for security updates
		if strings.Contains(lines[1], "can be updated immediately") {
			/*results = append(*results, CISResult{
				BenchmarkID:    "6.1.1",
				Status:         "fail",
				Finding:        "System has updates that can be applied immediately.",
				Recommendation: "Apply updates using 'sudo apt update && sudo apt upgrade'",
			})*/
			status = "fail"
			message = "System has updates that can be applied immediately."
			fix = "Apply updates using 'sudo apt update && sudo apt upgrade'"
			output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
		} else {
			/*results = append(*results, CISResult{
				BenchmarkID:    "6.1.1",
				Status:         "pass",
				Finding:        "System is up to date.",
			})*/
			status = "success"
			message = "System is up to date"
			fix = ""
			output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
		}

		// Check for security updates
		if strings.Contains(lines[1], "security updates") {
			/*results = append(*results, CISResult{
				BenchmarkID:    "6.1.2",
				Status:         "fail",
				Finding:        "System has security updates that can be applied immediately.",
				Recommendation: "Apply security updates using 'sudo apt update && sudo apt upgrade'",
			})*/
			status = "fail"
			message = "System has security updates that can be applied immediately."
			fix = "Apply security updates using 'sudo apt update && sudo apt upgrade'"
			output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
		} else {
			/*results = append(*results, CISResult{
				BenchmarkID:    "6.1.2",
				Status:         "pass",
				Finding:        "System is up to date with security patches.",
			})*/
			status = "success"
			message = "System is up to date with security patches."
			fix = ""
			output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
		}
	} else {
		/*results = append(*results, CISResult{
			BenchmarkID:    "6.1.1",
			Status:         "fail",
			Finding:        "Could not determine update status from apt-check output.",
			Recommendation: "Check the output of /usr/lib/update-notifier/apt-check --human-readable",
		})*/
		status = "fail"
		message = "Could not determine update status from apt-check output."
		fix = "Check the output of /usr/lib/update-notifier/apt-check --human-readable"
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	}
}

// checkSystemReboot checks if a system reboot is required after updates (6.1.3)
func checkSystemReboot() {
	if _, err := os.Stat("/var/run/reboot-required"); err == nil {
		/*results = append(*results, CISResult{
			BenchmarkID:    "6.1.3",
			Status:         "fail",
			Finding:        "System reboot is required.",
			Recommendation: "Reboot the system to apply updates.",
		})*/
		status = "fail"
		message = "System reboot is required"
		fix = "Reboot the system to apply updates"
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	} else if os.IsNotExist(err) {
		/*results = append(*results, CISResult{
			BenchmarkID:    "6.1.3",
			Status:         "pass",
			Finding:        "System reboot is not required.",
		})*/
		status = "success"
		message = "System reboot is not required"
		fix = ""
		output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
	} else {
		/*results = append(*results, CISResult{
			BenchmarkID:    "6.1.3",
			Status:         "fail",
			Finding:        fmt.Sprintf("Error checking if reboot is required: %v", err),
			Recommendation: "Check system status.",
		})*/
		fmt.Printf("Error checking if reboot is required: %v", err)
	}
}

func main() {

	fmt.Println("--- CIS 1.1 ---") // START OF CIS1.1
	checkPartitioning() // Check if /var/tmp is a separate partition
	fstab, err := os.Open("/etc/fstab") // Check /etc/fstab for mount options and permissions
	if err != nil {
		/*results = append(results, CISResult{
			BenchmarkID:    "1.1.X",
			Status:         "fail",
			Finding:        fmt.Sprintf("Error opening /etc/fstab: %v", err),
			Recommendation: "Check /etc/fstab existence and permissions.",
		})*/
		fmt.Printf("Error opening /etc/fstab", err)
	} else {
		defer fstab.Close()
		scanner := bufio.NewScanner(fstab)
		for scanner.Scan() {
			line := scanner.Text()
			if strings.HasPrefix(line, "#") {
				continue // Skip comment lines
			}
			checkFstabEntry(line)
		}
		if err := scanner.Err(); err != nil {
			/*results = append(results, CISResult{
				BenchmarkID:    "1.1.X",
				Status:         "fail",
				Finding:        fmt.Sprintf("Error reading /etc/fstab: %v", err),
				Recommendation: "Check /etc/fstab for errors.",
			})*/
			status = "fail"
			message = fmt.Sprintf("Error reading /etc/fstab: v%", err)
			fix = "Check /etc/fstab for errors"
			output_module.PrintOutput(output_module.NewMainOut(status, message, fix, modname))
		}
	}
	// Check mount options
	checkMountOptions("/tmp")
	checkMountOptions("/var")
	checkMountOptions("/var/tmp")
	checkMountOptions("/var/log")
	checkMountOptions("/var/log/audit")
	checkMountOptions("/home")
	checkWorldWritableFiles() // Check for world-writable files
	checkUnownedFiles() // Check for unowned files and directories
	checkSUIDFiles() // Check for SUID/SGID files
	checkCoreDumps() // Check for core dumps
	checkFilePermissions("/etc/fstab", 0644, "root", "root", "1.1.21") // Check permissions

	fmt.Println("--- CIS 2.1 ---") // START OF CIS2.1
	checkServiceStatus("rsync", "2.1.2", false) // Check if rsync service should be disabled
	checkServiceStatus("dhcp-client", "2.1.3", false) // Check if dhcp client should be disabled
	checkServiceStatus("nfs", "2.1.4", false) // Check if nfs server should be disabled
	checkServiceStatus("rpcbind", "2.1.5", false) // Check if rpcbind should be disabled
	checkServiceStatus("tftp", "2.1.6", false) // Check if tftp server should be disabled
	checkServiceStatus("nis", "2.1.7", false) // Check if nis client should be disabled
	checkServiceStatus("httpd", "2.1.8", false) // Check if httpd service should be disabled
	checkServiceStatus("dovecot", "2.1.9", false) // Check if dovecot service should be disabled
	checkServiceStatus("smbd", "2.1.10", false) // Check if samba service should be disabled
	checkServiceStatus("nfs-server", "2.1.11", false) // Check if nfs service should be disabled
	checkLegacyService("telnet") //Check if telnet server should be disabled
	checkLegacyService("rsh") // Check if rsh server should be disabled

	fmt.Println("--- CIS 3.1 ---") // START OF CIS3.1
	checkIPForwarding() // Check for IP Forwarding
	checkPacketRedirectSending() // Check for Packet Redirecting

	fmt.Println("--- CIS 3.7 ---") // START OF CIS3.7
	checkGPGInstalled() // Check if GPG is installed
	checkGPGKeyConfigured() // Check if GPG is configured
	checkCryptoPreferredHashes() // Check preferred hashes

	fmt.Println("--- CIS 4.3 ---") // START OF CIS4.3
	checkTimeSyncEnabled()
	checkTimeSyncRunning()
	checkChronyConfig()
	checkNTPConfig()

	fmt.Println("--- CIS 6.1 ---") // START OF CIS6.1
	checkUpdatesInstalled()
	checkSystemReboot()
}
