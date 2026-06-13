import 'package:equatable/equatable.dart';
import '../../../core/constants/enums.dart';

class UserModel extends Equatable {
  final String id;
  final String email;
  final String? phone;
  final String? fullName;
  final String? avatar;
  final String? bio;
  final UserType userType;
  final bool isVerified;
  final bool isBanned;
  final double profileCompletion;
  final String? dateOfBirth;
  final String? gender;

  const UserModel({
    required this.id,
    required this.email,
    this.phone,
    this.fullName,
    this.avatar,
    this.bio,
    required this.userType,
    this.isVerified = false,
    this.isBanned = false,
    this.profileCompletion = 0,
    this.dateOfBirth,
    this.gender,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id']?.toString() ?? '',
      email: json['email'] ?? '',
      phone: json['phone'],
      fullName: json['full_name'],
      avatar: json['avatar'],
      bio: json['bio'],
      userType: UserType.fromApi(json['user_type'] ?? 'graduate'),
      isVerified: json['is_verified'] ?? false,
      isBanned: json['is_banned'] ?? false,
      profileCompletion: (json['profile_completion'] ?? 0).toDouble(),
      dateOfBirth: json['date_of_birth'],
      gender: json['gender'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'phone': phone,
      'full_name': fullName,
      'avatar': avatar,
      'bio': bio,
      'user_type': userType.apiValue,
      'is_verified': isVerified,
      'is_banned': isBanned,
      'profile_completion': profileCompletion,
      'date_of_birth': dateOfBirth,
      'gender': gender,
    };
  }

  UserModel copyWith({
    String? id,
    String? email,
    String? phone,
    String? fullName,
    String? avatar,
    String? bio,
    UserType? userType,
    bool? isVerified,
    bool? isBanned,
    double? profileCompletion,
    String? dateOfBirth,
    String? gender,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      fullName: fullName ?? this.fullName,
      avatar: avatar ?? this.avatar,
      bio: bio ?? this.bio,
      userType: userType ?? this.userType,
      isVerified: isVerified ?? this.isVerified,
      isBanned: isBanned ?? this.isBanned,
      profileCompletion: profileCompletion ?? this.profileCompletion,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      gender: gender ?? this.gender,
    );
  }

  @override
  List<Object?> get props => [
        id,
        email,
        phone,
        fullName,
        avatar,
        bio,
        userType,
        isVerified,
        isBanned,
        profileCompletion,
      ];
}
