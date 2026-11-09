import 'package:flutter/material.dart';
import '../../core/app_state.dart';
import '../../core/i18n.dart';
import '../../core/theme.dart';
import 'account_tab.dart';
import 'bookings_tab.dart';
import 'explore_tab.dart';
import 'home_tab.dart';

/// Tourist (and visitor) area: Home, Explore, My bookings, Account.
class TouristShell extends StatefulWidget {
  const TouristShell({super.key});

  @override
  State<TouristShell> createState() => _TouristShellState();
}

class _TouristShellState extends State<TouristShell> {
  @override
  void initState() {
    super.initState();
    final catalog = AppScope.read(context).catalog;
    if (!catalog.loaded && !catalog.loading) catalog.load();
  }

  @override
  Widget build(BuildContext context) {
    final state = AppScope.of(context);
    return ValueListenableBuilder<int>(
      valueListenable: state.touristTab,
      builder: (context, tab, _) => PopScope(
        canPop: tab == 0,
        onPopInvokedWithResult: (didPop, _) {
          if (!didPop) state.touristTab.value = 0;
        },
        child: Scaffold(
          body: IndexedStack(
            index: tab,
            children: const [HomeTab(), ExploreTab(), BookingsTab(), AccountTab()],
          ),
          bottomNavigationBar: DecoratedBox(
            decoration: const BoxDecoration(
              color: Colors.white, boxShadow: AppShadows.navBar, border: Border(top: BorderSide(color: AppColors.border)),
            ),
            child: NavigationBar(
              selectedIndex: tab,
              onDestinationSelected: (i) => state.touristTab.value = i,
              destinations: [
                NavigationDestination(
                  icon: const Icon(Icons.home_outlined),
                  selectedIcon: const Icon(Icons.home_rounded),
                  label: context.tr('الرئيسية', 'Home'),
                ),
                NavigationDestination(
                  icon: const Icon(Icons.explore_outlined),
                  selectedIcon: const Icon(Icons.explore_rounded),
                  label: context.tr('استكشف', 'Explore'),
                ),
                NavigationDestination(
                  icon: const Icon(Icons.confirmation_number_outlined),
                  selectedIcon: const Icon(Icons.confirmation_number_rounded),
                  label: context.tr('حجوزاتي', 'Bookings'),
                ),
                NavigationDestination(
                  icon: const Icon(Icons.person_outline_rounded),
                  selectedIcon: const Icon(Icons.person_rounded),
                  label: context.tr('حسابي', 'Account'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Opens the Explore tab on one of its sections (0 trips, 1 landmarks, 2 hotels, 3 restaurants, 4 guides).
void openExplore(BuildContext context, int section) {
  final state = AppScope.read(context);
  state.exploreSection.value = section;
  state.touristTab.value = 1;
}
