enum UserType {
  graduate,
  employer,
  admin,
  institution;

  String get apiValue {
    switch (this) {
      case UserType.graduate:
        return 'graduate';
      case UserType.employer:
        return 'employer';
      case UserType.admin:
        return 'admin';
      case UserType.institution:
        return 'institution';
    }
  }

  static UserType fromApi(String value) {
    switch (value) {
      case 'graduate':
        return UserType.graduate;
      case 'employer':
        return UserType.employer;
      case 'admin':
        return UserType.admin;
      case 'institution':
        return UserType.institution;
      default:
        return UserType.graduate;
    }
  }
}

enum ApplicationStatus {
  pending,
  reviewed,
  shortlisted,
  interview,
  accepted,
  rejected,
  withdrawn;

  String get apiValue => name;
}

enum EmploymentType {
  fullTime,
  partTime,
  freelance,
  contract,
  internship,
  remote;

  String get apiValue {
    switch (this) {
      case EmploymentType.fullTime:
        return 'full_time';
      case EmploymentType.partTime:
        return 'part_time';
      default:
        return name;
    }
  }
}

enum ExperienceLevel {
  entry,
  junior,
  mid,
  senior,
  lead,
  executive;
}

enum NotificationType {
  application,
  interview,
  message,
  jobMatch,
  profileView,
  verification,
  system,
  announcement;
}

enum ThemeVariant {
  light,
  dark,
  system;
}
