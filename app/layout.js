export const metadata = {
  title: "Filmplex",
  description: "Filmplex App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
