# 🚀 GETTING STARTED - Start Here

**Status**: ✅ System is ready to start  
**Date**: February 22, 2026  
**Next Step**: Choose how to start

---

## 🎯 Quick Start (Choose One)

You have **3 options** to run the system right now:

### ✨ Option A: Docker (FASTEST - Recommended ⭐)
**No prerequisites needed. Everything included.**

**Command**:
```bash
cd c:/systemdevelop/competency2568
docker-compose up -d
```

**Then access**:
- 🌐 Frontend: http://localhost:3000
- 🔌 Backend API: http://localhost:7000
- 📊 Database Admin: http://localhost:8080

**Time**: 5 minutes  
**Best for**: Quick testing, immediate visibility

---

### 🐧 Option B: Docker Bash Script (EASY)
**Automated Docker startup with verification**

**Command**:
```bash
cd c:/systemdevelop/competency2568
bash scripts/docker-deploy.sh
```

**What it does**:
- ✅ Checks Docker is installed
- ✅ Starts all services
- ✅ Verifies everything running
- ✅ Shows you access URLs

**Time**: 5-10 minutes  
**Best for**: Automated verification

---

### 📝 Option C: Manual Local Setup
**For development or if Docker not available**

**Prerequisites**:
- Node.js v18+
- MySQL 8.0+
- npm v9+

**Steps**:
```bash
# 1. Setup database
mysql -u root -p < schema.sql

# 2. Install & start backend (Terminal 1)
cd backend
npm install
npm start

# 3. Install & start frontend (Terminal 2)
cd frontend
npm install
npm run dev
```

**Access**: http://localhost:3000  
**Time**: 15-20 minutes  
**Best for**: Development/customization

---

## 🔑 Demo Credentials (All Options)

After starting, login with any of these:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@ccollege.ac.th | admin123 |
| **Evaluator** | eva.me@ccollege.ac.th | password123 |
| **Evaluatee** | t.it01@ccollege.ac.th | demo123 |

---

## ✅ System Verification

After starting, verify everything works:

- [ ] Frontend loads: http://localhost:3000
- [ ] Login with admin credentials above
- [ ] Admin dashboard visible
- [ ] Can click "Periods" menu to view periods
- [ ] Backend responding: http://localhost:7000/api/topics
- [ ] Database connected (no connection errors)

---

## 📍 What You're Getting

✅ Complete competency evaluation system  
✅ Admin management dashboard  
✅ Evaluator scoring interface  
✅ Evaluatee progress tracking  
✅ File upload for evidence  
✅ CSV export functionality  
✅ Role-based access control  
✅ "Ready to use" state  

---

## 🎯 After Starting

### First 2 Minutes
1. Open http://localhost:3000 in browser
2. Login with: `admin@ccollege.ac.th` / `admin123`
3. Explore the admin dashboard
4. Click through different sections

### First 10 Minutes  
1. Login as Evaluator: `eva.me@ccollege.ac.th` / `password123`
2. View "Tasks" section
3. Logout and login as Evaluatee: `t.it01@ccollege.ac.th` / `demo123`
4. View "Evaluation" section

### First 30 Minutes
1. Follow [QUICK_START.md](QUICK_START.md) testing checklist
2. Try each major feature
3. Test file upload
4. Review admin features
5. Confirm everything works

---

## 🛑 Stopping the System

### Docker
```bash
docker-compose down
# Services stop, docker remains (can restart quickly)
```

### Manual Setup
Ctrl+C in each terminal (Backend & Frontend)

### Restart Later
Same command as before - services start again with your data intact.

---

## 🆘 Troubleshooting

### "Docker not found"
**Windows**: Download Docker Desktop from https://docker.com  
**Mac**: Download Docker Desktop from https://docker.com  
**Linux**: `sudo apt install docker.io docker-compose`

### "npm not found"
Download Node.js from https://nodejs.org (includes npm)

### "Port already in use"
```bash
# Find and kill process using port 3000
lsof -i :3000
kill -9 {PID}
```

### "Can't connect to database"
Make sure MySQL is running (or use Docker which includes it)

### "Blank page on localhost:3000"
Wait 30 seconds for frontend to build, then refresh browser

---

## 📚 Full Documentation

Once system is running:

- **Settings & Config**: See [DEPLOYMENT_CONFIG.md](DEPLOYMENT_CONFIG.md)
- **All Features**: See [QUICK_START.md](QUICK_START.md)
- **API Testing**: See [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md)
- **Production Deployment**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Everything**: See [DOCS_INDEX.md](DOCS_INDEX.md)

---

## ⏱️ Estimated Timelines

| Method | Time | Complexity |
|--------|------|-------------|
| Docker (recommended) | 5 min | ⭐ (easiest) |
| Docker script | 10 min | ⭐⭐ |
| Local manual | 20 min | ⭐⭐⭐ |
| Production setup | 2-4 hours | ⭐⭐⭐⭐⭐ |

---

## 💡 Pro Tips

1. **Use Docker** - It's the fastest way to see everything working
2. **Read docs while system starts** - Don't wait, they're short reads
3. **Test all 3 roles** - Each has different features to explore
4. **Check file uploads** - One of the key features
5. **Review admin pages** - Where all management happens

---

## 🎯 Next Immediate Steps

### Right Now:
1. Choose Option A, B, or C above
2. Run the command for your choice
3. Wait for services to start (5-30 min)

### Once Running:
1. Open http://localhost:3000
2. Login with demo credentials
3. Explore the system
4. Verify everything works

### After Exploring:
1. Read [QUICK_START.md](QUICK_START.md)
2. Run [PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md)
3. Decide on production setup if needed

---

## ✨ You're All Set!

Everything is ready. Choose your option above and run the command.

**Your system will be running in 5-30 minutes** depending on choice.

---

**Questions?**  
→ See [DOCS_INDEX.md](DOCS_INDEX.md) for documentation map  
→ See [DEPLOYMENT_CONFIG.md](DEPLOYMENT_CONFIG.md) for configuration  
→ See [DEPLOYMENT_READY.md](DEPLOYMENT_READY.md) for deployment overview  

---

**Status**: ✅ **READY TO START**  
**All systems**: **GO**  
**Let's begin!** 🚀
