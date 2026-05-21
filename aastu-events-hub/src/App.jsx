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
import TeamRegistrationPage from './pages/TeamRegistrationPage';
import NotFoundPage from './pages/NotFoundPage';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import OnboardingPage from './pages/OnboardingPage';

// Student dashboard
import StudentDashboard from './pages/dashboard/StudentDashboard';

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

              {/* ── Auth ── */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* ── Onboarding ── */}
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              } />

              {/* ── Registration ── */}
              <Route path="/events/:id/register" element={
                <ProtectedRoute>
                  <RegistrationPage />
                </ProtectedRoute>
              } />
              <Route path="/events/:id/team" element={
                <ProtectedRoute>
                  <TeamRegistrationPage />
                </ProtectedRoute>
              } />

              {/* ── Student Dashboard ── */}
              <Route path="/dashboard" element={
                <StudentRoute>
                  <StudentDashboard defaultTab="Overview" />
                </StudentRoute>
              } />
              <Route path="/dashboard/tickets" element={
                <StudentRoute>
                  <StudentDashboard defaultTab="My Events" />
                </StudentRoute>
              } />
              <Route path="/dashboard/analytics" element={
                <StudentRoute>
                  <StudentDashboard defaultTab="Overview" />
                </StudentRoute>
              } />
              <Route path="/dashboard/settings" element={
                <StudentRoute>
                  <StudentDashboard defaultTab="Profile" />
                </StudentRoute>
              } />

              {/* ── Admin ── */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/events" element={<AdminRoute><AdminEventsPage /></AdminRoute>} />
              <Route path="/admin/events/create" element={<AdminRoute><AdminEventsPage openCreate /></AdminRoute>} />
              <Route path="/admin/events/:id/edit" element={<AdminRoute><AdminEventsPage /></AdminRoute>} />
              <Route path="/admin/tickets" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
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
