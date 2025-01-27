# Database Structure

## Overview

Dental CPMS uses SQLite database managed by Prisma ORM. The database schema is designed to meet the core requirements of a dental clinic.

## Data Models

### User
```prisma
model User {
  id       Int    @id @default(autoincrement())
  username String @unique
  password String
  email    String @unique
}
```
- Manages system users (doctors, staff)
- Requires unique username and email
- Password hashing for security

### Patient
```prisma
model Patient {
  id                 Int      @id @default(autoincrement())
  firstName          String
  lastName           String
  dateOfBirth        DateTime
  homePhone          String?
  currentTreatment   String?
  medicalHistory     String?
  surgeryHistory     String?
  anyMedicalProblems String?
  womenSpecificInfo  String?
  events             Event[]
  xrays              Xray[]
}
```
- Basic patient information
- Medical history and treatment records
- Related to appointments (Events) and X-rays

### Event (Appointments)
```prisma
model Event {
  id        Int      @id @default(autoincrement())
  title     String
  start     DateTime
  end       DateTime
  color     String
  patient   Patient? @relation(fields: [patientId], references: [id])
  patientId Int?
}
```
- Appointment management
- Start and end times
- Color coding for appointment categorization
- Optional patient association

### Xray
```prisma
model Xray {
  id            Int      @id @default(autoincrement())
  patientId     Int
  datePerformed DateTime
  findings      String
  impression    String
  imageUrl      String
  patient       Patient  @relation(fields: [patientId], references: [id])
}
```
- X-ray image management
- Capture date and findings
- Image URL storage
- Mandatory patient association

### Backup
```prisma
model Backup {
  id        String   @id @default(uuid())
  fileName  String
  size      Int
  createdAt DateTime @default(now())
}
```
- System backup tracking
- Automatic UUID generation
- File size and creation time tracking

## Relationships

1. **Patient - Event (1:N)**
   - A patient can have multiple appointments
   - Appointments can be optionally associated with a patient

2. **Patient - Xray (1:N)**
   - A patient can have multiple X-ray records
   - Each X-ray record must be associated with a patient

## Database Security

1. **Data Integrity**
   - Relational integrity through foreign key constraints
   - Null checks for required fields

2. **Uniqueness Controls**
   - Unique constraints for username and email
   - UUID usage for unique backup IDs

## Database Management

1. **Migrations**
   - Schema changes managed through Prisma migrations
   - Version control and rollback capability

2. **Backup**
   - Automated backup system
   - Backup history tracking

## Development Recommendations

1. **Soft Delete**
   - Implement soft delete for critical data
   - Add `deleted_at` field

2. **Audit Log**
   - Log data changes
   - Add `created_at` and `updated_at` fields

3. **Relationship Enhancements**
   - Add treatment plan model
   - Add prescription management model
   - Add financial model for payment tracking 