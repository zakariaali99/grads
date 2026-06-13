import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/api_constants.dart';

class AuthInterceptor extends Interceptor {
  final FlutterSecureStorage _storage;

  AuthInterceptor(this._storage);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await _storage.read(key: 'access_token');
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    options.headers['Accept-Language'] = 'ar';
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      final refreshToken = await _storage.read(key: 'refresh_token');
      if (refreshToken != null) {
        try {
          final dio = Dio(BaseOptions(baseUrl: ApiConstants.apiUrl));
          final response = await dio.post('/auth/refresh/', data: {
            'refresh': refreshToken,
          });

          if (response.statusCode == 200) {
            final newAccess = response.data['access'] as String;
            final newRefresh = response.data['refresh'] as String;

            await _storage.write(key: 'access_token', value: newAccess);
            await _storage.write(key: 'refresh_token', value: newRefresh);

            err.requestOptions.headers['Authorization'] = 'Bearer $newAccess';
            final retryResponse = await dio.fetch(err.requestOptions);
            handler.resolve(retryResponse);
            return;
          }
        } catch (_) {
          await _storage.deleteAll();
        }
      }
    }

    handler.next(err);
  }
}
