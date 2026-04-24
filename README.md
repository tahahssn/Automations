# Discord Truth or Dare Bot

A Discord bot powered by n8n workflow automation and Google Gemini API that provides interactive Truth or Dare games with AI-generated responses.

## Features

- **Truth or Dare Gameplay**: Interactive game commands for Discord servers
- **AI-Powered Responses**: Utilizes Google Gemini API for intelligent responses
- **Docker Deployment**: Easy setup with Docker and Docker Compose
- **n8n Workflow Automation**: Streamlined backend automation
- **Discord Integration**: Seamless bridge between Discord and n8n workflows

## Available Commands

- `!help` - Display help information and available commands
- `!truth` - Get a truth question
- `!dare` - Get a dare challenge

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- Ubuntu/Linux environment (or WSL on Windows)
- `sudo` access on your machine
- **Docker** (version compatible with your system)
- **Docker Compose**
- **Node.js** and **npm**
- Google Gemini API Key
- Discord Bot Token

## Installation & Setup

### 1. Update Your System

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Docker

```bash
sudo apt install -y docker.io

# Verify installation
docker --version
```

### 3. Install Docker Compose

```bash
sudo apt install -y docker-compose

# Verify installation
docker compose --version
```

### 4. Create n8n Directory and Docker Setup

```bash
# Create a dedicated folder
mkdir ~/n8n && cd ~/n8n

# Add current user to docker group (optional but recommended)
sudo usermod -aG docker ubuntu

# Apply the group change to current session
newgrp docker

# Verify the group is applied
groups
```

### 5. Set Up Docker Compose

Update the `docker-compose.yml` file with your configuration:

```bash
nano docker-compose.yml
```

**Important**: Update your public IP address in the configuration file before proceeding.

### 6. Start n8n

```bash
# Start n8n in the background
docker-compose up -d

# Verify it's running
docker ps

# View live logs (press Ctrl + C to exit)
docker-compose logs -f
```

### 7. Access n8n Web Interface

Open your browser and navigate to:

```
http://<Your_EC2_Public_IP>:5678/
```

- Log in to n8n
- Activate your license

### 8. Import the Workflow

1. In n8n, click the **3 Dots** menu
2. Select **Import from file**
3. Choose `discord-truthdare.json`
4. Add your **Google Gemini API Key** to the workflow

### 9. Set Up Discord Bot

#### Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/login?redirect_to=%2Fdevelopers)
2. Create a new application
3. Generate and copy your bot token

#### Install Node.js Dependencies

```bash
sudo apt install npm

# Navigate to your project directory
cd ~/n8n

# Install required packages
npm init -y
npm install discord.js axios dotenv
```

#### Configure discord-bot.js

```bash
nano discord-bot.js
```

**Important Steps:**
1. Paste the contents of `discord-bot.js`
2. Add your Discord bot token to the appropriate field
3. (Optional) Update **Line 109** to personalize the footer:
   ```javascript
   text: 'Made by YourName | Inspired by Affan | Powered by n8n'
   ```

### 10. Start the Discord Bot

#### Option A: Direct Execution (Simple)

```bash
node discord-bot.js
```

**Important**: The script will run continuously and listen for Discord commands. Keep this terminal window open. To stop the bot, press `Ctrl + C`.

The bot will automatically:
- Connect to Discord
- Listen for commands (!help, !truth, !dare)
- Keep running until manually stopped
- Attempt to reconnect if connection drops

#### Option B: Run in Background with Screen (Recommended)

To run the bot in a detachable terminal session:

```bash
# Install screen if not already installed
sudo apt install screen

# Start the bot in a new screen session
screen -S discord-bot -d -m node discord-bot.js

# List active screen sessions
screen -ls

# Reattach to the session to view logs
screen -r discord-bot

# Detach from session (without stopping it): Press Ctrl + A, then D
```

#### Option C: Use PM2 for Process Management (Production)

For enterprise-level process management:

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the bot with PM2
pm2 start discord-bot.js --name discord-bot

# View running processes
pm2 list

# View logs in real-time
pm2 logs discord-bot

# Stop the bot
pm2 stop discord-bot

# Restart the bot
pm2 restart discord-bot

# Make PM2 start on system boot (optional)
pm2 startup
pm2 save
```

#### Handling Crashes and Reconnections

The Discord bot will automatically attempt to reconnect if:
- Network connection drops
- Discord API becomes temporarily unavailable
- The bot is disconnected for any reason

**Monitoring the Bot**:
```bash
# Check if the bot is running
ps aux | grep discord-bot.js

