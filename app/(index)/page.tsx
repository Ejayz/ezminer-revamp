import TransactionTable from "@/components/TransactionTable";
import Image from "next/image";

export default function Home() {
  return (
    <div id="home" className="hero min-h-screen bg-base-100">
      <div className="hero-content flex flex-col">
        <div className="gap-2 grid grid-row-2">
          <div className="card card-side w-full lg:w-3/4 h-auto lg:h-56  bg-base-100 shadow-xl">
            <figure>
              <Image
                src="/images/crypto_mining_convert.jpg"
                className="max-w-sm w-38 my-auto h-38 rounded-lg shadow-2xl"
                alt={"crypto_image_cpu"}
                height={1024}
                width={1024}
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title">CPU MINNING</h2>
              <p className="py-6">
                Ez Miner will allow you to mine hashes using your cpu. You can
                then convert those hashes into crypto currency of your choice.
              </p>
            </div>
          </div>
          <div className="card card-side w-full lg:w-3/4 lg:mr-0 lg:ml-auto mx-auto flex flex-row-reverse h-auto lg:h-56 bg-base-100 shadow-xl">
            <figure className="rounded-r-xl rounded-l-none">
              <Image
                src="/images/crypto_wallet.jpg"
                className="max-w-sm rounded-r-lg rounded-l-none shadow-2xl"
                alt={"crypto_image_cpu"}
                height={1024}
                width={1024}
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title">FAUCETPAY WITHDRAWAL</h2>
              <p className="py-6">
                We use one of biggest crypto earning and micro wallet platform
                for withdrawal. Faucetpay is a micro wallet that allows you to
                receive payments from faucets or websites that pay you in crypto
                currency.
              </p>
            </div>
          </div>
          <div className="card card-side w-full lg:w-3/4 h-auto lg:h-56 bg-base-100 shadow-xl">
            <figure>
              <Image
                src="/images/multiple_conversion_currency.jpg"
                className="max-w-sm rounded-lg shadow-2xl"
                alt={"crypto_image_cpu"}
                height={1024}
                width={1024}
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title">MULTIPLE CURRENCY SUPPORTED</h2>
              <p className="py-6">
                Hashes can be converted into multiple crypto currencies. You can
                choose from a wide range of crypto currencies. From Bitcoin to
                Dogecoin, we have it all.
              </p>
            </div>
          </div>
        </div>
        <iframe
          data-aa="2128000"
          src="//ad.a-ads.com/2128000?size=250x250"
          style={{
            width: "250px",
            height: "250px",
            border: "0px",
            padding: "0",
            overflow: "hidden",
            backgroundColor: "transparent",
          }}
        ></iframe>
        <div id="payout" className="w-full text-center my-12">
          <h1 className="text-4xl font-bold text-center">Payouts</h1>
          <TransactionTable />
        </div>
      </div>
    </div>
  );
}
