#PeraVerse – Group 05 (Registration & Batch Management)

This repository contains the Group 05 module of the PeraVerse RFID Ticketing System.  
We focus on visitor registration, batch management, RFID tag linking, payments, and proximity tracking.

---

Features
- Visitor Registration UI & APIs (multilingual, WCAG 2.1 compliant)
- Batch Management (School 100, Friends 15, Family 25)
- RFID Tag Linking with QR backup
- Payment integration (≤3s response)
- Proximity tracking (5s check, 10m radius)
- Audit logs & security (TLS 1.3, AES-256, RBAC)

---

System Architecture
Our module is part of the larger PeraVerse system:  
- Frontend: React.js  
- Backend: Node.js + Express  
- Database: MySQL (AES-256, ACID, 10k concurrency)  
- Infrastructure: RFID readers, Wi-Fi/4G, payment gateway, alerts  



---

Data Model
Key entities:
- visitors (id, name, rfid_tag, group_type, status, entry/exit time)
- batches (batch_id, lead_id, type, members)
- rfid_tags (tag_id, status, assigned_to, histories)
- tickets (ticket_id, visitor_id, batch_id, zone_permissions)


---

Project Timeline
- Week 1–2: ERD, Architecture, WBS, Tech Stack  
- Week 3–4: Mockups, GitHub setup, DB + Core Backend  
- Week 5–8: Frontend & Backend Features, Integration, Testing  
- Final Weeks:Error handling, Validations, Final Testing  

---

Team Members
- E/21/342 Saabith – Registration UI Developer  
- E/21/375 Shagiththiah – Batch Management Specialist  
- E/21/206 Jeyatheeswaran – Tag Linking & QR Backup  
- E/21/386 Sivasuthan – Payments & Proximity  

---

Docs
- [Work Breakdown Structure]
- [System Architecture]
- [ER Diagram]
- [SRS]
