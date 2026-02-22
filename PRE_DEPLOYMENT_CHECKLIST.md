# Pre-Deployment Checklist

Use this checklist to ensure your system is fully prepared for production deployment.

---

## ✅ Phase 1: Preparation (1-2 hours before)

### Code Review
- [ ] All API endpoints tested and working
- [ ] All frontend pages display correctly
- [ ] No console errors in browser
- [ ] No compilation warnings
- [ ] All environment variables configured
- [ ] API CORS_ORIGIN matches production domain
- [ ] No hardcoded credentials in code
- [ ] All dependencies installed: `npm install --production`

### Database
- [ ] Database schema imported successfully
- [ ] All 13 tables created
- [ ] Seed data loaded (demo users, periods, topics)
- [ ] Foreign key constraints working
- [ ] Database user created with limited permissions
- [ ] Character set is UTF-8MB4
- [ ] Connection pooling configured (if using)

### Documentation
- [ ] [README.md](README.md) is current
- [ ] [DEPLOYMENT.md](DEPLOYMENT.md) is complete
- [ ] [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md) has all endpoints
- [ ] Configuration examples provided
- [ ] Troubleshooting guide written

### Security
- [ ] JWT_SECRET is 32+ characters (not default)
- [ ] All demo user passwords changed
- [ ] Database user has limited permissions (no root)
- [ ] HTTPS/SSL certificate obtained
- [ ] CORS_ORIGIN restricted to production domain only
- [ ] File upload directory outside web root
- [ ] File upload size limits enforced
- [ ] No SQL injection vulnerabilities (using Knex.js)
- [ ] No XSS vulnerabilities (Vue sanitization)
- [ ] Secure headers configured (if using Nginx)
- [ ] Rate limiting considered/configured
- [ ] HTTPS redirect configured (HTTP → HTTPS)

---

## ✅ Phase 2: Infrastructure (Day before)

### Target Environment
- [ ] Server/VM provisioned and accessible
- [ ] OS is Ubuntu 20.04 LTS (or configured alternative)
- [ ] Minimum 2GB RAM available
- [ ] Minimum 20GB storage available
- [ ] Internet connectivity verified
- [ ] DNS records pointing to server IP
- [ ] Domain name confirmed and tested

