import Hero from "@/components/Hero";
import Main from "@/components/Main";

export const metadata = {
  title: "Stutra",
  description: "Track your daily study hours toward your goal!",
};

export default function HomePage() {
  return (
    <Main>
      <Hero />
    </Main>
  );
}
