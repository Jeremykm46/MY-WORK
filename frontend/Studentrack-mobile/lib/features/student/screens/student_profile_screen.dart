import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../auth/providers/auth_provider.dart';

class StudentProfileScreen extends StatelessWidget {
  const StudentProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final auth = context.read<AuthProvider>();

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 240,
            pinned: true,
            backgroundColor: AppColors.primary,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [Color(0xFF1E3A5F), Color(0xFF2563EB)])),
                child: SafeArea(
                  child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                    const SizedBox(height: 20),
                    Stack(children: [
                      CircleAvatar(
                        radius: 44, backgroundColor: Colors.white.withValues(alpha: 0.2),
                        child: Text(user?.initials ?? 'S', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 28)),
                      ),
                      Positioned(bottom: 0, right: 0, child: Container(
                        width: 28, height: 28, decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                        child: const Icon(Icons.camera_alt_rounded, size: 15, color: AppColors.primary),
                      )),
                    ]),
                    const SizedBox(height: 10),
                    Text(user?.name ?? '', style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800, fontFamily: 'Poppins')),
                    const SizedBox(height: 4),
                    Text(user?.studentId ?? '', style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 13, fontFamily: 'monospace')),
                    const SizedBox(height: 8),
                    Wrap(spacing: 8, children: [
                      _Chip(user?.course ?? 'Student'),
                      const _Chip('Active', color: AppColors.accent),
                    ]),
                  ]),
                ),
              ),
            ),
          ),

          SliverPadding(
            padding: const EdgeInsets.all(16),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                // Stats
                const Row(children: [
                  _StatTile('91.4%', 'Attendance', AppColors.accent, AppColors.accentLight),
                  SizedBox(width: 12),
                  _StatTile('3.8', 'GPA', AppColors.primary, AppColors.primaryLight),
                  SizedBox(width: 12),
                  _StatTile('4', 'Courses', AppColors.secondary, AppColors.secondaryLight),
                ]),
                const SizedBox(height: 20),

                // Info
                _SectionCard(title: 'Personal Information', children: [
                  _InfoRow(Icons.person_outline, 'Full Name', user?.name ?? ''),
                  _InfoRow(Icons.email_outlined, 'Email', user?.email ?? ''),
                  _InfoRow(Icons.phone_outlined, 'Phone', user?.phone ?? 'Not set'),
                  _InfoRow(Icons.book_outlined, 'Course', user?.course ?? ''),
                  _InfoRow(Icons.school_outlined, 'Department', user?.department ?? ''),
                ]),
                const SizedBox(height: 12),

                // Settings
                _SectionCard(title: 'Settings & Preferences', children: [
                  _ActionRow(Icons.notifications_outlined, 'Notification Settings', onTap: () {}),
                  _ActionRow(Icons.lock_outline, 'Change Password', onTap: () {}),
                  _ActionRow(Icons.privacy_tip_outlined, 'Privacy Settings', onTap: () {}),
                  _ActionRow(Icons.help_outline, 'Help & Support', onTap: () {}),
                ]),
                const SizedBox(height: 20),

                // Logout
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () async {
                      await auth.logout();
                      if (context.mounted) context.go('/login');
                    },
                    icon: const Icon(Icons.logout_rounded, color: AppColors.danger),
                    label: const Text('Sign Out', style: TextStyle(color: AppColors.danger, fontWeight: FontWeight.w700)),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppColors.danger, width: 2),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
                const SizedBox(height: 80),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  final String label;
  final Color? color;
  const _Chip(this.label, {this.color});
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
    decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(20)),
    child: Text(label, style: TextStyle(color: color ?? Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
  );
}

class _StatTile extends StatelessWidget {
  final String value, label;
  final Color color, bg;
  const _StatTile(this.value, this.label, this.color, this.bg);
  @override
  Widget build(BuildContext context) => Expanded(child: Container(
    padding: const EdgeInsets.symmetric(vertical: 12),
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
    child: Column(children: [
      Text(value, style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w800, fontSize: 18, color: color)),
      Text(label, style: const TextStyle(fontSize: 11, color: AppColors.gray, fontWeight: FontWeight.w600)),
    ]),
  ));
}

class _SectionCard extends StatelessWidget {
  final String title;
  final List<Widget> children;
  const _SectionCard({required this.title, required this.children});
  @override
  Widget build(BuildContext context) => Container(
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.border)),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Padding(padding: const EdgeInsets.fromLTRB(16, 14, 16, 8), child: Text(title, style: const TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w700, fontSize: 14, color: AppColors.dark))),
      ...children,
    ]),
  );
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label, value;
  const _InfoRow(this.icon, this.label, this.value);
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
    decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppColors.border))),
    child: Row(children: [
      Icon(icon, size: 18, color: AppColors.grayLight),
      const SizedBox(width: 12),
      Text(label, style: const TextStyle(fontSize: 13, color: AppColors.gray)),
      const Spacer(),
      Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.dark)),
    ]),
  );
}

class _ActionRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _ActionRow(this.icon, this.label, {required this.onTap});
  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppColors.border))),
      child: Row(children: [
        Icon(icon, size: 18, color: AppColors.primary),
        const SizedBox(width: 12),
        Expanded(child: Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.dark))),
        const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.grayLight),
      ]),
    ),
  );
}
