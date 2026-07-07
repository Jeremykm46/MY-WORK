import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../../../core/theme/app_theme.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _passCtrl  = TextEditingController();
  bool _showPass = false;
  bool _loading  = false;
  String _role   = 'student';

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    final auth = context.read<AuthProvider>();
    await auth.login(_emailCtrl.text.trim(), _passCtrl.text.trim());
    if (!mounted) return;
    setState(() => _loading = false);
    if (auth.error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(auth.error!), backgroundColor: AppColors.danger, behavior: SnackBarBehavior.floating),
      );
      auth.clearError();
    } else {
      final role = auth.user!.role;
      context.go(role == 'student' ? '/student' : '/lecturer');
    }
  }

  @override
  void dispose() { _emailCtrl.dispose(); _passCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: AppColors.heroGradient),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                const SizedBox(height: 32),
                // Logo
                Container(
                  width: 64, height: 64,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: AppColors.primaryGradient),
                    borderRadius: BorderRadius.circular(18),
                    boxShadow: [BoxShadow(color: AppColors.primary.withValues(alpha: 0.4), blurRadius: 20, offset: const Offset(0, 6))],
                  ),
                  child: const Icon(Icons.school_rounded, color: Colors.white, size: 36),
                ),
                const SizedBox(height: 16),
                RichText(
                  text: const TextSpan(
                    style: TextStyle(fontFamily: 'Poppins', fontSize: 28, fontWeight: FontWeight.w800),
                    children: [
                      TextSpan(text: 'Student', style: TextStyle(color: Colors.white)),
                      TextSpan(text: 'Track', style: TextStyle(color: Color(0xFF60A5FA))),
                    ],
                  ),
                ),
                const SizedBox(height: 6),
                Text('Sign in to your account', style: TextStyle(color: Colors.white.withValues(alpha: 0.65), fontSize: 14)),
                const SizedBox(height: 36),

                // Card
                Container(
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.2), blurRadius: 30, offset: const Offset(0, 10))]),
                  padding: const EdgeInsets.all(28),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Role tabs
                        Container(
                          decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(12)),
                          padding: const EdgeInsets.all(4),
                          child: Row(
                            children: ['student', 'lecturer'].map((r) {
                              final selected = _role == r;
                              return Expanded(
                                child: GestureDetector(
                                  onTap: () => setState(() => _role = r),
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 200),
                                    padding: const EdgeInsets.symmetric(vertical: 10),
                                    decoration: BoxDecoration(
                                      color: selected ? (r == 'student' ? AppColors.primary : AppColors.secondary) : Colors.transparent,
                                      borderRadius: BorderRadius.circular(9),
                                      boxShadow: selected ? [BoxShadow(color: (r == 'student' ? AppColors.primary : AppColors.secondary).withValues(alpha: 0.3), blurRadius: 8)] : [],
                                    ),
                                    child: Text(
                                      r == 'student' ? '🎓 Student' : '👨‍🏫 Lecturer',
                                      textAlign: TextAlign.center,
                                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: selected ? Colors.white : AppColors.gray),
                                    ),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Email
                        const Text('Email', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: AppColors.dark2)),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _emailCtrl,
                          keyboardType: TextInputType.emailAddress,
                          decoration: const InputDecoration(prefixIcon: Icon(Icons.email_outlined, color: AppColors.grayLight), hintText: 'Enter your email'),
                          validator: (v) => (v?.isEmpty ?? true) ? 'Email is required' : null,
                        ),
                        const SizedBox(height: 16),

                        // Password
                        const Text('Password', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: AppColors.dark2)),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _passCtrl,
                          obscureText: !_showPass,
                          decoration: InputDecoration(
                            prefixIcon: const Icon(Icons.lock_outline, color: AppColors.grayLight),
                            hintText: 'Enter your password',
                            suffixIcon: IconButton(icon: Icon(_showPass ? Icons.visibility_off_outlined : Icons.visibility_outlined, color: AppColors.grayLight), onPressed: () => setState(() => _showPass = !_showPass)),
                          ),
                          validator: (v) => (v?.isEmpty ?? true) ? 'Password is required' : null,
                        ),
                        const SizedBox(height: 12),

                        Align(
                          alignment: Alignment.centerRight,
                          child: TextButton(onPressed: () {}, child: const Text('Forgot?', style: TextStyle(fontSize: 12, color: AppColors.gray))),
                        ),
                        const SizedBox(height: 8),

                        // Login button
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: _loading ? null : _login,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: _role == 'student' ? AppColors.primary : AppColors.secondary,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                            ),
                            child: _loading
                              ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                              : const Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                                  Text('Sign In', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                                  SizedBox(width: 8),
                                  Icon(Icons.arrow_forward_rounded, size: 18),
                                ]),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text("Don't have an account?", style: TextStyle(color: Colors.white.withValues(alpha: 0.65), fontSize: 13)),
                    TextButton(
                      onPressed: () => context.go('/register'),
                      child: const Text('Sign Up', style: TextStyle(color: Color(0xFF60A5FA), fontWeight: FontWeight.w700, fontSize: 13)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
