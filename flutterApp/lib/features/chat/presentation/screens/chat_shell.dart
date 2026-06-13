import 'package:flutter/material.dart';

class ChatShell extends StatelessWidget {
  final Widget child;

  const ChatShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return child;
  }
}
