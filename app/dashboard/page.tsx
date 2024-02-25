"use client";
import MinnerTransactionTable from "@/components/MinnerTransactionTable";
import MinnersStats from "@/components/MinnersStats";
import { useQuery } from "@tanstack/react-query";
import Marquee from "react-fast-marquee";

export default function Home() {
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey: ["getMaintenanceMode"],
    queryFn: async () => {
      const res = await fetch("/api/v1/getMaintenance", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return res.json();
    },
  });

  console.log(data);
  return (
    <>
      <Marquee className="bg-base-100 flex text-xl">
        {isLoading || isFetching ? (
          <span>Getting announcements...</span>
        ) : (
          <>
            <span className="">Announcements:</span>
            <div className="mx-2 badge badge-neutral badge-sm mt-auto mb-auto"></div>
            {data.data.is_maintenance ? (
              <span>Minner is currently in maintenance.</span>
            ) : (
              <> </>
            )}
            <div className="mx-2 badge badge-neutral badge-sm mt-auto mb-auto"></div>
            {isFetching || isLoading ? (
              <span>Checking withrawal method status...</span>
            ) : data.data.is_auto_transaction ? (
              <span>Auto transaction is enabled.</span>
            ) : (
              <span>Auto transaction is disabled.</span>
            )}
            <div className="mx-2 badge badge-neutral badge-sm mt-auto mb-auto"></div>
          </>
        )}
      </Marquee>
      <div id="home" className="hero min-h-screen  bg-base-100">
        <div className="hero-content w-screen flex flex-col">
          <MinnersStats />
          <MinnerTransactionTable></MinnerTransactionTable>
        </div>
      </div>
    </>
  );
}