### Software Requirements
- [ ] Node.js v18+ installed
- [ ] npm v9+ installed
- [ ] MySQL 8.0+ installed and running
- [ ] Git installed (for cloning repo)
- [ ] Nginx installed (if using reverse proxy)
- [ ] SSL certificate obtained (or Let's Encrypt path prepared)

### Network & Firewall
- [ ] Port 22 (SSH) open for admin access
- [ ] Port 80 (HTTP) open for web traffic
- [ ] Port 443 (HTTPS) open for secure web traffic
- [ ] Port 3306 (MySQL) closed to external (localhost only)
- [ ] Port 7000 (Backend) closed to external (proxy only)
- [ ] Firewall rules configured
- [ ] DDoS protection enabled (optional)

---

## ✅ Phase 3: Pre-Deployment Testing (2-4 hours before)

### Backend API Testing
- [ ] Backend starts without errors: `npm start`
- [ ] All 12 API endpoints respond (use [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md))
  - [ ] POST /api/auth/login returns JWT token
  - [ ] GET /api/topics returns topic list
  - [ ] GET /api/indicators returns indicators
  - [ ] GET /api/periods returns periods
  - [ ] GET /api/assignments returns assignments
  - [ ] GET /api/results returns results
  - [ ] GET /api/departments returns departments
- [ ] Error responses formatted correctly
- [ ] CORS headers present in responses
- [ ] Authentication middleware working
- [ ] Authorization checks working (role-based)
- [ ] Rate limiting (if configured) working
- [ ] Request logging working

### Frontend Testing
- [ ] Frontend builds without errors: `npm run build`
- [ ] All pages load and display correctly
- [ ] Admin pages load (login first with admin user)
- [ ] Evaluator pages load
- [ ] Evaluatee pages load
- [ ] Forms submit data to API correctly
- [ ] Pagination works in data tables
- [ ] CSV export works (if implemented)
- [ ] File upload works
- [ ] Error messages display properly
- [ ] Responsive design works on mobile
- [ ] No JavaScript console errors

### Database Testing
- [ ] Database connection successful
- [ ] All tables exist and have data
- [ ] Foreign key relationships work
- [ ] Indexes created on performance-critical columns
- [ ] Query performance acceptable (< 1 second)
- [ ] Backup process works

### Integration Testing
- [ ] Login flow works end-to-end
- [ ] User can create topic (admin)
- [ ] User can view topics (evaluator)
- [ ] User can submit evaluation (evaluator)
- [ ] User can view results (evaluatee)
- [ ] Pagination works
- [ ] Filtering works
- [ ] CSV export works
- [ ] File uploads work

### Performance Testing
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms (typical)
- [ ] Database query time < 1 second
- [ ] Memory usage stable
- [ ] CPU usage < 80% under typical load
- [ ] Concurrent user limit identified

---

## ✅ Phase 4: Deployment Day

### Pre-Deployment
- [ ] Latest code deployed to server (or cloned via git)
- [ ] Environment variables (.env files) configured
- [ ] Database created and seeded
- [ ] All dependencies installed
- [ ] Frontend built (`npm run build`)
- [ ] Logs directory exists and writable
- [ ] Upload directory exists and writable
- [ ] Backup directory exists
- [ ] SSL certification installed

### Service Startup
- [ ] Backend service started and stable
- [ ] Frontend service started and stable
- [ ] Reverse proxy (Nginx) started
- [ ] Database connections pooled and healthy
- [ ] All services set to auto-start on reboot

### Verification
- [ ] Frontend accessible at https://yourdomain.com
- [ ] Backend accessible at https://yourdomain.com/api
- [ ] Redirect from HTTP to HTTPS working
- [ ] Security headers present
- [ ] All pages load correctly
- [ ] Admin login works
- [ ] Demo user login works
- [ ] Evaluator workflow works
- [ ] Evaluatee view works
- [ ] Key features tested:
  - [ ] Create topic
  - [ ] Create indicator
  - [ ] Create period
  - [ ] Assign evaluator
  - [ ] Submit evaluation
  - [ ] View results
  - [ ] Export CSV
  - [ ] Upload file

### Monitoring Setup
- [ ] Error logging configured
- [ ] Access logging configured
- [ ] Application monitoring set up
- [ ] Database monitoring set up
- [ ] Server resource monitoring set up
- [ ] Uptime monitoring set up
- [ ] Alert rules configured

### Backup & Recovery
- [ ] Database backup script created
- [ ] Test backup/restore process
- [ ] Backup location identified
- [ ] Disaster recovery plan documented
- [ ] Administrator contacts documented

---

## ✅ Phase 5: Post-Deployment (First Week)

### Day 1-3
- [ ] Monitor logs for errors
- [ ] Monitor resource usage (CPU, RAM, disk)
- [ ] Verify all functionality works
- [ ] Test edge cases and error scenarios
- [ ] Verify email notifications (if used)
- [ ] Test with multiple browsers
- [ ] Test on mobile devices
- [ ] Run full integration tests
- [ ] Document any issues

### Day 4-7
- [ ] Monitor performance metrics
- [ ] Test backup/restore process
- [ ] Brief users on system features
- [ ] Collect user feedback
- [ ] Monitor for any errors or anomalies
- [ ] Verify scheduled tasks/jobs (if any)
- [ ] Review logs for security issues
- [ ] Plan for any necessary adjustments

### Week 2+
- [ ] Continue monitoring
- [ ] Address any issues from first week
- [ ] Optimize based on actual usage
- [ ] Plan for scaling (if needed)
- [ ] Plan feature enhancements
- [ ] Set up regular maintenance schedule
- [ ] Document lessons learned

---

## 🔒 Security Sign-Off

Before deploying to production:

**System Administrator**: _________________ Date: _______
- [ ] All security requirements met
- [ ] Vulnerabilities addressed
- [ ] Security policies understood
- [ ] Backup procedures tested

**Database Administrator**: _________________ Date: _______
- [ ] Database security configured
- [ ] Permissions restricted appropriately
- [ ] Backup procedures verified
- [ ] Query performance acceptable

**Network Administrator**: _________________ Date: _______
- [ ] Firewall rules configured
- [ ] SSL/TLS certificates installed
- [ ] DDoS protection (if applicable)
- [ ] Network monitoring configured

**Development Lead**: _________________ Date: _______
- [ ] Code reviewed
- [ ] All features tested
- [ ] Documentation complete
- [ ] Known issues documented

---

## 📝 Deployment Details

**Deployment Date/Time**: ________________  
**Deployed By**: ________________  
**Environment**: ________________  (Development/Staging/*Production)  
**Domain**: ________________  
**Server IP**: ________________  
**Database Host**: ________________  

**Rollback Information**:
- [ ] Previous version backup location: ________________
- [ ] Database backup location: ________________
- [ ] Rollback procedure documented: ________________

---

## 🚨 Emergency Contacts

In case of critical issues post-deployment:

| Role | Name | Phone | Email |
|------|------|-------|-------|
| System Admin | | | |
| Database Admin | | | |
| Network Admin | | | |
| Development Lead | | | |
| Project Manager | | | |

---

## ✅ Sign-Off

**By signing below, I confirm that this system is ready for production deployment.**

- [ ] All items checked above
- [ ] All issues resolved or documented
- [ ] System tested and verified
- [ ] Documentation complete
- [ ] Emergency procedures in place

**Deployment Approved By**: _________________ Date: _______

**Name & Title**: _________________ 

**Organization**: _________________

---

## 📋 Post-Deployment Validation (Repeat after deployment)

After system is deployed, verify:

- [ ] All pages load without errors
- [ ] Login/logout works
- [ ] Admin functions work
- [ ] Evaluator functions work
- [ ] Evaluatee functions work
- [ ] File uploads work
- [ ] CSV export works
- [ ] Error messages display correctly
- [ ] Performance is acceptable
- [ ] No security warnings or issues
- [ ] Monitoring/alerts working
- [ ] Backups running

**Date Verified**: ________________  
**Verified By**: ________________  

---

**Use this checklist before every deployment. Print, sign, and keep on file.**

**Last Updated**: February 2026
