import MinnerTransactionTable from "@/components/MinnerTransactionTable";
import MinnersStats from "@/components/MinnersStats";

export default function Home() {
  return (
    <div id="home" className="hero min-h-screen  bg-base-100">
      <div className="hero-content w-screen flex flex-col">
      <MinnersStats />
      <MinnerTransactionTable></MinnerTransactionTable>
      </div>
    </div>
  );
}
