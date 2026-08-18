import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "价溯云图 - 农产品价格大数据平台",
  description: "智慧农业数据中心平台",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
