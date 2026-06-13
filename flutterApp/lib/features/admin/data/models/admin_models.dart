class AdminUser {
  final String id;
  final String name;
  final String email;
  final String role;
  final String status;
  final String? avatarUrl;
  final DateTime joinedDate;
  final int reportsCount;
  final bool isVerified;

  const AdminUser({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.status,
    this.avatarUrl,
    required this.joinedDate,
    this.reportsCount = 0,
    this.isVerified = false,
  });
}

class VerificationRequest {
  final String id;
  final String userName;
  final String userEmail;
  final String documentType;
  final String documentUrl;
  final String status;
  final DateTime submittedDate;
  final DateTime? reviewedDate;
  final String? reviewerNotes;

  const VerificationRequest({
    required this.id,
    required this.userName,
    required this.userEmail,
    required this.documentType,
    required this.documentUrl,
    required this.status,
    required this.submittedDate,
    this.reviewedDate,
    this.reviewerNotes,
  });
}

class FraudAlert {
  final String id;
  final String type;
  final String description;
  final String severity;
  final DateTime detectedDate;
  final String userName;
  final bool isResolved;

  const FraudAlert({
    required this.id,
    required this.type,
    required this.description,
    required this.severity,
    required this.detectedDate,
    required this.userName,
    this.isResolved = false,
  });
}

class CrudItem {
  final String id;
  final String name;
  final String nameAr;
  final String? description;
  final int usageCount;
  final bool isActive;

  const CrudItem({
    required this.id,
    required this.name,
    required this.nameAr,
    this.description,
    this.usageCount = 0,
    this.isActive = true,
  });
}

class Announcement {
  final String id;
  final String title;
  final String body;
  final String targetRole;
  final DateTime createdAt;
  final bool isPublished;

  const Announcement({
    required this.id,
    required this.title,
    required this.body,
    required this.targetRole,
    required this.createdAt,
    this.isPublished = true,
  });
}

class AuditEntry {
  final String id;
  final String action;
  final String adminName;
  final String targetType;
  final String targetName;
  final DateTime timestamp;
  final String details;

  const AuditEntry({
    required this.id,
    required this.action,
    required this.adminName,
    required this.targetType,
    required this.targetName,
    required this.timestamp,
    required this.details,
  });
}
