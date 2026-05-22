import { Link } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import Footer from '../components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />
      <div className="container" style={{ flex: 1, padding: '48px 24px', maxWidth: 760 }}>
        <div style={{ marginBottom: 32 }}>
          <Link to="/" style={{ fontSize: 13, color: '#64748B', textDecoration: 'none' }}>← Back to Home</Link>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ fontSize: 13, color: '#64748B', marginBottom: 32 }}>Last updated: January 1, 2024</p>

        {[
          {
            title: '1. Information We Collect',
            body: 'We collect information you provide directly to us, such as when you create an account, register for events, or contact us for support. This includes your name, university email address, student ID, department, and profile information.',
          },
          {
            title: '2. How We Use Your Information',
            body: 'We use the information we collect to provide, maintain, and improve our services, process event registrations, send you notifications about events you\'ve registered for, and communicate with you about platform updates.',
          },
          {
            title: '3. Information Sharing',
            body: 'We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. This does not include trusted third parties who assist us in operating our platform, as long as those parties agree to keep this information confidential.',
          },
          {
            title: '4. Data Security',
            body: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Your data is stored securely on AASTU servers.',
          },
          {
            title: '5. Cookies',
            body: 'We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.',
          },
          {
            title: '6. Your Rights',
            body: 'You have the right to access, update, or delete your personal information at any time through your account settings. You may also contact us directly to request access to, correction of, or deletion of any personal information we hold about you.',
          },
          {
            title: '7. Contact Us',
            body: 'If you have any questions about this Privacy Policy, please contact us at support@aastu.edu.et or visit the AASTU ICT Department, Addis Ababa Science and Technology University.',
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
