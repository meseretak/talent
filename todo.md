# 📌 StatisticsInformation Update Strategy

When building the service, make sure that updates to the `StatisticsInformation` model occur _implicitly_ within the appropriate service functions. This ensures that updates happen automatically as part of normal workflows, reducing maintenance overhead and avoiding forgotten updates.

---

## ✅ TODO: Implement Implicit Updates for `StatisticsInformation`

### 🛠 Project Service

- [ ] On project completion:
  - [ ] Increment `totalJobsCompleted`
  - [ ] Increment `totalProjects`
  - [ ] Update `totalClients` if the project is with a new client

### 📝 Task Service

- [ ] On task completion:
  - [ ] Increment `totalTasks`

### ⭐ Review Service

- [ ] On review submission:
  - [ ] Increment `totalReviews`
  - [ ] Recalculate and update `totalRating`

### 💰 Payment Service

- [ ] On payment processing:
  - [ ] Update `totalEarnings`

### 👥 Client Interaction

- [ ] When a freelancer works with a _new client_:
  - [ ] Increment `totalClients`

---
