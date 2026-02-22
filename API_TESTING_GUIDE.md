# API Testing Guide

**Quick reference for testing all API endpoints**

## Authentication

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@ccollege.ac.th",
  "password": "admin123"
}

# Response includes: { success, data: { name_th, role, email, token } }
```

Store the `token` from response. Use it in subsequent requests:
```bash
Authorization: Bearer {token}
```

---

## Topics API

**List Topics**
```bash
GET /api/topics
Authorization: Bearer {token}
```

**Get Single Topic**
```bash
GET /api/topics/:id
Authorization: Bearer {token}
```

**Create Topic** (Admin only)
```bash
POST /api/topics
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "T001",
  "name_th": "ทักษะด้านการสอน",
  "weight": 10,
  "is_active": true
}
```

**Update Topic** (Admin only)
```bash
PUT /api/topics/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name_th": "Updated Name",
  "weight": 15
}
```

**Delete Topic** (Admin only)
```bash
DELETE /api/topics/:id
Authorization: Bearer {token}
```

---

## Indicators API

**List Indicators**
```bash
GET /api/indicators
Authorization: Bearer {token}

# Optional query params:
# ?topic_id=1
# ?page=1&itemsPerPage=10
```

**Get Single Indicator with Evidence Types**
```bash
GET /api/indicators/:id
Authorization: Bearer {token}

# Returns: indicator + associated evidence types
```

**Create Indicator** (Admin only)
```bash
POST /api/indicators
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "IND001",
  "name_th": "ตัวชี้วัดการสอน",
  "description": "รายละเอียด",
  "topic_id": 1,
  "type": "score_1_4",
  "min_evidence_required": 1,
  "is_active": true,
  "evidence_ids": [1, 2, 3]
}
```

**Update Indicator** (Admin only)
```bash
PUT /api/indicators/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name_th": "Updated Indicator",
  "evidence_ids": [1, 2]
}
```

**Delete Indicator** (Admin only)
```bash
DELETE /api/indicators/:id
Authorization: Bearer {token}
```

---

## Periods API

**List Periods**
```bash
GET /api/periods
Authorization: Bearer {token}
```

**Create Period** (Admin only)
```bash
POST /api/periods
Authorization: Bearer {token}
Content-Type: application/json

{
  "name_th": "รอบที่ 1",
  "start_date": "2024-01-01",
  "end_date": "2024-03-31",
  "is_active": true,
  "buddhist_year": 2567
}
```

**Toggle Active Status** (Admin only)
```bash
PUT /api/periods/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "is_active": false
}
```

**Delete Period** (Admin only)
```bash
DELETE /api/periods/:id
Authorization: Bearer {token}
```

---

## Assignments API

**List Assignments**
```bash
GET /api/assignments
Authorization: Bearer {token}

# Query params:
# ?period_id=1
# ?evaluator_id=5
# ?evaluatee_id=10
```

**Create Assignment** (Admin only)
```bash
POST /api/assignments
Authorization: Bearer {token}
Content-Type: application/json

{
  "period_id": 1,
  "evaluator_id": 5,      # Must be evaluator role
  "evaluatee_id": 10      # Must be evaluatee role
}
```

**Update Assignment** (Admin only)
```bash
PUT /api/assignments/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "evaluatee_id": 11
}
```

**Delete Assignment** (Admin only)
```bash
DELETE /api/assignments/:id
Authorization: Bearer {token}
```

---

## Results API

**List Results**
```bash
GET /api/results
Authorization: Bearer {token}

# Query params:
# ?period_id=1
# ?evaluatee_id=10
# ?evaluator_id=5
# ?status=submitted
```

**Get Single Result**
```bash
GET /api/results/:id
Authorization: Bearer {token}
```

**Create Result** (Evaluator submits evaluation)
```bash
POST /api/results
Authorization: Bearer {token}
Content-Type: application/json

