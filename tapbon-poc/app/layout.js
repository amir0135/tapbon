import "./globals.css";

export const metadata = {
  title: "Tapbon — digital bon med ét tap",
  description: "Flere anmeldelser, flere stamkunder, og bonner der er klar til bogføring — fra hvert eneste salg.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="da">
      <body>{children}</body>
    </html>
  );
}