# View the bot's output/logs
tail -f bot.log  # (if logs are piped to a file)
```

## Restarting After EC2 Stop

If you stopped your EC2 instance and started it again, Docker containers do not restart automatically and your public IP will have changed. Follow these steps every time this happens.

### 1. Get Your New Public IP

Go to **AWS Console → EC2 → Instances** and copy your new **Public IPv4 address**.

> **Note**: EC2 public IPs change every time the instance is stopped and started, unless you have an Elastic IP assigned.

### 2. Update the Public IP in docker-compose.yml

```bash
cd ~/n8n
nano docker-compose.yml
```

Find the line containing your old public IP (typically in `WEBHOOK_URL` or `N8N_HOST`) and replace it with the new one. Save and exit with `Ctrl + X`, then `Y`, then `Enter`.

### 3. Bring n8n Back Up

```bash
cd ~/n8n
docker-compose up -d

# Confirm it's running
docker ps
```

You should see n8n listed with a status of `Up`. Open `http://<Your_New_EC2_Public_IP>:5678/` in your browser to verify.

### 4. Restart the Discord Bot

Start the bot again using whichever method you used during setup:

```bash
# Option A - Direct
node discord-bot.js

# Option B - Screen
screen -S discord-bot -d -m node discord-bot.js

# Option C - PM2
pm2 restart discord-bot
```

Send `!help` in your Discord server to confirm everything is back up and working.

## Testing the Bot

### Test via n8n Webhook
Test the webhook using n8n's testing interface.

### Test in Discord
1. Invite your bot to your Discord server
2. Try the commands:
   ```
   !help
   !truth
   !dare
   ```

## Project Structure

```
Discord Bot/
├── README.md                  # This file
├── Commands.txt              # Installation and setup commands
├── discord-bot.js            # Discord bot bridge (Node.js)
├── discord-truthdare.json    # n8n workflow configuration
└── docker-compose.yml        # Docker Compose configuration
```

## How It Works

1. **Discord Bot** (`discord-bot.js`) acts as a bridge between Discord and n8n
2. When a user sends a command (!truth, !dare), it triggers a webhook
3. **n8n Workflow** processes the request and calls Google Gemini API
4. The AI-generated response is sent back to Discord
5. User receives the truth question or dare challenge in Discord

## Configuration

### Environment Variables

Create a `.env` file in your project directory with:

```env
DISCORD_BOT_TOKEN=your_bot_token_here
GEMINI_API_KEY=your_gemini_api_key_here
N8N_WEBHOOK_URL=your_n8n_webhook_url
```

### n8n Configuration

- Update your EC2 Public IP in `docker-compose.yml`
- Add Gemini API Key in the n8n workflow
- Configure webhook endpoint to match your Discord bot setup

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Cannot connect to n8n | Verify your EC2 Public IP is correct and port 5678 is accessible |
| Docker command not found | Ensure Docker is installed: `docker --version` |
| docker-compose command not found | Install Docker Compose: `sudo apt install -y docker-compose` |
| Permission denied errors | Add user to docker group: `sudo usermod -aG docker $USER` |
| Bot not responding | Check bot token is correctly set in `discord-bot.js` |
| Workflow not executing | Verify Gemini API key is added to the n8n workflow |
| n8n unreachable after EC2 restart | Update IP in `docker-compose.yml` and run `docker-compose up -d` |

### Viewing Logs

```bash
# View all container logs
docker ps

# View n8n logs in real-time
docker-compose logs -f

# Stop all containers
docker-compose down
```

### Getting Help

If you encounter any errors:
1. Check the logs: `docker-compose logs -f`
2. Verify all configuration files are correctly set up
3. Ensure all required API keys are added
4. Contact the project maintainer or consult Claude (AI Assistant)

## Environment Details

- **OS**: Ubuntu/Linux (or compatible)
- **Runtime**: Node.js
- **Containerization**: Docker & Docker Compose
- **AI Service**: Google Gemini API
- **Automation**: n8n
- **Chat Platform**: Discord

## Dependencies

### System Dependencies
- Docker
- Docker Compose
- Node.js
- npm

### Node.js Packages
- `discord.js` - Discord bot framework
- `axios` - HTTP client
- `dotenv` - Environment variable management

## Credits

**Original Creator**: Affan  
**Inspired by**: Affan's n8n & Discord integration approach  
**Powered by**: n8n workflow automation

## License

Please contact the original creator for licensing information.

## Additional Resources

- [n8n Documentation](https://docs.n8n.io/)
- [Discord.js Documentation](https://discord.js.org/)
- [Google Gemini API](https://ai.google.dev/)
- [Docker Documentation](https://docs.docker.com/)

---

**Last Updated**: 2026  
**Version**: 1.0

For issues, questions, or contributions, please contact the maintainer.
