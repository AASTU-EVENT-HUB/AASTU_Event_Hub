import { Link } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import Footer from '../components/layout/Footer';

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />
      <div className="container" style={{ flex: 1, padding: '48px 24px', maxWidth: 760 }}>
        <div style={{ marginBottom: 32 }}>
          <Link to="/" style={{ fontSize: 13, color: '#64748B', textDecoration: 'none' }}>← Back to Home</Link>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ fontSize: 13, color: '#64748B', marginBottom: 32 }}>Last updated: January 1, 2024</p>

        {[
          {
            title: '1. Acceptance of Terms',
            body: 'By accessing and using the AASTU Events Hub platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.',
          },
          {
            title: '2. Eligibility',
            body: 'The AASTU Events Hub is intended for use by currently enrolled students, faculty, and staff of Addis Ababa Science and Technology University. You must have a valid AASTU email address to create an account.',
          },
          {
            title: '3. User Accounts',
            body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.',
          },
          {
            title: '4. Event Registration',
            body: 'When you register for an event, you commit to attending. Repeated no-shows may result in restrictions on future registrations. Cancellations must be made at least 24 hours before the event start time.',
          },
          {
            title: '5. Code of Conduct',
            body: 'All users must adhere to the AASTU Code of Conduct when participating in events. Harassment, discrimination, or disruptive behavior will result in immediate removal from the event and potential account suspension.',
          },
          {
            title: '6. Intellectual Property',
            body: 'The AASTU Events Hub platform and its original content, features, and functionality are owned by Addis Ababa Science and Technology University and are protected by international copyright, trademark, and other intellectual property laws.',
          },
          {
            title: '7. Limitation of Liability',
            body: 'AASTU Events Hub shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.',
          },
          {
            title: '8. Changes to Terms',
            body: 'We reserve the right to modify these terms at any time. We will notify users of significant changes via email or platform notification. Continued use of the platform after changes constitutes acceptance of the new terms.',
          },
          {
            title: '9. Contact',
            body: 'For questions about these Terms of Service, contact us at support@aastu.edu.et.',
          },
        ].map(section => (
          <div key={section.title} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 10 }}>{section.title}</h2>
            <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.8 }}>{section.body}</p>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}
