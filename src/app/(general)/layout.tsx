import Navbar from "@/components/Navbar";
import { getTheme } from "@/app/actions";

export default async function GeneralLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getTheme();
  
  return (
    <>
      <Navbar theme={theme}>{children}</Navbar>
    </>
  );
}
