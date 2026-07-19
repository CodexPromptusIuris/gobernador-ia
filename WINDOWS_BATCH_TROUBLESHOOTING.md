# 🪟 Windows Batch File Troubleshooting Guide

## 🚀 Which Batch File to Use?

### For Beginners
```
Double-click: run.bat
```
Simple, just starts everything.

### For Advanced Users
```
Double-click: gobernador.bat
```
Has commands like `stop`, `logs`, `restart`.

### For Setup
```
Double-click: setup.bat
```
Interactive wizard with checks.

### For Diagnosis
```
Double-click: diagnose.bat
```
Checks if everything is working.

---

## ❌ Batch File Won't Run?

### Problem 1: "Access Denied" or "Cannot find file"

**Solution:**
1. Right-click the .bat file
2. Select "Run as Administrator"
3. Click "Yes" when asked

### Problem 2: Window opens and closes immediately

**Solution:**
1. Open Command Prompt (Windows key + R, type `cmd`, Enter)
2. Navigate to project: `cd C:\path\to\project`
3. Run: `run.bat`
4. This keeps the window open

### Problem 3: "Docker not found" message

**Solution:**
1. Docker is not installed or not in PATH
2. Download: https://www.docker.com/products/docker-desktop
3. Install and restart your computer
4. Try again: `run.bat`

### Problem 4: Batch file runs but shows errors

**Solution:**
Run diagnostics:
1. Double-click: `diagnose.bat`
2. Read the output
3. Follow recommendations

---

## 🐛 Common Errors and Fixes

### "Docker daemon not running"
```
Solution:
  1. Click Docker Desktop icon in system tray
  2. Wait 30 seconds for it to start
  3. Run the batch file again
```

### "Port 5173 already in use"
```
Solution:
  1. Close other applications
  2. Or open Command Prompt:
     netstat -ano | findstr :5173
  3. Find the process ID and close that app
  4. Try again
```

### "docker-compose.yml not found"
```
Solution:
  1. Make sure you're in the right directory
  2. The batch file should be in the same folder
  3. Run from: C:\path\to\gobernador\
```

### "ERROR: Config file not found"
```
Solution:
  1. Create .env file:
     copy .env.example .env
  2. Edit with Notepad
  3. Change passwords
  4. Try again
```

---

## 🔧 Manual Commands in Command Prompt

If batch files don't work, try these directly:

```cmd
REM Navigate to project
cd C:\path\to\gobernador

REM Check Docker
docker --version

REM Check if running
docker ps

REM Start services
docker compose up -d --build

REM View logs
docker compose logs -f

REM Stop services
docker compose down

REM Check status
docker compose ps
```

---

## 🎯 Step-by-Step Fix

If run.bat doesn't work:

### Step 1: Verify Files Exist
```
Your folder should have:
  ✓ run.bat
  ✓ gobernador.bat
  ✓ docker-compose.yml
  ✓ .env (or .env.example)
  ✓ backend/ (folder)
  ✓ frontend/ (folder)
```

### Step 2: Verify Docker
```cmd
docker --version
REM Should print: Docker version 24.x.x or higher
```

### Step 3: Edit .env
```cmd
notepad .env
```
Change all passwords, save.

### Step 3: Test Compose File
```cmd
docker compose config
REM Should show your services config
```

### Step 4: Start Manually
```cmd
docker compose up -d --build
REM Watch for output
```

### Step 5: Check Logs
```cmd
docker compose logs -f
REM Watch for errors, press Ctrl+C to exit
```

---

## 🆘 If Everything Fails

### Complete Reset
```cmd
REM Stop everything
docker compose down -v

REM Clean up Docker
docker system prune -a --volumes

REM Restart Docker Desktop (close and open)

REM Start fresh
docker compose up -d --build
```

### Check Docker Desktop
1. Click Windows Start menu
2. Type "Docker"
3. Click "Docker Desktop"
4. Wait 60 seconds for it to start
5. Try batch file again

### Create Simple Test
```cmd
REM Test if Docker works
docker run hello-world

REM Should print: "Hello from Docker!"
REM If not, Docker is not properly installed
```

---

## 📋 Batch File Alternatives

If batch files still don't work:

### Option 1: Use Command Prompt Directly
```cmd
cd C:\path\to\project
docker compose up -d --build
```

### Option 2: Use PowerShell
```powershell
cd C:\path\to\project
docker compose up -d --build
```

### Option 3: Use Docker Desktop GUI
```
1. Open Docker Desktop
2. Click "Images"
3. Find the images (they'll auto-build)
4. Or use Containers tab to manage
```

### Option 4: Use VS Code Terminal
```
1. Open VS Code
2. Open project folder
3. Open Terminal (Ctrl + `)
4. Run: docker compose up -d --build
```

---

## ✅ How to Know It's Working

After running the batch file or command:

1. ✅ No error messages
2. ✅ "Services started" message appears
3. ✅ Command prompt returns to input
4. ✅ Open: http://localhost:5173
5. ✅ Web page loads

---

## 🎓 Batch File Basics

### Why batch files?
- Simple one-click launch
- No terminal knowledge needed
- Same on all Windows versions

### Why they might fail?
- Docker not installed
- Not running as Administrator
- Wrong directory
- Port conflicts
- Disk space issues

### How to troubleshoot?
1. Check error messages
2. Run: `diagnose.bat`
3. Run commands manually
4. Check Docker Desktop is running

---

## 📞 Getting Help

### Check These Files
- `WINDOWS_QUICK_START.txt` - Beginner guide
- `README.md` - Full documentation
- `FINAL_CHECKLIST.md` - Pre-flight checks

### Run Diagnosis
```cmd
diagnose.bat
```
This checks everything.

### View Logs
```cmd
gobernador logs
REM OR
docker compose logs -f
```

### Last Resort
Run manually and check output:
```cmd
cd C:\path\to\project
docker compose up --build
REM Keep the window open and read all messages
```

---

## 🚀 Quick Fix Checklist

- [ ] Docker Desktop installed
- [ ] Docker Desktop running (check system tray)
- [ ] .env file exists and edited
- [ ] Files in correct directory
- [ ] Port 5173 not in use
- [ ] At least 2GB disk space free
- [ ] Running as Administrator

If all checked and still not working:
→ Open Command Prompt and run: `docker compose up`
→ Read the error messages carefully

---

**Version:** 1.0  
**Last Updated:** 2024