{
  "assignment_id": 1,
  "indicator_id": 5,
  "topic_id": 1,
  "evaluatee_id": 10,
  "evaluator_id": 5,
  "period_id": 1,
  "score": 4,              # For score_1_4 indicators
  "value_yes_no": true,    # For yes_no indicators
  "notes": "Excellent",
  "status": "draft"        # or "submitted"
}
```

**Update Result** (Evaluator edits before submitting)
```bash
PUT /api/results/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "score": 3,
  "notes": "Good work",
  "status": "submitted"
}
```

**Delete Result**
```bash
DELETE /api/results/:id
Authorization: Bearer {token}
```

---

## Departments API

**List Departments**
```bash
GET /api/departments
Authorization: Bearer {token}
```

**Get Single Department**
```bash
GET /api/departments/:id
Authorization: Bearer {token}

# Returns: department + vocational field info
```

---

## Testing Workflow Example

### 1. Admin Setup (Admin login)
```bash
# Login as admin
POST /api/auth/login
{
  "email": "admin@ccollege.ac.th",
  "password": "admin123"
}
# Save token from response

# Create period
POST /api/periods
{
  "name_th": "Test Period",
  "start_date": "2024-01-01",
  "end_date": "2024-03-31",
  "is_active": true
}
# Save period_id from response

# Create assignment
POST /api/assignments
{
  "period_id": {period_id},
  "evaluator_id": 5,
  "evaluatee_id": 10
}
# Save assignment_id from response
```

### 2. Evaluator Workflow (Evaluator login)
```bash
# Login as evaluator
POST /api/auth/login
{
  "email": "eva.me@ccollege.ac.th",
  "password": "password123"
}
# Save evaluator token

# View assigned tasks
GET /api/assignments?evaluator_id=5

# Submit evaluation result
POST /api/results
{
  "assignment_id": {assignment_id},
  "indicator_id": 1,
  "topic_id": 1,
  "evaluatee_id": 10,
  "evaluator_id": 5,
  "period_id": {period_id},
  "score": 4,
  "notes": "Excellent performance",
  "status": "submitted"
}
```

### 3. Evaluatee Workflow (Evaluatee login)
```bash
# Login as evaluatee
POST /api/auth/login
{
  "email": "t.it01@ccollege.ac.th",
  "password": "demo123"
}
# Save evaluatee token

# View my results
GET /api/results?evaluatee_id=10&period_id={period_id}

# View progress
# Frontend handles grouping and statistics
```

---

## Testing with cURL

Save token to environment variable:
```bash
TOKEN=$(curl -X POST http://localhost:7000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ccollege.ac.th","password":"admin123"}' \
  -s | jq -r '.data.token')

echo $TOKEN
```

Use token in requests:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:7000/api/topics
```

---

## Testing with Postman

1. Create new Collection: "Competency Evaluation System"
2. Create new Environment with variables:
   - `baseUrl`: http://localhost:7000
   - `token`: (empty, will be set by auth request)
3. Create request for login:
   - Add Pre-request Script:
   ```javascript
   // Auto-set token after successful login
   pm.environment.set("token", pm.response.json().data.token);
   ```
4. In all other requests, use:
   - Authorization header: `Bearer {{token}}`
5. Run requests in order to test complete workflow

---

## Response Format

All API responses follow this format:

**Success (201, 200):**
```json
{
  "success": true,
  "data": { /* resource data */ },
  "message": "Operation successful"
}
```

**List Response (200):**
```json
{
  "success": true,
  "items": [ /* array of resources */ ],
  "total": 25,
  "page": 1,
  "itemsPerPage": 10
}
```

**Error (400, 404, 422, 500):**
```json
{
  "success": false,
  "message": "Error description",
  "error": { /* error details */ }
}
```

---

## Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | GET request successful |
| 201 | Created | POST created resource |
| 204 | No Content | DELETE successful |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate assignment |
| 422 | Validation Error | Invalid data format |
| 500 | Server Error | Database/server issue |

---

**Test Plan Last Updated**: February 2026
