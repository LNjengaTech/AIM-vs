// app/privacy/page.tsx
// Privacy Policy for AIM-Mombasa.
// Public page — no auth required.
// This is a research project at TUM; policy reflects student project scope.

import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/home/footer";

export const metadata: Metadata = {
  title: "Privacy Policy | AIM-Mombasa",
  description: "How AIM-Mombasa collects, uses, and protects your data.",
};

interface PolicySectionProps {
  title: string;
  children: React.ReactNode;
}

const PolicySection = ({ title, children }: PolicySectionProps) => (
  <section className="mb-10">
    <h2 className="text-xl font-bold border-b pb-2 mb-4">{title}</h2>
    <div className="text-muted-foreground leading-relaxed space-y-3 text-sm">
      {children}
    </div>
  </section>
);

export default async function PrivacyPage() {
  const session = await auth();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={session?.user} />
      
      <main className="flex-grow container max-w-3xl mx-auto py-16 px-4">
        <header className="mb-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">Legal</p>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm">Last updated: April 2026.</p>
        </header>

        <PolicySection title="1. Overview">
          <p>
            AIM-Mombasa is an academic research project developed at the Technical University of Mombasa (TUM) by Lonnex Njenga. 
            This Privacy Policy describes how we collect, use, and handle your information when you use our platform.
          </p>
        </PolicySection>

        <PolicySection title="2. Data We Collect">
          <p>We collect several types of information for various purposes to provide and improve our service to you:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account data:</strong> Name, email address, and hashed password. Dealers provide additional details including business name, phone number, location, and dealer permit.</li>
            <li><strong>Car listings:</strong> Vehicle specifications (make, model, year, price, mileage) and photos uploaded to Cloudinary.</li>
            <li><strong>Usage data:</strong> Page views, favorites, and BOLO (Be On Look Out) requests. This data is used solely for analytics and ranking algorithms.</li>
            <li><strong>Messages:</strong> In-platform messages between dealers and administrators. These communications are not shared with any external parties.</li>
          </ul>
        </PolicySection>

        <PolicySection title="3. How We Use Your Data">
          <p>The data we collect is used to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Operate and maintain the platform (authentication, listing management, BOLO alerts).</li>
            <li>Provide dealer analytics, such as tracking views, leads, and favorites per listing.</li>
            <li>Enable administrator review for dealer and listing verifications.</li>
            <li><strong>Note:</strong> We do NOT sell, rent, or trade your data with any third party.</li>
          </ul>
        </PolicySection>

        <PolicySection title="4. Image Storage (Cloudinary)">
          <p>
            All images uploaded to the platform are stored on Cloudinary's secure servers. We store only the URL references to these images in our database. 
            Cloudinary is GDPR-compliant, and by uploading images, users agree to Cloudinary's Terms of Service.
          </p>
        </PolicySection>

        <PolicySection title="5. Authentication & Sessions">
          <p>
            Authentication is handled by NextAuth.js using encrypted JWT (JSON Web Token) sessions. 
            Passwords are stored as secure bcrypt hashes — they are never stored in plain text and are never visible to the development team.
          </p>
        </PolicySection>

        <PolicySection title="6. Data Retention">
          <p>
            Account data is retained for as long as your account exists. Deleting your account will remove all associated data, 
            including listings, BOLO requests, messages, and favorites, from our primary database. 
            Images stored on Cloudinary are not automatically deleted upon account removal; please contact us for manual removal if required.
          </p>
        </PolicySection>

        <PolicySection title="7. Your Rights">
          <p>
            You may request account deletion at any time through your account Settings page. 
            For any enquiries regarding your data or to request a copy of the information we hold, please use the form on our Contact page.
          </p>
        </PolicySection>

        <PolicySection title="8. Research Context">
          <p>
            Data collected through AIM-Mombasa is used solely to demonstrate the platform's functionality as part of an IT research project. 
            There is no commercial intent behind this platform, and no data is shared with external commercial entities.
          </p>
        </PolicySection>

        <PolicySection title="9. Changes to This Policy">
          <p>
            We may update our Privacy Policy from time to time. The "Last updated" date at the top of this page will reflect the most recent revisions.
          </p>
        </PolicySection>
      </main>

      <Footer />
    </div>
  );
}
