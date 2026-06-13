class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic errors;

  const ApiException({
    required this.message,
    this.statusCode,
    this.errors,
  });

  factory ApiException.serverError(int statusCode, {String? message, dynamic errors}) {
    return ApiException(
      message: message ?? 'Server error occurred',
      statusCode: statusCode,
      errors: errors,
    );
  }

  factory ApiException.networkError([String? message]) {
    return ApiException(
      message: message ?? 'Network error. Please check your connection.',
    );
  }

  factory ApiException.timeoutError() {
    return const ApiException(message: 'Request timed out. Please try again.');
  }

  factory ApiException.unauthorized([String? message]) {
    return ApiException(
      message: message ?? 'Session expired. Please login again.',
      statusCode: 401,
    );
  }

  factory ApiException.validationError(dynamic errors) {
    return ApiException(
      message: 'Validation failed',
      statusCode: 422,
      errors: errors,
    );
  }

  factory ApiException.notFound([String? message]) {
    return ApiException(
      message: message ?? 'Resource not found',
      statusCode: 404,
    );
  }

  @override
  String toString() => 'ApiException: $message (${statusCode ?? "unknown"})';
}
