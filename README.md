# InfoSec Agent Linux

## Description

The InfoSec Agent is a security and privacy tool capable of running on Windows, MacOS, and Linux operating system. 

This project aims to improve the security and privacy of computer users. The goal of this project is to make information security more accessible to the general public. The application is intended to run modules that work to collect system information to discover anny security or privacy related vulnerabilities. The results are then presented to the user in a dashboard, showing the current status of the system and suggesting recommended actions to improve the cybersecurity posture.

## Affiliations

This project is a collaborative effort among multiple student groups from universities in The Netherlands. Utrecht University and Fontys ICT, in partnership with the Dutch IT company Guardian360, have worked to establish this project.

## Contributing

The InfoSec Agent project is an open-source project.

Please feel free to report any bugs or issues you encounter. Feedback is valuable, and helps to improve this project.

## Building

To build the agent, make sure you first install the required dependencies. 

Install `NodeJS` with at least version `23.4.0`
It is preferred to use `Bun.sh` over `npm`.

Building can be done on any operating system, and has been reported working on Windows and Linux.

### Commands

`cd InfoSec-Agent` Navigate to the root folder

`bun i` Install all necessary dependencies

`bun run build` Initiate the building of the agent.

> **Note:** When running the application in development mode, it may require the following command on Linux if a sandboxing issue is encountered: `sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0`

## Installation

TBD

## Usage

TBD

## Support

TBD

## Roadmap

TBD

## Authors

Alexander Pirvu, Samuil Totev, Sava Vasilev, Kaloyan Andreev

## License

TBD

## Project Status

In Development