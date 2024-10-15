# Node.js Installation Guide

This guide provides instructions to install Node.js.

## 1. Installing Node.js on Linux

### Step 1: Update the System Package List

Before installing Node.js, it's a good practice to update the package list.

```bash
sudo apt update
```

### Step 2: Install Node.js from the NodeSource Repository

You can install the latest version of Node.js from the official NodeSource repository.

Add the NodeSource PPA to your system:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs
```

Verify the installation:

```bash
node -v
npm -v
```
