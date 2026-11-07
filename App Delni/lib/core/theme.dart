import 'package:flutter/material.dart';

/// Delni design tokens, taken from the web platform (src/styles.css) so the app and the site look like one product.
class AppColors {
  static const primary = Color(0xFF003580); // Royal ocean blue
  static const primaryMid = Color(0xFF0D5C96);
  static const primaryGlow = Color(0xFF2563EB);
  static const navy = Color(0xFF0F172A);
  static const background = Color(0xFFFAF8F5); // Warm cream
  static const card = Colors.white;
  static const muted = Color(0xFFF3ECE1); // Sand beige
  static const mutedText = Color(0xFF5A6A85);
  static const accent = Color(0xFF10B981); // Emerald
  static const gold = Color(0xFFF59E0B);
  static const brandOrange = Color(0xFFD96B27); // Logo tagline
  static const destructive = Color(0xFFEF4444);
  static const border = Color(0xFFE8E2D6);
  static const sand = Color(0xFFFFFDF9);

  static const primarySoft = Color(0xFFE8EEF8);
  static const accentSoft = Color(0xFFE7F8F1);
  static const goldSoft = Color(0xFFFEF3DC);
  static const orangeSoft = Color(0xFFFBEDE3);
  static const destructiveSoft = Color(0xFFFDECEC);
}

class AppGradients {
  static const sun = LinearGradient(
    begin: AlignmentDirectional.topStart,
    end: AlignmentDirectional.bottomEnd,
    colors: [AppColors.primary, AppColors.primaryMid],
  );
  static const sea = LinearGradient(
    begin: AlignmentDirectional.topStart,
    end: AlignmentDirectional.bottomEnd,
    colors: [AppColors.primary, AppColors.accent],
  );
  static const sand = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [AppColors.sand, Color(0xFFF5EFE6)],
  );
  static const hero = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    stops: [0, 0.6, 1],
    colors: [Color(0x33003580), Color(0x8C0F172A), Color(0xE60F172A)],
  );
}

class AppShadows {
  static const soft = [BoxShadow(color: Color(0x1F003580), blurRadius: 20, offset: Offset(0, 4), spreadRadius: -4)];
  static const card = [BoxShadow(color: Color(0x120F172A), blurRadius: 30, offset: Offset(0, 10), spreadRadius: -10)];
  static const glow = [BoxShadow(color: Color(0x40003580), blurRadius: 40, offset: Offset(0, 15), spreadRadius: -10)];
}

class AppRadius {
  static const sm = 12.0;
  static const md = 16.0;
  static const lg = 20.0;
  static const xl = 24.0;
}

/// Spacing scale (4pt grid).
class Gap {
  static const xs = 4.0;
  static const sm = 8.0;
  static const md = 12.0;
  static const lg = 16.0;
  static const xl = 24.0;
  static const xxl = 32.0;
  static const page = 20.0;
}

class AppText {
  static const display = TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: AppColors.navy, height: 1.3);
  static const h1 = TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.navy, height: 1.35);
  static const h2 = TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.navy, height: 1.4);
  static const h3 = TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.navy, height: 1.4);
  static const body = TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.navy, height: 1.6);
  static const bodyMuted = TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: AppColors.mutedText, height: 1.6);
  static const caption = TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.mutedText, height: 1.4);
  static const label = TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.navy);
  static const price = TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primary);
}

class AppTheme {
  static const fontFamily = 'Cairo';

