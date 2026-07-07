import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../../../core/theme/app_theme.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});
  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl  = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passCtrl  = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _idCtrl    = TextEditingController();
  bool _showPass = false, _loading = false;
  String _role = 'student';
  String _course = 'Computer Science';
  String _dept = 'Computer Science';

  Future<void> _register() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    final auth = context.read<AuthProvider>();
    await auth.register(
      name: _nameCtrl.text.trim(),
      email: _emailCtrl.text.trim(),
      password: _passCtrl.text.trim(),
      role: _role,
      studentId: _role == 'student' ? _idCtrl.text.trim() : null,
      staffId: _role == 'lecturer' ? _idCtrl.text.trim() : null,
      department: _role == 'student' ? _course : _dept,
      phone: _phoneCtrl.text.trim(),
    );
    if (!mounted) return;
    setState(() => _loading = false);
    if (auth.error == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Account created! Please check your email to verify, then sign in.'), backgroundColor: AppColors.accent, behavior: SnackBarBehavior.floating));
      context.go('/login');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(auth.error!), backgroundColor: AppColors.danger, behavior: SnackBarBehavior.floating));
      auth.clearError();
    }
  }

  @override
  void dispose() { _nameCtrl.dispose(); _emailCtrl.dispose(); _passCtrl.dispose(); _phoneCtrl.dispose(); _idCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: AppColors.heroGradient)),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                const SizedBox(height: 20),
                Container(width: 56, height: 56, decoration: BoxDecoration(gradient: const LinearGradient(colors: AppColors.primaryGradient), borderRadius: BorderRadius.circular(16)), child: const Icon(Icons.school_rounded, color: Colors.white, size: 32)),
                const SizedBox(height: 12),
                const Text('Create Account', style: TextStyle(fontFamily: 'Poppins', fontSize: 24, fontWeight: FontWeight.w800, color: Colors.white)),
                const SizedBox(height: 4),
                Text('Join StudentTrack today!', style: TextStyle(color: Colors.white.withValues(alpha: 0.65), fontSize: 13)),
                const SizedBox(height: 28),

                Container(
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.2), blurRadius: 30, offset: const Offset(0, 10))]),
                  padding: const EdgeInsets.all(24),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Role toggle
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
                                    ),
                                    child: Text(r == 'student' ? '🎓 Student' : '👨‍🏫 Lecturer', textAlign: TextAlign.center, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: selected ? Colors.white : AppColors.gray)),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                        const SizedBox(height: 18),

                        for (final f in [
                          {'label': 'Full Name *', 'ctrl': _nameCtrl, 'hint': 'John Doe', 'icon': Icons.person_outline, 'type': TextInputType.name},
                          {'label': 'Email *', 'ctrl': _emailCtrl, 'hint': 'you@student.edutrack.edu', 'icon': Icons.email_outlined, 'type': TextInputType.emailAddress},
                          {
                            'label': _role == 'student' ? 'Student ID *' : 'Staff ID *',
                            'ctrl': _idCtrl,
                            'hint': _role == 'student' ? 'STU-2025-001' : 'STAFF001',
                            'icon': Icons.badge_outlined,
                            'type': TextInputType.text,
                          },
                          {'label': 'Phone', 'ctrl': _phoneCtrl, 'hint': '+1 (555) 000-0000', 'icon': Icons.phone_outlined, 'type': TextInputType.phone},
                        ]) ...[
                          Text(f['label']! as String, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: AppColors.dark2)),
                          const SizedBox(height: 6),
                          TextFormField(
                            controller: f['ctrl'] as TextEditingController,
                            keyboardType: f['type'] as TextInputType?,
                            decoration: InputDecoration(prefixIcon: Icon(f['icon'] as IconData, color: AppColors.grayLight), hintText: f['hint'] as String),
                            validator: (f['label'] as String).contains('*') ? (v) => (v?.isEmpty ?? true) ? 'Required' : null : null,
                          ),
                          const SizedBox(height: 14),
                        ],

                        // Password
                        const Text('Password *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: AppColors.dark2)),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _passCtrl, obscureText: !_showPass,
                          decoration: InputDecoration(
                            prefixIcon: const Icon(Icons.lock_outline, color: AppColors.grayLight),
                            hintText: 'Min. 8 characters',
                            suffixIcon: IconButton(icon: Icon(_showPass ? Icons.visibility_off_outlined : Icons.visibility_outlined, color: AppColors.grayLight), onPressed: () => setState(() => _showPass = !_showPass)),
                          ),
                          validator: (v) => (v?.length ?? 0) < 8 ? 'Min. 8 characters' : null,
                        ),
                        const SizedBox(height: 14),

                        // Course / Dept
                        Text(_role == 'student' ? 'Course' : 'Department', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: AppColors.dark2)),
                        const SizedBox(height: 6),
                        DropdownButtonFormField<String>(
                          initialValue: _role == 'student' ? _course : _dept,
                          decoration: const InputDecoration(prefixIcon: Icon(Icons.book_outlined, color: AppColors.grayLight)),
                          items: (_role == 'student'
                            ? ['Computer Science', 'Information Technology', 'Engineering', 'Business Admin', 'Education']
                            : ['Computer Science', 'Information Technology', 'Engineering', 'Business', 'Education', 'Science']
                          ).map((s) => DropdownMenuItem(value: s, child: Text(s, style: const TextStyle(fontSize: 14)))).toList(),
                          onChanged: (v) => setState(() { if (_role == 'student') { _course = v!; } else { _dept = v!; } }),
                        ),
                        const SizedBox(height: 20),

                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: _loading ? null : _register,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: _role == 'student' ? AppColors.primary : AppColors.secondary,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                            ),
                            child: _loading
                              ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                              : const Text('🚀 Create Account', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Already have an account?', style: TextStyle(color: Colors.white.withValues(alpha: 0.65), fontSize: 13)),
                    TextButton(onPressed: () => context.go('/login'), child: const Text('Sign In', style: TextStyle(color: Color(0xFF60A5FA), fontWeight: FontWeight.w700, fontSize: 13))),
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
