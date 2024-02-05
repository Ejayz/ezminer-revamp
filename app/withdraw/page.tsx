import RegisterComponent from "@/components/RegisterComponent";
import WithdrawComponent from "@/components/WithdrawComponent";

export default function Home() {
  return (
    <div id="home" className="hero min-h-screen bg-base-100">
      <WithdrawComponent />
    </div>
  );
}
