#!/bin/bash

# Define service file content
SERVICE_FILE_CONTENT="[Unit]
Description=InfoSec Agent Privilege Escalation Service
After=network.target

[Service]
ExecStart=/bin/infosec-agent/daemon
Restart=always
User=root

[Install]
WantedBy=multi-user.target"

# Create the service file
echo "$SERVICE_FILE_CONTENT" > /etc/systemd/system/infosec.service

# Create the target directory if it doesn't exist
mkdir -p /bin/infosec-agent

# Copy the daemon executable to the target directory
cp /opt/InfoSecAgent/resources/daemon/daemon /bin/infosec-agent/daemon

# Make the daemon executable
chmod +x /bin/infosec-agent/daemon

# Generate a random string up to 128 characters
RANDOM_STRING=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 128)

# Export the random string as an environment variable
export INFOSEC_AGENT_KEY="$RANDOM_STRING"

# Reload systemd manager configuration
systemctl daemon-reload

# Enable the service to start on boot
systemctl enable infosec.service

# Start the service immediately
systemctl start infosec.service

echo "InfoSec Agent Privilege Escalation service installed and started successfully."