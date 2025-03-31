# Solstice Agent API Deployment Guide

This guide provides step-by-step instructions for deploying the Solstice Agent API to various platforms.

## 1. Local Development Setup

For testing and development:

```bash
# Clone the repository if needed
cd /Users/tejasagnihotri/SolsticeApp/agent-api

# Install dependencies
pip install -r requirements.txt

# Install Ollama (if not already installed)
curl -fsSL https://ollama.com/install.sh | sh

# Pull the Mistral model
ollama pull mistral

# Run the server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

## 2. Cloud Deployment Options

### Option A: Render.com (Recommended for Simplicity)

1. **Create a new Web Service**:
   - Sign in to [Render](https://render.com)
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository or use the "Deploy from Git" option

2. **Configure the service**:
   - **Name**: `solstice-agent-api`
   - **Environment**: `Docker`
   - **Branch**: `main` (or your preferred branch)
   - **Root Directory**: `/agent-api` (if your repo contains the whole Solstice app)

3. **Set environment variables**:
   - `OLLAMA_MODEL`: `mistral`
   - `USE_OPENROUTER`: `false` (or `true` if using OpenRouter as fallback)
   - `OPENROUTER_API_KEY`: Your OpenRouter API key (if using)

4. **Deploy**:
   - Click "Create Web Service"
   - Wait for the build and deployment to complete

5. **Update Solstice App**:
   - Set `AGENT_API_URL` in your Solstice app's `.env` file to your Render URL (e.g., `https://solstice-agent-api.onrender.com`)

### Option B: Railway.app (For Autoscaling)

1. **Create a new project**:
   - Sign in to [Railway](https://railway.app)
   - Click "New Project" and select "Deploy from GitHub repo"
   - Connect your GitHub repository

2. **Configure the service**:
   - **Root Directory**: `/agent-api` (if your repo contains the whole Solstice app)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Set environment variables**:
   - `OLLAMA_MODEL`: `mistral`
   - `USE_OPENROUTER`: `false` (or `true` if using OpenRouter as fallback)
   - `OPENROUTER_API_KEY`: Your OpenRouter API key (if using)

4. **Deploy**:
   - Click "Deploy"
   - Wait for the build and deployment to complete

5. **Update Solstice App**:
   - Set `AGENT_API_URL` in your Solstice app's `.env` file to your Railway URL

### Option C: VPS (For Maximum Performance)

1. **Provision a VPS**:
   - Recommended: DigitalOcean Droplet ($5-10/month)
   - Minimum specs: 2GB RAM, 1 vCPU
   - OS: Ubuntu 22.04

2. **Set up the server**:
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install dependencies
   sudo apt install -y python3-pip python3-venv git
   
   # Install Ollama
   curl -fsSL https://ollama.com/install.sh | sh
   
   # Clone the repository
   git clone <your-repo-url>
   cd SolsticeApp/agent-api
   
   # Create and activate virtual environment
   python3 -m venv venv
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Pull the Mistral model
   ollama pull mistral
   ```

3. **Create a systemd service**:
   ```bash
   sudo nano /etc/systemd/system/solstice-agent.service
   ```

   Add the following content:
   ```
   [Unit]
   Description=Solstice Agent API
   After=network.target
   
   [Service]
   User=<your-username>
   WorkingDirectory=/path/to/SolsticeApp/agent-api
   ExecStart=/path/to/SolsticeApp/agent-api/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
   Restart=always
   
   [Install]
   WantedBy=multi-user.target
   ```

4. **Start the service**:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable solstice-agent
   sudo systemctl start solstice-agent
   ```

5. **Set up Nginx as a reverse proxy**:
   ```bash
   sudo apt install -y nginx certbot python3-certbot-nginx
   
   # Configure Nginx
   sudo nano /etc/nginx/sites-available/solstice-agent
   ```

   Add the following content:
   ```
   server {
       listen 80;
       server_name your-domain.com;
   
       location / {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

   Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/solstice-agent /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Set up SSL**:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

7. **Update Solstice App**:
   - Set `AGENT_API_URL` in your Solstice app's `.env` file to your domain (e.g., `https://your-domain.com`)

## 3. Production Environment Configuration

Create a `.env.production` file in your Solstice app:

```
# Solstice App Production Environment
NODE_ENV=production
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
AGENT_API_URL=https://your-deployed-agent-api-url
ENABLE_MOCK_DATA=false
ENABLE_ANALYTICS=true
```

## 4. Testing Checklist

After deployment, test the following flows:

1. **Content Parsing**:
   - Save a YouTube or Instagram URL
   - Go to SavedContentScreen and click Review
   - Verify that the API returns segmented Cards

2. **Cue Generation**:
   - Select a Card and open the editor
   - Verify that cueAgent runs and returns form cues

3. **Routine Building**:
   - Add cards to a routine
   - Verify that the routine is saved to Supabase

4. **Routine Playback**:
   - Launch the perform flow
   - Verify that cues are visible during playback

## 5. Monitoring and Maintenance

1. **API Monitoring**:
   - Check the API logs on your deployment platform
   - Monitor response times and error rates

2. **Database Monitoring**:
   - Use Supabase dashboard to monitor database usage
   - Check query performance with the added indexes

3. **Regular Updates**:
   - Update the Mistral model periodically
   - Check for security updates for dependencies

## 6. Optional Improvements

1. **LLM Prompt Tuning**:
   - Refine prompts based on user feedback
   - Add user preferences to personalize recommendations

2. **Caching Layer**:
   - Add Redis for caching frequent API calls
   - Cache parsed content to reduce LLM calls

3. **Media Proxy**:
   - Set up a proxy for YouTube/Instagram thumbnails
   - Cache media assets for faster loading

4. **Analytics**:
   - Track API usage patterns
   - Identify popular content types and features
