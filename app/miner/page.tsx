"use client";
import MinnerPanel from "@/components/MinnerPanel";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Marquee from "react-fast-marquee";
export default async function Home() {
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
    refetchOnWindowFocus: false,
  });

  console.log(data);

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
      <div id="home" className="hero min-h-screen  bg-base-100">
        <div className="hero-content w-screen flex flex-row">
          <div className="w-1/4 h-auto">
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
          </div>
          {isLoading || isFetching ? (
            <div className="flex justify-center w-1/2 items-center">
              <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-24 w-24"></div>
            </div>
          ) : data.data.is_maintenance ? (
            <div className="flex flex-col w-1/2 justify-center items-center">
              <Image
                src="/svg/maintenance-animate.svg"
                alt={"Maintenance"}
                width={400}
                height={400}
              ></Image>
              <h1 className="text-4xl text-red-500">Maintenance Mode</h1>
              <span>
                Miner is currently on maintenance. Please bear with us. Thank
                you.{" "}
              </span>
            </div>
          ) : (
            <>
              <MinnerPanel />
            </>
          )}
        </div>
      </div>
    </>
  );
}
