'use client';

import DashboardLayout from '../dashboard/layout';

export default function LawyersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