  static ThemeData light() {
    final scheme = ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      primary: AppColors.primary,
      onPrimary: Colors.white,
      secondary: AppColors.navy,
      onSecondary: Colors.white,
      tertiary: AppColors.accent,
      error: AppColors.destructive,
      surface: AppColors.card,
      onSurface: AppColors.navy,
    );
    final rounded = RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md));
    OutlineInputBorder border(Color c, [double w = 1]) => OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: c, width: w),
        );

    return ThemeData(
      useMaterial3: true,
      fontFamily: fontFamily,
      colorScheme: scheme,
      scaffoldBackgroundColor: AppColors.background,
      splashFactory: InkSparkle.splashFactory,
      dividerTheme: const DividerThemeData(color: AppColors.border, thickness: 1, space: 1),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.background,
        foregroundColor: AppColors.navy,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(fontFamily: fontFamily, fontSize: 17, fontWeight: FontWeight.w800, color: AppColors.navy),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
        hintStyle: const TextStyle(color: Color(0xFF9AA5B8), fontSize: 13, fontWeight: FontWeight.w500),
        labelStyle: const TextStyle(color: AppColors.mutedText, fontSize: 13, fontWeight: FontWeight.w600),
        floatingLabelStyle: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700),
        prefixIconColor: AppColors.mutedText,
        suffixIconColor: AppColors.mutedText,
        border: border(AppColors.border),
        enabledBorder: border(AppColors.border),
        focusedBorder: border(AppColors.primary, 1.6),
        errorBorder: border(AppColors.destructive),
        focusedErrorBorder: border(AppColors.destructive, 1.6),
        errorStyle: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          disabledBackgroundColor: AppColors.primary.withValues(alpha: 0.4),
          disabledForegroundColor: Colors.white70,
          elevation: 0,
          minimumSize: const Size(64, 52),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          textStyle: const TextStyle(fontFamily: fontFamily, fontSize: 15, fontWeight: FontWeight.w800),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primary,
          minimumSize: const Size(64, 52),
          side: const BorderSide(color: AppColors.border, width: 1.4),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          textStyle: const TextStyle(fontFamily: fontFamily, fontSize: 14, fontWeight: FontWeight.w700),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.primary,
          textStyle: const TextStyle(fontFamily: fontFamily, fontSize: 13.5, fontWeight: FontWeight.w700),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: Colors.white,
        selectedColor: AppColors.primary,
        side: const BorderSide(color: AppColors.border),
        labelStyle: const TextStyle(fontFamily: fontFamily, fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.navy),
        secondaryLabelStyle: const TextStyle(fontFamily: fontFamily, fontSize: 12.5, fontWeight: FontWeight.w700, color: Colors.white),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        showCheckmark: false,
      ),
      cardTheme: CardThemeData(color: Colors.white, elevation: 0, margin: EdgeInsets.zero, shape: rounded),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        showDragHandle: true,
        dragHandleColor: Color(0xFFD6D0C4),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl))),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.xl)),
        titleTextStyle: const TextStyle(fontFamily: fontFamily, fontSize: 17, fontWeight: FontWeight.w800, color: AppColors.navy),
        contentTextStyle: const TextStyle(fontFamily: fontFamily, fontSize: 13.5, color: AppColors.mutedText, height: 1.6),
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: AppColors.navy,
        contentTextStyle: const TextStyle(fontFamily: fontFamily, fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        insetPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      ),
      navigationBarTheme: NavigationBarThemeData(
        height: 68,
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        indicatorColor: AppColors.primarySoft,
        elevation: 0,
        labelTextStyle: WidgetStateProperty.resolveWith((s) => TextStyle(
              fontFamily: fontFamily,
              fontSize: 11.5,
              fontWeight: s.contains(WidgetState.selected) ? FontWeight.w800 : FontWeight.w600,
              color: s.contains(WidgetState.selected) ? AppColors.primary : AppColors.mutedText,
            )),
        iconTheme: WidgetStateProperty.resolveWith((s) => IconThemeData(
              size: 24,
              color: s.contains(WidgetState.selected) ? AppColors.primary : AppColors.mutedText,
            )),
      ),
      tabBarTheme: const TabBarThemeData(
        labelColor: AppColors.primary,
        unselectedLabelColor: AppColors.mutedText,
        indicatorColor: AppColors.primary,
        dividerColor: Colors.transparent,
        labelStyle: TextStyle(fontFamily: fontFamily, fontSize: 13.5, fontWeight: FontWeight.w800),
        unselectedLabelStyle: TextStyle(fontFamily: fontFamily, fontSize: 13.5, fontWeight: FontWeight.w600),
      ),
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.all(Colors.white),
        trackColor: WidgetStateProperty.resolveWith((s) => s.contains(WidgetState.selected) ? AppColors.accent : const Color(0xFFCBD2DC)),
        trackOutlineColor: WidgetStateProperty.all(Colors.transparent),
      ),
      checkboxTheme: CheckboxThemeData(
        fillColor: WidgetStateProperty.resolveWith((s) => s.contains(WidgetState.selected) ? AppColors.primary : Colors.white),
        side: const BorderSide(color: Color(0xFFC9C2B4), width: 1.4),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(color: AppColors.primary),
      datePickerTheme: DatePickerThemeData(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        headerBackgroundColor: AppColors.primary,
        headerForegroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.xl)),
      ),
    );
  }
}
