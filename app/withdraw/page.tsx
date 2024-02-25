"use client";

import RegisterComponent from "@/components/RegisterComponent";
import WithdrawComponent from "@/components/WithdrawComponent";
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

  return (
    <>
      <Marquee className="bg-base-100 flex text-xl">
        {isLoading || isFetching ? (
          <span>Getting announcements...</span>
        ) : (
          <>
            <span>Announcements:</span>
            <div className="badge badge-neutral badge-sm mt-auto mb-auto"></div>
            {data.data.is_maintenance ? (
              <span>Minner is currently in maintenance.</span>
            ) : (
              <> </>
            )}
            <div className="badge badge-neutral badge-sm mt-auto mb-auto"></div>
            {isFetching || isLoading ? (
              <span>Checking withrawal method status...</span>
            ) : data.data.is_auto_transaction ? (
              <span>Auto transaction is enabled.</span>
            ) : (
              <span>Auto transaction is disabled.</span>
            )}
          </>
        )}
      </Marquee>
      <div id="home" className="hero min-h-screen bg-base-100">
        <WithdrawComponent />
      </div>
    </>
  );
}
