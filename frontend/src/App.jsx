import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute, AdminRoute, OrganizerRoute, StudentRoute } from './components/layout/ProtectedRoute';

// Public pages
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import RegistrationPage from './pages/RegistrationPage';
import RegistrationConfirmationPage from './pages/RegistrationConfirmationPage';
import WaitlistConfirmationPage from './pages/WaitlistConfirmationPage';
import TeamRegistrationPage from './pages/TeamRegistrationPage';
import NotFoundPage from './pages/NotFoundPage';
import HelpPage from './pages/HelpPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import SuggestionsPage from './pages/SuggestionsPage';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import OnboardingPage from './pages/OnboardingPage';
import GoogleCallbackPage from './pages/auth/GoogleCallbackPage';

// Student pages
import StudentDashboard from './pages/dashboard/StudentDashboard';
import StudentTicketsPage from './pages/dashboard/StudentTicketsPage';
import StudentSettingsPage from './pages/dashboard/StudentSettingsPage';
import StudentAnalyticsPage from './pages/dashboard/StudentAnalyticsPage';
import StudentFeedbackPage from './pages/dashboard/StudentFeedbackPage';
import ApplyOrganizerPage from './pages/ApplyOrganizerPage';
import ProposeEventPage from './pages/ProposeEventPage';

// Organizer pages
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import OrganizerEventsPage from './pages/organizer/OrganizerEventsPage';
import OrganizerRegistrationsPage from './pages/organizer/OrganizerRegistrationsPage';
import OrganizerCheckinPage from './pages/organizer/OrganizerCheckinPage';
import OrganizerFeedbackPage from './pages/organizer/OrganizerFeedbackPage';
import OrganizerSuggestionsPage from './pages/organizer/OrganizerSuggestionsPage';
import OrganizerAnalyticsPage from './pages/organizer/OrganizerAnalyticsPage';
import OrganizerSettingsPage from './pages/organizer/OrganizerSettingsPage';
import OrganizerNotificationsPage from './pages/organizer/OrganizerNotificationsPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminCheckinPage from './pages/admin/AdminCheckinPage';
import AdminScannerPage from './pages/admin/AdminScannerPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';
import AdminTeamPage from './pages/admin/AdminTeamPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminApprovalPage from './pages/admin/AdminApprovalPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminAuditPage from './pages/admin/AdminAuditPage';
import AdminTicketsPage from './pages/admin/AdminTicketsPage';
import AdminOrganizerApplicationsPage from './pages/admin/AdminOrganizerApplicationsPage';
import AdminSuggestionsPage from './pages/admin/AdminSuggestionsPage';
import AdminFeedbackPage from './pages/admin/AdminFeedbackPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            <Routes>
              {/* ── Public ── */}
              <Route path="/" element={<HomePage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/suggestions" element={<SuggestionsPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />

              {/* ── Auth ── */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

              {/* ── Onboarding ── */}
              <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

              {/* ── Event registration (any logged-in user) ── */}
              <Route path="/events/:id/register" element={<ProtectedRoute><RegistrationPage /></ProtectedRoute>} />
              <Route path="/events/:id/confirmation" element={<ProtectedRoute><RegistrationConfirmationPage /></ProtectedRoute>} />
              <Route path="/events/:id/waitlist-confirmation" element={<ProtectedRoute><WaitlistConfirmationPage /></ProtectedRoute>} />
              <Route path="/events/:id/team" element={<ProtectedRoute><TeamRegistrationPage /></ProtectedRoute>} />

              {/* ── Student ── */}
              <Route path="/dashboard" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
              <Route path="/dashboard/tickets" element={<StudentRoute><StudentTicketsPage /></StudentRoute>} />
              <Route path="/dashboard/analytics" element={<StudentRoute><StudentAnalyticsPage /></StudentRoute>} />
              <Route path="/dashboard/settings" element={<StudentRoute><StudentSettingsPage /></StudentRoute>} />
              <Route path="/dashboard/feedback" element={<StudentRoute><StudentFeedbackPage /></StudentRoute>} />
              <Route path="/apply-organizer" element={<StudentRoute><ApplyOrganizerPage /></StudentRoute>} />
              <Route path="/propose-event" element={<StudentRoute><ProposeEventPage /></StudentRoute>} />

              {/* ── Organizer ── */}
              <Route path="/organizer" element={<OrganizerRoute><OrganizerDashboard /></OrganizerRoute>} />
              <Route path="/organizer/events" element={<OrganizerRoute><OrganizerEventsPage /></OrganizerRoute>} />
              <Route path="/organizer/registrations" element={<OrganizerRoute><OrganizerRegistrationsPage /></OrganizerRoute>} />
              <Route path="/organizer/checkin/:eventId" element={<OrganizerRoute><OrganizerCheckinPage /></OrganizerRoute>} />
              <Route path="/organizer/feedback" element={<OrganizerRoute><OrganizerFeedbackPage /></OrganizerRoute>} />
              <Route path="/organizer/suggestions" element={<OrganizerRoute><OrganizerSuggestionsPage /></OrganizerRoute>} />
              <Route path="/organizer/analytics" element={<OrganizerRoute><OrganizerAnalyticsPage /></OrganizerRoute>} />
              <Route path="/organizer/notifications" element={<OrganizerRoute><OrganizerNotificationsPage /></OrganizerRoute>} />
              <Route path="/organizer/settings" element={<OrganizerRoute><OrganizerSettingsPage /></OrganizerRoute>} />

              {/* ── Admin ── */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/events" element={<AdminRoute><AdminEventsPage /></AdminRoute>} />
              <Route path="/admin/tickets" element={<AdminRoute><AdminTicketsPage /></AdminRoute>} />
              <Route path="/admin/analytics" element={<AdminRoute><AdminAnalyticsPage /></AdminRoute>} />
              <Route path="/admin/checkin/:eventId" element={<AdminRoute><AdminCheckinPage /></AdminRoute>} />
              <Route path="/admin/scanner/:eventId" element={<AdminRoute><AdminScannerPage /></AdminRoute>} />
              <Route path="/admin/notifications" element={<AdminRoute><AdminNotificationsPage /></AdminRoute>} />
              <Route path="/admin/team" element={<AdminRoute><AdminTeamPage /></AdminRoute>} />
              <Route path="/admin/settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />
              <Route path="/admin/approval" element={<AdminRoute><AdminApprovalPage /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
              <Route path="/admin/audit" element={<AdminRoute><AdminAuditPage /></AdminRoute>} />
              <Route path="/admin/organizer-applications" element={<AdminRoute><AdminOrganizerApplicationsPage /></AdminRoute>} />
              <Route path="/admin/suggestions" element={<AdminRoute><AdminSuggestionsPage /></AdminRoute>} />
              <Route path="/admin/feedback" element={<AdminRoute><AdminFeedbackPage /></AdminRoute>} />

              {/* ── 404 ── */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
