import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute, AdminRoute, StudentRoute } from './components/layout/ProtectedRoute';

// Public pages
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import RegistrationPage from './pages/RegistrationPage';
import RegistrationConfirmationPage from './pages/RegistrationConfirmationPage';
import WaitlistConfirmationPage from './pages/WaitlistConfirmationPage';
import TeamRegistrationPage from './pages/TeamRegistrationPage';
import NotFoundPage from './pages/NotFoundPage';
import ProposeEventPage from './pages/ProposeEventPage';
import HelpPage from './pages/HelpPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import OnboardingPage from './pages/OnboardingPage';
import GoogleCallbackPage from './pages/auth/GoogleCallbackPage';

// Student dashboard
import StudentDashboard from './pages/dashboard/StudentDashboard';
import StudentTicketsPage from './pages/dashboard/StudentTicketsPage';
import StudentSettingsPage from './pages/dashboard/StudentSettingsPage';
import StudentAnalyticsPage from './pages/dashboard/StudentAnalyticsPage';

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

              {/* ── Registration ── */}
              <Route path="/events/:id/register" element={<ProtectedRoute><RegistrationPage /></ProtectedRoute>} />
              <Route path="/events/:id/confirmation" element={<ProtectedRoute><RegistrationConfirmationPage /></ProtectedRoute>} />
              <Route path="/events/:id/waitlist-confirmation" element={<ProtectedRoute><WaitlistConfirmationPage /></ProtectedRoute>} />
              <Route path="/events/:id/team" element={<ProtectedRoute><TeamRegistrationPage /></ProtectedRoute>} />

              {/* ── Propose Event ── */}
              <Route path="/propose-event" element={<StudentRoute><ProposeEventPage /></StudentRoute>} />

              {/* ── Student Dashboard ── */}
              <Route path="/dashboard" element={<StudentRoute><StudentDashboard defaultTab="Overview" /></StudentRoute>} />
              <Route path="/dashboard/tickets" element={<StudentRoute><StudentTicketsPage /></StudentRoute>} />
              <Route path="/dashboard/analytics" element={<StudentRoute><StudentAnalyticsPage /></StudentRoute>} />
              <Route path="/dashboard/settings" element={<StudentRoute><StudentSettingsPage /></StudentRoute>} />

              {/* ── Admin ── */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/events" element={<AdminRoute><AdminEventsPage /></AdminRoute>} />
              <Route path="/admin/events/create" element={<AdminRoute><AdminEventsPage openCreate /></AdminRoute>} />
              <Route path="/admin/events/:id/edit" element={<AdminRoute><AdminEventsPage /></AdminRoute>} />
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

              {/* ── 404 ── */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
